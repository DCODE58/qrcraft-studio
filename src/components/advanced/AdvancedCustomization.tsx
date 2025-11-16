import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Upload, Palette, Grid3x3, Square, Circle, Diamond, Hexagon } from 'lucide-react';
import { HexColorPicker } from 'react-colorful';
import { useState } from 'react';

interface AdvancedCustomizationProps {
  style: any;
  onStyleChange: (style: any) => void;
}

export const AdvancedCustomization = ({ style, onStyleChange }: AdvancedCustomizationProps) => {
  const [showFgPicker, setShowFgPicker] = useState(false);
  const [showBgPicker, setShowBgPicker] = useState(false);
  const [showGradientPicker, setShowGradientPicker] = useState(false);

  const dotPatterns = [
    { id: 'square', name: 'Square', icon: Square },
    { id: 'rounded', name: 'Rounded', icon: Circle },
    { id: 'dots', name: 'Dots', icon: Circle },
    { id: 'classy', name: 'Classy', icon: Diamond },
    { id: 'classy-rounded', name: 'Classy Rounded', icon: Diamond },
    { id: 'extra-rounded', name: 'Extra Rounded', icon: Circle },
  ];

  const cornerPatterns = [
    { id: 'square', name: 'Square' },
    { id: 'extra-rounded', name: 'Extra Rounded' },
    { id: 'dot', name: 'Dot' },
  ];

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onStyleChange({ ...style, logoUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      {/* Logo Upload */}
      <Card className="p-4">
        <Label className="text-sm font-medium mb-2 block">Logo</Label>
        <div className="space-y-3">
          <input
            type="file"
            accept="image/*"
            onChange={handleLogoUpload}
            className="hidden"
            id="logo-upload"
          />
          <Button
            variant="outline"
            className="w-full"
            onClick={() => document.getElementById('logo-upload')?.click()}
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload Logo
          </Button>
          {style.logoUrl && (
            <div className="relative">
              <img 
                src={style.logoUrl} 
                alt="Logo" 
                className="w-20 h-20 object-contain mx-auto border rounded"
              />
              <Button
                size="sm"
                variant="ghost"
                className="absolute top-0 right-0"
                onClick={() => onStyleChange({ ...style, logoUrl: null })}
              >
                Remove
              </Button>
            </div>
          )}
          {style.logoUrl && (
            <div>
              <Label className="text-xs">Logo Size</Label>
              <Slider
                value={[style.logoSize || 80]}
                onValueChange={([value]) => onStyleChange({ ...style, logoSize: value })}
                min={40}
                max={150}
                step={10}
                className="mt-2"
              />
              <span className="text-xs text-muted-foreground">{style.logoSize || 80}px</span>
            </div>
          )}
        </div>
      </Card>

      {/* Gradient Colors */}
      <Card className="p-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Enable Gradient</Label>
            <Switch
              checked={style.useGradient || false}
              onCheckedChange={(checked) => onStyleChange({ ...style, useGradient: checked })}
            />
          </div>
          
          {style.useGradient && (
            <>
              <div>
                <Label className="text-xs">Primary Color</Label>
                <div className="flex gap-2 mt-1">
                  <div
                    className="w-10 h-10 rounded border cursor-pointer"
                    style={{ backgroundColor: style.fgColor }}
                    onClick={() => setShowFgPicker(!showFgPicker)}
                  />
                  <Input
                    value={style.fgColor}
                    onChange={(e) => onStyleChange({ ...style, fgColor: e.target.value })}
                    className="flex-1"
                  />
                </div>
                {showFgPicker && (
                  <div className="mt-2">
                    <HexColorPicker
                      color={style.fgColor}
                      onChange={(color) => onStyleChange({ ...style, fgColor: color })}
                    />
                  </div>
                )}
              </div>

              <div>
                <Label className="text-xs">Gradient Color</Label>
                <div className="flex gap-2 mt-1">
                  <div
                    className="w-10 h-10 rounded border cursor-pointer"
                    style={{ backgroundColor: style.gradientColor || style.fgColor }}
                    onClick={() => setShowGradientPicker(!showGradientPicker)}
                  />
                  <Input
                    value={style.gradientColor || style.fgColor}
                    onChange={(e) => onStyleChange({ ...style, gradientColor: e.target.value })}
                    className="flex-1"
                  />
                </div>
                {showGradientPicker && (
                  <div className="mt-2">
                    <HexColorPicker
                      color={style.gradientColor || style.fgColor}
                      onChange={(color) => onStyleChange({ ...style, gradientColor: color })}
                    />
                  </div>
                )}
              </div>

              <div>
                <Label className="text-xs">Gradient Direction</Label>
                <Select
                  value={style.gradientDirection || 'diagonal'}
                  onValueChange={(value) => onStyleChange({ ...style, gradientDirection: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="horizontal">Horizontal</SelectItem>
                    <SelectItem value="vertical">Vertical</SelectItem>
                    <SelectItem value="diagonal">Diagonal</SelectItem>
                    <SelectItem value="radial">Radial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
        </div>
      </Card>

      {/* Dot Patterns */}
      <Card className="p-4">
        <Label className="text-sm font-medium mb-3 block">Dot Pattern</Label>
        <div className="grid grid-cols-3 gap-2">
          {dotPatterns.map((pattern) => (
            <button
              key={pattern.id}
              onClick={() => onStyleChange({ ...style, dotStyle: pattern.id })}
              className={`p-3 rounded-lg border-2 transition-all hover:border-primary ${
                style.dotStyle === pattern.id ? 'border-primary bg-primary/5' : 'border-border'
              }`}
            >
              <pattern.icon className="w-6 h-6 mx-auto mb-1" />
              <p className="text-xs text-center">{pattern.name}</p>
            </button>
          ))}
        </div>
      </Card>

      {/* Corner Patterns */}
      <Card className="p-4">
        <Label className="text-sm font-medium mb-3 block">Corner Style</Label>
        <div className="grid grid-cols-3 gap-2">
          {cornerPatterns.map((pattern) => (
            <button
              key={pattern.id}
              onClick={() => onStyleChange({ ...style, cornerStyle: pattern.id })}
              className={`p-3 rounded-lg border-2 transition-all hover:border-primary ${
                style.cornerStyle === pattern.id ? 'border-primary bg-primary/5' : 'border-border'
              }`}
            >
              <div className="w-8 h-8 mx-auto mb-1 border-2 border-current" 
                   style={{ 
                     borderRadius: pattern.id === 'extra-rounded' ? '8px' : 
                                  pattern.id === 'dot' ? '50%' : '0' 
                   }} 
              />
              <p className="text-xs text-center">{pattern.name}</p>
            </button>
          ))}
        </div>
      </Card>

      {/* Border & Shadow */}
      <Card className="p-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Add Border</Label>
            <Switch
              checked={style.showBorder || false}
              onCheckedChange={(checked) => onStyleChange({ ...style, showBorder: checked })}
            />
          </div>

          {style.showBorder && (
            <div>
              <Label className="text-xs">Border Width</Label>
              <Slider
                value={[style.borderWidth || 2]}
                onValueChange={([value]) => onStyleChange({ ...style, borderWidth: value })}
                min={1}
                max={10}
                step={1}
                className="mt-2"
              />
              <span className="text-xs text-muted-foreground">{style.borderWidth || 2}px</span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Add Shadow</Label>
            <Switch
              checked={style.showShadow || false}
              onCheckedChange={(checked) => onStyleChange({ ...style, showShadow: checked })}
            />
          </div>

          {style.showShadow && (
            <div>
              <Label className="text-xs">Shadow Intensity</Label>
              <Slider
                value={[style.shadowIntensity || 0.2]}
                onValueChange={([value]) => onStyleChange({ ...style, shadowIntensity: value })}
                min={0.1}
                max={0.5}
                step={0.1}
                className="mt-2"
              />
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};