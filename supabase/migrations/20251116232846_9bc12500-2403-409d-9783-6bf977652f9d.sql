-- Phase 2 & 3: Dynamic QR Codes, Bulk Generation, Scheduling, and Security

-- Table for URL shortener (Dynamic QR Codes)
CREATE TABLE IF NOT EXISTS public.short_urls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  short_code text UNIQUE NOT NULL,
  destination_url text NOT NULL,
  qr_code_id uuid REFERENCES public.qr_codes(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  clicks integer DEFAULT 0 NOT NULL,
  is_active boolean DEFAULT true NOT NULL,
  password_hash text,
  expires_at timestamp with time zone
);

CREATE INDEX idx_short_urls_code ON public.short_urls(short_code);
CREATE INDEX idx_short_urls_qr_code ON public.short_urls(qr_code_id);

-- Enable RLS
ALTER TABLE public.short_urls ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Short URLs are publicly readable"
  ON public.short_urls FOR SELECT
  USING (true);

CREATE POLICY "Short URLs are insertable by anyone"
  ON public.short_urls FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Short URLs are updatable by anyone"
  ON public.short_urls FOR UPDATE
  USING (true);

-- Add scheduling and security columns to qr_codes
ALTER TABLE public.qr_codes 
  ADD COLUMN IF NOT EXISTS activation_date timestamp with time zone,
  ADD COLUMN IF NOT EXISTS is_recurring boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS recurrence_pattern text,
  ADD COLUMN IF NOT EXISTS ip_whitelist text[],
  ADD COLUMN IF NOT EXISTS ip_blacklist text[],
  ADD COLUMN IF NOT EXISTS allowed_countries text[],
  ADD COLUMN IF NOT EXISTS restricted_countries text[],
  ADD COLUMN IF NOT EXISTS require_2fa boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS max_scans_per_ip integer,
  ADD COLUMN IF NOT EXISTS device_restrictions jsonb DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS is_dynamic boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS short_url_id uuid REFERENCES public.short_urls(id) ON DELETE SET NULL;

-- Table for bulk generation jobs
CREATE TABLE IF NOT EXISTS public.bulk_generation_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  status text DEFAULT 'pending' NOT NULL,
  total_codes integer NOT NULL,
  completed_codes integer DEFAULT 0 NOT NULL,
  failed_codes integer DEFAULT 0 NOT NULL,
  settings jsonb NOT NULL,
  error_log jsonb DEFAULT '[]',
  download_url text
);

-- Enable RLS
ALTER TABLE public.bulk_generation_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Bulk jobs are readable by anyone"
  ON public.bulk_generation_jobs FOR SELECT
  USING (true);

CREATE POLICY "Bulk jobs are insertable by anyone"
  ON public.bulk_generation_jobs FOR INSERT
  WITH CHECK (true);

-- Table for QR templates (Advanced Customization)
CREATE TABLE IF NOT EXISTS public.qr_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  category text NOT NULL,
  style_settings jsonb NOT NULL,
  preview_url text,
  is_premium boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.qr_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Templates are publicly readable"
  ON public.qr_templates FOR SELECT
  USING (true);

-- Table for brand kits (Advanced Customization)
CREATE TABLE IF NOT EXISTS public.brand_kits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  colors jsonb NOT NULL,
  logo_url text,
  fonts jsonb,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.brand_kits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Brand kits are readable by anyone"
  ON public.brand_kits FOR SELECT
  USING (true);

CREATE POLICY "Brand kits are insertable by anyone"
  ON public.brand_kits FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Brand kits are updatable by anyone"
  ON public.brand_kits FOR UPDATE
  USING (true);

-- Function to generate short codes
CREATE OR REPLACE FUNCTION public.generate_short_code()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  chars text := 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result text := '';
  i integer;
BEGIN
  FOR i IN 1..6 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN result;
END;
$$;

-- Function to check if QR code is accessible (scheduling + security)
CREATE OR REPLACE FUNCTION public.is_qr_accessible(
  qr_id_param uuid,
  scanner_ip_param inet DEFAULT NULL,
  scanner_country_param text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  qr_record RECORD;
  scan_count_for_ip integer;
BEGIN
  SELECT * INTO qr_record FROM public.qr_codes WHERE id = qr_id_param;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('accessible', false, 'reason', 'QR code not found');
  END IF;
  
  -- Check if QR is active
  IF qr_record.status != 'active' THEN
    RETURN jsonb_build_object('accessible', false, 'reason', 'QR code is not active');
  END IF;
  
  -- Check activation date
  IF qr_record.activation_date IS NOT NULL AND qr_record.activation_date > NOW() THEN
    RETURN jsonb_build_object('accessible', false, 'reason', 'QR code not yet active');
  END IF;
  
  -- Check expiration
  IF qr_record.expires_at IS NOT NULL AND qr_record.expires_at < NOW() THEN
    RETURN jsonb_build_object('accessible', false, 'reason', 'QR code has expired');
  END IF;
  
  -- Check scan limit
  IF qr_record.scan_limit IS NOT NULL AND qr_record.scan_count >= qr_record.scan_limit THEN
    RETURN jsonb_build_object('accessible', false, 'reason', 'Scan limit reached');
  END IF;
  
  -- Check IP whitelist
  IF qr_record.ip_whitelist IS NOT NULL AND array_length(qr_record.ip_whitelist, 1) > 0 THEN
    IF scanner_ip_param IS NULL OR NOT (scanner_ip_param::text = ANY(qr_record.ip_whitelist)) THEN
      RETURN jsonb_build_object('accessible', false, 'reason', 'IP not whitelisted');
    END IF;
  END IF;
  
  -- Check IP blacklist
  IF qr_record.ip_blacklist IS NOT NULL AND scanner_ip_param IS NOT NULL THEN
    IF scanner_ip_param::text = ANY(qr_record.ip_blacklist) THEN
      RETURN jsonb_build_object('accessible', false, 'reason', 'IP is blacklisted');
    END IF;
  END IF;
  
  -- Check country restrictions
  IF qr_record.allowed_countries IS NOT NULL AND array_length(qr_record.allowed_countries, 1) > 0 THEN
    IF scanner_country_param IS NULL OR NOT (scanner_country_param = ANY(qr_record.allowed_countries)) THEN
      RETURN jsonb_build_object('accessible', false, 'reason', 'Country not allowed');
    END IF;
  END IF;
  
  IF qr_record.restricted_countries IS NOT NULL AND scanner_country_param IS NOT NULL THEN
    IF scanner_country_param = ANY(qr_record.restricted_countries) THEN
      RETURN jsonb_build_object('accessible', false, 'reason', 'Country is restricted');
    END IF;
  END IF;
  
  -- Check max scans per IP
  IF qr_record.max_scans_per_ip IS NOT NULL AND scanner_ip_param IS NOT NULL THEN
    SELECT COUNT(*) INTO scan_count_for_ip
    FROM public.qr_analytics
    WHERE qr_code_id = qr_id_param AND scanner_ip = scanner_ip_param;
    
    IF scan_count_for_ip >= qr_record.max_scans_per_ip THEN
      RETURN jsonb_build_object('accessible', false, 'reason', 'Max scans per IP reached');
    END IF;
  END IF;
  
  RETURN jsonb_build_object('accessible', true);
END;
$$;

-- Trigger for updating short_urls updated_at
CREATE TRIGGER update_short_urls_updated_at
  BEFORE UPDATE ON public.short_urls
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some default templates
INSERT INTO public.qr_templates (name, description, category, style_settings) VALUES
  ('Modern Business', 'Clean professional design for business cards', 'business', '{"fgColor": "#1a1a1a", "bgColor": "#ffffff", "dotStyle": "rounded", "cornerStyle": "square", "logo": true}'),
  ('Vibrant Food', 'Colorful design perfect for restaurants', 'restaurant', '{"fgColor": "#ff6b35", "bgColor": "#f7f7f7", "dotStyle": "dots", "cornerStyle": "rounded", "gradient": true}'),
  ('Tech Startup', 'Modern gradient design for tech companies', 'tech', '{"fgColor": "#667eea", "bgColor": "#ffffff", "dotStyle": "square", "cornerStyle": "extra-rounded", "gradient": true}'),
  ('Elegant Event', 'Sophisticated design for special events', 'event', '{"fgColor": "#2d3748", "bgColor": "#f8f9fa", "dotStyle": "rounded", "cornerStyle": "square", "border": true}'),
  ('Healthcare Clean', 'Professional medical and healthcare design', 'healthcare', '{"fgColor": "#2563eb", "bgColor": "#ffffff", "dotStyle": "square", "cornerStyle": "rounded", "logo": true}');
