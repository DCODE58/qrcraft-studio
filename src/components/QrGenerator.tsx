import { useState, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { toPng, toSvg } from 'html-to-image';
import { HexColorPicker } from 'react-colorful';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { 
  ArrowLeft, Download, Palette, Settings, Wifi, Phone, Mail, User, Calendar, 
  MessageSquare, Copy, Share2, Sparkles, Zap, Globe, FileText, Link, Users, 
  Video, Camera, Music, Briefcase, MapPin, Clock, Menu, Store, Ticket, Gift,
  Facebook, Instagram, Twitter, Youtube, Linkedin, Github, Chrome, Smartphone,
  Receipt, Car, Home, CreditCard, FileImage, HelpCircle, QrCode, Eye, EyeOff,
  Lock, ImageIcon, CheckCircle, Plus, Loader2, Edit3, X
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { toast as sonnerToast } from 'sonner';
import { Switch } from '@/components/ui/switch';

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
  video: {
    title: string;
    description: string;
    url: string;
    customTag: string;
  };
  images: string;
  social: string;
  whatsapp: {
    number: string;
    message: string;
  };
  mp3: string;
  menu: {
    sections: Array<{
      id: string;
      name: string;
      description: string;
      items: Array<{
        id: string;
        name: string;
        description: string;
        price: string;
      }>;
    }>;
  };
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
    video: {
      title: '',
      description: '',
      url: '',
      customTag: ''
    },
    images: '',
    social: '',
    whatsapp: {
      number: '',
      message: ''
    },
    mp3: '',
    menu: {
      sections: [],
    },
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

  const [hasPassword, setHasPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedColorPalette, setSelectedColorPalette] = useState('blue-green');
  const [qrFrame, setQrFrame] = useState('scan-me');
  const [customFrameName, setCustomFrameName] = useState('Scan Me');
  const [uploadedFiles, setUploadedFiles] = useState<{[key: string]: File}>({});
  const [socialLinks, setSocialLinks] = useState<{platform: string, url: string}[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showColorPalette, setShowColorPalette] = useState(false);
  const qrCodeRef = useRef<HTMLDivElement>(null);
  const contentFormRef = useRef<HTMLDivElement>(null);

  const qrRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const colorPalettes = {
    'blue-green': { primary: '#527AC9', secondary: '#7EC09F' },
    'black': { primary: '#000000', secondary: '#333333' },
    'dark-blue': { primary: '#1E3A8A', secondary: '#3B82F6' },
    'purple': { primary: '#7C3AED', secondary: '#A78BFA' },
    'green-black': { primary: '#059669', secondary: '#000000' },
    'yellow-black': { primary: '#F59E0B', secondary: '#000000' }
  };

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

  // Auto-scroll to content form when type is selected
  const scrollToContentForm = () => {
    if (contentFormRef.current) {
      const headerHeight = 80; // Account for header height
      const elementTop = contentFormRef.current.offsetTop - headerHeight;
      window.scrollTo({ 
        top: elementTop, 
        behavior: 'smooth' 
      });
    }
  };

  // Handle QR type selection with auto-scroll
  const handleQRTypeSelect = (type: QRType) => {
    setQrType(type);
    setCurrentStep(2);
    // Delay scroll to ensure the content form is rendered and DOM updated
    setTimeout(() => {
      scrollToContentForm();
    }, 150);
  };

  // Handle file upload
  const handleFileUpload = (file: File, type: string) => {
    setUploadedFiles(prev => ({ ...prev, [type]: file }));
    const fileUrl = URL.createObjectURL(file);
    
    switch (type) {
      case 'pdf':
        setQrData({ ...qrData, pdf: fileUrl });
        break;
      case 'mp3':
        setQrData({ ...qrData, mp3: fileUrl });
        break;
      case 'video':
        setQrData({ ...qrData, video: { ...qrData.video, url: fileUrl } });
        break;
      case 'images':
        setQrData({ ...qrData, images: fileUrl });
        break;
    }
  };

  // Get current location for location QR type
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Geolocation not supported",
        description: "Your browser doesn't support geolocation.",
        variant: "destructive",
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setQrData({
          ...qrData,
          location: {
            ...qrData.location,
            latitude: latitude.toString(),
            longitude: longitude.toString(),
          }
        });
        toast({
          title: "📍 Location Detected!",
          description: "Your current location has been added to the QR code.",
          className: "bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200",
        });
      },
      (error) => {
        toast({
          title: "Location access denied",
          description: "Please allow location access or enter coordinates manually.",
          variant: "destructive",
        });
      }
    );
  };

  // Step indicator component
  const StepIndicator = () => (
    <div className="flex items-center justify-center gap-4 mb-8">
      <div className="flex items-center">
        <div className={`w-8 h-8 ${currentStep >= 1 ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'} rounded-full flex items-center justify-center text-sm font-semibold`}>
          {currentStep > 1 ? <CheckCircle className="w-4 h-4" /> : '1'}
        </div>
        <span className={`ml-2 text-sm font-medium ${currentStep >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>Select QR type</span>
      </div>
      <div className={`w-8 h-0.5 ${currentStep > 1 ? 'bg-primary' : 'bg-border'}`}></div>
      <div className="flex items-center">
        <div className={`w-8 h-8 ${currentStep >= 2 ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'} rounded-full flex items-center justify-center text-sm font-semibold`}>
          {currentStep > 2 ? <CheckCircle className="w-4 h-4" /> : '2'}
        </div>
        <span className={`ml-2 text-sm font-medium ${currentStep >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>Add content</span>
      </div>
      <div className={`w-8 h-0.5 ${currentStep > 2 ? 'bg-primary' : 'bg-border'}`}></div>
      <div className="flex items-center">
        <div className={`w-8 h-8 ${currentStep >= 3 ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'} rounded-full flex items-center justify-center text-sm font-semibold`}>
          3
        </div>
        <span className={`ml-2 text-sm font-medium ${currentStep >= 3 ? 'text-primary' : 'text-muted-foreground'}`}>Design QR code</span>
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
        const linksText = socialLinks.map(link => `${link.platform}: ${link.url}`).join('\n');
        return linksText || qrData.links;
      case 'business':
        return `BEGIN:VCARD\nVERSION:3.0\nORG:${qrData.business.name}\nTEL:${qrData.business.phone}\nEMAIL:${qrData.business.email}\nURL:${qrData.business.website}\nADR:${qrData.business.address}\nNOTE:${qrData.business.description}\nEND:VCARD`;
      case 'video':
        return qrData.video.url || `Video: ${qrData.video.title}\nDescription: ${qrData.video.description}\nTag: ${qrData.video.customTag}`;
      case 'images':
        return qrData.images;
      case 'social':
        const socialLinksText = socialLinks.map(link => `${link.platform}: ${link.url}`).join('\n');
        return socialLinksText || qrData.social;
      case 'whatsapp':
        return `https://wa.me/${qrData.whatsapp.number}?text=${encodeURIComponent(qrData.whatsapp.message)}`;
      case 'mp3':
        return qrData.mp3;
      case 'menu':
        const menuText = qrData.menu.sections.map(section => {
          const items = section.items.map(item => 
            `• ${item.name}${item.price ? ' - ' + item.price : ''}${item.description ? ' (' + item.description + ')' : ''}`
          ).join('\n');
          return `${section.name}${section.description ? ' - ' + section.description : ''}\n${items}`;
        }).join('\n\n');
        return menuText;
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

  // Generate protected QR value with password if enabled
  const getProtectedQRValue = (): string => {
    const baseValue = generateQRValue();
    if (hasPassword && password) {
      // Create a simple protection page URL with encoded data
      const encodedData = btoa(JSON.stringify({
        content: baseValue,
        password: password,
        type: qrType
      }));
      return `${window.location.origin}/password-protected#protected=${encodedData}`;
    }
    return baseValue;
  };

  const downloadQR = async (format: 'png' | 'svg') => {
    if (!qrRef.current) return;

    setIsGenerating(true);
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
      link.download = `qr-studio-${qrType}-${Date.now()}.${format}`;
      link.href = dataUrl;
      link.click();

      sonnerToast.success("✨ QR Code Downloaded!", {
        description: `Your ${qrType.toUpperCase()} QR code has been saved as ${format.toUpperCase()}.`,
        position: "top-center",
        duration: 3000,
      });
    } catch (error) {
      sonnerToast.error("Download Failed", {
        description: "There was an error downloading your QR code. Please try again.",
        position: "top-center",
        duration: 4000,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyQRValue = async () => {
    const value = getProtectedQRValue();
    if (!value) return;

    try {
      await navigator.clipboard.writeText(value);
      toast({
        title: "📋 Copied to Clipboard!",
        description: "QR code content has been copied to your clipboard.",
        className: "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200",
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
        title: 'Qr Studio - QR Code',
        text: `Check out this QR code I created with Qr Studio: ${getProtectedQRValue()}`,
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
      <div ref={contentFormRef}>
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
              <div className="space-y-4">
                <div>
                  <Label htmlFor="url" className="text-sm font-medium">Website URL</Label>
                  <Input
                    id="url"
                    type="url"
                    placeholder="https://example.com"
                    value={qrData.url}
                    onChange={(e) => setQrData({ ...qrData, url: e.target.value })}
                    className="input-elevated mt-2 bg-background text-foreground"
                  />
                </div>
                <div>
                  <Label htmlFor="url-custom-tag" className="text-sm font-medium">Custom Tag (Optional)</Label>
                  <Input
                    id="url-custom-tag"
                    placeholder="Add your custom tag here..."
                    className="input-elevated mt-2 bg-background text-foreground"
                  />
                </div>
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

            {qrType === 'pdf' && (
              <div className="space-y-4">
                <div className="border-2 border-dashed border-green-200 dark:border-green-800 rounded-lg p-8 text-center bg-green-50/50 dark:bg-green-950/20">
                  <FileText className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground mb-4">Upload the PDF file you want to display</p>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'pdf')}
                    className="hidden"
                    id="pdf-upload"
                  />
                  <Button 
                    variant="outline" 
                    onClick={() => document.getElementById('pdf-upload')?.click()}
                    className="mb-2"
                  >
                    Upload PDF
                  </Button>
                  <p className="text-xs text-muted-foreground">Maximum size: 25MB</p>
                </div>
                {uploadedFiles.pdf && (
                  <div className="text-sm text-green-600 dark:text-green-400 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    File uploaded: {uploadedFiles.pdf.name}
                  </div>
                )}
              </div>
            )}

            {qrType === 'mp3' && (
              <div className="space-y-4">
                <div className="border-2 border-dashed border-green-200 dark:border-green-800 rounded-lg p-8 text-center bg-green-50/50 dark:bg-green-950/20">
                  <Music className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground mb-4">Upload an audio file from your device</p>
                  <input
                    type="file"
                    accept=".mp3,.wav,.ogg"
                    onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'mp3')}
                    className="hidden"
                    id="mp3-upload"
                  />
                  <Button 
                    variant="outline" 
                    onClick={() => document.getElementById('mp3-upload')?.click()}
                    className="mb-2"
                  >
                    Upload MP3
                  </Button>
                  <p className="text-xs text-muted-foreground">Maximum size: 25MB</p>
                </div>
                {uploadedFiles.mp3 && (
                  <div className="text-sm text-green-600 dark:text-green-400 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    File uploaded: {uploadedFiles.mp3.name}
                  </div>
                )}
              </div>
            )}

            {qrType === 'video' && (
              <div className="space-y-4">
                <div className="border-2 border-dashed border-blue-200 dark:border-blue-800 rounded-lg p-8 text-center bg-blue-50/50 dark:bg-blue-950/20">
                  <Video className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground mb-4">Upload a video file or add video information</p>
                  
                  {/* Video Upload Section */}
                  <div className="mb-6">
                    <input
                      type="file"
                      accept=".mp4,.avi,.mov,.wmv,.webm"
                      onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'video')}
                      className="hidden"
                      id="video-upload"
                    />
                    <Button 
                      variant="outline" 
                      onClick={() => document.getElementById('video-upload')?.click()}
                      className="mb-2"
                    >
                      Upload Video File
                    </Button>
                    <p className="text-xs text-muted-foreground">Maximum size: 100MB</p>
                    {uploadedFiles.video && (
                      <div className="text-sm text-green-600 dark:text-green-400 flex items-center gap-2 mt-2">
                        <CheckCircle className="w-4 h-4" />
                        File uploaded: {uploadedFiles.video.name}
                      </div>
                    )}
                  </div>

                  {/* Video Details Form */}
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="video-title" className="text-sm font-medium">Video Title</Label>
                      <Input
                        id="video-title"
                        placeholder="E.g. My Awesome Video"
                        value={qrData.video.title}
                        onChange={(e) => setQrData({ ...qrData, video: { ...qrData.video, title: e.target.value } })}
                        className="input-elevated mt-2 bg-background text-foreground"
                      />
                    </div>
                    <div>
                      <Label htmlFor="video-description" className="text-sm font-medium">Description</Label>
                      <Textarea
                        id="video-description"
                        placeholder="E.g. Here is a video about..."
                        value={qrData.video.description}
                        onChange={(e) => setQrData({ ...qrData, video: { ...qrData.video, description: e.target.value } })}
                        className="input-elevated mt-2 min-h-[80px] bg-background text-foreground"
                      />
                      <div className="text-xs text-muted-foreground text-right mt-1">{qrData.video.description.length} / 4000</div>
                    </div>
                    <div>
                      <Label htmlFor="video-custom-tag" className="text-sm font-medium">Custom Tag</Label>
                      <Input
                        id="video-custom-tag"
                        placeholder="Add your custom tag here..."
                        value={qrData.video.customTag}
                        onChange={(e) => setQrData({ ...qrData, video: { ...qrData.video, customTag: e.target.value } })}
                        className="input-elevated mt-2 bg-background text-foreground"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {qrType === 'images' && (
              <div className="space-y-4">
                <div className="border-2 border-dashed border-purple-200 dark:border-purple-800 rounded-lg p-8 text-center bg-purple-50/50 dark:bg-purple-950/20">
                  <ImageIcon className="w-12 h-12 text-purple-500 mx-auto mb-4" />
                 <div className="space-y-4">
                   <div>
                     <Label htmlFor="gallery-title" className="text-sm font-medium">Image gallery/album title</Label>
                     <Input
                       id="gallery-title"
                       placeholder="E.g. My gallery"
                       className="input-elevated mt-2 bg-background text-foreground"
                     />
                   </div>
                   <div>
                     <Label htmlFor="gallery-description" className="text-sm font-medium">Image gallery/album description</Label>
                     <Textarea
                       id="gallery-description"
                       placeholder="E.g. Summer Pictures"
                       className="input-elevated mt-2 min-h-[80px]"
                     />
                     <div className="text-xs text-muted-foreground text-right mt-1">0 / 4000</div>
                   </div>
                   <div>
                     <Label htmlFor="gallery-website" className="text-sm font-medium">Website</Label>
                     <Input
                       id="gallery-website"
                       placeholder="E.g. https://www.mypictures.com/"
                       className="input-elevated mt-2 bg-background text-foreground"
                     />
                   </div>
                   
                   {/* Image Upload Section */}
                   <div className="mt-4">
                     <input
                       type="file"
                       accept="image/*"
                       multiple
                       onChange={(e) => {
                         const files = Array.from(e.target.files || []);
                         files.forEach(file => handleFileUpload(file, 'images'));
                       }}
                       className="hidden"
                       id="image-upload"
                     />
                     <Button 
                       variant="outline" 
                       onClick={() => document.getElementById('image-upload')?.click()}
                       className="w-full"
                     >
                       <ImageIcon className="w-4 h-4 mr-2" />
                       Upload Images
                     </Button>
                     <p className="text-xs text-muted-foreground mt-1 text-center">Upload multiple images (JPG, PNG, GIF)</p>
                   </div>
                 </div>
                </div>
              </div>
            )}

            {qrType === 'menu' && (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-2">Create Your Restaurant Menu</h3>
                  <p className="text-sm text-muted-foreground">Build a digital menu with sections and items</p>
                </div>
                
                {/* Menu Sections */}
                <div className="space-y-6">
                  {qrData.menu.sections.map((section, sectionIndex) => (
                    <div key={section.id} className="p-4 border border-border rounded-lg bg-muted/20">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold">Section {sectionIndex + 1}</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const newSections = qrData.menu.sections.filter((_, i) => i !== sectionIndex);
                            setQrData({ ...qrData, menu: { sections: newSections } });
                          }}
                          className="text-destructive hover:text-destructive"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm font-medium">Section Name *</Label>
                          <Input
                            placeholder="E.g. Appetizers, Main Course, Desserts"
                            value={section.name}
                            onChange={(e) => {
                              const newSections = [...qrData.menu.sections];
                              newSections[sectionIndex].name = e.target.value;
                              setQrData({ ...qrData, menu: { sections: newSections } });
                            }}
                            className="input-elevated mt-2"
                          />
                        </div>
                        
                        <div>
                          <Label className="text-sm font-medium">Section Description</Label>
                          <Textarea
                            placeholder="Brief description of this menu section"
                            value={section.description}
                            onChange={(e) => {
                              const newSections = [...qrData.menu.sections];
                              newSections[sectionIndex].description = e.target.value;
                              setQrData({ ...qrData, menu: { sections: newSections } });
                            }}
                            className="input-elevated mt-2 min-h-[60px]"
                          />
                        </div>
                        
                        {/* Menu Items */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Label className="text-sm font-medium">Menu Items</Label>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                const newSections = [...qrData.menu.sections];
                                newSections[sectionIndex].items.push({
                                  id: Date.now().toString(),
                                  name: '',
                                  description: '',
                                  price: ''
                                });
                                setQrData({ ...qrData, menu: { sections: newSections } });
                              }}
                              className="gap-1"
                            >
                              <Plus className="w-3 h-3" />
                              Add Item
                            </Button>
                          </div>
                          
                          {section.items.map((item, itemIndex) => (
                            <div key={item.id} className="p-3 bg-background rounded border">
                              <div className="flex items-start justify-between mb-2">
                                <span className="text-xs font-medium text-muted-foreground">Item {itemIndex + 1}</span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    const newSections = [...qrData.menu.sections];
                                    newSections[sectionIndex].items = section.items.filter((_, i) => i !== itemIndex);
                                    setQrData({ ...qrData, menu: { sections: newSections } });
                                  }}
                                  className="text-destructive hover:text-destructive p-1 h-auto"
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div className="md:col-span-1">
                                  <Input
                                    placeholder="Item name"
                                    value={item.name}
                                    onChange={(e) => {
                                      const newSections = [...qrData.menu.sections];
                                      newSections[sectionIndex].items[itemIndex].name = e.target.value;
                                      setQrData({ ...qrData, menu: { sections: newSections } });
                                    }}
                                    className="text-sm"
                                  />
                                </div>
                                <div className="md:col-span-1">
                                  <Input
                                    placeholder="Description"
                                    value={item.description}
                                    onChange={(e) => {
                                      const newSections = [...qrData.menu.sections];
                                      newSections[sectionIndex].items[itemIndex].description = e.target.value;
                                      setQrData({ ...qrData, menu: { sections: newSections } });
                                    }}
                                    className="text-sm"
                                  />
                                </div>
                                <div className="md:col-span-1">
                                  <Input
                                    placeholder="Price"
                                    value={item.price}
                                    onChange={(e) => {
                                      const newSections = [...qrData.menu.sections];
                                      newSections[sectionIndex].items[itemIndex].price = e.target.value;
                                      setQrData({ ...qrData, menu: { sections: newSections } });
                                    }}
                                    className="text-sm"
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Add Section Button */}
                  <Button
                    variant="outline"
                    onClick={() => {
                      const newSection = {
                        id: Date.now().toString(),
                        name: '',
                        description: '',
                        items: []
                      };
                      setQrData({ 
                        ...qrData, 
                        menu: { 
                          sections: [...qrData.menu.sections, newSection] 
                        } 
                      });
                    }}
                    className="w-full gap-2 border-dashed"
                  >
                    <Plus className="w-4 h-4" />
                    Add Menu Section
                  </Button>
                </div>
              </div>
            )}

            {qrType === 'links' && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="links-title" className="text-sm font-medium">Title</Label>
                  <Input
                    id="links-title"
                    placeholder="Links Collection"
                    value={qrData.links}
                    onChange={(e) => setQrData({ ...qrData, links: e.target.value })}
                    className="input-elevated mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="links-description" className="text-sm font-medium">Description</Label>
                  <Textarea
                    id="links-description"
                    placeholder="Collection of useful links"
                    className="input-elevated mt-2 min-h-[80px]"
                  />
                </div>
                
                {/* Social Media Links */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Social Media Links</Label>
                  {socialLinks.map((link, index) => (
                    <div key={index} className="flex gap-2">
                      <Select value={link.platform} onValueChange={(value) => {
                        const newLinks = [...socialLinks];
                        newLinks[index].platform = value;
                        setSocialLinks(newLinks);
                      }}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="instagram">Instagram</SelectItem>
                          <SelectItem value="facebook">Facebook</SelectItem>
                          <SelectItem value="twitter">Twitter/X</SelectItem>
                          <SelectItem value="linkedin">LinkedIn</SelectItem>
                          <SelectItem value="youtube">YouTube</SelectItem>
                          <SelectItem value="github">GitHub</SelectItem>
                          <SelectItem value="snapchat">Snapchat</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        placeholder="https://..."
                        value={link.url}
                        onChange={(e) => {
                          const newLinks = [...socialLinks];
                          newLinks[index].url = e.target.value;
                          setSocialLinks(newLinks);
                        }}
                        className="flex-1"
                      />
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSocialLinks(socialLinks.filter((_, i) => i !== index))}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  <Button 
                    variant="outline" 
                    onClick={() => setSocialLinks([...socialLinks, { platform: 'instagram', url: '' }])}
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Social Link
                  </Button>
                </div>
              </div>
            )}

            {qrType === 'social' && (
              <div className="space-y-4">
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Social Media Links</Label>
                  {socialLinks.map((link, index) => (
                    <div key={index} className="flex gap-2">
                      <Select value={link.platform} onValueChange={(value) => {
                        const newLinks = [...socialLinks];
                        newLinks[index].platform = value;
                        setSocialLinks(newLinks);
                      }}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="instagram">Instagram</SelectItem>
                          <SelectItem value="facebook">Facebook</SelectItem>
                          <SelectItem value="twitter">Twitter/X</SelectItem>
                          <SelectItem value="linkedin">LinkedIn</SelectItem>
                          <SelectItem value="youtube">YouTube</SelectItem>
                          <SelectItem value="github">GitHub</SelectItem>
                          <SelectItem value="snapchat">Snapchat</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        placeholder="https://..."
                        value={link.url}
                        onChange={(e) => {
                          const newLinks = [...socialLinks];
                          newLinks[index].url = e.target.value;
                          setSocialLinks(newLinks);
                        }}
                        className="flex-1"
                      />
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSocialLinks(socialLinks.filter((_, i) => i !== index))}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  <Button 
                    variant="outline" 
                    onClick={() => setSocialLinks([...socialLinks, { platform: 'instagram', url: '' }])}
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Social Link
                  </Button>
                </div>
              </div>
            )}

            {qrType === 'event' && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="eventTitle" className="text-sm font-medium">Event Title</Label>
                  <Input
                    id="eventTitle"
                    placeholder="Birthday Party"
                    value={qrData.event.title}
                    onChange={(e) => setQrData({ 
                      ...qrData, 
                      event: { ...qrData.event, title: e.target.value }
                    })}
                    className="input-elevated mt-2"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="eventStart" className="text-sm font-medium">Start Date & Time</Label>
                    <Input
                      id="eventStart"
                      type="datetime-local"
                      value={qrData.event.start}
                      onChange={(e) => setQrData({ 
                        ...qrData, 
                        event: { ...qrData.event, start: e.target.value }
                      })}
                      className="input-elevated mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="eventEnd" className="text-sm font-medium">End Date & Time</Label>
                    <Input
                      id="eventEnd"
                      type="datetime-local"
                      value={qrData.event.end}
                      onChange={(e) => setQrData({ 
                        ...qrData, 
                        event: { ...qrData.event, end: e.target.value }
                      })}
                      className="input-elevated mt-2"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="eventLocation" className="text-sm font-medium">Location</Label>
                  <Input
                    id="eventLocation"
                    placeholder="123 Main St, City, State"
                    value={qrData.event.location}
                    onChange={(e) => setQrData({ 
                      ...qrData, 
                      event: { ...qrData.event, location: e.target.value }
                    })}
                    className="input-elevated mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="eventDescription" className="text-sm font-medium">Description</Label>
                  <Textarea
                    id="eventDescription"
                    placeholder="Event details and description..."
                    value={qrData.event.description}
                    onChange={(e) => setQrData({ 
                      ...qrData, 
                      event: { ...qrData.event, description: e.target.value }
                    })}
                    className="input-elevated mt-2"
                  />
                </div>
              </div>
            )}

            {qrType === 'location' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="latitude" className="text-sm font-medium">Latitude</Label>
                    <Input
                      id="latitude"
                      type="number"
                      step="any"
                      placeholder="40.7128"
                      value={qrData.location.latitude}
                      onChange={(e) => setQrData({ 
                        ...qrData, 
                        location: { ...qrData.location, latitude: e.target.value }
                      })}
                      className="input-elevated mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="longitude" className="text-sm font-medium">Longitude</Label>
                    <Input
                      id="longitude"
                      type="number"
                      step="any"
                      placeholder="-74.0060"
                      value={qrData.location.longitude}
                      onChange={(e) => setQrData({ 
                        ...qrData, 
                        location: { ...qrData.location, longitude: e.target.value }
                      })}
                      className="input-elevated mt-2"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="locationAddress" className="text-sm font-medium">Address/Label</Label>
                  <Input
                    id="locationAddress"
                    placeholder="Central Park, New York"
                    value={qrData.location.address}
                    onChange={(e) => setQrData({ 
                      ...qrData, 
                      location: { ...qrData.location, address: e.target.value }
                    })}
                    className="input-elevated mt-2"
                  />
                </div>
                <Button 
                  onClick={getCurrentLocation}
                  variant="outline" 
                  className="w-full gap-2"
                  type="button"
                >
                  <MapPin className="w-4 h-4" />
                  Use Current Location
                </Button>
                {qrData.location.latitude && qrData.location.longitude && (
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>
                        Location: {qrData.location.latitude}, {qrData.location.longitude}
                      </span>
                    </div>
                    <a 
                      href={`https://maps.google.com/?q=${qrData.location.latitude},${qrData.location.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline text-sm"
                    >
                      View on Google Maps
                    </a>
                  </div>
                )}
              </div>
            )}

            {qrType === 'crypto' && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="cryptoCurrency" className="text-sm font-medium">Cryptocurrency</Label>
                  <Select 
                    value={qrData.crypto.currency} 
                    onValueChange={(value) => 
                      setQrData({ 
                        ...qrData, 
                        crypto: { ...qrData.crypto, currency: value }
                      })
                    }
                  >
                    <SelectTrigger className="input-elevated mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BTC">Bitcoin (BTC)</SelectItem>
                      <SelectItem value="ETH">Ethereum (ETH)</SelectItem>
                      <SelectItem value="LTC">Litecoin (LTC)</SelectItem>
                      <SelectItem value="BCH">Bitcoin Cash (BCH)</SelectItem>
                      <SelectItem value="DOGE">Dogecoin (DOGE)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="cryptoAddress" className="text-sm font-medium">Wallet Address</Label>
                  <Input
                    id="cryptoAddress"
                    placeholder="1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"
                    value={qrData.crypto.address}
                    onChange={(e) => setQrData({ 
                      ...qrData, 
                      crypto: { ...qrData.crypto, address: e.target.value }
                    })}
                    className="input-elevated mt-2 font-mono text-xs"
                  />
                </div>
                <div>
                  <Label htmlFor="cryptoAmount" className="text-sm font-medium">Amount (Optional)</Label>
                  <Input
                    id="cryptoAmount"
                    type="number"
                    step="any"
                    placeholder="0.001"
                    value={qrData.crypto.amount}
                    onChange={(e) => setQrData({ 
                      ...qrData, 
                      crypto: { ...qrData.crypto, amount: e.target.value }
                    })}
                    className="input-elevated mt-2"
                  />
                </div>
              </div>
            )}

            {qrType === 'business' && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="businessName" className="text-sm font-medium">Business Name</Label>
                  <Input
                    id="businessName"
                    placeholder="Acme Corporation"
                    value={qrData.business.name}
                    onChange={(e) => setQrData({ 
                      ...qrData, 
                      business: { ...qrData.business, name: e.target.value }
                    })}
                    className="input-elevated mt-2"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="businessPhone" className="text-sm font-medium">Phone</Label>
                    <Input
                      id="businessPhone"
                      type="tel"
                      placeholder="+1234567890"
                      value={qrData.business.phone}
                      onChange={(e) => setQrData({ 
                        ...qrData, 
                        business: { ...qrData.business, phone: e.target.value }
                      })}
                      className="input-elevated mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="businessEmail" className="text-sm font-medium">Email</Label>
                    <Input
                      id="businessEmail"
                      type="email"
                      placeholder="contact@acme.com"
                      value={qrData.business.email}
                      onChange={(e) => setQrData({ 
                        ...qrData, 
                        business: { ...qrData.business, email: e.target.value }
                      })}
                      className="input-elevated mt-2"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="businessWebsite" className="text-sm font-medium">Website</Label>
                  <Input
                    id="businessWebsite"
                    placeholder="https://acme.com"
                    value={qrData.business.website}
                    onChange={(e) => setQrData({ 
                      ...qrData, 
                      business: { ...qrData.business, website: e.target.value }
                    })}
                    className="input-elevated mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="businessAddress" className="text-sm font-medium">Address</Label>
                  <Input
                    id="businessAddress"
                    placeholder="123 Business St, City, State, ZIP"
                    value={qrData.business.address}
                    onChange={(e) => setQrData({ 
                      ...qrData, 
                      business: { ...qrData.business, address: e.target.value }
                    })}
                    className="input-elevated mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="businessDescription" className="text-sm font-medium">Description</Label>
                  <Textarea
                    id="businessDescription"
                    placeholder="Brief description of your business..."
                    value={qrData.business.description}
                    onChange={(e) => setQrData({ 
                      ...qrData, 
                      business: { ...qrData.business, description: e.target.value }
                    })}
                    className="input-elevated mt-2"
                  />
                </div>
              </div>
            )}

            {qrType === 'apps' && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="appName" className="text-sm font-medium">App Name</Label>
                  <Input
                    id="appName"
                    placeholder="My Awesome App"
                    value={qrData.apps.name}
                    onChange={(e) => setQrData({ 
                      ...qrData, 
                      apps: { ...qrData.apps, name: e.target.value }
                    })}
                    className="input-elevated mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="appUrl" className="text-sm font-medium">App Store URL</Label>
                  <Input
                    id="appUrl"
                    type="url"
                    placeholder="https://apps.apple.com/app/..."
                    value={qrData.apps.url}
                    onChange={(e) => setQrData({ 
                      ...qrData, 
                      apps: { ...qrData.apps, url: e.target.value }
                    })}
                    className="input-elevated mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="appDescription" className="text-sm font-medium">Description</Label>
                  <Textarea
                    id="appDescription"
                    placeholder="App description..."
                    value={qrData.apps.description}
                    onChange={(e) => setQrData({ 
                      ...qrData, 
                      apps: { ...qrData.apps, description: e.target.value }
                    })}
                    className="input-elevated mt-2"
                  />
                </div>
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

            {/* Password Protection Section */}
            <div className="space-y-4 pt-4 border-t border-border/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Lock className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <Label className="text-sm font-medium">Password Protection</Label>
                    <p className="text-xs text-muted-foreground">Require a password to access this QR code</p>
                  </div>
                </div>
                <Switch
                  checked={hasPassword}
                  onCheckedChange={setHasPassword}
                />
              </div>
              
              {hasPassword && (
                <div className="space-y-2">
                  <Label htmlFor="qrPassword" className="text-sm font-medium">Password</Label>
                  <div className="relative">
                    <Input
                      id="qrPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="input-elevated pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <Eye className="w-4 h-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>
      </div>
    );
  };

  const qrValue = generateQRValue();
  const protectedQRValue = getProtectedQRValue();

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
                <h1 className="text-xl font-bold">Qr Studio</h1>
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
                onClick={() => handleQRTypeSelect(config.type)}
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

                {/* Color Palette Selection */}
                <div className="space-y-4">
                  <Label className="text-sm font-medium">Color palette</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {Object.entries(colorPalettes).map(([key, palette]) => (
                      <button
                        key={key}
                        onClick={() => {
                          setSelectedColorPalette(key);
                          setQrStyle({
                            ...qrStyle,
                            fgColor: palette.primary,
                            bgColor: '#FFFFFF'
                          });
                          setCurrentStep(3);
                        }}
                        className={`h-20 rounded-lg border-2 transition-all ${
                          selectedColorPalette === key 
                            ? 'border-primary ring-2 ring-primary/20' 
                            : 'border-border hover:border-primary/50'
                        }`}
                        style={{
                          background: key === 'blue-green' 
                            ? `linear-gradient(135deg, ${palette.primary}, ${palette.secondary})`
                            : key.includes('black')
                            ? `linear-gradient(135deg, ${palette.primary}, ${palette.secondary})`
                            : palette.primary
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* Interactive Color Picker */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Color Customization</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowColorPalette(!showColorPalette)}
                      className="gap-2"
                    >
                      <Palette className="w-4 h-4" />
                      {showColorPalette ? 'Hide Palette' : 'Show Palette'}
                    </Button>
                  </div>
                  
                  {showColorPalette && (
                    <div className="flex flex-col gap-4 p-4 bg-gradient-to-br from-muted/30 to-muted/50 rounded-lg border border-border/50 backdrop-blur-sm animate-fade-in">
                      <div className="w-full max-w-xs mx-auto">
                        <HexColorPicker 
                          color={qrStyle.fgColor} 
                          onChange={(color) => {
                            setQrStyle({ ...qrStyle, fgColor: color });
                            setCurrentStep(3);
                          }}
                          style={{ width: '100%', height: '200px' }}
                        />
                      </div>
                      <div className="flex gap-2 items-center">
                      <div 
                        className="w-12 h-10 rounded border border-border"
                        style={{ backgroundColor: qrStyle.fgColor }}
                      />
                      <Input
                        type="text"
                        value={qrStyle.fgColor}
                        onChange={(e) => setQrStyle({ ...qrStyle, fgColor: e.target.value })}
                        className="input-elevated flex-1 bg-background text-foreground"
                        placeholder="#527AC9"
                      />
                        </div>
                      </div>
                    )}
                  </div>

                {/* QR Frame Selection */}
                <div className="space-y-4">
                  <Label className="text-sm font-medium">QR Frame Style</Label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => setQrFrame('scan-me')}
                      className={`p-4 border-2 rounded-lg text-center transition-all ${
                        qrFrame === 'scan-me' 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="text-sm font-medium">Scan Me</div>
                      <div className="text-xs text-muted-foreground mt-1">Classic frame</div>
                    </button>
                    <button
                      onClick={() => setQrFrame('rounded')}
                      className={`p-4 border-2 rounded-lg text-center transition-all ${
                        qrFrame === 'rounded' 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="text-sm font-medium">Rounded</div>
                      <div className="text-xs text-muted-foreground mt-1">Modern frame</div>
                    </button>
                    <button
                      onClick={() => setQrFrame('custom')}
                      className={`p-4 border-2 rounded-lg text-center transition-all ${
                        qrFrame === 'custom' 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="text-sm font-medium">Custom</div>
                      <div className="text-xs text-muted-foreground mt-1">Your own text</div>
                    </button>
                  </div>
                  
                  {/* Custom Frame Name Input */}
                  {qrFrame === 'custom' && (
                    <div className="mt-3">
                      <Label htmlFor="custom-frame-name" className="text-sm font-medium">Custom Frame Text</Label>
                      <div className="flex gap-2 mt-2">
                        <Input
                          id="custom-frame-name"
                          placeholder="Enter custom text..."
                          value={customFrameName}
                          onChange={(e) => setCustomFrameName(e.target.value)}
                          className="input-elevated flex-1"
                        />
                        <Button variant="outline" size="sm">
                          <Edit3 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* QR Code Size Slider */}
                <div className="space-y-4">
                  <Label className="text-sm font-medium">QR Code Size: {qrStyle.size}px</Label>
                  <Slider
                    value={[qrStyle.size]}
                    onValueChange={(value) => setQrStyle({ ...qrStyle, size: value[0] })}
    max={400}
    min={100}
                    step={10}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Small (100px)</span>
                    <span>Large (400px)</span>
                  </div>
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
            </Card>
          </div>

          {/* QR Preview and Actions */}
          <div className="space-y-6" ref={qrCodeRef}>
            <Card className="card-elevated animate-slide-in-right">
              <div className="space-y-6 text-center">
                <div>
                  <h3 className="text-lg font-semibold mb-2 flex items-center justify-center gap-2">
                    QR Code Preview
                    {hasPassword && <Lock className="w-4 h-4 text-primary" />}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {hasPassword ? "Password protected QR code" : "This is how your QR code will look"}
                  </p>
                </div>

                <div className="flex justify-center">
                  <div 
                    ref={qrRef}
                    className={`inline-block p-6 rounded-2xl shadow-lg border-2 border-border/20 ${
                      qrFrame === 'scan-me' ? 'bg-white' : 'bg-white'
                    }`}
                    style={{ backgroundColor: qrStyle.bgColor }}
                  >
                    {qrFrame === 'scan-me' && qrValue && (
                      <div className="text-center mb-4">
                        <span className="inline-block px-3 py-1 bg-primary text-white text-sm font-medium rounded-full">
                          Scan Me
                        </span>
                      </div>
                    )}
                    
                    {qrValue ? (
                      <QRCodeSVG
                        value={getProtectedQRValue()}
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
                    
                    {qrFrame === 'custom' && qrValue && (
                      <div className="text-center mt-4">
                        <span className="inline-block px-3 py-1 bg-secondary text-secondary-foreground text-sm font-medium rounded-full">
                          {customFrameName || 'Scan Me'}
                        </span>
                      </div>
                    )}
                    
                    {qrFrame === 'rounded' && qrValue && (
                      <div className="text-center mt-4">
                        <span className="inline-block px-4 py-2 bg-gradient-to-r from-primary to-accent text-white text-sm font-medium rounded-full shadow-lg">
                          Scan QR Code
                        </span>
                      </div>
                    )}
                    
                    {qrFrame === 'elegant' && qrValue && (
                      <div className="text-center mt-4">
                        <span className="inline-block px-4 py-2 bg-slate-800 text-white text-sm font-medium rounded-sm tracking-wide uppercase shadow-md">
                          QR Code
                        </span>
                      </div>
                    )}
                    
                    {qrFrame === 'minimal' && qrValue && (
                      <div className="text-center mt-4">
                        <span className="inline-block px-3 py-1 border border-gray-300 text-gray-700 text-xs font-normal rounded">
                          SCAN
                        </span>
                      </div>
                    )}
                    
                    {qrFrame === 'corporate' && qrValue && (
                      <div className="text-center mt-4">
                        <span className="inline-block px-4 py-2 bg-blue-900 text-white text-sm font-semibold rounded shadow-sm">
                          QR STUDIO
                        </span>
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
                      <Button 
                        onClick={() => downloadQR('png')} 
                        className="gap-2 btn-primary"
                        disabled={isGenerating}
                      >
                        {isGenerating ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Download className="w-4 h-4" />
                        )}
                        Download PNG
                      </Button>
                      <Button 
                        onClick={() => downloadQR('svg')} 
                        variant="outline" 
                        className="gap-2"
                        disabled={isGenerating}
                      >
                        {isGenerating ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Download className="w-4 h-4" />
                        )}
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