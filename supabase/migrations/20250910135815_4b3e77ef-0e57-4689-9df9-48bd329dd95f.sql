-- Enhanced QR Code Platform Schema
-- Add analytics tracking, multiple QR types, and advanced features

-- Create enum for QR types
CREATE TYPE qr_type_enum AS ENUM (
  'url', 'text', 'email', 'phone', 'sms', 'wifi', 'vcard', 
  'event', 'payment', 'file', 'video', 'app_link', 'password-protected'
);

-- Create enum for QR status
CREATE TYPE qr_status_enum AS ENUM ('active', 'expired', 'single_use_consumed', 'disabled');

-- Update qr_codes table with enhanced schema
ALTER TABLE public.qr_codes 
  ADD COLUMN IF NOT EXISTS title TEXT,
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS status qr_status_enum DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS scan_limit INTEGER,
  ADD COLUMN IF NOT EXISTS scan_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_dynamic BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS logo_url TEXT,
  ADD COLUMN IF NOT EXISTS color_scheme JSONB DEFAULT '{"primary": "#2563eb", "background": "#ffffff"}',
  ADD COLUMN IF NOT EXISTS style_options JSONB DEFAULT '{"dotStyle": "square", "cornerStyle": "square"}',
  ADD COLUMN IF NOT EXISTS utm_parameters JSONB,
  ADD COLUMN IF NOT EXISTS creator_ip INET,
  ADD COLUMN IF NOT EXISTS creator_user_agent TEXT;

-- Change qr_type column to use enum
ALTER TABLE public.qr_codes ALTER COLUMN qr_type TYPE qr_type_enum USING qr_type::qr_type_enum;
ALTER TABLE public.qr_codes ALTER COLUMN qr_type SET DEFAULT 'url';

-- Create analytics table for scan tracking
CREATE TABLE public.qr_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  qr_code_id UUID NOT NULL REFERENCES public.qr_codes(id) ON DELETE CASCADE,
  scanned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  scanner_ip INET,
  user_agent TEXT,
  referer TEXT,
  device_type TEXT,
  browser TEXT,
  os TEXT,
  country TEXT,
  city TEXT,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  session_id TEXT,
  is_unique_visitor BOOLEAN DEFAULT true
);

-- Create indexes for analytics performance
CREATE INDEX idx_qr_analytics_qr_code_id ON public.qr_analytics(qr_code_id);
CREATE INDEX idx_qr_analytics_scanned_at ON public.qr_analytics(scanned_at);
CREATE INDEX idx_qr_analytics_device_type ON public.qr_analytics(device_type);
CREATE INDEX idx_qr_analytics_country ON public.qr_analytics(country);

-- Create WiFi QR specific data table
CREATE TABLE public.qr_wifi_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  qr_code_id UUID NOT NULL REFERENCES public.qr_codes(id) ON DELETE CASCADE,
  ssid TEXT NOT NULL,
  password TEXT,
  security TEXT DEFAULT 'WPA2',
  hidden BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create vCard QR specific data table
CREATE TABLE public.qr_vcard_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  qr_code_id UUID NOT NULL REFERENCES public.qr_codes(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  organization TEXT,
  title TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  address TEXT,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create event QR specific data table
CREATE TABLE public.qr_event_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  qr_code_id UUID NOT NULL REFERENCES public.qr_codes(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  all_day BOOLEAN DEFAULT false,
  organizer_name TEXT,
  organizer_email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create payment QR specific data table
CREATE TABLE public.qr_payment_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  qr_code_id UUID NOT NULL REFERENCES public.qr_codes(id) ON DELETE CASCADE,
  payment_type TEXT NOT NULL, -- 'mpesa', 'paypal', 'stripe', 'crypto'
  amount DECIMAL(10,2),
  currency TEXT DEFAULT 'USD',
  recipient TEXT NOT NULL,
  description TEXT,
  payment_data JSONB, -- Store provider-specific data
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create file storage table for file/video QRs
CREATE TABLE public.qr_file_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  qr_code_id UUID NOT NULL REFERENCES public.qr_codes(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_size BIGINT,
  file_type TEXT,
  storage_path TEXT NOT NULL,
  download_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.qr_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_wifi_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_vcard_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_event_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_payment_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_file_data ENABLE ROW LEVEL SECURITY;

-- RLS Policies for analytics (public read for QR functionality)
CREATE POLICY "Analytics are readable for QR owners and scanners" 
ON public.qr_analytics FOR SELECT USING (true);

CREATE POLICY "Analytics can be inserted by anyone" 
ON public.qr_analytics FOR INSERT WITH CHECK (true);

-- RLS Policies for QR data tables (public read for QR functionality)
CREATE POLICY "WiFi data is readable for QR access" 
ON public.qr_wifi_data FOR SELECT USING (true);

CREATE POLICY "vCard data is readable for QR access" 
ON public.qr_vcard_data FOR SELECT USING (true);

CREATE POLICY "Event data is readable for QR access" 
ON public.qr_event_data FOR SELECT USING (true);

CREATE POLICY "Payment data is readable for QR access" 
ON public.qr_payment_data FOR SELECT USING (true);

CREATE POLICY "File data is readable for QR access" 
ON public.qr_file_data FOR SELECT USING (true);

-- Functions for QR analytics
CREATE OR REPLACE FUNCTION public.record_qr_scan(
  qr_id_param UUID,
  scanner_ip_param INET DEFAULT NULL,
  user_agent_param TEXT DEFAULT NULL,
  referer_param TEXT DEFAULT NULL,
  device_info JSONB DEFAULT '{}'::jsonb
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  qr_record RECORD;
  scan_result JSONB;
BEGIN
  -- Get QR code details and check if it exists and is active
  SELECT * INTO qr_record 
  FROM public.qr_codes 
  WHERE id = qr_id_param;
  
  -- Check if QR exists
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'QR code not found'
    );
  END IF;
  
  -- Check if QR is expired
  IF qr_record.expires_at IS NOT NULL AND qr_record.expires_at < NOW() THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'QR code has expired'
    );
  END IF;
  
  -- Check if QR is disabled
  IF qr_record.status = 'disabled' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'QR code is disabled'
    );
  END IF;
  
  -- Check scan limit
  IF qr_record.scan_limit IS NOT NULL AND qr_record.scan_count >= qr_record.scan_limit THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'QR code scan limit reached'
    );
  END IF;
  
  -- Check if single use and already consumed
  IF qr_record.status = 'single_use_consumed' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'QR code has already been used'
    );
  END IF;
  
  -- Record the scan
  INSERT INTO public.qr_analytics (
    qr_code_id,
    scanner_ip,
    user_agent,
    referer,
    device_type,
    browser,
    os,
    country,
    city,
    utm_source,
    utm_medium,
    utm_campaign
  ) VALUES (
    qr_id_param,
    scanner_ip_param,
    user_agent_param,
    referer_param,
    COALESCE(device_info->>'device_type', 'unknown'),
    COALESCE(device_info->>'browser', 'unknown'),
    COALESCE(device_info->>'os', 'unknown'),
    COALESCE(device_info->>'country', 'unknown'),
    COALESCE(device_info->>'city', 'unknown'),
    device_info->>'utm_source',
    device_info->>'utm_medium',
    device_info->>'utm_campaign'
  );
  
  -- Update scan count
  UPDATE public.qr_codes 
  SET scan_count = scan_count + 1,
      status = CASE 
        WHEN scan_limit = 1 THEN 'single_use_consumed'::qr_status_enum
        ELSE status
      END
  WHERE id = qr_id_param;
  
  -- Return success with QR data
  RETURN jsonb_build_object(
    'success', true,
    'qr_type', qr_record.qr_type,
    'content_url', qr_record.content_url,
    'scan_count', qr_record.scan_count + 1
  );
END;
$$;

-- Function to get QR analytics summary
CREATE OR REPLACE FUNCTION public.get_qr_analytics_summary(qr_id_param UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_scans', COUNT(*),
    'unique_scans', COUNT(DISTINCT scanner_ip),
    'last_scanned', MAX(scanned_at),
    'top_countries', (
      SELECT jsonb_agg(jsonb_build_object('country', country, 'count', cnt))
      FROM (
        SELECT country, COUNT(*) as cnt
        FROM public.qr_analytics
        WHERE qr_code_id = qr_id_param AND country IS NOT NULL
        GROUP BY country
        ORDER BY cnt DESC
        LIMIT 5
      ) top_countries
    ),
    'device_breakdown', (
      SELECT jsonb_agg(jsonb_build_object('device', device_type, 'count', cnt))
      FROM (
        SELECT device_type, COUNT(*) as cnt
        FROM public.qr_analytics
        WHERE qr_code_id = qr_id_param AND device_type IS NOT NULL
        GROUP BY device_type
        ORDER BY cnt DESC
      ) devices
    ),
    'scan_timeline', (
      SELECT jsonb_agg(jsonb_build_object('date', scan_date, 'count', cnt))
      FROM (
        SELECT DATE(scanned_at) as scan_date, COUNT(*) as cnt
        FROM public.qr_analytics
        WHERE qr_code_id = qr_id_param
        GROUP BY DATE(scanned_at)
        ORDER BY scan_date DESC
        LIMIT 30
      ) timeline
    )
  ) INTO result
  FROM public.qr_analytics
  WHERE qr_code_id = qr_id_param;
  
  RETURN COALESCE(result, '{}'::jsonb);
END;
$$;