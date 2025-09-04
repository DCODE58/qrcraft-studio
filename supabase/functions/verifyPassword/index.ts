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

    const { id, password } = await req.json();

    if (!id || !password) {
      throw new Error("ID and password are required");
    }

    console.log('Verifying password for QR ID:', id);

    // Use the database RPC function to verify password
    const { data, error } = await supabase.rpc('verify_qr_password', {
      qr_id_param: id,
      password_text: password
    });

    if (error) {
      console.error('Error verifying password:', error);
      throw new Error("Verification failed");
    }

    if (!data || data.length === 0) {
      throw new Error("No verification result");
    }

    const result = data[0];

    if (!result.success) {
      console.log('Password verification failed:', result.error_message);
      throw new Error(result.error_message || "Invalid password");
    }

    console.log('Password verified successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        url: result.content_url 
      }), 
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Error in verifyPassword function:', error);
    
    const status = error.message === "Invalid password" || 
                  error.message === "QR code has expired" ? 401 : 400;
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }), 
      {
        status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});