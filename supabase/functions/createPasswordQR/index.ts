import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import * as bcrypt from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";

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

    // Hash the password with bcrypt
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Calculate expiry date if provided
    let expiresAt = null;
    if (expiresIn) {
      expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();
    }

    // Insert into database
    const { data, error } = await supabase
      .from('qr_codes')
      .insert({
        password_hash: passwordHash,
        content_url: contentUrl,
        qr_type: qrType || 'password-protected',
        expires_at: expiresAt
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving QR code:', error);
      throw new Error("Failed to create QR code");
    }

    console.log('Password-protected QR created successfully:', data.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        qrId: data.id,
        expiresAt: data.expires_at
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