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
import { Download, Palette, Settings, Wifi, Phone, Mail, User, Calendar, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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

const QrGenerator = () => {
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
    fgColor: '#3B82F6',
    bgColor: '#FFFFFF',
    size: 256,
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
          pixelRatio: 2,
        });
      } else {
        dataUrl = await toSvg(qrRef.current);
      }

      const link = document.createElement('a');
      link.download = `qrcode.${format}`;
      link.href = dataUrl;
      link.click();

      toast({
        title: "QR Code Downloaded!",
        description: `Your QR code has been saved as ${format.toUpperCase()}.`,
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "There was an error downloading your QR code.",
        variant: "destructive",
      });
    }
  };

  const qrValue = generateQRValue();

  const typeIcons = {
    text: MessageSquare,
    url: 'globe',
    email: Mail,
    phone: Phone,
    sms: MessageSquare,
    wifi: Wifi,
    vcard: User,
    event: Calendar
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4 animate-fade-in">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Generate QR Code
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Create beautiful, customizable QR codes for any purpose. Choose your content type and style.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Generator Section */}
        <div className="space-y-6 animate-slide-up">
          <Card className="card-premium">
            <Tabs value={qrType} onValueChange={(value) => setQrType(value as QRType)}>
              <TabsList className="grid grid-cols-4 lg:grid-cols-8 w-full">
                <TabsTrigger value="text" className="flex items-center gap-1">
                  <MessageSquare className="w-4 h-4" />
                  <span className="hidden sm:inline">Text</span>
                </TabsTrigger>
                <TabsTrigger value="url" className="flex items-center gap-1">
                  <div className="w-4 h-4 rounded-full bg-primary/20" />
                  <span className="hidden sm:inline">URL</span>
                </TabsTrigger>
                <TabsTrigger value="email" className="flex items-center gap-1">
                  <Mail className="w-4 h-4" />
                  <span className="hidden sm:inline">Email</span>
                </TabsTrigger>
                <TabsTrigger value="phone" className="flex items-center gap-1">
                  <Phone className="w-4 h-4" />
                  <span className="hidden sm:inline">Phone</span>
                </TabsTrigger>
                <TabsTrigger value="sms" className="flex items-center gap-1">
                  <MessageSquare className="w-4 h-4" />
                  <span className="hidden sm:inline">SMS</span>
                </TabsTrigger>
                <TabsTrigger value="wifi" className="flex items-center gap-1">
                  <Wifi className="w-4 h-4" />
                  <span className="hidden sm:inline">WiFi</span>
                </TabsTrigger>
                <TabsTrigger value="vcard" className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">Contact</span>
                </TabsTrigger>
                <TabsTrigger value="event" className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span className="hidden sm:inline">Event</span>
                </TabsTrigger>
              </TabsList>

              <div className="mt-6 space-y-4">
                <TabsContent value="text" className="space-y-4">
                  <div>
                    <Label htmlFor="text">Text Content</Label>
                    <Textarea
                      id="text"
                      placeholder="Enter your text here..."
                      value={qrData.text}
                      onChange={(e) => setQrData({ ...qrData, text: e.target.value })}
                      className="input-premium mt-2"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="url" className="space-y-4">
                  <div>
                    <Label htmlFor="url">Website URL</Label>
                    <Input
                      id="url"
                      type="url"
                      placeholder="https://example.com"
                      value={qrData.url}
                      onChange={(e) => setQrData({ ...qrData, url: e.target.value })}
                      className="input-premium mt-2"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="email" className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="contact@example.com"
                      value={qrData.email}
                      onChange={(e) => setQrData({ ...qrData, email: e.target.value })}
                      className="input-premium mt-2"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="phone" className="space-y-4">
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+1234567890"
                      value={qrData.phone}
                      onChange={(e) => setQrData({ ...qrData, phone: e.target.value })}
                      className="input-premium mt-2"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="sms" className="space-y-4">
                  <div>
                    <Label htmlFor="sms">SMS Number</Label>
                    <Input
                      id="sms"
                      type="tel"
                      placeholder="+1234567890"
                      value={qrData.sms}
                      onChange={(e) => setQrData({ ...qrData, sms: e.target.value })}
                      className="input-premium mt-2"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="wifi" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="ssid">Network Name (SSID)</Label>
                      <Input
                        id="ssid"
                        placeholder="MyWiFiNetwork"
                        value={qrData.wifi.ssid}
                        onChange={(e) => setQrData({ 
                          ...qrData, 
                          wifi: { ...qrData.wifi, ssid: e.target.value }
                        })}
                        className="input-premium mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="WiFi password"
                        value={qrData.wifi.password}
                        onChange={(e) => setQrData({ 
                          ...qrData, 
                          wifi: { ...qrData.wifi, password: e.target.value }
                        })}
                        className="input-premium mt-2"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="security">Security Type</Label>
                    <Select 
                      value={qrData.wifi.security} 
                      onValueChange={(value: 'WPA' | 'WEP' | 'nopass') => 
                        setQrData({ 
                          ...qrData, 
                          wifi: { ...qrData.wifi, security: value }
                        })
                      }
                    >
                      <SelectTrigger className="input-premium mt-2">
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

                <TabsContent value="vcard" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        placeholder="John"
                        value={qrData.vcard.firstName}
                        onChange={(e) => setQrData({ 
                          ...qrData, 
                          vcard: { ...qrData.vcard, firstName: e.target.value }
                        })}
                        className="input-premium mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        placeholder="Doe"
                        value={qrData.vcard.lastName}
                        onChange={(e) => setQrData({ 
                          ...qrData, 
                          vcard: { ...qrData.vcard, lastName: e.target.value }
                        })}
                        className="input-premium mt-2"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="vcardPhone">Phone</Label>
                    <Input
                      id="vcardPhone"
                      type="tel"
                      placeholder="+1234567890"
                      value={qrData.vcard.phone}
                      onChange={(e) => setQrData({ 
                        ...qrData, 
                        vcard: { ...qrData.vcard, phone: e.target.value }
                      })}
                      className="input-premium mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="vcardEmail">Email</Label>
                    <Input
                      id="vcardEmail"
                      type="email"
                      placeholder="john@example.com"
                      value={qrData.vcard.email}
                      onChange={(e) => setQrData({ 
                        ...qrData, 
                        vcard: { ...qrData.vcard, email: e.target.value }
                      })}
                      className="input-premium mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="organization">Organization</Label>
                    <Input
                      id="organization"
                      placeholder="Company Name"
                      value={qrData.vcard.organization}
                      onChange={(e) => setQrData({ 
                        ...qrData, 
                        vcard: { ...qrData.vcard, organization: e.target.value }
                      })}
                      className="input-premium mt-2"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="event" className="space-y-4">
                  <div>
                    <Label htmlFor="eventTitle">Event Title</Label>
                    <Input
                      id="eventTitle"
                      placeholder="Meeting with Team"
                      value={qrData.event.title}
                      onChange={(e) => setQrData({ 
                        ...qrData, 
                        event: { ...qrData.event, title: e.target.value }
                      })}
                      className="input-premium mt-2"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="eventStart">Start Date & Time</Label>
                      <Input
                        id="eventStart"
                        type="datetime-local"
                        value={qrData.event.start}
                        onChange={(e) => setQrData({ 
                          ...qrData, 
                          event: { ...qrData.event, start: e.target.value }
                        })}
                        className="input-premium mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="eventEnd">End Date & Time</Label>
                      <Input
                        id="eventEnd"
                        type="datetime-local"
                        value={qrData.event.end}
                        onChange={(e) => setQrData({ 
                          ...qrData, 
                          event: { ...qrData.event, end: e.target.value }
                        })}
                        className="input-premium mt-2"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="eventLocation">Location</Label>
                    <Input
                      id="eventLocation"
                      placeholder="Conference Room A"
                      value={qrData.event.location}
                      onChange={(e) => setQrData({ 
                        ...qrData, 
                        event: { ...qrData.event, location: e.target.value }
                      })}
                      className="input-premium mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="eventDescription">Description</Label>
                    <Textarea
                      id="eventDescription"
                      placeholder="Event details..."
                      value={qrData.event.description}
                      onChange={(e) => setQrData({ 
                        ...qrData, 
                        event: { ...qrData.event, description: e.target.value }
                      })}
                      className="input-premium mt-2"
                    />
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </Card>

          {/* Customization */}
          <Card className="card-premium">
            <div className="flex items-center gap-2 mb-4">
              <Palette className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">Customize Style</h3>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="fgColor">Foreground</Label>
                <div className="flex items-center gap-2 mt-2">
                  <Input
                    type="color"
                    value={qrStyle.fgColor}
                    onChange={(e) => setQrStyle({ ...qrStyle, fgColor: e.target.value })}
                    className="w-12 h-10 p-1 rounded-lg"
                  />
                  <Input
                    value={qrStyle.fgColor}
                    onChange={(e) => setQrStyle({ ...qrStyle, fgColor: e.target.value })}
                    className="input-premium text-sm"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="bgColor">Background</Label>
                <div className="flex items-center gap-2 mt-2">
                  <Input
                    type="color"
                    value={qrStyle.bgColor}
                    onChange={(e) => setQrStyle({ ...qrStyle, bgColor: e.target.value })}
                    className="w-12 h-10 p-1 rounded-lg"
                  />
                  <Input
                    value={qrStyle.bgColor}
                    onChange={(e) => setQrStyle({ ...qrStyle, bgColor: e.target.value })}
                    className="input-premium text-sm"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="size">Size (px)</Label>
                <Input
                  id="size"
                  type="number"
                  min="128"
                  max="512"
                  value={qrStyle.size}
                  onChange={(e) => setQrStyle({ ...qrStyle, size: parseInt(e.target.value) })}
                  className="input-premium mt-2"
                />
              </div>
              
              <div>
                <Label htmlFor="level">Error Correction</Label>
                <Select 
                  value={qrStyle.level} 
                  onValueChange={(value: 'L' | 'M' | 'Q' | 'H') => 
                    setQrStyle({ ...qrStyle, level: value })
                  }
                >
                  <SelectTrigger className="input-premium mt-2">
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
        </div>

        {/* Preview & Download Section */}
        <div className="space-y-6 animate-scale-in">
          <Card className="card-premium">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Preview</h3>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => downloadQR('png')}
                  disabled={!qrValue}
                  className="btn-premium"
                  size="sm"
                >
                  <Download className="w-4 h-4 mr-2" />
                  PNG
                </Button>
                <Button
                  onClick={() => downloadQR('svg')}
                  disabled={!qrValue}
                  className="btn-accent"
                  size="sm"
                >
                  <Download className="w-4 h-4 mr-2" />
                  SVG
                </Button>
              </div>
            </div>
            
            <div className="flex justify-center p-8 bg-gradient-subtle rounded-xl">
              {qrValue ? (
                <div 
                  ref={qrRef}
                  className="p-4 bg-white rounded-xl shadow-medium"
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
                <div className="flex flex-col items-center justify-center text-muted-foreground space-y-2 h-64">
                  <Settings className="w-12 h-12" />
                  <p>Fill in the form to generate QR code</p>
                </div>
              )}
            </div>
          </Card>

          {/* Quick Templates */}
          <Card className="card-premium">
            <h3 className="text-lg font-semibold mb-4">Quick Templates</h3>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setQrType('url');
                  setQrData({ ...qrData, url: 'https://qrcraft.com' });
                }}
                className="justify-start"
              >
                <div className="w-4 h-4 rounded-full bg-blue-500 mr-2" />
                Website
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setQrType('wifi');
                  setQrData({
                    ...qrData,
                    wifi: { ssid: 'GuestWiFi', password: '', security: 'nopass', hidden: false }
                  });
                }}
                className="justify-start"
              >
                <Wifi className="w-4 h-4 mr-2" />
                Guest WiFi
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setQrType('email');
                  setQrData({ ...qrData, email: 'contact@example.com' });
                }}
                className="justify-start"
              >
                <Mail className="w-4 h-4 mr-2" />
                Email
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
                }}
                className="justify-start"
              >
                <User className="w-4 h-4 mr-2" />
                Contact
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default QrGenerator;