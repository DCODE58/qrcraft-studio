import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Link, MessageSquare, Mail, Phone, MessageCircle, 
  Wifi, User, Calendar, CreditCard, File, 
  Video, Smartphone, Lock
} from 'lucide-react';
import { QRType } from '@/types/qr-types';

interface QRTypeSelectorProps {
  selectedType: QRType;
  onTypeSelect: (type: QRType) => void;
}

const qrTypes = [
  { 
    type: 'url' as QRType, 
    icon: Link, 
    label: 'Website URL', 
    description: 'Link to any website or webpage',
    color: 'text-blue-600'
  },
  { 
    type: 'text' as QRType, 
    icon: MessageSquare, 
    label: 'Plain Text', 
    description: 'Share any text content',
    color: 'text-gray-600'
  },
  { 
    type: 'email' as QRType, 
    icon: Mail, 
    label: 'Email', 
    description: 'Pre-filled email with subject and body',
    color: 'text-red-600'
  },
  { 
    type: 'phone' as QRType, 
    icon: Phone, 
    label: 'Phone Call', 
    description: 'Direct dial a phone number',
    color: 'text-green-600'
  },
  { 
    type: 'sms' as QRType, 
    icon: MessageCircle, 
    label: 'SMS Message', 
    description: 'Pre-filled text message',
    color: 'text-blue-500'
  },
  { 
    type: 'wifi' as QRType, 
    icon: Wifi, 
    label: 'WiFi Network', 
    description: 'Connect to WiFi network instantly',
    color: 'text-purple-600'
  },
  { 
    type: 'vcard' as QRType, 
    icon: User, 
    label: 'Contact Card', 
    description: 'Share contact information (vCard)',
    color: 'text-indigo-600'
  },
  { 
    type: 'event' as QRType, 
    icon: Calendar, 
    label: 'Calendar Event', 
    description: 'Add event to calendar with reminders',
    color: 'text-orange-600'
  },
  { 
    type: 'payment' as QRType, 
    icon: CreditCard, 
    label: 'Payment', 
    description: 'M-Pesa, PayPal, Stripe, crypto payments',
    color: 'text-emerald-600'
  },
  { 
    type: 'file' as QRType, 
    icon: File, 
    label: 'File Download', 
    description: 'Share documents, PDFs, images',
    color: 'text-amber-600'
  },
  { 
    type: 'video' as QRType, 
    icon: Video, 
    label: 'Video Content', 
    description: 'Share video files or streaming links',
    color: 'text-pink-600'
  },
  { 
    type: 'app_link' as QRType, 
    icon: Smartphone, 
    label: 'App Deep Link', 
    description: 'Open specific app screens on mobile',
    color: 'text-cyan-600'
  },
  { 
    type: 'password-protected' as QRType, 
    icon: Lock, 
    label: 'Password Protected', 
    description: 'Secure QR with password protection',
    color: 'text-red-700'
  }
];

export function QRTypeSelector({ selectedType, onTypeSelect }: QRTypeSelectorProps) {
  return (
    <div className="space-y-4">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold text-foreground">Choose QR Type</h3>
        <p className="text-sm text-muted-foreground">Select the type of content you want to share</p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {qrTypes.map(({ type, icon: Icon, label, description, color }) => {
          const isSelected = selectedType === type;
          
          return (
            <Button
              key={type}
              variant={isSelected ? "default" : "outline"}
              className={`h-auto p-4 justify-start text-left transition-all duration-200 ${
                isSelected 
                  ? 'bg-primary text-primary-foreground shadow-md' 
                  : 'hover:bg-muted/50 hover:scale-[1.02]'
              }`}
              onClick={() => onTypeSelect(type)}
            >
              <div className="flex items-start gap-3 w-full">
                <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                  isSelected ? 'text-primary-foreground' : color
                }`} />
                <div className="flex-1 min-w-0">
                  <div className={`font-medium text-sm ${
                    isSelected ? 'text-primary-foreground' : 'text-foreground'
                  }`}>
                    {label}
                  </div>
                  <div className={`text-xs mt-1 leading-tight ${
                    isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground'
                  }`}>
                    {description}
                  </div>
                </div>
              </div>
            </Button>
          );
        })}
      </div>
    </div>
  );
}