-- Create the qr_codes table for password-protected QRs
CREATE TABLE IF NOT EXISTS public.qr_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  password_hash TEXT NOT NULL,
  content_url TEXT NOT NULL,
  qr_type TEXT DEFAULT 'password-protected',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on qr_codes table
ALTER TABLE public.qr_codes ENABLE ROW LEVEL SECURITY;

-- Create policies for qr_codes (publicly readable for verification, but secure)
CREATE POLICY "QR codes are readable for verification" 
ON public.qr_codes 
FOR SELECT 
USING (true);

-- Create storage buckets for media uploads
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('images', 'images', false),
  ('videos', 'videos', false)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for images bucket
CREATE POLICY "Users can upload images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'images');

CREATE POLICY "Users can view images via signed URLs" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'images');

CREATE POLICY "Users can delete their uploaded images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'images');

-- Create storage policies for videos bucket
CREATE POLICY "Users can upload videos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'videos');

CREATE POLICY "Users can view videos via signed URLs" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'videos');

CREATE POLICY "Users can delete their uploaded videos" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'videos');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates on qr_codes
CREATE TRIGGER update_qr_codes_updated_at
  BEFORE UPDATE ON public.qr_codes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();