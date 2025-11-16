import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const url = new URL(req.url);
    const shortCode = url.pathname.split('/').pop();

    if (!shortCode) {
      return new Response(JSON.stringify({ error: 'Short code is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get short URL record
    const { data: shortUrl, error: fetchError } = await supabase
      .from('short_urls')
      .select('*, qr_codes(*)')
      .eq('short_code', shortCode)
      .single();

    if (fetchError || !shortUrl) {
      return new Response(JSON.stringify({ error: 'Short URL not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if short URL is active
    if (!shortUrl.is_active) {
      return new Response(JSON.stringify({ error: 'This link is no longer active' }), {
        status: 410,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check expiration
    if (shortUrl.expires_at && new Date(shortUrl.expires_at) < new Date()) {
      return new Response(JSON.stringify({ error: 'This link has expired' }), {
        status: 410,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get client IP for analytics
    const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0] || 
                     req.headers.get('x-real-ip') || 
                     'unknown';

    // Check QR code accessibility if linked
    if (shortUrl.qr_code_id) {
      const { data: accessCheck } = await supabase.rpc('is_qr_accessible', {
        qr_id_param: shortUrl.qr_code_id,
        scanner_ip_param: clientIP
      });

      if (accessCheck && !accessCheck.accessible) {
        return new Response(JSON.stringify({ 
          error: 'Access denied', 
          reason: accessCheck.reason 
        }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // Update click count
    await supabase
      .from('short_urls')
      .update({ clicks: (shortUrl.clicks || 0) + 1 })
      .eq('id', shortUrl.id);

    // Record analytics if QR code exists
    if (shortUrl.qr_code_id) {
      await supabase.rpc('record_qr_scan', {
        qr_id_param: shortUrl.qr_code_id,
        scanner_ip_param: clientIP,
        user_agent_param: req.headers.get('user-agent'),
        referer_param: req.headers.get('referer')
      });
    }

    // Return redirect information
    return new Response(JSON.stringify({ 
      destination: shortUrl.destination_url,
      clicks: shortUrl.clicks + 1
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in redirect function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});