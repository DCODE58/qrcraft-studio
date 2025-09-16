// QR Code Platform Types
export type QRType = 
  | 'url' 
  | 'text' 
  | 'email' 
  | 'phone' 
  | 'sms' 
  | 'wifi' 
  | 'vcard' 
  | 'event' 
  | 'payment' 
  | 'file' 
  | 'video' 
  | 'app_link' 
  | 'password-protected';

export type QRStatus = 'active' | 'expired' | 'single_use_consumed' | 'disabled';

export interface QRCode {
  id: string;
  title?: string;
  description?: string;
  qr_type: QRType;
  content_url: string;
  status: QRStatus;
  scan_limit?: number;
  scan_count: number;
  is_dynamic: boolean;
  logo_url?: string;
  color_scheme: {
    primary: string;
    background: string;
  };
  style_options: {
    dotStyle: 'square' | 'rounded' | 'dots';
    cornerStyle: 'square' | 'rounded';
  };
  utm_parameters?: {
    source?: string;
    medium?: string;
    campaign?: string;
  };
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

export interface WiFiData {
  ssid: string;
  password?: string;
  security: 'WPA' | 'WPA2' | 'WPA3' | 'WEP' | 'nopass';
  hidden: boolean;
}

export interface VCardData {
  full_name: string;
  organization?: string;
  title?: string;
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
  note?: string;
}

export interface EventData {
  title: string;
  description?: string;
  location?: string;
  start_date: string;
  end_date?: string;
  all_day: boolean;
  organizer_name?: string;
  organizer_email?: string;
}

export interface PaymentData {
  payment_type: 'mpesa' | 'paypal' | 'stripe' | 'crypto';
  amount?: number;
  currency: string;
  recipient: string;
  description?: string;
  payment_data?: Record<string, any>;
}

export interface FileData {
  file_name: string;
  file_size: number;
  file_type: string;
  storage_path: string;
  download_count: number;
}

export interface QRAnalytics {
  total_scans: number;
  unique_scans: number;
  last_scanned?: string;
  top_countries: Array<{ country: string; count: number }>;
  device_breakdown: Array<{ device: string; count: number }>;
  scan_timeline: Array<{ date: string; count: number }>;
}

export interface ScanEvent {
  id: string;
  qr_code_id: string;
  scanned_at: string;
  scanner_ip?: string;
  user_agent?: string;
  device_type?: string;
  browser?: string;
  os?: string;
  country?: string;
  city?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
}