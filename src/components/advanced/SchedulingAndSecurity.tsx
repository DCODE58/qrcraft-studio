import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, Shield, Globe, Lock, AlertTriangle } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

interface SchedulingAndSecurityProps {
  settings: any;
  onSettingsChange: (settings: any) => void;
}

export const SchedulingAndSecurity = ({ settings, onSettingsChange }: SchedulingAndSecurityProps) => {
  return (
    <div className="space-y-6">
      {/* Scheduling */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Scheduling</h3>
        </div>

        <div className="space-y-4">
          <div>
            <Label className="text-sm">Activation Date</Label>
            <Input
              type="datetime-local"
              value={settings.activationDate || ''}
              onChange={(e) => onSettingsChange({ ...settings, activationDate: e.target.value })}
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              QR code will only work after this date
            </p>
          </div>

          <div>
            <Label className="text-sm">Expiration Date</Label>
            <Input
              type="datetime-local"
              value={settings.expirationDate || ''}
              onChange={(e) => onSettingsChange({ ...settings, expirationDate: e.target.value })}
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              QR code will expire after this date
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm">Recurring Schedule</Label>
              <p className="text-xs text-muted-foreground">Enable time-based recurring</p>
            </div>
            <Switch
              checked={settings.isRecurring || false}
              onCheckedChange={(checked) => 
                onSettingsChange({ ...settings, isRecurring: checked })
              }
            />
          </div>

          {settings.isRecurring && (
            <div>
              <Label className="text-sm">Recurrence Pattern</Label>
              <Select
                value={settings.recurrencePattern || 'daily'}
                onValueChange={(value) => 
                  onSettingsChange({ ...settings, recurrencePattern: value })
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="weekdays">Weekdays Only</SelectItem>
                  <SelectItem value="weekends">Weekends Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </Card>

      {/* Scan Limits */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Scan Limits</h3>
        </div>

        <div className="space-y-4">
          <div>
            <Label className="text-sm">Maximum Total Scans</Label>
            <Input
              type="number"
              placeholder="Unlimited"
              value={settings.scanLimit || ''}
              onChange={(e) => 
                onSettingsChange({ ...settings, scanLimit: e.target.value ? parseInt(e.target.value) : null })
              }
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Leave empty for unlimited scans
            </p>
          </div>

          <div>
            <Label className="text-sm">Max Scans Per IP Address</Label>
            <Input
              type="number"
              placeholder="Unlimited"
              value={settings.maxScansPerIp || ''}
              onChange={(e) => 
                onSettingsChange({ ...settings, maxScansPerIp: e.target.value ? parseInt(e.target.value) : null })
              }
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Prevent abuse from single IP
            </p>
          </div>
        </div>
      </Card>

      {/* IP Restrictions */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">IP Restrictions</h3>
        </div>

        <div className="space-y-4">
          <div>
            <Label className="text-sm">IP Whitelist</Label>
            <Textarea
              placeholder="192.168.1.1&#10;10.0.0.1&#10;(one IP per line)"
              value={settings.ipWhitelist?.join('\n') || ''}
              onChange={(e) => 
                onSettingsChange({ 
                  ...settings, 
                  ipWhitelist: e.target.value.split('\n').filter(ip => ip.trim()) 
                })
              }
              rows={3}
              className="mt-1 font-mono text-xs"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Only these IPs can scan (leave empty to allow all)
            </p>
          </div>

          <div>
            <Label className="text-sm">IP Blacklist</Label>
            <Textarea
              placeholder="192.168.1.100&#10;10.0.0.50&#10;(one IP per line)"
              value={settings.ipBlacklist?.join('\n') || ''}
              onChange={(e) => 
                onSettingsChange({ 
                  ...settings, 
                  ipBlacklist: e.target.value.split('\n').filter(ip => ip.trim()) 
                })
              }
              rows={3}
              className="mt-1 font-mono text-xs"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Block these IPs from scanning
            </p>
          </div>
        </div>
      </Card>

      {/* Geographic Restrictions */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Globe className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Geographic Restrictions</h3>
        </div>

        <div className="space-y-4">
          <div>
            <Label className="text-sm">Allowed Countries</Label>
            <Textarea
              placeholder="US&#10;CA&#10;GB&#10;(country codes, one per line)"
              value={settings.allowedCountries?.join('\n') || ''}
              onChange={(e) => 
                onSettingsChange({ 
                  ...settings, 
                  allowedCountries: e.target.value.split('\n').filter(c => c.trim()) 
                })
              }
              rows={3}
              className="mt-1 font-mono text-xs"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Only allow scans from these countries (leave empty to allow all)
            </p>
          </div>

          <div>
            <Label className="text-sm">Restricted Countries</Label>
            <Textarea
              placeholder="CN&#10;RU&#10;(country codes, one per line)"
              value={settings.restrictedCountries?.join('\n') || ''}
              onChange={(e) => 
                onSettingsChange({ 
                  ...settings, 
                  restrictedCountries: e.target.value.split('\n').filter(c => c.trim()) 
                })
              }
              rows={3}
              className="mt-1 font-mono text-xs"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Block scans from these countries
            </p>
          </div>
        </div>
      </Card>

      {/* Two-Factor Authentication */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-primary" />
            <div>
              <h3 className="font-semibold">Two-Factor Authentication</h3>
              <p className="text-xs text-muted-foreground">Require OTP code to access</p>
            </div>
          </div>
          <Switch
            checked={settings.require2FA || false}
            onCheckedChange={(checked) => 
              onSettingsChange({ ...settings, require2FA: checked })
            }
          />
        </div>
      </Card>
    </div>
  );
};