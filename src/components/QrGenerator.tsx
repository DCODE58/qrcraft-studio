import React, { useState, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { HexColorPicker } from 'react-colorful';
import { Slider } from './ui/slider';
import { 
  ArrowLeft, Download, Copy, Share2, Upload, Plus, X, 
  Eye, EyeOff, Lock, MapPin, Calendar, Clock, 
  Globe, Wifi, Phone, Mail, User, Building, 
  Palette, Loader2, Camera, Music, FileText, Play,
  Instagram, Facebook, Twitter, Github, MessageCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { toPng, toSvg } from 'html-to-image';

type QRType = 'text' | 'url' | 'wifi' | 'vcard' | 'event' | 'links' | 'business' | 'video' | 'images' | 'social' | 'whatsapp' | 'menu' | 'apps' | 'coupon' | 'location' | 'crypto';

interface QRData {
  text: string;
  url: string;
  wifi: {
    ssid: string;
    password: string;
    security: 'WPA' | 'WEP' | 'nopass';
    hidden: boolean;
  };
  vcard: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    organization: string;
    title: string;
    url: string;
  };
  event: {
    title: string;
    description: string;
    location: string;
    startDate: string;
    endDate: string;
    startTime: string;
    endTime: string;
  };
  links: {
    title: string;
    linksList: Array<{
      name: string;
      url: string;
    }>;
  };
  business: {
    name: string;
    description: string;
    address: string;
    phone: string;
    email: string;
    website: string;
    hours: string;
  };
  video: {
    file: File | null;
    title: string;
    description: string;
  };
  images: {
    files: File[];
    title: string;
    description: string;
  };
  social: {
    platforms: {
      twitter: string;
      instagram: string;
      facebook: string;
      github: string;
      snapchat: string;
    };
  };
  whatsapp: {
    number: string;
    message: string;
  };
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
    appName: string;
    appStore: string;
    playStore: string;
  };
  coupon: {
    title: string;
    description: string;
    code: string;
    expiryDate: string;
    termsConditions: string;
  };
  location: {
    latitude: number;
    longitude: number;
    name: string;
    address: string;
  };
  crypto: {
    address: string;
    amount: string;
    currency: string;
    message: string;
  };
}

interface QRStyle {
  size: number;
  fgColor: string;
  bgColor: string;
  frameType: 'none' | 'scan-me' | 'bubble' | 'corner' | 'round' | 'square';
  customFrameText: string;
  logoUrl: string;
}

interface QrGeneratorProps {
  onBack: () => void;
}

const QrGenerator = ({ onBack }: QrGeneratorProps) => {
  const { toast } = useToast();
  const [qrType, setQrType] = useState<QRType>('text');
  const [qrData, setQrData] = useState<QRData>({
    text: '',
    url: '',
    wifi: {
      ssid: '',
      password: '',
      security: 'WPA',
      hidden: false,
    },
    vcard: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      organization: '',
      title: '',
      url: '',
    },
    event: {
      title: '',
      description: '',
      location: '',
      startDate: '',
      endDate: '',
      startTime: '',
      endTime: '',
    },
    links: {
      title: '',
      linksList: []
    },
    business: {
      name: '',
      description: '',
      address: '',
      phone: '',
      email: '',
      website: '',
      hours: '',
    },
    video: {
      file: null,
      title: '',
      description: '',
    },
    images: {
      files: [],
      title: '',
      description: '',
    },
    social: {
      platforms: {
        twitter: '',
        instagram: '',
        facebook: '',
        github: '',
        snapchat: '',
      },
    },
    whatsapp: {
      number: '',
      message: '',
    },
    menu: {
      restaurantName: '',
      description: '',
      days: {
        Monday: { isOpen: true, meals: [] },
        Tuesday: { isOpen: true, meals: [] },
        Wednesday: { isOpen: true, meals: [] },
        Thursday: { isOpen: true, meals: [] },
        Friday: { isOpen: true, meals: [] },
        Saturday: { isOpen: true, meals: [] },
        Sunday: { isOpen: true, meals: [] },
      },
    },
    apps: {
      appName: '',
      appStore: '',
      playStore: '',
    },
    coupon: {
      title: '',
      description: '',
      code: '',
      expiryDate: '',
      termsConditions: '',
    },
    location: {
      latitude: 0,
      longitude: 0,
      name: '',
      address: '',
    },
    crypto: {
      address: '',
      amount: '',
      currency: 'BTC',
      message: '',
    },
  });

  const [qrStyle, setQrStyle] = useState<QRStyle>({
    size: 300,
    fgColor: '#000000',
    bgColor: '#ffffff',
    frameType: 'none',
    customFrameText: 'Scan Me',
    logoUrl: '',
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasPassword, setHasPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState({ fg: false, bg: false });

  const qrRef = useRef<HTMLDivElement>(null);
  const contentFormRef = useRef<HTMLDivElement>(null);

  const colorPalettes = {
    modern: ['#000000', '#3B82F6', '#10B981', '#F59E0B', '#EF4444'],
    nature: ['#22C55E', '#059669', '#84CC16', '#65A30D', '#16A34A'],
    sunset: ['#F97316', '#EA580C', '#DC2626', '#B91C1C', '#991B1B'],
    ocean: ['#0EA5E9', '#0284C7', '#0369A1', '#075985', '#0C4A6E'],
    purple: ['#8B5CF6', '#7C3AED', '#6D28D9', '#5B21B6', '#4C1D95'],
    pink: ['#EC4899', '#DB2777', '#BE185D', '#9D174D', '#831843'],
  };

  const scrollToContentForm = () => {
    if (contentFormRef.current) {
      contentFormRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  const handleQRTypeSelect = (type: QRType) => {
    setQrType(type);
    setCurrentStep(2);
    setTimeout(() => {
      scrollToContentForm();
    }, 100);
  };

  const handleFileUpload = (file: File, type: string) => {
    if (!file) return;
    
    switch (type) {
      case 'video':
        setQrData(prev => ({
          ...prev,
          video: { ...prev.video, file }
        }));
        break;
      case 'images':
        setQrData(prev => ({
          ...prev,
          images: { ...prev.images, files: [...prev.images.files, file] }
        }));
        break;
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: 'Error',
        description: 'Geolocation is not supported by this browser.',
        variant: 'destructive',
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
            latitude,
            longitude,
          },
        });
        toast({
          title: 'Success',
          description: 'Location retrieved successfully!',
        });
      },
      (error) => {
        toast({
          title: 'Error',
          description: 'Failed to get location. Please try again.',
          variant: 'destructive',
        });
      }
    );
  };

  const addLink = () => {
    setQrData({
      ...qrData,
      links: {
        ...qrData.links,
        linksList: [...qrData.links.linksList, { name: '', url: '' }]
      }
    });
  };

  const removeLink = (index: number) => {
    setQrData({
      ...qrData,
      links: {
        ...qrData.links,
        linksList: qrData.links.linksList.filter((_, i) => i !== index)
      }
    });
  };

  const updateLink = (index: number, field: 'name' | 'url', value: string) => {
    const newLinks = [...qrData.links.linksList];
    newLinks[index] = { ...newLinks[index], [field]: value };
    setQrData({
      ...qrData,
      links: {
        ...qrData.links,
        linksList: newLinks
      }
    });
  };

  const generateQRValue = (): string => {
    switch (qrType) {
      case 'text':
        return qrData.text;
      case 'url':
        return qrData.url;
      case 'wifi':
        return `WIFI:T:${qrData.wifi.security};S:${qrData.wifi.ssid};P:${qrData.wifi.password};H:${qrData.wifi.hidden ? 'true' : 'false'};;`;
      case 'vcard':
        return `BEGIN:VCARD\nVERSION:3.0\nFN:${qrData.vcard.firstName} ${qrData.vcard.lastName}\nORG:${qrData.vcard.organization}\nTITLE:${qrData.vcard.title}\nTEL:${qrData.vcard.phone}\nEMAIL:${qrData.vcard.email}\nURL:${qrData.vcard.url}\nEND:VCARD`;
      case 'event':
        return `BEGIN:VEVENT\nSUMMARY:${qrData.event.title}\nDESCRIPTION:${qrData.event.description}\nLOCATION:${qrData.event.location}\nDTSTART:${qrData.event.startDate}T${qrData.event.startTime}\nDTEND:${qrData.event.endDate}T${qrData.event.endTime}\nEND:VEVENT`;
      case 'links':
        return JSON.stringify({
          title: qrData.links.title,
          links: qrData.links.linksList
        });
      case 'whatsapp':
        return `https://wa.me/${qrData.whatsapp.number}?text=${encodeURIComponent(qrData.whatsapp.message)}`;
      case 'menu':
        const menuData = {
          restaurant: qrData.menu.restaurantName,
          description: qrData.menu.description,
          menu: Object.entries(qrData.menu.days)
            .filter(([, dayData]) => dayData.isOpen)
            .map(([day, dayData]) => ({
              day,
              meals: dayData.meals
            }))
        };
        return JSON.stringify(menuData);
      case 'social':
        const socialLinks = Object.entries(qrData.social.platforms)
          .filter(([, url]) => url.trim() !== '')
          .map(([platform, url]) => ({ platform, url }));
        return JSON.stringify({ social: socialLinks });
      case 'location':
        return `geo:${qrData.location.latitude},${qrData.location.longitude}?q=${qrData.location.latitude},${qrData.location.longitude}(${encodeURIComponent(qrData.location.name)})`;
      default:
        return qrData.text;
    }
  };

  const getProtectedQRValue = (): string => {
    return hasPassword ? `protected:${password}:${generateQRValue()}` : generateQRValue();
  };

  const downloadQR = async (format: 'png' | 'svg') => {
    if (!qrRef.current) return;
    
    setIsDownloading(true);
    try {
      let dataUrl: string;
      
      if (format === 'png') {
        dataUrl = await toPng(qrRef.current, {
          backgroundColor: 'white',
          pixelRatio: 2,
        });
      } else {
        dataUrl = await toSvg(qrRef.current, {
          backgroundColor: 'white',
        });
      }

      const link = document.createElement('a');
      link.download = `qr-code.${format}`;
      link.href = dataUrl;
      link.click();

      toast({
        title: 'Success',
        description: `QR Code downloaded as ${format.toUpperCase()}!`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to download QR code. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const copyQRValue = async () => {
    const value = getProtectedQRValue();
    
    try {
      await navigator.clipboard.writeText(value);
      toast({
        title: 'Success',
        description: 'QR code value copied to clipboard!',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to copy to clipboard.',
        variant: 'destructive',
      });
    }
  };

  const shareQR = async () => {
    if (!navigator.share) {
      toast({
        title: 'Error',
        description: 'Web Share API is not supported in this browser.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await navigator.share({
        title: 'QR Code',
        text: 'Check out this QR code!',
        url: getProtectedQRValue(),
      });
    } catch (error) {
      // User cancelled sharing
    }
  };

  const QRFrameWrapper = ({ children }: { children: React.ReactNode }) => {
    const frameStyle = {
      padding: qrStyle.frameType !== 'none' ? '20px' : '0',
      borderRadius: qrStyle.frameType === 'round' ? '50%' : qrStyle.frameType === 'corner' ? '20px' : '0',
      border: qrStyle.frameType === 'square' ? '3px solid #000' : 'none',
      background: qrStyle.frameType === 'bubble' ? 'linear-gradient(45deg, #3B82F6, #8B5CF6)' : 'transparent',
      position: 'relative' as const,
    };

    return (
      <div style={frameStyle} className="inline-block">
        {qrStyle.frameType === 'scan-me' && (
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
            {qrStyle.customFrameText || 'Scan Me'}
          </div>
        )}
        {qrStyle.frameType === 'bubble' && (
          <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-white text-gray-800 px-3 py-1 rounded-full text-sm font-medium shadow-lg">
            {qrStyle.customFrameText || 'Scan Me'}
          </div>
        )}
        {qrStyle.frameType === 'corner' && (
          <div className="absolute top-2 right-2 bg-white/90 text-gray-800 px-2 py-1 rounded text-xs font-medium">
            {qrStyle.customFrameText || 'Scan Me'}
          </div>
        )}
        {children}
      </div>
    );
  };

  const renderContentForm = () => {
    return (
      <div ref={contentFormRef} className="space-y-6">
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Step 2: Enter your content
          </h3>
          <p className="text-sm text-muted-foreground">
            Fill in the details for your {qrType.toUpperCase()} QR code
          </p>
        </div>

        <div className="space-y-4">
          {qrType === 'text' && (
            <div>
              <Label htmlFor="text-content" className="text-sm font-medium text-foreground">Text Content</Label>
              <Textarea
                id="text-content"
                placeholder="Enter your text here..."
                value={qrData.text}
                onChange={(e) => setQrData({ ...qrData, text: e.target.value })}
                className="input-elevated mt-2"
                rows={4}
              />
            </div>
          )}

          {qrType === 'url' && (
            <div>
              <Label htmlFor="url-content" className="text-sm font-medium text-foreground">Website URL</Label>
              <Input
                id="url-content"
                type="url"
                placeholder="https://example.com"
                value={qrData.url}
                onChange={(e) => setQrData({ ...qrData, url: e.target.value })}
                className="input-elevated mt-2"
              />
            </div>
          )}

          {qrType === 'social' && (
            <div className="space-y-4">
              <Label className="text-sm font-medium text-foreground">Social Media Profiles</Label>
              
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center gap-3">
                  <Twitter className="w-5 h-5 text-blue-500" />
                  <Input
                    placeholder="Twitter/X username or URL"
                    value={qrData.social.platforms.twitter}
                    onChange={(e) => setQrData({
                      ...qrData,
                      social: {
                        ...qrData.social,
                        platforms: {
                          ...qrData.social.platforms,
                          twitter: e.target.value
                        }
                      }
                    })}
                    className="input-elevated"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <Instagram className="w-5 h-5 text-pink-500" />
                  <Input
                    placeholder="Instagram username or URL"
                    value={qrData.social.platforms.instagram}
                    onChange={(e) => setQrData({
                      ...qrData,
                      social: {
                        ...qrData.social,
                        platforms: {
                          ...qrData.social.platforms,
                          instagram: e.target.value
                        }
                      }
                    })}
                    className="input-elevated"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <Facebook className="w-5 h-5 text-blue-600" />
                  <Input
                    placeholder="Facebook profile or page URL"
                    value={qrData.social.platforms.facebook}
                    onChange={(e) => setQrData({
                      ...qrData,
                      social: {
                        ...qrData.social,
                        platforms: {
                          ...qrData.social.platforms,
                          facebook: e.target.value
                        }
                      }
                    })}
                    className="input-elevated"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <Github className="w-5 h-5 text-gray-800 dark:text-gray-200" />
                  <Input
                    placeholder="GitHub username or repository URL"
                    value={qrData.social.platforms.github}
                    onChange={(e) => setQrData({
                      ...qrData,
                      social: {
                        ...qrData.social,
                        platforms: {
                          ...qrData.social.platforms,
                          github: e.target.value
                        }
                      }
                    })}
                    className="input-elevated"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <MessageCircle className="w-5 h-5 text-yellow-500" />
                  <Input
                    placeholder="Snapchat username"
                    value={qrData.social.platforms.snapchat}
                    onChange={(e) => setQrData({
                      ...qrData,
                      social: {
                        ...qrData.social,
                        platforms: {
                          ...qrData.social.platforms,
                          snapchat: e.target.value
                        }
                      }
                    })}
                    className="input-elevated"
                  />
                </div>
              </div>
            </div>
          )}

          {qrType === 'whatsapp' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="whatsapp-number" className="text-sm font-medium text-foreground">Phone Number</Label>
                <Input
                  id="whatsapp-number"
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
                <Label htmlFor="whatsapp-message" className="text-sm font-medium text-foreground">Pre-filled Message</Label>
                <Textarea
                  id="whatsapp-message"
                  placeholder="Hello! I found your contact through QR code..."
                  value={qrData.whatsapp.message}
                  onChange={(e) => setQrData({
                    ...qrData,
                    whatsapp: { ...qrData.whatsapp, message: e.target.value }
                  })}
                  className="input-elevated mt-2"
                  rows={3}
                />
              </div>
            </div>
          )}

          {qrType === 'menu' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="restaurant-name" className="text-sm font-medium text-foreground">Restaurant Name</Label>
                <Input
                  id="restaurant-name"
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
                <Label htmlFor="restaurant-description" className="text-sm font-medium text-foreground">Description</Label>
                <Textarea
                  id="restaurant-description"
                  placeholder="Brief description of your restaurant..."
                  value={qrData.menu.description}
                  onChange={(e) => setQrData({
                    ...qrData,
                    menu: { ...qrData.menu, description: e.target.value }
                  })}
                  className="input-elevated mt-2"
                />
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium text-foreground">Weekly Menu</Label>
                {Object.entries(qrData.menu.days).map(([day, dayData]) => (
                  <Card key={day} className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <Label className="text-sm font-medium">{day}</Label>
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
                    </div>
                    {dayData.isOpen && (
                      <div className="space-y-3">
                        {dayData.meals.map((meal, index) => (
                          <div key={index} className="border rounded-lg p-3 bg-background">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              <Input
                                placeholder="Meal name"
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
                              <div className="flex items-center gap-2">
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
                  </Card>
                ))}
              </div>
            </div>
          )}

          {qrType === 'links' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="links-title" className="text-sm font-medium text-foreground">Page Title</Label>
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

              <div className="space-y-3">
                <Label className="text-sm font-medium text-foreground">Links</Label>
                {qrData.links.linksList.map((link, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      placeholder="Link name"
                      value={link.name}
                      onChange={(e) => updateLink(index, 'name', e.target.value)}
                      className="input-elevated"
                    />
                    <Input
                      placeholder="URL"
                      value={link.url}
                      onChange={(e) => updateLink(index, 'url', e.target.value)}
                      className="input-elevated"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeLink(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addLink}
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
                <Label htmlFor="images-title" className="text-sm font-medium text-foreground">Gallery Title</Label>
                <Input
                  id="images-title"
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
                <Label htmlFor="images-description" className="text-sm font-medium text-foreground">Description</Label>
                <Textarea
                  id="images-description"
                  placeholder="Describe your image collection..."
                  value={qrData.images.description}
                  onChange={(e) => setQrData({
                    ...qrData,
                    images: { ...qrData.images, description: e.target.value }
                  })}
                  className="input-elevated mt-2"
                />
              </div>

              <div>
                <Label className="text-sm font-medium text-foreground">Upload Images</Label>
                <div className="mt-2 border-2 border-dashed border-border rounded-lg p-6 text-center">
                  <Camera className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Drag & drop images here, or click to select
                  </p>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files) {
                        Array.from(e.target.files).forEach(file => {
                          handleFileUpload(file, 'images');
                        });
                      }
                    }}
                    className="hidden"
                    id="images-upload"
                  />
                  <label htmlFor="images-upload">
                    <Button variant="outline" className="cursor-pointer" asChild>
                      <span>
                        <Upload className="w-4 h-4 mr-2" />
                        Choose Images
                      </span>
                    </Button>
                  </label>
                </div>
                {qrData.images.files.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm text-muted-foreground">
                      {qrData.images.files.length} image(s) selected
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {qrType === 'video' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="video-title" className="text-sm font-medium text-foreground">Video Title</Label>
                <Input
                  id="video-title"
                  placeholder="My Video"
                  value={qrData.video.title}
                  onChange={(e) => setQrData({
                    ...qrData,
                    video: { ...qrData.video, title: e.target.value }
                  })}
                  className="input-elevated mt-2"
                />
              </div>
              
              <div>
                <Label htmlFor="video-description" className="text-sm font-medium text-foreground">Description</Label>
                <Textarea
                  id="video-description"
                  placeholder="Describe your video..."
                  value={qrData.video.description}
                  onChange={(e) => setQrData({
                    ...qrData,
                    video: { ...qrData.video, description: e.target.value }
                  })}
                  className="input-elevated mt-2"
                />
              </div>

              <div>
                <Label className="text-sm font-medium text-foreground">Upload Video</Label>
                <div className="mt-2 border-2 border-dashed border-border rounded-lg p-6 text-center">
                  <Play className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Drag & drop video here, or click to select
                  </p>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        handleFileUpload(e.target.files[0], 'video');
                      }
                    }}
                    className="hidden"
                    id="video-upload"
                  />
                  <label htmlFor="video-upload">
                    <Button variant="outline" className="cursor-pointer" asChild>
                      <span>
                        <Upload className="w-4 h-4 mr-2" />
                        Choose Video
                      </span>
                    </Button>
                  </label>
                </div>
                {qrData.video.file && (
                  <div className="mt-3">
                    <p className="text-sm text-muted-foreground">
                      Video selected: {qrData.video.file.name}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Add other QR types here... */}
        </div>

        <Button
          onClick={() => setCurrentStep(3)}
          className="w-full gradient-primary text-white"
          disabled={!generateQRValue()}
        >
          Next: Customize Design
        </Button>
      </div>
    );
  };

  const qrTypes = [
    { id: 'text', icon: FileText, label: 'Text', description: 'Plain text or message' },
    { id: 'url', icon: Globe, label: 'Website', description: 'Website or link' },
    { id: 'social', icon: MessageCircle, label: 'Social Media', description: 'Social profiles' },
    { id: 'whatsapp', icon: MessageCircle, label: 'WhatsApp', description: 'WhatsApp chat' },
    { id: 'menu', icon: FileText, label: 'Restaurant Menu', description: 'Digital menu' },
    { id: 'links', icon: Globe, label: 'List of Links', description: 'Multiple links page' },
    { id: 'images', icon: Camera, label: 'Image Gallery', description: 'Photo collection' },
    { id: 'video', icon: Play, label: 'Video', description: 'Video content' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={onBack}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>
          <h1 className="text-2xl font-bold gradient-text">QR Generator</h1>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep >= step
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {step}
                </div>
                {step < 3 && (
                  <div
                    className={`w-12 h-0.5 mx-2 ${
                      currentStep > step ? 'bg-primary' : 'bg-muted'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: QR Type Selection */}
        {currentStep >= 1 && (
          <Card className="mb-8 card-elevated">
            <div className="p-6">
              <div className="border-b pb-4 mb-6">
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Step 1: Choose QR Code Type
                </h3>
                <p className="text-sm text-muted-foreground">
                  Select the type of content you want to encode in your QR code
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {qrTypes.map((type) => {
                  const IconComponent = type.icon;
                  return (
                    <Button
                      key={type.id}
                      variant={qrType === type.id ? 'default' : 'outline'}
                      className={`h-auto p-4 flex flex-col items-center gap-3 ${
                        qrType === type.id ? 'bg-primary text-primary-foreground' : ''
                      }`}
                      onClick={() => handleQRTypeSelect(type.id as QRType)}
                    >
                      <IconComponent className="w-6 h-6" />
                      <div className="text-center">
                        <div className="font-medium text-sm">{type.label}</div>
                        <div className="text-xs opacity-75">{type.description}</div>
                      </div>
                    </Button>
                  );
                })}
              </div>
            </div>
          </Card>
        )}

        {/* Step 2: Content Form */}
        {currentStep >= 2 && (
          <Card className="mb-8 card-elevated">
            <div className="p-6">
              {renderContentForm()}
            </div>
          </Card>
        )}

        {/* Step 3: Customization & Preview */}
        {currentStep >= 3 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Customization Panel */}
            <Card className="card-elevated">
              <div className="p-6">
                <div className="border-b pb-4 mb-6">
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Step 3: Customize Design
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Personalize the appearance of your QR code
                  </p>
                </div>

                <Tabs defaultValue="colors" className="space-y-6">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="colors">Colors</TabsTrigger>
                    <TabsTrigger value="size">Size & Frame</TabsTrigger>
                    <TabsTrigger value="advanced">Advanced</TabsTrigger>
                  </TabsList>

                  <TabsContent value="colors" className="space-y-6">
                    {/* Color Picker */}
                    <div className="space-y-4">
                      <Label className="text-sm font-medium text-foreground">Foreground Color</Label>
                      <div className="relative">
                        <Button
                          variant="outline"
                          className="w-full justify-start gap-3 h-12"
                          onClick={() => setShowColorPicker({ ...showColorPicker, fg: !showColorPicker.fg })}
                        >
                          <div
                            className="w-6 h-6 rounded border-2 border-border"
                            style={{ backgroundColor: qrStyle.fgColor }}
                          />
                          <span>{qrStyle.fgColor}</span>
                        </Button>
                        {showColorPicker.fg && (
                          <div className="absolute top-full left-0 z-10 mt-2 p-3 bg-background border rounded-lg shadow-lg">
                            <HexColorPicker
                              color={qrStyle.fgColor}
                              onChange={(color) => setQrStyle({ ...qrStyle, fgColor: color })}
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <Label className="text-sm font-medium text-foreground">Background Color</Label>
                      <div className="relative">
                        <Button
                          variant="outline"
                          className="w-full justify-start gap-3 h-12"
                          onClick={() => setShowColorPicker({ ...showColorPicker, bg: !showColorPicker.bg })}
                        >
                          <div
                            className="w-6 h-6 rounded border-2 border-border"
                            style={{ backgroundColor: qrStyle.bgColor }}
                          />
                          <span>{qrStyle.bgColor}</span>
                        </Button>
                        {showColorPicker.bg && (
                          <div className="absolute top-full left-0 z-10 mt-2 p-3 bg-background border rounded-lg shadow-lg">
                            <HexColorPicker
                              color={qrStyle.bgColor}
                              onChange={(color) => setQrStyle({ ...qrStyle, bgColor: color })}
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Color Palettes */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium text-foreground">Color Palettes</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(colorPalettes).map(([name, colors]) => (
                          <Button
                            key={name}
                            variant="outline"
                            className="h-auto p-3 flex flex-col items-center gap-2"
                            onClick={() => setQrStyle({ ...qrStyle, fgColor: colors[0], bgColor: '#ffffff' })}
                          >
                            <div className="flex gap-1">
                              {colors.slice(0, 4).map((color, index) => (
                                <div
                                  key={index}
                                  className="w-3 h-3 rounded-full border border-border"
                                  style={{ backgroundColor: color }}
                                />
                              ))}
                            </div>
                            <span className="text-xs capitalize">{name}</span>
                          </Button>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="size" className="space-y-6">
                    {/* Size Control */}
                    <div className="space-y-4">
                      <Label className="text-sm font-medium text-foreground">
                        Size: {qrStyle.size}px
                      </Label>
                      <Slider
                        value={[qrStyle.size]}
                        onValueChange={(value) => setQrStyle({ ...qrStyle, size: value[0] })}
                        min={200}
                        max={600}
                        step={50}
                        className="w-full"
                      />
                    </div>

                    {/* Frame Type */}
                    <div className="space-y-4">
                      <Label className="text-sm font-medium text-foreground">Frame Style</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { id: 'none', label: 'No Frame' },
                          { id: 'scan-me', label: 'Scan Me' },
                          { id: 'bubble', label: 'Bubble' },
                          { id: 'corner', label: 'Corner Tag' },
                          { id: 'round', label: 'Round' },
                          { id: 'square', label: 'Square Border' },
                        ].map((frame) => (
                          <Button
                            key={frame.id}
                            variant={qrStyle.frameType === frame.id ? 'default' : 'outline'}
                            className="text-sm"
                            onClick={() => setQrStyle({ ...qrStyle, frameType: frame.id as any })}
                          >
                            {frame.label}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Custom Frame Text */}
                    {qrStyle.frameType !== 'none' && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-foreground">Custom Frame Text</Label>
                        <Input
                          placeholder="Enter custom text..."
                          value={qrStyle.customFrameText}
                          onChange={(e) => setQrStyle({ ...qrStyle, customFrameText: e.target.value })}
                          className="input-elevated"
                        />
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="advanced" className="space-y-6">
                    <div className="text-sm text-muted-foreground">
                      Advanced customization options coming soon...
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </Card>

            {/* QR Code Preview & Download */}
            <Card className="card-elevated">
              <div className="p-6">
                <div className="border-b pb-4 mb-6">
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Preview & Download
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Your customized QR code is ready
                  </p>
                </div>

                {/* QR Code Display */}
                <div className="flex justify-center mb-6">
                  <div ref={qrRef} className="inline-block">
                    <QRFrameWrapper>
                      <QRCodeSVG
                        value={getProtectedQRValue()}
                        size={qrStyle.size}
                        fgColor={qrStyle.fgColor}
                        bgColor={qrStyle.bgColor}
                        level="M"
                        includeMargin={true}
                      />
                    </QRFrameWrapper>
                  </div>
                </div>

                {/* Download Buttons */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  <Button
                    onClick={() => downloadQR('png')}
                    variant="default"
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
                </div>

                <Button
                  onClick={shareQR}
                  variant="outline"
                  className="w-full gap-2 mb-6"
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </Button>

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
        )}
      </div>
    </div>
  );
};

export default QrGenerator;