import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { password, contentUrl, qrType, expiresIn } = await req.json();

    if (!password || !contentUrl) {
      throw new Error("Password and content URL are required");
    }

    console.log('Creating password-protected QR for type:', qrType);

    // Use PostgreSQL function to create QR code with hashed password
    const { data, error } = await supabase.rpc('create_qr_code', {
      password_text: password,
      content_url_param: contentUrl,
      qr_type_param: qrType || 'password-protected',
      expires_in_seconds: expiresIn || null
    });

    if (error || !data || data.length === 0) {
      console.error('Error creating QR code:', error);
      throw new Error("Failed to create QR code");
    }

    const result = data[0];
    console.log('Password-protected QR created successfully:', result.qr_id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        qrId: result.qr_id,
        expiresAt: result.expires_at
      }), 
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Error in createPasswordQR function:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }), 
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});