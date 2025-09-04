-- Enable pgcrypto extension for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create RPC function to create password-protected QR codes
CREATE OR REPLACE FUNCTION public.create_qr_code(
  password_text TEXT,
  content_url_param TEXT,
  qr_type_param TEXT DEFAULT 'password-protected',
  expires_in_seconds INTEGER DEFAULT NULL
)
RETURNS TABLE (
  qr_id UUID,
  expires_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_id UUID;
  expiry_date TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Generate new UUID
  new_id := gen_random_uuid();
  
  -- Calculate expiry date if provided
  IF expires_in_seconds IS NOT NULL THEN
    expiry_date := NOW() + (expires_in_seconds || ' seconds')::INTERVAL;
  END IF;
  
  -- Insert the new QR code with hashed password
  INSERT INTO public.qr_codes (
    id,
    password_hash,
    content_url,
    qr_type,
    expires_at
  ) VALUES (
    new_id,
    crypt(password_text, gen_salt('bf', 12)),
    content_url_param,
    qr_type_param,
    expiry_date
  );
  
  -- Return the created record info
  RETURN QUERY SELECT new_id, expiry_date;
END;
$$;

-- Create RPC function to verify password and get content
CREATE OR REPLACE FUNCTION public.verify_qr_password(
  qr_id_param UUID,
  password_text TEXT
)
RETURNS TABLE (
  success BOOLEAN,
  content_url TEXT,
  error_message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  qr_record RECORD;
BEGIN
  -- Get the QR code record
  SELECT * INTO qr_record
  FROM public.qr_codes
  WHERE id = qr_id_param;
  
  -- Check if QR code exists
  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, NULL::TEXT, 'QR code not found';
    RETURN;
  END IF;
  
  -- Check if QR code has expired
  IF qr_record.expires_at IS NOT NULL AND qr_record.expires_at < NOW() THEN
    RETURN QUERY SELECT FALSE, NULL::TEXT, 'QR code has expired';
    RETURN;
  END IF;
  
  -- Verify password
  IF crypt(password_text, qr_record.password_hash) = qr_record.password_hash THEN
    RETURN QUERY SELECT TRUE, qr_record.content_url, NULL::TEXT;
  ELSE
    RETURN QUERY SELECT FALSE, NULL::TEXT, 'Invalid password';
  END IF;
END;
$$;