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

    const { qrCodes, settings } = await req.json();

    if (!Array.isArray(qrCodes) || qrCodes.length === 0) {
      return new Response(JSON.stringify({ error: 'QR codes array is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create bulk job record
    const { data: job, error: jobError } = await supabase
      .from('bulk_generation_jobs')
      .insert({
        total_codes: qrCodes.length,
        settings: settings || {},
      })
      .select()
      .single();

    if (jobError || !job) {
      throw new Error('Failed to create bulk job');
    }

    const results = {
      jobId: job.id,
      successful: [],
      failed: [],
    };

    // Process each QR code
    for (const qrData of qrCodes) {
      try {
        // Generate short code if dynamic
        let shortUrlId = null;
        if (settings?.isDynamic) {
          const shortCode = await generateUniqueShortCode(supabase);
          
          const { data: shortUrl, error: shortUrlError } = await supabase
            .from('short_urls')
            .insert({
              short_code: shortCode,
              destination_url: qrData.url || qrData.text,
            })
            .select()
            .single();

          if (!shortUrlError && shortUrl) {
            shortUrlId = shortUrl.id;
          }
        }

        // Create QR code record
        const { data: qrCode, error: qrError } = await supabase
          .from('qr_codes')
          .insert({
            qr_type: qrData.type || 'url',
            content_url: qrData.url || qrData.text,
            title: qrData.title,
            description: qrData.description,
            color_scheme: settings?.colorScheme,
            style_options: settings?.styleOptions,
            is_dynamic: settings?.isDynamic || false,
            short_url_id: shortUrlId,
            scan_limit: qrData.scanLimit,
            expires_at: qrData.expiresAt,
            activation_date: qrData.activationDate,
          })
          .select()
          .single();

        if (qrError) {
          throw qrError;
        }

        results.successful.push({
          id: qrCode.id,
          title: qrData.title,
          shortCode: shortUrlId ? (await supabase
            .from('short_urls')
            .select('short_code')
            .eq('id', shortUrlId)
            .single()).data?.short_code : null,
        });

        // Update job progress
        await supabase
          .from('bulk_generation_jobs')
          .update({ completed_codes: results.successful.length })
          .eq('id', job.id);

      } catch (error) {
        console.error('Error processing QR code:', error);
        results.failed.push({
          data: qrData,
          error: error.message,
        });

        // Update job progress
        await supabase
          .from('bulk_generation_jobs')
          .update({ 
            failed_codes: results.failed.length,
            error_log: results.failed,
          })
          .eq('id', job.id);
      }
    }

    // Update job status
    await supabase
      .from('bulk_generation_jobs')
      .update({ 
        status: results.failed.length > 0 ? 'completed_with_errors' : 'completed',
        completed_codes: results.successful.length,
        failed_codes: results.failed.length,
      })
      .eq('id', job.id);

    return new Response(JSON.stringify(results), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in bulkGenerate function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function generateUniqueShortCode(supabase: any): Promise<string> {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let attempts = 0;
  const maxAttempts = 10;

  while (attempts < maxAttempts) {
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    // Check if code exists
    const { data } = await supabase
      .from('short_urls')
      .select('id')
      .eq('short_code', code)
      .maybeSingle();

    if (!data) {
      return code;
    }

    attempts++;
  }

  throw new Error('Failed to generate unique short code');
}