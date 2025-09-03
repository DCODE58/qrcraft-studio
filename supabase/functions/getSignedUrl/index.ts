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

    const { bucket, path } = await req.json();

    if (!bucket || !path) {
      throw new Error("Bucket and path are required");
    }

    console.log('Generating signed URL for:', { bucket, path });

    // Check if file exists first
    const { data: fileData, error: fileError } = await supabase.storage
      .from(bucket)
      .list(path.split('/').slice(0, -1).join('/'), {
        search: path.split('/').pop()
      });

    if (fileError || !fileData || fileData.length === 0) {
      throw new Error("File not found or expired");
    }

    // Generate signed URL valid for 1 hour
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, 60 * 60); // 1 hour = 3600 seconds

    if (error) {
      console.error('Error generating signed URL:', error);
      throw new Error(error.message);
    }

    if (!data || !data.signedUrl) {
      throw new Error("Failed to generate signed URL");
    }

    console.log('Signed URL generated successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        url: data.signedUrl,
        expiresIn: 3600 // 1 hour in seconds
      }), 
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Error in getSignedUrl function:', error);
    
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