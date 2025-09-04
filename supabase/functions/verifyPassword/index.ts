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

    const { id, password } = await req.json();

    if (!id || !password) {
      throw new Error("ID and password are required");
    }

    console.log('Verifying password for QR ID:', id);

    const { data, error } = await supabase
      .from('qr_codes')
      .select('password_hash, content_url, expires_at')
      .eq('id', id)
      .single();

    if (error || !data) {
      console.error('QR code not found:', error);
      throw new Error("QR code not found");
    }

    // Check if QR code has expired
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      throw new Error("QR code has expired");
    }

    const isValid = await bcrypt.compare(password, data.password_hash);
    
    if (!isValid) {
      console.log('Invalid password provided');
      throw new Error("Invalid password");
    }

    console.log('Password verified successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        url: data.content_url 
      }), 
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Error in verifyPassword function:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }), 
      {
        status: error.message === "Invalid password" ? 401 : 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});