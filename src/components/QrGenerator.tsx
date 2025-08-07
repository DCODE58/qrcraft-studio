import { useState, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { toPng, toSvg } from 'html-to-image';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ArrowLeft, Download, Palette, Settings, Wifi, Phone, Mail, User, Calendar, 
  MessageSquare, Copy, Share2, Sparkles, Zap, Globe, FileText, Link, Users, 
  Video, Camera, Music, Briefcase, MapPin, Clock, Menu, Store, Ticket, Gift,
  Facebook, Instagram, Twitter, Youtube, Linkedin, Github, Chrome, Smartphone,
  Receipt, Car, Home, CreditCard, FileImage, HelpCircle, QrCode
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type QRType = 'text' | 'url' | 'email' | 'phone' | 'sms' | 'wifi' | 'vcard' | 'event' | 
             'pdf' | 'links' | 'business' | 'video' | 'images' | 'social' | 'whatsapp' | 
             'mp3' | 'menu' | 'apps' | 'coupon' | 'facebook' | 'instagram' | 'twitter' | 
             'linkedin' | 'youtube' | 'location' | 'crypto';

interface QRData {
  text: string;
  url: string;
  email: string;
  phone: string;
  sms: string;
  wifi: {
    ssid: string;
    password: string;
    security: 'WPA' | 'WEP' | 'nopass';
    hidden: boolean;
  };
  vcard: {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    organization: string;
    website: string;
    address: string;
  };
  event: {
    title: string;
    start: string;
    end: string;
    location: string;
    description: string;
  };
  pdf: string;
  links: string;
  business: {
    name: string;
    phone: string;
    email: string;
    website: string;
    address: string;
    description: string;
  };
  video: string;
  images: string;
  social: string;
  whatsapp: {
    number: string;
    message: string;
  };
  mp3: string;
  menu: string;
  apps: {
    name: string;
    url: string;
    description: string;
  };
  coupon: {
    title: string;
    code: string;
    discount: string;
    expiry: string;
    description: string;
  };
  facebook: string;
  instagram: string;
  twitter: string;
  linkedin: string;
  youtube: string;
  location: {
    latitude: string;
    longitude: string;
    address: string;
  };
  crypto: {
    address: string;
    amount: string;
    currency: string;
  };
}

interface QRStyle {
  fgColor: string;
  bgColor: string;
  size: number;
  level: 'L' | 'M' | 'Q' | 'H';
}

interface QrGeneratorProps {
  onBack?: () => void;
}

const QrGenerator = ({ onBack }: QrGeneratorProps) => {
  const [qrType, setQrType] = useState<QRType>('url');
  const [qrData, setQrData] = useState<QRData>({
    text: '',
    url: 'https://',
    email: '',
    phone: '',
    sms: '',
    wifi: {
      ssid: '',
      password: '',
      security: 'WPA',
      hidden: false
    },
    vcard: {
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      organization: '',
      website: '',
      address: ''
    },
    event: {
      title: '',
      start: '',
      end: '',
      location: '',
      description: ''
    },
    pdf: '',
    links: '',
    business: {
      name: '',
      phone: '',
      email: '',
      website: '',
      address: '',
      description: ''
    },
    video: '',
    images: '',
    social: '',
    whatsapp: {
      number: '',
      message: ''
    },
    mp3: '',
    menu: '',
    apps: {
      name: '',
      url: '',
      description: ''
    },
    coupon: {
      title: '',
      code: '',
      discount: '',
      expiry: '',
      description: ''
    },
    facebook: '',
    instagram: '',
    twitter: '',
    linkedin: '',
    youtube: '',
    location: {
      latitude: '',
      longitude: '',
      address: ''
    },
    crypto: {
      address: '',
      amount: '',
      currency: 'BTC'
    }
  });
  
  const [qrStyle, setQrStyle] = useState<QRStyle>({
    fgColor: '#2563EB',
    bgColor: '#FFFFFF',
    size: 280,
    level: 'M'
  });

  const qrRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const qrTypeConfigs = [
    { type: 'url' as QRType, label: 'Website', icon: Globe, color: 'text-blue-500', description: 'Link to any website URL' },
    { type: 'pdf' as QRType, label: 'PDF', icon: FileText, color: 'text-red-500', description: 'Show a PDF document' },
    { type: 'links' as QRType, label: 'List of Links', icon: Link, color: 'text-purple-500', description: 'Share multiple links' },
    { type: 'vcard' as QRType, label: 'vCard', icon: User, color: 'text-green-500', description: 'Share digital business card' },
    { type: 'business' as QRType, label: 'Business', icon: Briefcase, color: 'text-indigo-500', description: 'Share information about your business' },
    { type: 'video' as QRType, label: 'Video', icon: Video, color: 'text-pink-500', description: 'Show a video' },
    { type: 'images' as QRType, label: 'Images', icon: Camera, color: 'text-orange-500', description: 'Share multiple images' },
    { type: 'facebook' as QRType, label: 'Facebook', icon: Facebook, color: 'text-blue-600', description: 'Share your Facebook page' },
    { type: 'instagram' as QRType, label: 'Instagram', icon: Instagram, color: 'text-pink-600', description: 'Share your Instagram' },
    { type: 'social' as QRType, label: 'Social Media', icon: Users, color: 'text-cyan-500', description: 'Share your social channels' },
    { type: 'whatsapp' as QRType, label: 'WhatsApp', icon: MessageSquare, color: 'text-green-600', description: 'Get WhatsApp messages' },
    { type: 'mp3' as QRType, label: 'MP3', icon: Music, color: 'text-yellow-500', description: 'Share audio files' },
    { type: 'menu' as QRType, label: 'Menu', icon: Menu, color: 'text-teal-500', description: 'Create a restaurant menu' },
    { type: 'apps' as QRType, label: 'Apps', icon: Smartphone, color: 'text-gray-600', description: 'Redirect to an app store' },
    { type: 'coupon' as QRType, label: 'Coupon', icon: Gift, color: 'text-amber-500', description: 'Share a coupon' },
    { type: 'wifi' as QRType, label: 'WiFi', icon: Wifi, color: 'text-blue-400', description: 'Connect to a Wi-Fi network' },
    { type: 'text' as QRType, label: 'Text', icon: MessageSquare, color: 'text-gray-700', description: 'Plain text content' },
    { type: 'email' as QRType, label: 'Email', icon: Mail, color: 'text-red-400', description: 'Send an email' },
    { type: 'phone' as QRType, label: 'Phone', icon: Phone, color: 'text-green-400', description: 'Make a phone call' },
    { type: 'sms' as QRType, label: 'SMS', icon: MessageSquare, color: 'text-blue-300', description: 'Send a text message' },
    { type: 'event' as QRType, label: 'Event', icon: Calendar, color: 'text-purple-400', description: 'Add calendar event' },
    { type: 'location' as QRType, label: 'Location', icon: MapPin, color: 'text-red-600', description: 'Share GPS coordinates' },
    { type: 'crypto' as QRType, label: 'Crypto', icon: CreditCard, color: 'text-yellow-600', description: 'Cryptocurrency payment' }
  ];

  // Step indicator component
  const StepIndicator = () => (
    <div className="flex items-center justify-center gap-4 mb-8">
      <div className="flex items-center">
        <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-semibold">
          1
        </div>
        <span className="ml-2 text-sm font-medium text-primary">Select QR type</span>
      </div>
      <div className="w-8 h-0.5 bg-border"></div>
      <div className="flex items-center">
        <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-semibold">
          2
        </div>
        <span className="ml-2 text-sm font-medium text-primary">Add content</span>
      </div>
      <div className="w-8 h-0.5 bg-border"></div>
      <div className="flex items-center">
        <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-semibold">
          3
        </div>
        <span className="ml-2 text-sm font-medium text-primary">Design QR code</span>
      </div>
    </div>
  );

  const generateQRValue = (): string => {
    switch (qrType) {
      case 'text':
        return qrData.text;
      case 'url':
        return qrData.url;
      case 'email':
        return `mailto:${qrData.email}`;
      case 'phone':
        return `tel:${qrData.phone}`;
      case 'sms':
        return `sms:${qrData.sms}`;
      case 'wifi':
        return `WIFI:T:${qrData.wifi.security};S:${qrData.wifi.ssid};P:${qrData.wifi.password};H:${qrData.wifi.hidden};`;
      case 'vcard':
        return `BEGIN:VCARD\nVERSION:3.0\nFN:${qrData.vcard.firstName} ${qrData.vcard.lastName}\nORG:${qrData.vcard.organization}\nTEL:${qrData.vcard.phone}\nEMAIL:${qrData.vcard.email}\nURL:${qrData.vcard.website}\nADR:${qrData.vcard.address}\nEND:VCARD`;
      case 'event':
        return `BEGIN:VEVENT\nSUMMARY:${qrData.event.title}\nDTSTART:${qrData.event.start}\nDTEND:${qrData.event.end}\nLOCATION:${qrData.event.location}\nDESCRIPTION:${qrData.event.description}\nEND:VEVENT`;
      case 'pdf':
        return qrData.pdf;
      case 'links':
        return qrData.links;
      case 'business':
        return `BEGIN:VCARD\nVERSION:3.0\nORG:${qrData.business.name}\nTEL:${qrData.business.phone}\nEMAIL:${qrData.business.email}\nURL:${qrData.business.website}\nADR:${qrData.business.address}\nNOTE:${qrData.business.description}\nEND:VCARD`;
      case 'video':
        return qrData.video;
      case 'images':
        return qrData.images;
      case 'social':
        return qrData.social;
      case 'whatsapp':
        return `https://wa.me/${qrData.whatsapp.number}?text=${encodeURIComponent(qrData.whatsapp.message)}`;
      case 'mp3':
        return qrData.mp3;
      case 'menu':
        return qrData.menu;
      case 'apps':
        return qrData.apps.url;
      case 'coupon':
        return `Coupon: ${qrData.coupon.title}\nCode: ${qrData.coupon.code}\nDiscount: ${qrData.coupon.discount}\nExpiry: ${qrData.coupon.expiry}\nDescription: ${qrData.coupon.description}`;
      case 'facebook':
        return qrData.facebook;
      case 'instagram':
        return qrData.instagram;
      case 'twitter':
        return qrData.twitter;
      case 'linkedin':
        return qrData.linkedin;
      case 'youtube':
        return qrData.youtube;
      case 'location':
        return `geo:${qrData.location.latitude},${qrData.location.longitude}?q=${qrData.location.latitude},${qrData.location.longitude}(${qrData.location.address})`;
      case 'crypto':
        return `${qrData.crypto.currency.toLowerCase()}:${qrData.crypto.address}?amount=${qrData.crypto.amount}`;
      default:
        return '';
    }
  };

  const downloadQR = async (format: 'png' | 'svg') => {
    if (!qrRef.current) return;

    try {
      let dataUrl: string;
      
      if (format === 'png') {
        dataUrl = await toPng(qrRef.current, {
          quality: 1,
          pixelRatio: 3,
          backgroundColor: qrStyle.bgColor,
        });
      } else {
        dataUrl = await toSvg(qrRef.current, {
          backgroundColor: qrStyle.bgColor,
        });
      }

      const link = document.createElement('a');
      link.download = `qrcraft-${qrType}-${Date.now()}.${format}`;
      link.href = dataUrl;
      link.click();

      toast({
        title: "✨ QR Code Downloaded!",
        description: `Your ${qrType.toUpperCase()} QR code has been saved as ${format.toUpperCase()}.`,
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "There was an error downloading your QR code. Please try again.",
        variant: "destructive",
      });
    }
  };

  const copyQRValue = async () => {
    const value = generateQRValue();
    if (!value) return;

    try {
      await navigator.clipboard.writeText(value);
      toast({
        title: "📋 Copied to Clipboard!",
        description: "QR code content has been copied to your clipboard.",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Could not copy to clipboard. Please try again.",
        variant: "destructive",
      });
    }
  };

  const shareQR = async () => {
    if (!navigator.share) {
      toast({
        title: "Share not supported",
        description: "Your browser doesn't support native sharing.",
        variant: "destructive",
      });
      return;
    }

    try {
      await navigator.share({
        title: 'QrCraft - QR Code',
        text: `Check out this QR code I created with QrCraft: ${generateQRValue()}`,
        url: window.location.href,
      });
    } catch (error) {
      // User cancelled or share failed
    }
  };

  const renderContentForm = () => {
    const config = qrTypeConfigs.find(config => config.type === qrType);
    const IconComponent = config?.icon || QrCode;

    return (
      <Card className="card-elevated animate-slide-in-left">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl bg-muted/50 flex items-center justify-center`}>
              <IconComponent className={`w-6 h-6 ${config?.color || 'text-gray-500'}`} />
            </div>
            <div>
              <h3 className="text-lg font-semibold">{config?.label || 'Content'}</h3>
              <p className="text-sm text-muted-foreground">{config?.description}</p>
            </div>
          </div>

          <div className="space-y-4">
            {qrType === 'text' && (
              <div>
                <Label htmlFor="text" className="text-sm font-medium">Text Content</Label>
                <Textarea
                  id="text"
                  placeholder="Enter your text here..."
                  value={qrData.text}
                  onChange={(e) => setQrData({ ...qrData, text: e.target.value })}
                  className="input-elevated mt-2 min-h-[100px] resize-y"
                />
              </div>
            )}

            {qrType === 'url' && (
              <div>
                <Label htmlFor="url" className="text-sm font-medium">Website URL</Label>
                <Input
                  id="url"
                  type="url"
                  placeholder="https://example.com"
                  value={qrData.url}
                  onChange={(e) => setQrData({ ...qrData, url: e.target.value })}
                  className="input-elevated mt-2"
                />
              </div>
            )}

            {qrType === 'email' && (
              <div>
                <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="contact@example.com"
                  value={qrData.email}
                  onChange={(e) => setQrData({ ...qrData, email: e.target.value })}
                  className="input-elevated mt-2"
                />
              </div>
            )}

            {qrType === 'phone' && (
              <div>
                <Label htmlFor="phone" className="text-sm font-medium">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1234567890"
                  value={qrData.phone}
                  onChange={(e) => setQrData({ ...qrData, phone: e.target.value })}
                  className="input-elevated mt-2"
                />
              </div>
            )}

            {qrType === 'sms' && (
              <div>
                <Label htmlFor="sms" className="text-sm font-medium">SMS Number</Label>
                <Input
                  id="sms"
                  type="tel"
                  placeholder="+1234567890"
                  value={qrData.sms}
                  onChange={(e) => setQrData({ ...qrData, sms: e.target.value })}
                  className="input-elevated mt-2"
                />
              </div>
            )}

            {qrType === 'wifi' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="ssid" className="text-sm font-medium">Network Name (SSID)</Label>
                    <Input
                      id="ssid"
                      placeholder="MyWiFiNetwork"
                      value={qrData.wifi.ssid}
                      onChange={(e) => setQrData({ 
                        ...qrData, 
                        wifi: { ...qrData.wifi, ssid: e.target.value }
                      })}
                      className="input-elevated mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="WiFi password"
                      value={qrData.wifi.password}
                      onChange={(e) => setQrData({ 
                        ...qrData, 
                        wifi: { ...qrData.wifi, password: e.target.value }
                      })}
                      className="input-elevated mt-2"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="security" className="text-sm font-medium">Security Type</Label>
                  <Select 
                    value={qrData.wifi.security} 
                    onValueChange={(value: 'WPA' | 'WEP' | 'nopass') => 
                      setQrData({ 
                        ...qrData, 
                        wifi: { ...qrData.wifi, security: value }
                      })
                    }
                  >
                    <SelectTrigger className="input-elevated mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="WPA">WPA/WPA2</SelectItem>
                      <SelectItem value="WEP">WEP</SelectItem>
                      <SelectItem value="nopass">No Password</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {qrType === 'vcard' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName" className="text-sm font-medium">First Name</Label>
                    <Input
                      id="firstName"
                      placeholder="John"
                      value={qrData.vcard.firstName}
                      onChange={(e) => setQrData({ 
                        ...qrData, 
                        vcard: { ...qrData.vcard, firstName: e.target.value }
                      })}
                      className="input-elevated mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName" className="text-sm font-medium">Last Name</Label>
                    <Input
                      id="lastName"
                      placeholder="Doe"
                      value={qrData.vcard.lastName}
                      onChange={(e) => setQrData({ 
                        ...qrData, 
                        vcard: { ...qrData.vcard, lastName: e.target.value }
                      })}
                      className="input-elevated mt-2"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="vcardPhone" className="text-sm font-medium">Phone</Label>
                    <Input
                      id="vcardPhone"
                      type="tel"
                      placeholder="+1234567890"
                      value={qrData.vcard.phone}
                      onChange={(e) => setQrData({ 
                        ...qrData, 
                        vcard: { ...qrData.vcard, phone: e.target.value }
                      })}
                      className="input-elevated mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="vcardEmail" className="text-sm font-medium">Email</Label>
                    <Input
                      id="vcardEmail"
                      type="email"
                      placeholder="john@example.com"
                      value={qrData.vcard.email}
                      onChange={(e) => setQrData({ 
                        ...qrData, 
                        vcard: { ...qrData.vcard, email: e.target.value }
                      })}
                      className="input-elevated mt-2"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="organization" className="text-sm font-medium">Organization</Label>
                  <Input
                    id="organization"
                    placeholder="Company Name"
                    value={qrData.vcard.organization}
                    onChange={(e) => setQrData({ 
                      ...qrData, 
                      vcard: { ...qrData.vcard, organization: e.target.value }
                    })}
                    className="input-elevated mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="vcardWebsite" className="text-sm font-medium">Website</Label>
                  <Input
                    id="vcardWebsite"
                    placeholder="https://example.com"
                    value={qrData.vcard.website}
                    onChange={(e) => setQrData({ 
                      ...qrData, 
                      vcard: { ...qrData.vcard, website: e.target.value }
                    })}
                    className="input-elevated mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="vcardAddress" className="text-sm font-medium">Address</Label>
                  <Textarea
                    id="vcardAddress"
                    placeholder="123 Main St, City, State, ZIP"
                    value={qrData.vcard.address}
                    onChange={(e) => setQrData({ 
                      ...qrData, 
                      vcard: { ...qrData.vcard, address: e.target.value }
                    })}
                    className="input-elevated mt-2"
                  />
                </div>
              </div>
            )}

            {qrType === 'whatsapp' && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="whatsappNumber" className="text-sm font-medium">WhatsApp Number</Label>
                  <Input
                    id="whatsappNumber"
                    type="tel"
                    placeholder="+1234567890"
                    value={qrData.whatsapp.number}
                    onChange={(e) => setQrData({ 
                      ...qrData, 
                      whatsapp: { ...qrData.whatsapp, number: e.target.value }
                    })}
                    className="input-elevated mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="whatsappMessage" className="text-sm font-medium">Pre-filled Message</Label>
                  <Textarea
                    id="whatsappMessage"
                    placeholder="Hello! I'd like to know more about..."
                    value={qrData.whatsapp.message}
                    onChange={(e) => setQrData({ 
                      ...qrData, 
                      whatsapp: { ...qrData.whatsapp, message: e.target.value }
                    })}
                    className="input-elevated mt-2"
                  />
                </div>
              </div>
            )}

            {qrType === 'coupon' && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="couponTitle" className="text-sm font-medium">Coupon Title</Label>
                  <Input
                    id="couponTitle"
                    placeholder="Special Discount"
                    value={qrData.coupon.title}
                    onChange={(e) => setQrData({ 
                      ...qrData, 
                      coupon: { ...qrData.coupon, title: e.target.value }
                    })}
                    className="input-elevated mt-2"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="couponCode" className="text-sm font-medium">Coupon Code</Label>
                    <Input
                      id="couponCode"
                      placeholder="SAVE20"
                      value={qrData.coupon.code}
                      onChange={(e) => setQrData({ 
                        ...qrData, 
                        coupon: { ...qrData.coupon, code: e.target.value }
                      })}
                      className="input-elevated mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="couponDiscount" className="text-sm font-medium">Discount</Label>
                    <Input
                      id="couponDiscount"
                      placeholder="20% off"
                      value={qrData.coupon.discount}
                      onChange={(e) => setQrData({ 
                        ...qrData, 
                        coupon: { ...qrData.coupon, discount: e.target.value }
                      })}
                      className="input-elevated mt-2"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="couponExpiry" className="text-sm font-medium">Expiry Date</Label>
                  <Input
                    id="couponExpiry"
                    type="date"
                    value={qrData.coupon.expiry}
                    onChange={(e) => setQrData({ 
                      ...qrData, 
                      coupon: { ...qrData.coupon, expiry: e.target.value }
                    })}
                    className="input-elevated mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="couponDescription" className="text-sm font-medium">Description</Label>
                  <Textarea
                    id="couponDescription"
                    placeholder="Terms and conditions..."
                    value={qrData.coupon.description}
                    onChange={(e) => setQrData({ 
                      ...qrData, 
                      coupon: { ...qrData.coupon, description: e.target.value }
                    })}
                    className="input-elevated mt-2"
                  />
                </div>
              </div>
            )}

            {(qrType === 'pdf' || qrType === 'video' || qrType === 'images' || qrType === 'mp3' || qrType === 'menu' || qrType === 'links' || qrType === 'social') && (
              <div>
                <Label htmlFor="urlInput" className="text-sm font-medium">URL</Label>
                <Input
                  id="urlInput"
                  type="url"
                  placeholder="https://example.com"
                  value={qrData[qrType as keyof QRData] as string}
                  onChange={(e) => setQrData({ ...qrData, [qrType]: e.target.value })}
                  className="input-elevated mt-2"
                />
              </div>
            )}

            {(qrType === 'facebook' || qrType === 'instagram' || qrType === 'twitter' || qrType === 'linkedin' || qrType === 'youtube') && (
              <div>
                <Label htmlFor="socialUrl" className="text-sm font-medium">{config?.label} URL</Label>
                <Input
                  id="socialUrl"
                  type="url"
                  placeholder={`https://${qrType}.com/username`}
                  value={qrData[qrType as keyof QRData] as string}
                  onChange={(e) => setQrData({ ...qrData, [qrType]: e.target.value })}
                  className="input-elevated mt-2"
                />
              </div>
            )}
          </div>
        </div>
      </Card>
    );
  };

  const qrValue = generateQRValue();

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header with back button */}
      <div className="bg-card border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center gap-4">
            {onBack && (
              <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
            )}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-primary to-primary-hover rounded-xl flex items-center justify-center">
                <QrCode className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">QrCraft</h1>
                <p className="text-sm text-muted-foreground">Professional QR Generator</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 py-8">
        {/* Step Indicator */}
        <StepIndicator />

        {/* Main heading */}
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl md:text-4xl font-bold">
            Create a <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">QR code</span> in seconds!
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Choose from a variety of QR codes to match your needs. Our custom QR codes can link to your business website, provide WiFi access, display restaurant menus, and more.
          </p>
        </div>

        {/* QR Type Selection Grid */}
        <div className="mb-12">
          <h3 className="text-xl font-semibold mb-6 text-center">Select QR Type</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-8">
            {qrTypeConfigs.map((config) => (
              <button
                key={config.type}
                onClick={() => setQrType(config.type)}
                className={`p-4 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${
                  qrType === config.type 
                    ? 'border-primary bg-primary/5 shadow-lg' 
                    : 'border-border hover:border-primary/50 bg-card'
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <div className={`w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center`}>
                    <config.icon className={`w-5 h-5 ${config.color}`} />
                  </div>
                  <span className="text-xs font-medium text-center">{config.label}</span>
                  <span className="text-xs text-muted-foreground text-center leading-tight">{config.description}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Content Form */}
          <div className="space-y-6">
            {renderContentForm()}
            
            {/* Style Settings */}
            <Card className="card-elevated">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-muted/50 flex items-center justify-center">
                    <Palette className="w-6 h-6 text-pink-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Customize Style</h3>
                    <p className="text-sm text-muted-foreground">Personalize your QR code appearance</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fgColor" className="text-sm font-medium">Foreground Color</Label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        id="fgColor"
                        type="color"
                        value={qrStyle.fgColor}
                        onChange={(e) => setQrStyle({ ...qrStyle, fgColor: e.target.value })}
                        className="w-16 h-10 p-1 border"
                      />
                      <Input
                        type="text"
                        value={qrStyle.fgColor}
                        onChange={(e) => setQrStyle({ ...qrStyle, fgColor: e.target.value })}
                        className="input-elevated flex-1"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="bgColor" className="text-sm font-medium">Background Color</Label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        id="bgColor"
                        type="color"
                        value={qrStyle.bgColor}
                        onChange={(e) => setQrStyle({ ...qrStyle, bgColor: e.target.value })}
                        className="w-16 h-10 p-1 border"
                      />
                      <Input
                        type="text"
                        value={qrStyle.bgColor}
                        onChange={(e) => setQrStyle({ ...qrStyle, bgColor: e.target.value })}
                        className="input-elevated flex-1"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="size" className="text-sm font-medium">Size (px)</Label>
                    <Input
                      id="size"
                      type="number"
                      min="100"
                      max="1000"
                      value={qrStyle.size}
                      onChange={(e) => setQrStyle({ ...qrStyle, size: parseInt(e.target.value) || 280 })}
                      className="input-elevated mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="level" className="text-sm font-medium">Error Correction</Label>
                    <Select 
                      value={qrStyle.level} 
                      onValueChange={(value: 'L' | 'M' | 'Q' | 'H') => setQrStyle({ ...qrStyle, level: value })}
                    >
                      <SelectTrigger className="input-elevated mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="L">Low (~7%)</SelectItem>
                        <SelectItem value="M">Medium (~15%)</SelectItem>
                        <SelectItem value="Q">Quartile (~25%)</SelectItem>
                        <SelectItem value="H">High (~30%)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* QR Preview and Actions */}
          <div className="space-y-6">
            <Card className="card-elevated animate-slide-in-right">
              <div className="space-y-6 text-center">
                <div>
                  <h3 className="text-lg font-semibold mb-2">QR Code Preview</h3>
                  <p className="text-sm text-muted-foreground">This is how your QR code will look</p>
                </div>

                <div className="flex justify-center">
                  <div 
                    ref={qrRef}
                    className="inline-block p-6 bg-white rounded-2xl shadow-lg border-2 border-border/20"
                    style={{ backgroundColor: qrStyle.bgColor }}
                  >
                    {qrValue ? (
                      <QRCodeSVG
                        value={qrValue}
                        size={qrStyle.size}
                        fgColor={qrStyle.fgColor}
                        bgColor={qrStyle.bgColor}
                        level={qrStyle.level}
                        includeMargin
                      />
                    ) : (
                      <div 
                        className="flex items-center justify-center border-2 border-dashed border-muted-foreground/30 rounded-lg"
                        style={{ width: qrStyle.size, height: qrStyle.size }}
                      >
                        <div className="text-center">
                          <QrCode className="w-12 h-12 text-muted-foreground/50 mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">Enter content to generate QR code</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {qrValue && (
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2 justify-center">
                      <Button onClick={copyQRValue} variant="outline" size="sm" className="gap-2">
                        <Copy className="w-4 h-4" />
                        Copy Content
                      </Button>
                      <Button onClick={shareQR} variant="outline" size="sm" className="gap-2">
                        <Share2 className="w-4 h-4" />
                        Share
                      </Button>
                    </div>

                    <div className="flex flex-wrap gap-2 justify-center">
                      <Button onClick={() => downloadQR('png')} className="gap-2 btn-primary">
                        <Download className="w-4 h-4" />
                        Download PNG
                      </Button>
                      <Button onClick={() => downloadQR('svg')} variant="outline" className="gap-2">
                        <Download className="w-4 h-4" />
                        Download SVG
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Info section */}
            <Card className="card-premium">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-r from-primary to-accent rounded-2xl flex items-center justify-center mx-auto">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Create your QR codes today!</h3>
                  <p className="text-sm text-muted-foreground">
                    We offer high-resolution QR codes that look great in a variety of mediums. 
                    Save your codes in several popular file formats and print or edit them anytime.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QrGenerator;