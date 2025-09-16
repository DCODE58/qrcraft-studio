import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { toPng, toSvg } from 'html-to-image';
import { HexColorPicker } from 'react-colorful';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  Download, Upload, Settings, Palette, Eye, EyeOff, 
  Share2, Copy, CheckCircle, AlertCircle, Clock, 
  Lock, Unlock, BarChart3, ArrowLeft, Save,
  Mail, Phone, MessageSquare, Zap, ExternalLink, Plus
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { QRTypeSelector } from './QRTypeSelector';
import { WiFiForm } from './qr-forms/WiFiForm';
import { VCardForm } from './qr-forms/VCardForm';
import { EventForm } from './qr-forms/EventForm';
import { QRType, QRCode, WiFiData, VCardData, EventData } from '@/types/qr-types';

interface EnhancedQrGeneratorProps {
  onBack?: () => void;
}

export function EnhancedQrGenerator({ onBack }: EnhancedQrGeneratorProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedType, setSelectedType] = useState<QRType>('url');
  const [qrData, setQrData] = useState<Partial<QRCode>>({
    qr_type: 'url',
    content_url: '',
    title: '',
    description: '',
    color_scheme: { primary: '#2563eb', background: '#ffffff' },
    style_options: { dotStyle: 'square', cornerStyle: 'square' },
    is_dynamic: false,
    scan_limit: undefined,
  });

  // Form data for different QR types
  const [wifiData, setWifiData] = useState<WiFiData>({
    ssid: '',
    password: '',
    security: 'WPA2',
    hidden: false,
  });

  const [vcardData, setVcardData] = useState<VCardData>({
    full_name: '',
    organization: '',
    title: '',
    phone: '',
    email: '',
    website: '',
    address: '',
    note: '',
  });

  const [eventData, setEventData] = useState<EventData>({
    title: '',
    description: '',
    location: '',
    start_date: '',
    end_date: '',
    all_day: false,
    organizer_name: '',
    organizer_email: '',
  });

  // QR customization
  const [qrSize, setQrSize] = useState(280);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  
  // Password protection
  const [isPasswordProtected, setIsPasswordProtected] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Expiry settings
  const [hasExpiry, setHasExpiry] = useState(false);
  const [expiryHours, setExpiryHours] = useState(24);
  
  // Single use
  const [isSingleUse, setIsSingleUse] = useState(false);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQrId, setGeneratedQrId] = useState<string | null>(null);
  
  const qrRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Generate QR content based on type
  const generateQRContent = (): string => {
    switch (selectedType) {
      case 'url':
        return qrData.content_url || '';
      case 'text':
        return qrData.content_url || '';
      case 'email':
        const emailParts = (qrData.content_url || '').split('?');
        const email = emailParts[0].replace('mailto:', '');
        const params = new URLSearchParams(emailParts[1] || '');
        const subject = params.get('subject') || '';
        const body = params.get('body') || '';
        return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      case 'phone':
        return `tel:${qrData.content_url?.replace('tel:', '') || ''}`;
      case 'sms':
        const smsParts = (qrData.content_url || '').split('?');
        const number = smsParts[0].replace('sms:', '');
        const message = new URLSearchParams(smsParts[1] || '').get('body') || '';
        return `sms:${number}?body=${encodeURIComponent(message)}`;
      case 'wifi':
        return `WIFI:T:${wifiData.security};S:${wifiData.ssid};P:${wifiData.password || ''};H:${wifiData.hidden};;`;
      case 'vcard':
        return generateVCard(vcardData);
      case 'event':
        return generateCalendarEvent(eventData);
      default:
        return qrData.content_url || '';
    }
  };

  const generateVCard = (data: VCardData): string => {
    let vcard = 'BEGIN:VCARD\nVERSION:3.0\n';
    if (data.full_name) vcard += `FN:${data.full_name}\n`;
    if (data.organization) vcard += `ORG:${data.organization}\n`;
    if (data.title) vcard += `TITLE:${data.title}\n`;
    if (data.phone) vcard += `TEL:${data.phone}\n`;
    if (data.email) vcard += `EMAIL:${data.email}\n`;
    if (data.website) vcard += `URL:${data.website}\n`;
    if (data.address) vcard += `ADR:;;${data.address};;;;\n`;
    if (data.note) vcard += `NOTE:${data.note}\n`;
    vcard += 'END:VCARD';
    return vcard;
  };

  const generateCalendarEvent = (data: EventData): string => {
    const formatDate = (dateString: string, allDay: boolean) => {
      const date = new Date(dateString);
      if (allDay) {
        return date.toISOString().split('T')[0].replace(/-/g, '');
      }
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    let ical = 'BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//QRCraft Studio//EN\n';
    ical += 'BEGIN:VEVENT\n';
    ical += `UID:${Date.now()}@qrcraft.studio\n`;
    ical += `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z\n`;
    if (data.title) ical += `SUMMARY:${data.title}\n`;
    if (data.description) ical += `DESCRIPTION:${data.description.replace(/\n/g, '\\n')}\n`;
    if (data.location) ical += `LOCATION:${data.location}\n`;
    if (data.start_date) {
      const dtstart = formatDate(data.start_date, data.all_day);
      ical += `DTSTART${data.all_day ? ';VALUE=DATE' : ''}:${dtstart}\n`;
    }
    if (data.end_date) {
      const dtend = formatDate(data.end_date, data.all_day);
      ical += `DTEND${data.all_day ? ';VALUE=DATE' : ''}:${dtend}\n`;
    }
    ical += 'END:VEVENT\nEND:VCALENDAR';
    return ical;
  };

  const handleTypeSelect = (type: QRType) => {
    setSelectedType(type);
    setQrData({ ...qrData, qr_type: type });
    setCurrentStep(2);
  };

  const handleGenerateQR = async () => {
    if (isPasswordProtected && !password.trim()) {
      toast({
        title: "Password Required",
        description: "Please enter a password for protection",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      const content = generateQRContent();
      
      if (!content.trim()) {
        toast({
          title: "Content Required",
          description: "Please fill in the required fields",
          variant: "destructive",
        });
        return;
      }

      let qrCodeData = {
        qr_type: selectedType,
        content_url: content,
        title: qrData.title || undefined,
        description: qrData.description || undefined,
        color_scheme: qrData.color_scheme,
        style_options: qrData.style_options,
        is_dynamic: qrData.is_dynamic || false,
        scan_limit: isSingleUse ? 1 : qrData.scan_limit,
        expires_at: hasExpiry ? new Date(Date.now() + (expiryHours * 60 * 60 * 1000)).toISOString() : undefined,
      };

      if (isPasswordProtected) {
        // Create password-protected QR
        const { data, error } = await supabase.functions.invoke('createPasswordQR', {
          body: {
            password: password.trim(),
            contentUrl: content,
            qrType: selectedType,
            expiresIn: hasExpiry ? expiryHours * 3600 : null,
          }
        });

        if (error) throw error;

        setGeneratedQrId(data.qrId);
        toast({
          title: "🔐 Secure QR Generated!",
          description: "Your password-protected QR code is ready.",
          className: "bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200",
        });
      } else {
        // For now, we'll generate a regular QR code
        // In a full implementation, you'd save to database here too
        setGeneratedQrId('preview-' + Date.now());
        toast({
          title: "✨ QR Code Generated!",
          description: "Your QR code is ready to download and share.",
          className: "bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200",
        });
      }

      setCurrentStep(3);

    } catch (error: any) {
      console.error('Generation error:', error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate QR code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadQR = async (format: 'png' | 'svg' = 'png') => {
    if (!qrRef.current) return;

    try {
      const fileName = `qr-${selectedType}-${Date.now()}`;
      
      if (format === 'png') {
        const dataUrl = await toPng(qrRef.current, {
          quality: 1.0,
          pixelRatio: 2,
        });
        
        const link = document.createElement('a');
        link.download = `${fileName}.png`;
        link.href = dataUrl;
        link.click();
      } else {
        const dataUrl = await toSvg(qrRef.current);
        const link = document.createElement('a');
        link.download = `${fileName}.svg`;
        link.href = dataUrl;
        link.click();
      }

      toast({
        title: "📁 Downloaded!",
        description: `QR code saved as ${fileName}.${format}`,
        className: "bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200",
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to download QR code. Please try again.",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = async () => {
    const content = generateQRContent();
    try {
      await navigator.clipboard.writeText(content);
      toast({
        title: "📋 Copied!",
        description: "QR code content copied to clipboard.",
        className: "bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy to clipboard.",
        variant: "destructive",
      });
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center gap-4 mb-8">
      {[1, 2, 3].map((step) => (
        <React.Fragment key={step}>
          <div className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-200 ${
              currentStep >= step 
                ? 'bg-primary text-primary-foreground shadow-md' 
                : 'bg-muted text-muted-foreground'
            }`}>
              {currentStep > step ? <CheckCircle className="w-4 h-4" /> : step}
            </div>
            <span className={`ml-2 text-sm font-medium transition-colors ${
              currentStep >= step ? 'text-primary' : 'text-muted-foreground'
            }`}>
              {step === 1 ? 'Select Type' : step === 2 ? 'Configure' : 'Generate'}
            </span>
          </div>
          {step < 3 && (
            <div className={`w-8 h-0.5 transition-colors ${
              currentStep > step ? 'bg-primary' : 'bg-border'
            }`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  const renderContentForm = () => {
    switch (selectedType) {
      case 'wifi':
        return <WiFiForm data={wifiData} onChange={setWifiData} />;
      
      case 'vcard':
        return <VCardForm data={vcardData} onChange={setVcardData} />;
      
      case 'event':  
        return <EventForm data={eventData} onChange={setEventData} />;
      
      case 'url':
        return (
          <Card className="card-elevated space-y-4 p-6">
            <div className="space-y-2">
              <Label htmlFor="url">Website URL *</Label>
              <Input
                id="url"
                type="url"
                value={qrData.content_url || ''}
                onChange={(e) => setQrData({ ...qrData, content_url: e.target.value })}
                placeholder="https://example.com"
                className="input-elevated"
              />
            </div>
          </Card>
        );
      
      case 'text':
        return (
          <Card className="card-elevated space-y-4 p-6">
            <div className="space-y-2">
              <Label htmlFor="text">Text Content *</Label>
              <Textarea
                id="text"
                value={qrData.content_url || ''}
                onChange={(e) => setQrData({ ...qrData, content_url: e.target.value })}
                placeholder="Enter your text content..."
                className="input-elevated min-h-[100px] resize-none"
              />
            </div>
          </Card>
        );
      
      case 'email':
        return (
          <Card className="card-elevated space-y-4 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={qrData.content_url?.replace('mailto:', '').split('?')[0] || ''}
                  onChange={(e) => {
                    const params = new URLSearchParams(qrData.content_url?.split('?')[1] || '');
                    const subject = params.get('subject') || '';
                    const body = params.get('body') || '';
                    setQrData({ 
                      ...qrData, 
                      content_url: `mailto:${e.target.value}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}` 
                    });
                  }}
                  placeholder="recipient@example.com"
                  className="input-elevated"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={(() => {
                    const params = new URLSearchParams(qrData.content_url?.split('?')[1] || '');
                    return params.get('subject') || '';
                  })()}
                  onChange={(e) => {
                    const email = qrData.content_url?.replace('mailto:', '').split('?')[0] || '';
                    const params = new URLSearchParams(qrData.content_url?.split('?')[1] || '');
                    const body = params.get('body') || '';
                    setQrData({ 
                      ...qrData, 
                      content_url: `mailto:${email}?subject=${encodeURIComponent(e.target.value)}&body=${encodeURIComponent(body)}` 
                    });
                  }}
                  placeholder="Email subject"
                  className="input-elevated"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="body">Message Body</Label>
              <Textarea
                id="body"
                value={(() => {
                  const params = new URLSearchParams(qrData.content_url?.split('?')[1] || '');
                  return params.get('body') || '';
                })()}
                onChange={(e) => {
                  const email = qrData.content_url?.replace('mailto:', '').split('?')[0] || '';
                  const params = new URLSearchParams(qrData.content_url?.split('?')[1] || '');
                  const subject = params.get('subject') || '';
                  setQrData({ 
                    ...qrData, 
                    content_url: `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(e.target.value)}` 
                  });
                }}
                placeholder="Pre-filled email message..."
                className="input-elevated min-h-[80px] resize-none"
              />
            </div>
          </Card>
        );
      
      case 'phone':
        return (
          <Card className="card-elevated space-y-4 p-6">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                value={qrData.content_url?.replace('tel:', '') || ''}
                onChange={(e) => setQrData({ ...qrData, content_url: `tel:${e.target.value}` })}
                placeholder="+1 (555) 123-4567"
                className="input-elevated"
              />
            </div>
          </Card>
        );
      
      case 'sms':
        return (
          <Card className="card-elevated space-y-4 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sms-number">Phone Number *</Label>
                <Input
                  id="sms-number"
                  type="tel"
                  value={qrData.content_url?.replace('sms:', '').split('?')[0] || ''}
                  onChange={(e) => {
                    const params = new URLSearchParams(qrData.content_url?.split('?')[1] || '');
                    const body = params.get('body') || '';
                    setQrData({ 
                      ...qrData, 
                      content_url: `sms:${e.target.value}?body=${encodeURIComponent(body)}` 
                    });
                  }}
                  placeholder="+1 (555) 123-4567"
                  className="input-elevated"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sms-message">Message</Label>
              <Textarea
                id="sms-message"
                value={(() => {
                  const params = new URLSearchParams(qrData.content_url?.split('?')[1] || '');
                  return params.get('body') || '';
                })()}
                onChange={(e) => {
                  const number = qrData.content_url?.replace('sms:', '').split('?')[0] || '';
                  setQrData({ 
                    ...qrData, 
                    content_url: `sms:${number}?body=${encodeURIComponent(e.target.value)}` 
                  });
                }}
                placeholder="Pre-filled SMS message..."
                className="input-elevated min-h-[80px] resize-none"
              />
            </div>
          </Card>
        );
      
      default:
        return (
          <Card className="card-elevated space-y-4 p-6">
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Coming Soon</h3>
              <p className="text-muted-foreground">
                This QR type is being implemented. Please select another type for now.
              </p>
            </div>
          </Card>
        );
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          {onBack && (
            <Button onClick={onBack} variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          )}
          <div>
            <h1 className="text-2xl font-bold text-foreground">QR Code Generator</h1>
            <p className="text-muted-foreground">Create professional QR codes with advanced features</p>
          </div>
        </div>
      </div>

      {/* Step Indicator */}
      {renderStepIndicator()}

      <AnimatePresence mode="wait">
        {/* Step 1: Select QR Type */}
        {currentStep === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <QRTypeSelector selectedType={selectedType} onTypeSelect={handleTypeSelect} />
          </motion.div>
        )}

        {/* Step 2: Configure Content */}
        {currentStep === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Basic Info */}
            <Card className="card-elevated space-y-4 p-6">
              <h3 className="text-lg font-semibold text-foreground">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title (Optional)</Label>
                  <Input
                    id="title"
                    value={qrData.title || ''}
                    onChange={(e) => setQrData({ ...qrData, title: e.target.value })}
                    placeholder="My QR Code"
                    className="input-elevated"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Input
                    id="description"
                    value={qrData.description || ''}
                    onChange={(e) => setQrData({ ...qrData, description: e.target.value })}
                    placeholder="Brief description..."
                    className="input-elevated"
                  />
                </div>
              </div>
            </Card>

            {/* Content Form */}
            {renderContentForm()}

            {/* Security & Options */}
            <Card className="card-elevated space-y-6 p-6">
              <h3 className="text-lg font-semibold text-foreground">Security & Options</h3>
              
              {/* Password Protection */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      Password Protection
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Require a password to access QR content
                    </p>
                  </div>
                  <Switch
                    checked={isPasswordProtected}
                    onCheckedChange={setIsPasswordProtected}
                  />
                </div>

                {isPasswordProtected && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2"
                  >
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter secure password"
                        className="input-elevated pr-12"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-4 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </motion.div>
                )}
              </div>

              <Separator />

              {/* Expiry Settings */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Expiry Date
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Set when this QR code should expire
                    </p>
                  </div>
                  <Switch
                    checked={hasExpiry}
                    onCheckedChange={setHasExpiry}
                  />
                </div>

                {hasExpiry && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2"
                  >
                    <Label>Expires in (hours)</Label>
                    <div className="space-y-2">
                      <Slider
                        value={[expiryHours]}
                        onValueChange={(value) => setExpiryHours(value[0])}
                        max={168} // 7 days
                        min={1}
                        step={1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>1 hour</span>
                        <span className="font-medium">{expiryHours} hours</span>
                        <span>7 days</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              <Separator />

              {/* Single Use */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Single Use
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    QR code expires after first scan
                  </p>
                </div>
                <Switch
                  checked={isSingleUse}
                  onCheckedChange={setIsSingleUse}
                />
              </div>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-end">
              <Button
                onClick={() => setCurrentStep(1)}
                variant="outline"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button
                onClick={handleGenerateQR}
                disabled={isGenerating}
                className="btn-primary"
              >
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                    Generating...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Generate QR Code
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Generated QR Code */}
        {currentStep === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* QR Code Display */}
              <Card className="card-elevated p-6">
                <div className="text-center space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">Your QR Code</h3>
                  
                  <div 
                    ref={qrRef}
                    className="inline-block p-6 bg-white rounded-xl shadow-sm"
                  >
                    <QRCodeSVG
                      value={isPasswordProtected && generatedQrId 
                        ? `${window.location.origin}/secure/${generatedQrId}`
                        : generateQRContent()
                      }
                      size={qrSize}
                      fgColor={qrData.color_scheme?.primary || '#2563eb'}
                      bgColor={qrData.color_scheme?.background || '#ffffff'}
                      level="M"
                      includeMargin={true}
                    />
                  </div>

                  {qrData.title && (
                    <div className="space-y-1">
                      <h4 className="font-medium text-foreground">{qrData.title}</h4>
                      {qrData.description && (
                        <p className="text-sm text-muted-foreground">{qrData.description}</p>
                      )}
                    </div>
                  )}
                </div>
              </Card>

              {/* Actions & Info */}
              <div className="space-y-4">
                {/* Download Options */}
                <Card className="card-elevated p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Download Options</h3>
                  <div className="space-y-3">
                    <Button
                      onClick={() => downloadQR('png')}
                      className="w-full btn-primary"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download PNG
                    </Button>
                    <Button
                      onClick={() => downloadQR('svg')}
                      variant="outline"
                      className="w-full"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download SVG
                    </Button>
                  </div>
                </Card>

                {/* QR Info */}
                <Card className="card-elevated p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">QR Code Details</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Type:</span>
                      <Badge variant="secondary">{selectedType.toUpperCase()}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Protected:</span>
                      <Badge variant={isPasswordProtected ? "default" : "secondary"}>
                        {isPasswordProtected ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                    {hasExpiry && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Expires:</span>
                        <span className="text-foreground">
                          {expiryHours} hour{expiryHours !== 1 ? 's' : ''}
                        </span>
                      </div>
                    )}
                    {isSingleUse && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Usage:</span>
                        <Badge variant="destructive">Single Use</Badge>
                      </div>
                    )}
                  </div>
                </Card>

                {/* Additional Actions */}
                <div className="space-y-3">
                  <Button
                    onClick={copyToClipboard}
                    variant="outline"
                    className="w-full"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Content
                  </Button>
                  <Button
                    onClick={() => {
                      setCurrentStep(1);
                      setGeneratedQrId(null);
                    }}
                    variant="outline"
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Another
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}