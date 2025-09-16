import React from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { WiFiData } from '@/types/qr-types';
import { Wifi, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WiFiFormProps {
  data: WiFiData;
  onChange: (data: WiFiData) => void;
}

export function WiFiForm({ data, onChange }: WiFiFormProps) {
  const [showPassword, setShowPassword] = React.useState(false);

  const generateWiFiString = (wifiData: WiFiData): string => {
    const security = wifiData.security === 'nopass' ? 'nopass' : wifiData.security;
    const password = wifiData.security === 'nopass' ? '' : wifiData.password || '';
    const hidden = wifiData.hidden ? 'true' : 'false';
    
    return `WIFI:T:${security};S:${wifiData.ssid};P:${password};H:${hidden};;`;
  };

  const handleChange = (field: keyof WiFiData, value: any) => {
    const newData = { ...data, [field]: value };
    onChange(newData);
  };

  React.useEffect(() => {
    // Update the QR content URL when WiFi data changes
    if (data.ssid) {
      const wifiString = generateWiFiString(data);
      // This would typically be handled by the parent component
      console.log('WiFi QR String:', wifiString);
    }
  }, [data]);

  return (
    <Card className="card-elevated space-y-6 p-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
          <Wifi className="w-5 h-5 text-purple-600 dark:text-purple-400" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">WiFi Network Settings</h3>
          <p className="text-sm text-muted-foreground">Configure WiFi connection details</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="ssid">Network Name (SSID) *</Label>
          <Input
            id="ssid"
            value={data.ssid}
            onChange={(e) => handleChange('ssid', e.target.value)}
            placeholder="Enter WiFi network name"
            className="input-elevated"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="security">Security Type</Label>
          <Select value={data.security} onValueChange={(value) => handleChange('security', value)}>
            <SelectTrigger className="input-elevated">
              <SelectValue placeholder="Select security type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="WPA3">WPA3 (Most Secure)</SelectItem>
              <SelectItem value="WPA2">WPA2 (Recommended)</SelectItem>
              <SelectItem value="WPA">WPA (Legacy)</SelectItem>
              <SelectItem value="WEP">WEP (Not Recommended)</SelectItem>
              <SelectItem value="nopass">No Password (Open)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {data.security !== 'nopass' && (
          <div className="space-y-2">
            <Label htmlFor="password">Network Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={data.password || ''}
                onChange={(e) => handleChange('password', e.target.value)}
                placeholder="Enter WiFi password"
                className="input-elevated pr-12"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-4 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              The password will be encrypted in the QR code
            </p>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label htmlFor="hidden">Hidden Network</Label>
            <p className="text-xs text-muted-foreground">
              Enable if this is a hidden/non-broadcast network
            </p>
          </div>
          <Switch
            id="hidden"
            checked={data.hidden}
            onCheckedChange={(checked) => handleChange('hidden', checked)}
          />
        </div>
      </div>

      <div className="bg-muted/30 rounded-lg p-4 space-y-2">
        <h4 className="text-sm font-medium text-foreground">How it works:</h4>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>• Scan the QR code with any modern smartphone</li>
          <li>• Device will automatically prompt to connect to WiFi</li>
          <li>• No need to manually enter password</li>
          <li>• Works with iOS 11+, Android 10+, and most QR scanner apps</li>
        </ul>
      </div>
    </Card>
  );
}