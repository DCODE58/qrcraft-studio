import React from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { VCardData } from '@/types/qr-types';
import { User, Building, Mail, Phone, Globe, MapPin, FileText } from 'lucide-react';

interface VCardFormProps {
  data: VCardData;
  onChange: (data: VCardData) => void;
}

export function VCardForm({ data, onChange }: VCardFormProps) {
  const generateVCard = (vCardData: VCardData): string => {
    let vcard = 'BEGIN:VCARD\nVERSION:3.0\n';
    
    if (vCardData.full_name) {
      vcard += `FN:${vCardData.full_name}\n`;
      // Split name for N field (Last;First;Middle;Prefix;Suffix)
      const nameParts = vCardData.full_name.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      vcard += `N:${lastName};${firstName};;;\n`;
    }
    
    if (vCardData.organization) {
      vcard += `ORG:${vCardData.organization}\n`;
    }
    
    if (vCardData.title) {
      vcard += `TITLE:${vCardData.title}\n`;
    }
    
    if (vCardData.phone) {
      vcard += `TEL:${vCardData.phone}\n`;
    }
    
    if (vCardData.email) {
      vcard += `EMAIL:${vCardData.email}\n`;
    }
    
    if (vCardData.website) {
      vcard += `URL:${vCardData.website}\n`;
    }
    
    if (vCardData.address) {
      vcard += `ADR:;;${vCardData.address};;;;\n`;
    }
    
    if (vCardData.note) {
      vcard += `NOTE:${vCardData.note}\n`;
    }
    
    vcard += 'END:VCARD';
    
    return vcard;
  };

  const handleChange = (field: keyof VCardData, value: string) => {
    const newData = { ...data, [field]: value };
    onChange(newData);
  };

  React.useEffect(() => {
    // Update the QR content when vCard data changes
    if (data.full_name) {
      const vCardString = generateVCard(data);
      console.log('vCard QR String:', vCardString);
    }
  }, [data]);

  return (
    <Card className="card-elevated space-y-6 p-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg flex items-center justify-center">
          <User className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Contact Information</h3>
          <p className="text-sm text-muted-foreground">Create a digital business card</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="full_name">Full Name *</Label>
          <div className="relative">
            <Input
              id="full_name"
              value={data.full_name}
              onChange={(e) => handleChange('full_name', e.target.value)}
              placeholder="John Doe"
              className="input-elevated pl-10"
            />
            <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="organization">Organization</Label>
          <div className="relative">
            <Input
              id="organization"
              value={data.organization || ''}
              onChange={(e) => handleChange('organization', e.target.value)}
              placeholder="Company Name"
              className="input-elevated pl-10"
            />
            <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="title">Job Title</Label>
          <Input
            id="title"
            value={data.title || ''}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder="Senior Developer"
            className="input-elevated"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <div className="relative">
            <Input
              id="phone"
              value={data.phone || ''}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="+1 (555) 123-4567"
              className="input-elevated pl-10"
            />
            <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <div className="relative">
            <Input
              id="email"
              type="email"
              value={data.email || ''}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="john@example.com"
              className="input-elevated pl-10"
            />
            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="website">Website</Label>
          <div className="relative">
            <Input
              id="website"
              value={data.website || ''}
              onChange={(e) => handleChange('website', e.target.value)}
              placeholder="https://example.com"
              className="input-elevated pl-10"
            />
            <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <div className="relative">
          <Input
            id="address"
            value={data.address || ''}
            onChange={(e) => handleChange('address', e.target.value)}
            placeholder="123 Main St, City, State 12345"
            className="input-elevated pl-10"
          />
          <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="note">Additional Notes</Label>
        <div className="relative">
          <Textarea
            id="note"
            value={data.note || ''}
            onChange={(e) => handleChange('note', e.target.value)}
            placeholder="Any additional information or notes"
            className="input-elevated pl-10 min-h-[80px] resize-none"
          />
          <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      <div className="bg-muted/30 rounded-lg p-4 space-y-2">
        <h4 className="text-sm font-medium text-foreground">How it works:</h4>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>• Scan to automatically save contact to phone</li>
          <li>• Compatible with all modern smartphones</li>
          <li>• Works with Apple Contacts, Google Contacts, and more</li>
          <li>• All contact information is embedded in the QR code</li>
        </ul>
      </div>
    </Card>
  );
}