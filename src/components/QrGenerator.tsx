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
  Lock, ImageIcon, CheckCircle, Loader2, X, Plus
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';

type QRType = 'text' | 'url' | 'email' | 'phone' | 'sms' | 'wifi' | 'vcard' | 'event' | 
             'pdf' | 'links' | 'business' | 'video' | 'images' | 'social' | 'whatsapp' | 
             'mp3' | 'menu' | 'apps' | 'coupon' | 'location' | 'crypto';

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
  links: {
    title: string;
    description: string;
    linksList: Array<{
      name: string;
      url: string;
      image: string;
    }>;
  };
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
  images: {
    title: string;
    description: string;
    website: string;
    files: string[];
  };
  social: {
    platforms: {
      twitter: string;
      instagram: string;
      facebook: string;
      github: string;
      snapchat: string;
    };
    title: string;
    description: string;
    customTag: string;
  };
  whatsapp: {
    number: string;
    message: string;
  };
  mp3: string;
  menu: {
    restaurantName: string;
    description: string;
    days: {
      [key: string]: {
        isOpen: boolean;
        meals: Array<{
          name: string;
          description: string;
          price: string;
          allergens: string[];
        }>;
      };
    };
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
  frameType: 'none' | 'scan-me' | 'rounded' | 'modern' | 'bubble' | 'corner';
  customFrameName: string;
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
    links: {
      title: '',
      description: '',
      linksList: []
    },
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
    images: {
      title: '',
      description: '',
      website: '',
      files: []
    },
    social: {
      platforms: {
        twitter: '',
        instagram: '',
        facebook: '',
        github: '',
        snapchat: ''
      },
      title: '',
      description: '',
      customTag: ''
    },
    whatsapp: {
      number: '',
      message: ''
    },
    mp3: '',
    menu: {
      restaurantName: '',
      description: '',
      days: {
        monday: { isOpen: false, meals: [] },
        tuesday: { isOpen: false, meals: [] },
        wednesday: { isOpen: false, meals: [] },
        thursday: { isOpen: false, meals: [] },
        friday: { isOpen: false, meals: [] },
        saturday: { isOpen: false, meals: [] },
        sunday: { isOpen: false, meals: [] }
      }
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
    level: 'M',
    frameType: 'scan-me',
    customFrameName: 'SCAN ME'
  });

  const [hasPassword, setHasPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedColorPalette, setSelectedColorPalette] = useState('blue-green');
  const [uploadedFiles, setUploadedFiles] = useState<{[key: string]: File}>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
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
      contentFormRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }
  };

  // Handle QR type selection with auto-scroll
  const handleQRTypeSelect = (type: QRType) => {
    setQrType(type);
    setCurrentStep(2);
    // Delay scroll to ensure the content form is rendered
    setTimeout(() => {
      scrollToContentForm();
    }, 100);
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
        setQrData({ ...qrData, images: { ...qrData.images, files: [...qrData.images.files, fileUrl] } });
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
          title: "Location detected!",
          description: "Your current location has been added to the QR code.",
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
        const linksData = qrData.links.linksList.map(link => `${link.name}: ${link.url}`).join('\n');
        return `${qrData.links.title}\n${qrData.links.description}\n${linksData}`;
      case 'business':
        return `BEGIN:VCARD\nVERSION:3.0\nORG:${qrData.business.name}\nTEL:${qrData.business.phone}\nEMAIL:${qrData.business.email}\nURL:${qrData.business.website}\nADR:${qrData.business.address}\nNOTE:${qrData.business.description}\nEND:VCARD`;
      case 'video':
        return qrData.video.url || `Video: ${qrData.video.title}\nDescription: ${qrData.video.description}\nTag: ${qrData.video.customTag}`;
      case 'images':
        return qrData.images.website || `Images: ${qrData.images.title}\nDescription: ${qrData.images.description}`;
      case 'social':
        const socialLinks = Object.entries(qrData.social.platforms)
          .filter(([_, url]) => url)
          .map(([platform, url]) => `${platform}: ${url}`)
          .join('\n');
        return `${qrData.social.title}\n${qrData.social.description}\n${socialLinks}\nTag: ${qrData.social.customTag}`;
      case 'whatsapp':
        return `https://wa.me/${qrData.whatsapp.number}?text=${encodeURIComponent(qrData.whatsapp.message)}`;
      case 'mp3':
        return qrData.mp3;
      case 'menu':
        const menuData = Object.entries(qrData.menu.days)
          .filter(([_, dayData]) => dayData.isOpen && dayData.meals.length > 0)
          .map(([day, dayData]) => {
            const mealsText = dayData.meals.map(meal => 
              `${meal.name} - ${meal.price}\n${meal.description}`
            ).join('\n');
            return `${day.toUpperCase()}\n${mealsText}`;
          }).join('\n\n');
        return `${qrData.menu.restaurantName}\n${qrData.menu.description}\n\n${menuData}`;
      case 'apps':
        return qrData.apps.url;
      case 'coupon':
        return `Coupon: ${qrData.coupon.title}\nCode: ${qrData.coupon.code}\nDiscount: ${qrData.coupon.discount}\nExpiry: ${qrData.coupon.expiry}\nDescription: ${qrData.coupon.description}`;
      case 'location':
        return `geo:${qrData.location.latitude},${qrData.location.longitude}?q=${qrData.location.latitude},${qrData.location.longitude}(${qrData.location.address})`;
      case 'crypto':
        return `${qrData.crypto.currency.toLowerCase()}:${qrData.crypto.address}?amount=${qrData.crypto.amount}`;
      default:
        return '';
    }
  };

  // Generate protected QR value (no password prompt on scan)
  const getProtectedQRValue = (): string => {
    const baseValue = generateQRValue();
    return baseValue; // Direct access, no password prompt
  };

  const downloadQR = async (format: 'png' | 'svg') => {
    if (!qrRef.current) return;

    setIsDownloading(true);

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
    } finally {
      setIsDownloading(false);
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

  // QR Frame Component
  const QRFrameWrapper = ({ children }: { children: React.ReactNode }) => {
    const frameStyle = {
      none: 'p-4',
      'scan-me': 'relative p-8 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 rounded-2xl shadow-2xl border-2 border-gray-200 dark:border-gray-700',
      'rounded': 'relative p-6 bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700',
      'modern': 'relative p-6 bg-gradient-to-tr from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 rounded-xl shadow-lg border border-blue-200 dark:border-blue-800',
      'bubble': 'relative p-8 bg-white dark:bg-gray-900 rounded-full shadow-2xl border-4 border-primary/20',
      'corner': 'relative p-6 bg-white dark:bg-gray-900 shadow-xl border-l-4 border-t-4 border-primary'
    };

    return (
      <div className={frameStyle[qrStyle.frameType]}>
        {qrStyle.frameType === 'scan-me' && (
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <div className="bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-full text-sm font-bold shadow-lg">
              {qrStyle.customFrameName}
            </div>
          </div>
        )}
        {qrStyle.frameType === 'bubble' && (
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
            <div className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-semibold">
              {qrStyle.customFrameName}
            </div>
          </div>
        )}
        {qrStyle.frameType === 'corner' && (
          <div className="absolute top-0 left-0 bg-primary text-primary-foreground px-2 py-1 text-xs font-bold">
            {qrStyle.customFrameName}
          </div>
        )}
        {children}
      </div>
    );
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
                </div>
              )}

              {qrType === 'social' && (
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Social Media Platforms</Label>
                    <div className="space-y-3 mt-2">
                      <div className="flex items-center gap-3">
                        <Twitter className="w-5 h-5 text-blue-500" />
                        <Input
                          placeholder="https://twitter.com/username"
                          value={qrData.social.platforms.twitter}
                          onChange={(e) => setQrData({
                            ...qrData,
                            social: {
                              ...qrData.social,
                              platforms: { ...qrData.social.platforms, twitter: e.target.value }
                            }
                          })}
                          className="input-elevated"
                        />
                      </div>
                      <div className="flex items-center gap-3">
                        <Instagram className="w-5 h-5 text-pink-500" />
                        <Input
                          placeholder="https://instagram.com/username"
                          value={qrData.social.platforms.instagram}
                          onChange={(e) => setQrData({
                            ...qrData,
                            social: {
                              ...qrData.social,
                              platforms: { ...qrData.social.platforms, instagram: e.target.value }
                            }
                          })}
                          className="input-elevated"
                        />
                      </div>
                      <div className="flex items-center gap-3">
                        <Facebook className="w-5 h-5 text-blue-600" />
                        <Input
                          placeholder="https://facebook.com/username"
                          value={qrData.social.platforms.facebook}
                          onChange={(e) => setQrData({
                            ...qrData,
                            social: {
                              ...qrData.social,
                              platforms: { ...qrData.social.platforms, facebook: e.target.value }
                            }
                          })}
                          className="input-elevated"
                        />
                      </div>
                      <div className="flex items-center gap-3">
                        <Github className="w-5 h-5 text-gray-600" />
                        <Input
                          placeholder="https://github.com/username"
                          value={qrData.social.platforms.github}
                          onChange={(e) => setQrData({
                            ...qrData,
                            social: {
                              ...qrData.social,
                              platforms: { ...qrData.social.platforms, github: e.target.value }
                            }
                          })}
                          className="input-elevated"
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="social-title" className="text-sm font-medium">Title</Label>
                    <Input
                      id="social-title"
                      placeholder="Follow me on social media"
                      value={qrData.social.title}
                      onChange={(e) => setQrData({
                        ...qrData,
                        social: { ...qrData.social, title: e.target.value }
                      })}
                      className="input-elevated mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="social-description" className="text-sm font-medium">Description</Label>
                    <Textarea
                      id="social-description"
                      placeholder="Connect with me on these platforms"
                      value={qrData.social.description}
                      onChange={(e) => setQrData({
                        ...qrData,
                        social: { ...qrData.social, description: e.target.value }
                      })}
                      className="input-elevated mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="social-tag" className="text-sm font-medium">Custom Tag</Label>
                    <Input
                      id="social-tag"
                      placeholder="Add your custom tag here..."
                      value={qrData.social.customTag}
                      onChange={(e) => setQrData({
                        ...qrData,
                        social: { ...qrData.social, customTag: e.target.value }
                      })}
                      className="input-elevated mt-2"
                    />
                  </div>
                </div>
              )}

              {qrType === 'menu' && (
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Restaurant Name</Label>
                    <Input
                      placeholder="Restaurant Name"
                      value={qrData.menu.restaurantName}
                      onChange={(e) => setQrData({
                        ...qrData,
                        menu: { ...qrData.menu, restaurantName: e.target.value }
                      })}
                      className="input-elevated mt-2"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Description</Label>
                    <Textarea
                      placeholder="Restaurant description"
                      value={qrData.menu.description}
                      onChange={(e) => setQrData({
                        ...qrData,
                        menu: { ...qrData.menu, description: e.target.value }
                      })}
                      className="input-elevated mt-2"
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Weekly Menu</Label>
                    {Object.entries(qrData.menu.days).map(([day, dayData]) => (
                      <div key={day} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={dayData.isOpen}
                              onCheckedChange={(checked) => setQrData({
                                ...qrData,
                                menu: {
                                  ...qrData.menu,
                                  days: {
                                    ...qrData.menu.days,
                                    [day]: { ...dayData, isOpen: checked }
                                  }
                                }
                              })}
                            />
                            <span className="font-medium capitalize">{day}</span>
                          </div>
                        </div>
                        
                        {dayData.isOpen && (
                          <div className="space-y-3 mt-3">
                            {dayData.meals.map((meal, index) => (
                              <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-2 p-3 bg-muted/30 rounded">
                                <Input
                                  placeholder="Dish name"
                                  value={meal.name}
                                  onChange={(e) => {
                                    const newMeals = [...dayData.meals];
                                    newMeals[index] = { ...meal, name: e.target.value };
                                    setQrData({
                                      ...qrData,
                                      menu: {
                                        ...qrData.menu,
                                        days: {
                                          ...qrData.menu.days,
                                          [day]: { ...dayData, meals: newMeals }
                                        }
                                      }
                                    });
                                  }}
                                  className="input-elevated"
                                />
                                <Input
                                  placeholder="Description"
                                  value={meal.description}
                                  onChange={(e) => {
                                    const newMeals = [...dayData.meals];
                                    newMeals[index] = { ...meal, description: e.target.value };
                                    setQrData({
                                      ...qrData,
                                      menu: {
                                        ...qrData.menu,
                                        days: {
                                          ...qrData.menu.days,
                                          [day]: { ...dayData, meals: newMeals }
                                        }
                                      }
                                    });
                                  }}
                                  className="input-elevated"
                                />
                                <div className="flex gap-2">
                                  <Input
                                    placeholder="Price"
                                    value={meal.price}
                                    onChange={(e) => {
                                      const newMeals = [...dayData.meals];
                                      newMeals[index] = { ...meal, price: e.target.value };
                                      setQrData({
                                        ...qrData,
                                        menu: {
                                          ...qrData.menu,
                                          days: {
                                            ...qrData.menu.days,
                                            [day]: { ...dayData, meals: newMeals }
                                          }
                                        }
                                      });
                                    }}
                                    className="input-elevated"
                                  />
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      const newMeals = dayData.meals.filter((_, i) => i !== index);
                                      setQrData({
                                        ...qrData,
                                        menu: {
                                          ...qrData.menu,
                                          days: {
                                            ...qrData.menu.days,
                                            [day]: { ...dayData, meals: newMeals }
                                          }
                                        }
                                      });
                                    }}
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const newMeals = [...dayData.meals, { name: '', description: '', price: '', allergens: [] }];
                                setQrData({
                                  ...qrData,
                                  menu: {
                                    ...qrData.menu,
                                    days: {
                                      ...qrData.menu.days,
                                      [day]: { ...dayData, meals: newMeals }
                                    }
                                  }
                                });
                              }}
                              className="w-full"
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Add Meal
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {qrType === 'links' && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="links-title" className="text-sm font-medium">Title</Label>
                    <Input
                      id="links-title"
                      placeholder="My Links"
                      value={qrData.links.title}
                      onChange={(e) => setQrData({
                        ...qrData,
                        links: { ...qrData.links, title: e.target.value }
                      })}
                      className="input-elevated mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="links-description" className="text-sm font-medium">Description</Label>
                    <Textarea
                      id="links-description"
                      placeholder="Collection of useful links"
                      value={qrData.links.description}
                      onChange={(e) => setQrData({
                        ...qrData,
                        links: { ...qrData.links, description: e.target.value }
                      })}
                      className="input-elevated mt-2 min-h-[80px]"
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Links</Label>
                    {qrData.links.linksList.map((link, index) => (
                      <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-2 p-3 bg-muted/30 rounded">
                        <Input
                          placeholder="Link name"
                          value={link.name}
                          onChange={(e) => {
                            const newLinks = [...qrData.links.linksList];
                            newLinks[index] = { ...link, name: e.target.value };
                            setQrData({
                              ...qrData,
                              links: { ...qrData.links, linksList: newLinks }
                            });
                          }}
                          className="input-elevated"
                        />
                        <div className="flex gap-2">
                          <Input
                            placeholder="https://example.com"
                            value={link.url}
                            onChange={(e) => {
                              const newLinks = [...qrData.links.linksList];
                              newLinks[index] = { ...link, url: e.target.value };
                              setQrData({
                                ...qrData,
                                links: { ...qrData.links, linksList: newLinks }
                              });
                            }}
                            className="input-elevated"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const newLinks = qrData.links.linksList.filter((_, i) => i !== index);
                              setQrData({
                                ...qrData,
                                links: { ...qrData.links, linksList: newLinks }
                              });
                            }}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      onClick={() => {
                        const newLinks = [...qrData.links.linksList, { name: '', url: '', image: '' }];
                        setQrData({
                          ...qrData,
                          links: { ...qrData.links, linksList: newLinks }
                        });
                      }}
                      className="w-full"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Link
                    </Button>
                  </div>
                </div>
              )}

              {qrType === 'images' && (
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Gallery Title</Label>
                    <Input
                      placeholder="My Photo Gallery"
                      value={qrData.images.title}
                      onChange={(e) => setQrData({
                        ...qrData,
                        images: { ...qrData.images, title: e.target.value }
                      })}
                      className="input-elevated mt-2"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Description</Label>
                    <Textarea
                      placeholder="Description of your images"
                      value={qrData.images.description}
                      onChange={(e) => setQrData({
                        ...qrData,
                        images: { ...qrData.images, description: e.target.value }
                      })}
                      className="input-elevated mt-2"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Website URL (Optional)</Label>
                    <Input
                      placeholder="https://mygallery.com"
                      value={qrData.images.website}
                      onChange={(e) => setQrData({
                        ...qrData,
                        images: { ...qrData.images, website: e.target.value }
                      })}
                      className="input-elevated mt-2"
                    />
                  </div>
                  <div className="border-2 border-dashed border-purple-200 dark:border-purple-800 rounded-lg p-8 text-center bg-purple-50/50 dark:bg-purple-950/20">
                    <ImageIcon className="w-12 h-12 text-purple-500 mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground mb-4">Upload images for your gallery</p>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        files.forEach(file => handleFileUpload(file, 'images'));
                      }}
                      className="hidden"
                      id="images-upload"
                    />
                    <Button 
                      variant="outline" 
                      onClick={() => document.getElementById('images-upload')?.click()}
                      className="mb-2"
                    >
                      Upload Images
                    </Button>
                    <p className="text-xs text-muted-foreground">JPG, PNG, GIF up to 10MB each</p>
                  </div>
                </div>
              )}

              {/* Next button */}
              <Button 
                onClick={() => setCurrentStep(3)}
                className="w-full mt-6 bg-gradient-to-r from-primary to-primary/80"
                disabled={!generateQRValue()}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    Next: Design QR Code
                    <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  };

  const renderQRPreview = () => {
    if (!generateQRValue() || currentStep < 3) return null;

    return (
      <div className="space-y-6">
        {/* Design Controls */}
        <Card className="card-elevated">
          <div className="space-y-6">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Customize Your QR Code
            </h3>

            {/* Size Control */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">QR Code Size</Label>
              <div className="px-3">
                <Slider
                  value={[qrStyle.size]}
                  onValueChange={(value) => setQrStyle({ ...qrStyle, size: value[0] })}
                  max={400}
                  min={150}
                  step={10}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Small</span>
                  <span>{qrStyle.size}px</span>
                  <span>Large</span>
                </div>
              </div>
            </div>

            {/* Color Palette Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Color Design</Label>
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
                    }}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      selectedColorPalette === key 
                        ? 'border-primary ring-2 ring-primary/20' 
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex gap-1">
                      <div
                        className="w-6 h-6 rounded"
                        style={{ backgroundColor: palette.primary }}
                      />
                      <div
                        className="w-6 h-6 rounded"
                        style={{ backgroundColor: palette.secondary }}
                      />
                    </div>
                    <p className="text-xs mt-1 capitalize">{key.replace('-', ' ')}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Color Picker */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Custom Colors</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Foreground Color</Label>
                  <div className="space-y-2">
                    <HexColorPicker
                      color={qrStyle.fgColor}
                      onChange={(color) => setQrStyle({ ...qrStyle, fgColor: color })}
                      style={{ width: '100%', height: '120px' }}
                    />
                    <Input
                      value={qrStyle.fgColor}
                      onChange={(e) => setQrStyle({ ...qrStyle, fgColor: e.target.value })}
                      className="input-elevated font-mono"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Background Color</Label>
                  <div className="space-y-2">
                    <HexColorPicker
                      color={qrStyle.bgColor}
                      onChange={(color) => setQrStyle({ ...qrStyle, bgColor: color })}
                      style={{ width: '100%', height: '120px' }}
                    />
                    <Input
                      value={qrStyle.bgColor}
                      onChange={(e) => setQrStyle({ ...qrStyle, bgColor: e.target.value })}
                      className="input-elevated font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Frame Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Frame Style</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { type: 'none', label: 'No Frame' },
                  { type: 'scan-me', label: 'Scan Me' },
                  { type: 'rounded', label: 'Rounded' },
                  { type: 'modern', label: 'Modern' },
                  { type: 'bubble', label: 'Bubble' },
                  { type: 'corner', label: 'Corner' }
                ].map((frame) => (
                  <button
                    key={frame.type}
                    onClick={() => setQrStyle({ ...qrStyle, frameType: frame.type as QRStyle['frameType'] })}
                    className={`p-3 text-sm rounded-lg border-2 transition-all ${
                      qrStyle.frameType === frame.type
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    {frame.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Frame Name */}
            {(qrStyle.frameType === 'scan-me' || qrStyle.frameType === 'bubble' || qrStyle.frameType === 'corner') && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Frame Text</Label>
                <Input
                  value={qrStyle.customFrameName}
                  onChange={(e) => setQrStyle({ ...qrStyle, customFrameName: e.target.value })}
                  placeholder="SCAN ME"
                  className="input-elevated"
                />
              </div>
            )}
          </div>
        </Card>

        {/* QR Code Preview */}
        <Card className="card-elevated">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Preview</h3>
            <div className="flex justify-center" ref={qrRef}>
              <QRFrameWrapper>
                <QRCodeSVG
                  value={getProtectedQRValue()}
                  size={qrStyle.size}
                  fgColor={qrStyle.fgColor}
                  bgColor={qrStyle.bgColor}
                  level={qrStyle.level}
                  includeMargin={false}
                />
              </QRFrameWrapper>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2 justify-center">
              <Button
                onClick={() => downloadQR('png')}
                className="gap-2"
                disabled={isDownloading}
              >
                {isDownloading ? (
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
                disabled={isDownloading}
              >
                {isDownloading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                Download SVG
              </Button>
              <Button
                onClick={copyQRValue}
                variant="outline"
                className="gap-2"
              >
                <Copy className="w-4 h-4" />
                Copy
              </Button>
              <Button
                onClick={shareQR}
                variant="outline"
                className="gap-2"
              >
                <Share2 className="w-4 h-4" />
                Share
              </Button>
            </div>

            {/* Password Protection */}
            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  <Label className="text-sm font-medium">Password Protection</Label>
                </div>
                <Switch
                  checked={hasPassword}
                  onCheckedChange={setHasPassword}
                />
              </div>
              {hasPassword && (
                <div className="space-y-2">
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password"
                      className="input-elevated pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Note: This QR code will be accessible without password prompt when scanned.
                  </p>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default QrGenerator;
