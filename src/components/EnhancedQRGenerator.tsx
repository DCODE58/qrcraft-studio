import { useState, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { toPng, toSvg } from 'html-to-image';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { 
  ArrowLeft, Download, Settings, Wifi, Phone, Mail, User, Calendar, 
  MessageSquare, Globe, FileText, Link, Users, 
  Video, Camera, Music, Briefcase, MapPin, 
  Facebook, Instagram, Twitter, Youtube, Linkedin, Github, Smartphone,
  Gift, QrCode, Eye, Upload, CheckCircle, Plus, Loader2, Palette
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { QRFrame, frameOptions } from './QRFrames';
import { QRDesignSelector, qrDesigns, QRDesign } from './QRDesigns';

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
  location: {
    latitude: string;
    longitude: string;
    address: string;
  };
}

interface QRStyle {
  fgColor: string;
  bgColor: string;
  size: number;
  level: 'L' | 'M' | 'Q' | 'H';
}

interface EnhancedQRGeneratorProps {
  onBack?: () => void;
}

const EnhancedQRGenerator = ({ onBack }: EnhancedQRGeneratorProps) => {
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
    location: {
      latitude: '',
      longitude: '',
      address: ''
    }
  });
  
  const [qrStyle, setQrStyle] = useState<QRStyle>({
    fgColor: '#2563EB',
    bgColor: '#FFFFFF',
    size: 512, // Increased from 280
    level: 'M'
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedFrame, setSelectedFrame] = useState('modern');
  const [customFrameText, setCustomFrameText] = useState('Scan Me');
  const [selectedDesign, setSelectedDesign] = useState('modern-blue');
  const [isGenerating, setIsGenerating] = useState(false);
  
  const qrCodeRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const qrTypeConfigs = [
    { type: 'url' as QRType, label: 'Website', icon: Globe, color: 'text-blue-500', description: 'Link to any website URL' },
    { type: 'text' as QRType, label: 'Text', icon: MessageSquare, color: 'text-gray-700', description: 'Plain text content' },
    { type: 'email' as QRType, label: 'Email', icon: Mail, color: 'text-red-400', description: 'Send an email' },
    { type: 'phone' as QRType, label: 'Phone', icon: Phone, color: 'text-green-400', description: 'Make a phone call' },
    { type: 'sms' as QRType, label: 'SMS', icon: MessageSquare, color: 'text-blue-300', description: 'Send a text message' },
    { type: 'wifi' as QRType, label: 'WiFi', icon: Wifi, color: 'text-blue-400', description: 'Connect to WiFi network' },
    { type: 'vcard' as QRType, label: 'Contact', icon: User, color: 'text-green-500', description: 'Share contact information' },
    { type: 'event' as QRType, label: 'Event', icon: Calendar, color: 'text-purple-400', description: 'Add calendar event' },
    { type: 'location' as QRType, label: 'Location', icon: MapPin, color: 'text-red-600', description: 'Share GPS coordinates' },
  ];

  // Handle QR type selection
  const handleQRTypeSelect = (type: QRType) => {
    setQrType(type);
    setCurrentStep(2);
  };

  // Handle design change
  const handleDesignChange = (design: QRDesign) => {
    setSelectedDesign(design.id);
    setQrStyle(prev => ({
      ...prev,
      fgColor: design.colors.foreground,
      bgColor: design.colors.background
    }));
  };

  // Step indicator component
  const StepIndicator = () => (
    <div className="flex items-center justify-center gap-4 mb-8">
      <div className="flex items-center">
        <div className={`w-8 h-8 ${currentStep >= 1 ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'} rounded-full flex items-center justify-center text-sm font-semibold`}>
          {currentStep > 1 ? <CheckCircle className="w-4 h-4" /> : '1'}
        </div>
        <span className={`ml-2 text-sm font-medium ${currentStep >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>Content Type</span>
      </div>
      <div className={`w-8 h-0.5 ${currentStep > 1 ? 'bg-primary' : 'bg-border'}`}></div>
      <div className="flex items-center">
        <div className={`w-8 h-8 ${currentStep >= 2 ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'} rounded-full flex items-center justify-center text-sm font-semibold`}>
          {currentStep > 2 ? <CheckCircle className="w-4 h-4" /> : '2'}
        </div>
        <span className={`ml-2 text-sm font-medium ${currentStep >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>Add Content</span>
      </div>
      <div className={`w-8 h-0.5 ${currentStep > 2 ? 'bg-primary' : 'bg-border'}`}></div>
      <div className="flex items-center">
        <div className={`w-8 h-8 ${currentStep >= 3 ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'} rounded-full flex items-center justify-center text-sm font-semibold`}>
          3
        </div>
        <span className={`ml-2 text-sm font-medium ${currentStep >= 3 ? 'text-primary' : 'text-muted-foreground'}`}>Design & Export</span>
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
      case 'location':
        return `geo:${qrData.location.latitude},${qrData.location.longitude}`;
      default:
        return qrData.text;
    }
  };

  // Render input form based on QR type
  const renderInputForm = () => {
    const inputClass = "bg-card border-2 border-border focus:border-primary/50 rounded-xl px-4 py-3 transition-all duration-200 focus:ring-2 focus:ring-primary/10 focus:outline-none";
    
    switch (qrType) {
      case 'url':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="url" className="text-sm font-medium text-foreground">Website URL</Label>
              <Input
                id="url"
                type="url"
                value={qrData.url}
                onChange={(e) => setQrData({ ...qrData, url: e.target.value })}
                placeholder="https://example.com"
                className={inputClass}
              />
            </div>
          </div>
        );
      
      case 'text':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="text" className="text-sm font-medium text-foreground">Text Content</Label>
              <Textarea
                id="text"
                value={qrData.text}
                onChange={(e) => setQrData({ ...qrData, text: e.target.value })}
                placeholder="Enter your text here..."
                className={inputClass}
                rows={4}
              />
            </div>
          </div>
        );

      case 'wifi':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="ssid" className="text-sm font-medium text-foreground">Network Name (SSID)</Label>
              <Input
                id="ssid"
                value={qrData.wifi.ssid}
                onChange={(e) => setQrData({ ...qrData, wifi: { ...qrData.wifi, ssid: e.target.value } })}
                placeholder="MyWiFiNetwork"
                className={inputClass}
              />
            </div>
            <div>
              <Label htmlFor="wifi-password" className="text-sm font-medium text-foreground">Password</Label>
              <Input
                id="wifi-password"
                type="password"
                value={qrData.wifi.password}
                onChange={(e) => setQrData({ ...qrData, wifi: { ...qrData.wifi, password: e.target.value } })}
                placeholder="WiFi password"
                className={inputClass}
              />
            </div>
            <div>
              <Label htmlFor="security" className="text-sm font-medium text-foreground">Security Type</Label>
              <Select value={qrData.wifi.security} onValueChange={(value: 'WPA' | 'WEP' | 'nopass') => 
                setQrData({ ...qrData, wifi: { ...qrData.wifi, security: value } })
              }>
                <SelectTrigger className={inputClass}>
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
        );

      case 'vcard':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName" className="text-sm font-medium text-foreground">First Name</Label>
                <Input
                  id="firstName"
                  value={qrData.vcard.firstName}
                  onChange={(e) => setQrData({ ...qrData, vcard: { ...qrData.vcard, firstName: e.target.value } })}
                  placeholder="John"
                  className={inputClass}
                />
              </div>
              <div>
                <Label htmlFor="lastName" className="text-sm font-medium text-foreground">Last Name</Label>
                <Input
                  id="lastName"
                  value={qrData.vcard.lastName}
                  onChange={(e) => setQrData({ ...qrData, vcard: { ...qrData.vcard, lastName: e.target.value } })}
                  placeholder="Doe"
                  className={inputClass}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="vcard-phone" className="text-sm font-medium text-foreground">Phone</Label>
              <Input
                id="vcard-phone"
                type="tel"
                value={qrData.vcard.phone}
                onChange={(e) => setQrData({ ...qrData, vcard: { ...qrData.vcard, phone: e.target.value } })}
                placeholder="+1 (555) 123-4567"
                className={inputClass}
              />
            </div>
            <div>
              <Label htmlFor="vcard-email" className="text-sm font-medium text-foreground">Email</Label>
              <Input
                id="vcard-email"
                type="email"
                value={qrData.vcard.email}
                onChange={(e) => setQrData({ ...qrData, vcard: { ...qrData.vcard, email: e.target.value } })}
                placeholder="john@example.com"
                className={inputClass}
              />
            </div>
            <div>
              <Label htmlFor="organization" className="text-sm font-medium text-foreground">Organization</Label>
              <Input
                id="organization"
                value={qrData.vcard.organization}
                onChange={(e) => setQrData({ ...qrData, vcard: { ...qrData.vcard, organization: e.target.value } })}
                placeholder="Company Name"
                className={inputClass}
              />
            </div>
          </div>
        );

      // Add more cases as needed
      default:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="default-input" className="text-sm font-medium text-foreground">Content</Label>
              <Input
                id="default-input"
                value={qrData.text}
                onChange={(e) => setQrData({ ...qrData, text: e.target.value })}
                placeholder="Enter content..."
                className={inputClass}
              />
            </div>
          </div>
        );
    }
  };

  // Download QR code
  const downloadQR = async (format: 'png' | 'svg' = 'png') => {
    if (!qrCodeRef.current) return;

    setIsGenerating(true);
    try {
      let dataUrl: string;
      
      if (format === 'svg') {
        dataUrl = await toSvg(qrCodeRef.current, {
          quality: 1.0,
          pixelRatio: 2,
        });
      } else {
        dataUrl = await toPng(qrCodeRef.current, {
          quality: 1.0,
          pixelRatio: 2,
        });
      }

      const link = document.createElement('a');
      link.download = `qr-code.${format}`;
      link.href = dataUrl;
      link.click();

      toast({
        title: "✅ Download Complete!",
        description: `QR code saved as ${format.toUpperCase()}`,
        className: "bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200",
      });
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Unable to download QR code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const qrValue = generateQRValue();
  const hasValidContent = qrValue && qrValue.trim() !== '' && qrValue !== 'https://';

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-surface-elevated to-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {onBack && (
                <Button variant="ghost" size="sm" onClick={onBack} className="text-muted-foreground hover:text-foreground">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              )}
              <div className="flex items-center gap-2">
                <QrCode className="w-6 h-6 text-primary" />
                <h1 className="text-2xl font-bold text-foreground">QR Studio</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <StepIndicator />

        {/* Step 1: Select QR Type */}
        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-4xl mx-auto"
            >
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-foreground mb-4">Choose QR Code Type</h2>
                <p className="text-muted-foreground text-lg">Select what type of content you want to encode</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {qrTypeConfigs.map((config) => {
                  const IconComponent = config.icon;
                  return (
                    <motion.button
                      key={config.type}
                      onClick={() => handleQRTypeSelect(config.type)}
                      className="p-6 rounded-2xl border-2 border-border hover:border-primary/50 bg-card hover:shadow-lg transition-all duration-200 text-left group"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                          <IconComponent className={`w-6 h-6 ${config.color}`} />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground mb-1">{config.label}</h3>
                          <p className="text-sm text-muted-foreground">{config.description}</p>
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Step 2: Add Content */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl mx-auto"
            >
              <Card className="card-elevated">
                <div className="p-8">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-foreground mb-2">Add Your Content</h2>
                    <p className="text-muted-foreground">Fill in the details for your {qrTypeConfigs.find(c => c.type === qrType)?.label} QR code</p>
                  </div>

                  {renderInputForm()}

                  <div className="flex gap-3 mt-8">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentStep(1)}
                      className="flex-1"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={() => setCurrentStep(3)}
                      disabled={!hasValidContent}
                      className="flex-1 btn-primary"
                    >
                      Continue to Design
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Step 3: Design & Export */}
          {currentStep === 3 && hasValidContent && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-6xl mx-auto"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Design Controls */}
                <Card className="card-elevated">
                  <div className="p-6 space-y-6">
                    <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                      <Palette className="w-5 h-5 text-primary" />
                      Customize Design
                    </h3>

                    {/* QR Design Selector */}
                    <QRDesignSelector
                      selectedDesign={selectedDesign}
                      onDesignChange={handleDesignChange}
                    />

                    {/* Frame Selector */}
                    <div className="space-y-3">
                      <label className="text-sm font-medium text-foreground">Frame Style</label>
                      <div className="grid grid-cols-3 gap-2">
                        {frameOptions.map((frame) => (
                          <motion.button
                            key={frame.id}
                            type="button"
                            onClick={() => setSelectedFrame(frame.id)}
                            className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                              selectedFrame === frame.id
                                ? 'border-primary bg-primary/10'
                                : 'border-border hover:border-primary/50 bg-card'
                            }`}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <div className="text-lg mb-1">{frame.preview}</div>
                            <div className="text-xs font-medium text-foreground">{frame.name}</div>
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    {/* Custom Frame Text */}
                    {selectedFrame !== 'none' && (
                      <div className="space-y-2">
                        <Label htmlFor="frameText" className="text-sm font-medium text-foreground">Frame Text</Label>
                        <Input
                          id="frameText"
                          value={customFrameText}
                          onChange={(e) => setCustomFrameText(e.target.value)}
                          placeholder="Scan Me"
                          className="input-premium"
                        />
                      </div>
                    )}

                    {/* Size Slider */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium text-foreground">
                        QR Code Size: {qrStyle.size}px
                      </Label>
                      <Slider
                        value={[qrStyle.size]}
                        onValueChange={(value) => setQrStyle({ ...qrStyle, size: value[0] })}
                        max={1024} // Increased from 350
                        min={256}
                        step={32}
                        className="w-full"
                      />
                    </div>

                    {/* Error Correction Level */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-foreground">Error Correction</Label>
                      <Select 
                        value={qrStyle.level} 
                        onValueChange={(value: 'L' | 'M' | 'Q' | 'H') => setQrStyle({ ...qrStyle, level: value })}
                      >
                        <SelectTrigger className="input-premium">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="L">Low (7%)</SelectItem>
                          <SelectItem value="M">Medium (15%)</SelectItem>
                          <SelectItem value="Q">Quartile (25%)</SelectItem>
                          <SelectItem value="H">High (30%)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </Card>

                {/* QR Code Preview */}
                <Card className="card-elevated">
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                      <Eye className="w-5 h-5 text-primary" />
                      Preview & Download
                    </h3>

                    <div className="flex justify-center mb-8">
                      <div ref={qrCodeRef}>
                        <QRFrame 
                          frameType={selectedFrame} 
                          customText={customFrameText} 
                          size={qrStyle.size}
                        >
                          <QRCodeSVG
                            value={qrValue}
                            size={qrStyle.size}
                            bgColor={qrStyle.bgColor}
                            fgColor={qrStyle.fgColor}
                            level={qrStyle.level}
                            includeMargin={false}
                          />
                        </QRFrame>
                      </div>
                    </div>

                    {/* Download Buttons */}
                    <div className="space-y-3">
                      <Button
                        onClick={() => downloadQR('png')}
                        disabled={isGenerating}
                        className="w-full btn-primary"
                      >
                        {isGenerating ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Download className="w-4 h-4 mr-2" />
                            Download PNG
                          </>
                        )}
                      </Button>
                      
                      <Button
                        onClick={() => downloadQR('svg')}
                        disabled={isGenerating}
                        variant="outline"
                        className="w-full"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download SVG
                      </Button>
                    </div>

                    <div className="mt-6 flex gap-3">
                      <Button
                        variant="outline"
                        onClick={() => setCurrentStep(2)}
                        className="flex-1"
                      >
                        Edit Content
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setCurrentStep(1)}
                        className="flex-1"
                      >
                        New QR Code
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default EnhancedQRGenerator;