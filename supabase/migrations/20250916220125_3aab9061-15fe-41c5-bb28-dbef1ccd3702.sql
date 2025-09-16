-- Fix security warnings by setting proper search_path on functions

-- Update record_qr_scan function with proper search_path
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
SET search_path = public
AS $$
DECLARE
  qr_record RECORD;
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

-- Update get_qr_analytics_summary function with proper search_path
CREATE OR REPLACE FUNCTION public.get_qr_analytics_summary(qr_id_param UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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