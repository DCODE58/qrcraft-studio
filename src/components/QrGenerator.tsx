import { useState, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { toPng, toSvg } from 'html-to-image';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, Palette, Settings, Wifi, Phone, Mail, User, Calendar, MessageSquare, Copy, Share2, Sparkles, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Header from './Header';

type QRType = 'text' | 'url' | 'email' | 'phone' | 'sms' | 'wifi' | 'vcard' | 'event';

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
  };
  event: {
    title: string;
    start: string;
    end: string;
    location: string;
    description: string;
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
  const [activeTab, setActiveTab] = useState<'content' | 'style'>('content');
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
      organization: ''
    },
    event: {
      title: '',
      start: '',
      end: '',
      location: '',
      description: ''
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
        return `BEGIN:VCARD\nVERSION:3.0\nFN:${qrData.vcard.firstName} ${qrData.vcard.lastName}\nORG:${qrData.vcard.organization}\nTEL:${qrData.vcard.phone}\nEMAIL:${qrData.vcard.email}\nEND:VCARD`;
      case 'event':
        return `BEGIN:VEVENT\nSUMMARY:${qrData.event.title}\nDTSTART:${qrData.event.start}\nDTEND:${qrData.event.end}\nLOCATION:${qrData.event.location}\nDESCRIPTION:${qrData.event.description}\nEND:VEVENT`;
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

  const qrValue = generateQRValue();

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header showBackButton onBackClick={onBack} title="QR Generator" />
      
      <div className="container mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Enhanced Header */}
        <div className="text-center space-y-6 animate-fade-in">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-hero rounded-2xl flex items-center justify-center shadow-lg">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-accent rounded-full flex items-center justify-center shadow-md">
                <Zap className="w-3 h-3 text-white" />
              </div>
            </div>
          </div>
          
          <div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-hero bg-clip-text text-transparent mb-3">
              Generate QR Code
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
              Create beautiful, customizable QR codes for any purpose. Choose your content type, customize the design, and download in high quality.
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Generator Section */}
          <div className="space-y-6 animate-slide-up">
            {/* Main controls */}
            <div className="flex flex-col sm:flex-row gap-2 bg-muted/30 p-1 rounded-xl">
              <Button
                variant={activeTab === 'content' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('content')}
                className="flex-1 gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                Content
              </Button>
              <Button
                variant={activeTab === 'style' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('style')}
                className="flex-1 gap-2"
              >
                <Palette className="w-4 h-4" />
                Style
              </Button>
            </div>

            {activeTab === 'content' && (
              <Card className="card-elevated animate-slide-in-left">
                <div className="space-y-6">
                  <div>
                    <Label className="text-base font-semibold">Content Type</Label>
                    <p className="text-sm text-muted-foreground mb-4">Choose what type of content your QR code will contain</p>
                    <Tabs value={qrType} onValueChange={(value) => setQrType(value as QRType)}>
                      <TabsList className="grid grid-cols-4 lg:grid-cols-8 w-full gap-1 p-1">
                        <TabsTrigger value="text" className="flex flex-col items-center gap-1 h-auto py-3">
                          <MessageSquare className="w-4 h-4" />
                          <span className="text-xs">Text</span>
                        </TabsTrigger>
                        <TabsTrigger value="url" className="flex flex-col items-center gap-1 h-auto py-3">
                          <div className="w-4 h-4 rounded-full bg-primary/20 border-2 border-primary/40" />
                          <span className="text-xs">URL</span>
                        </TabsTrigger>
                        <TabsTrigger value="email" className="flex flex-col items-center gap-1 h-auto py-3">
                          <Mail className="w-4 h-4" />
                          <span className="text-xs">Email</span>
                        </TabsTrigger>
                        <TabsTrigger value="phone" className="flex flex-col items-center gap-1 h-auto py-3">
                          <Phone className="w-4 h-4" />
                          <span className="text-xs">Phone</span>
                        </TabsTrigger>
                        <TabsTrigger value="sms" className="flex flex-col items-center gap-1 h-auto py-3">
                          <MessageSquare className="w-4 h-4" />
                          <span className="text-xs">SMS</span>
                        </TabsTrigger>
                        <TabsTrigger value="wifi" className="flex flex-col items-center gap-1 h-auto py-3">
                          <Wifi className="w-4 h-4" />
                          <span className="text-xs">WiFi</span>
                        </TabsTrigger>
                        <TabsTrigger value="vcard" className="flex flex-col items-center gap-1 h-auto py-3">
                          <User className="w-4 h-4" />
                          <span className="text-xs">Contact</span>
                        </TabsTrigger>
                        <TabsTrigger value="event" className="flex flex-col items-center gap-1 h-auto py-3">
                          <Calendar className="w-4 h-4" />
                          <span className="text-xs">Event</span>
                        </TabsTrigger>
                      </TabsList>

                      <div className="mt-6 space-y-6">
                        <TabsContent value="text" className="space-y-4 mt-0">
                          <div>
                            <Label htmlFor="text" className="text-sm font-medium">Text Content</Label>
                            <p className="text-xs text-muted-foreground mb-2">Enter any text you want to encode</p>
                            <Textarea
                              id="text"
                              placeholder="Enter your text here..."
                              value={qrData.text}
                              onChange={(e) => setQrData({ ...qrData, text: e.target.value })}
                              className="input-elevated mt-2 min-h-[100px] resize-y"
                            />
                          </div>
                        </TabsContent>

                        <TabsContent value="url" className="space-y-4 mt-0">
                          <div>
                            <Label htmlFor="url" className="text-sm font-medium">Website URL</Label>
                            <p className="text-xs text-muted-foreground mb-2">Enter the complete website address</p>
                            <Input
                              id="url"
                              type="url"
                              placeholder="https://example.com"
                              value={qrData.url}
                              onChange={(e) => setQrData({ ...qrData, url: e.target.value })}
                              className="input-elevated mt-2"
                            />
                          </div>
                        </TabsContent>

                        <TabsContent value="email" className="space-y-4 mt-0">
                          <div>
                            <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                            <p className="text-xs text-muted-foreground mb-2">Enter the email address</p>
                            <Input
                              id="email"
                              type="email"
                              placeholder="contact@example.com"
                              value={qrData.email}
                              onChange={(e) => setQrData({ ...qrData, email: e.target.value })}
                              className="input-elevated mt-2"
                            />
                          </div>
                        </TabsContent>

                        <TabsContent value="phone" className="space-y-4 mt-0">
                          <div>
                            <Label htmlFor="phone" className="text-sm font-medium">Phone Number</Label>
                            <p className="text-xs text-muted-foreground mb-2">Include country code for best compatibility</p>
                            <Input
                              id="phone"
                              type="tel"
                              placeholder="+1234567890"
                              value={qrData.phone}
                              onChange={(e) => setQrData({ ...qrData, phone: e.target.value })}
                              className="input-elevated mt-2"
                            />
                          </div>
                        </TabsContent>

                        <TabsContent value="sms" className="space-y-4 mt-0">
                          <div>
                            <Label htmlFor="sms" className="text-sm font-medium">SMS Number</Label>
                            <p className="text-xs text-muted-foreground mb-2">Phone number to send SMS to</p>
                            <Input
                              id="sms"
                              type="tel"
                              placeholder="+1234567890"
                              value={qrData.sms}
                              onChange={(e) => setQrData({ ...qrData, sms: e.target.value })}
                              className="input-elevated mt-2"
                            />
                          </div>
                        </TabsContent>

                        <TabsContent value="wifi" className="space-y-4 mt-0">
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
                        </TabsContent>

                        <TabsContent value="vcard" className="space-y-4 mt-0">
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
                        </TabsContent>

                        <TabsContent value="event" className="space-y-4 mt-0">
                          <div>
                            <Label htmlFor="eventTitle" className="text-sm font-medium">Event Title</Label>
                            <Input
                              id="eventTitle"
                              placeholder="Meeting with Team"
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
                              placeholder="Conference Room A"
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
                              placeholder="Event details..."
                              value={qrData.event.description}
                              onChange={(e) => setQrData({ 
                                ...qrData, 
                                event: { ...qrData.event, description: e.target.value }
                              })}
                              className="input-elevated mt-2"
                            />
                          </div>
                        </TabsContent>
                      </div>
                    </Tabs>
                  </div>
                </div>
              </Card>
            )}

            {activeTab === 'style' && (
              <Card className="card-elevated animate-slide-in-right">
                <div className="space-y-6">
                  <div className="flex items-center gap-2">
                    <Palette className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-semibold">Customize Style</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="fgColor" className="text-sm font-medium">Foreground Color</Label>
                      <p className="text-xs text-muted-foreground mb-2">The color of the QR code itself</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Input
                          type="color"
                          value={qrStyle.fgColor}
                          onChange={(e) => setQrStyle({ ...qrStyle, fgColor: e.target.value })}
                          className="w-12 h-10 p-1 rounded-lg border"
                        />
                        <Input
                          value={qrStyle.fgColor}
                          onChange={(e) => setQrStyle({ ...qrStyle, fgColor: e.target.value })}
                          className="input-elevated text-sm flex-1"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="bgColor" className="text-sm font-medium">Background Color</Label>
                      <p className="text-xs text-muted-foreground mb-2">The background color behind the QR code</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Input
                          type="color"
                          value={qrStyle.bgColor}
                          onChange={(e) => setQrStyle({ ...qrStyle, bgColor: e.target.value })}
                          className="w-12 h-10 p-1 rounded-lg border"
                        />
                        <Input
                          value={qrStyle.bgColor}
                          onChange={(e) => setQrStyle({ ...qrStyle, bgColor: e.target.value })}
                          className="input-elevated text-sm flex-1"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="size" className="text-sm font-medium">Size (pixels)</Label>
                      <p className="text-xs text-muted-foreground mb-2">The dimensions of the QR code</p>
                      <Input
                        id="size"
                        type="number"
                        min="128"
                        max="512"
                        step="8"
                        value={qrStyle.size}
                        onChange={(e) => setQrStyle({ ...qrStyle, size: parseInt(e.target.value) })}
                        className="input-elevated mt-2"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="level" className="text-sm font-medium">Error Correction</Label>
                      <p className="text-xs text-muted-foreground mb-2">Higher levels can recover from more damage</p>
                      <Select 
                        value={qrStyle.level} 
                        onValueChange={(value: 'L' | 'M' | 'Q' | 'H') => 
                          setQrStyle({ ...qrStyle, level: value })
                        }
                      >
                        <SelectTrigger className="input-elevated mt-2">
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

                  {/* Quick Templates */}
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">Quick Templates</Label>
                      <p className="text-xs text-muted-foreground mb-3">Popular content examples to get started</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setQrType('url');
                          setQrData({ ...qrData, url: 'https://qrcraft.com' });
                          setActiveTab('content');
                        }}
                        className="justify-start h-auto py-3"
                      >
                        <div className="w-4 h-4 rounded-full bg-blue-500 mr-2" />
                        <div className="text-left">
                          <div className="font-medium">Website</div>
                          <div className="text-xs text-muted-foreground">qrcraft.com</div>
                        </div>
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setQrType('wifi');
                          setQrData({
                            ...qrData,
                            wifi: { ssid: 'GuestWiFi', password: '', security: 'nopass', hidden: false }
                          });
                          setActiveTab('content');
                        }}
                        className="justify-start h-auto py-3"
                      >
                        <Wifi className="w-4 h-4 mr-2" />
                        <div className="text-left">
                          <div className="font-medium">Guest WiFi</div>
                          <div className="text-xs text-muted-foreground">No password</div>
                        </div>
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setQrType('email');
                          setQrData({ ...qrData, email: 'contact@example.com' });
                          setActiveTab('content');
                        }}
                        className="justify-start h-auto py-3"
                      >
                        <Mail className="w-4 h-4 mr-2" />
                        <div className="text-left">
                          <div className="font-medium">Email</div>
                          <div className="text-xs text-muted-foreground">contact@example.com</div>
                        </div>
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setQrType('vcard');
                          setQrData({
                            ...qrData,
                            vcard: {
                              firstName: 'John',
                              lastName: 'Doe',
                              phone: '+1234567890',
                              email: 'john@example.com',
                              organization: 'QrCraft'
                            }
                          });
                          setActiveTab('content');
                        }}
                        className="justify-start h-auto py-3"
                      >
                        <User className="w-4 h-4 mr-2" />
                        <div className="text-left">
                          <div className="font-medium">Contact Card</div>
                          <div className="text-xs text-muted-foreground">Business card</div>
                        </div>
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* Preview & Download Section */}
          <div className="space-y-6 animate-scale-in">
            <Card className="card-elevated">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold">Preview & Download</h3>
                  <p className="text-sm text-muted-foreground">Your QR code preview and export options</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={copyQRValue}
                    disabled={!qrValue}
                    variant="outline"
                    size="sm"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                  <Button
                    onClick={shareQR}
                    disabled={!qrValue}
                    variant="outline"
                    size="sm"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>
              
              <div className="flex justify-center p-8 bg-gradient-subtle rounded-xl mb-6">
                {qrValue ? (
                  <div 
                    ref={qrRef}
                    className="p-4 bg-white rounded-xl shadow-md animate-bounce-in"
                    style={{ backgroundColor: qrStyle.bgColor }}
                  >
                    <QRCodeSVG
                      value={qrValue}
                      size={qrStyle.size}
                      fgColor={qrStyle.fgColor}
                      bgColor={qrStyle.bgColor}
                      level={qrStyle.level}
                      includeMargin={true}
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-muted-foreground space-y-3 h-64">
                    <Settings className="w-12 h-12 opacity-50" />
                    <div className="text-center">
                      <p className="font-medium">Fill in the form to generate QR code</p>
                      <p className="text-sm">Choose a content type and enter your data</p>
                    </div>
                  </div>
                )}
              </div>

              {qrValue && (
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={() => downloadQR('png')}
                    className="btn-premium gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download PNG
                  </Button>
                  <Button
                    onClick={() => downloadQR('svg')}
                    className="btn-accent gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download SVG
                  </Button>
                </div>
              )}
            </Card>

            {/* QR Info */}
            {qrValue && (
              <Card className="card-premium">
                <h4 className="font-semibold mb-3">QR Code Information</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type:</span>
                    <span className="font-medium capitalize">{qrType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Size:</span>
                    <span className="font-medium">{qrStyle.size}×{qrStyle.size}px</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Error Correction:</span>
                    <span className="font-medium">{qrStyle.level}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Data Length:</span>
                    <span className="font-medium">{qrValue.length} characters</span>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QrGenerator;