import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Card } from '@/components/ui/card';
import { HexColorPicker } from 'react-colorful';
import { 
  Upload, Image as ImageIcon, Palette, Square, Circle, 
  Maximize2, Layers, Sparkles, Plus, X, ChevronDown 
} from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

export interface AdvancedQRStyle {
  logo?: {
    url: string;
    size: number;
    margin: number;
  };
  dotStyle: 'square' | 'dots' | 'rounded' | 'extra-rounded' | 'classy' | 'classy-rounded';
  cornerSquareStyle: 'square' | 'dot' | 'extra-rounded';
  cornerDotStyle: 'square' | 'dot';
  gradient?: {
    enabled: boolean;
    type: 'linear' | 'radial';
    colorStops: Array<{ offset: number; color: string }>;
    angle: number;
  };
  border: {
    enabled: boolean;
    width: number;
    color: string;
    style: 'solid' | 'dashed' | 'dotted' | 'double';
    radius: number;
  };
  shadow: {
    enabled: boolean;
    blur: number;
    color: string;
    offsetX: number;
    offsetY: number;
  };
}

interface AdvancedCustomizationProps {
  style: AdvancedQRStyle;
  onChange: (style: AdvancedQRStyle) => void;
  onLogoUpload: (file: File) => void;
}

export const AdvancedCustomization = ({ style, onChange, onLogoUpload }: AdvancedCustomizationProps) => {
  const [showGradientPicker, setShowGradientPicker] = useState(false);
  const [activeColorStop, setActiveColorStop] = useState(0);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onLogoUpload(file);
    }
  };

  const addGradientStop = () => {
    if (style.gradient && style.gradient.colorStops.length < 5) {
      onChange({
        ...style,
        gradient: {
          ...style.gradient,
          colorStops: [
            ...style.gradient.colorStops,
            { offset: 0.5, color: '#888888' }
          ].sort((a, b) => a.offset - b.offset)
        }
      });
    }
  };

  const removeGradientStop = (index: number) => {
    if (style.gradient && style.gradient.colorStops.length > 2) {
      onChange({
        ...style,
        gradient: {
          ...style.gradient,
          colorStops: style.gradient.colorStops.filter((_, i) => i !== index)
        }
      });
    }
  };

  const updateGradientStop = (index: number, color: string) => {
    if (style.gradient) {
      const newStops = [...style.gradient.colorStops];
      newStops[index] = { ...newStops[index], color };
      onChange({
        ...style,
        gradient: { ...style.gradient, colorStops: newStops }
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Logo Upload Section */}
      <Collapsible>
        <CollapsibleTrigger className="w-full">
          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-3">
              <ImageIcon className="w-5 h-5 text-primary" />
              <div className="text-left">
                <p className="text-sm font-semibold">Logo Embedding</p>
                <p className="text-xs text-muted-foreground">Add your brand logo to the center</p>
              </div>
            </div>
            <ChevronDown className="w-4 h-4 transition-transform" />
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-4 space-y-4">
          <div>
            <Label htmlFor="logo-upload" className="cursor-pointer">
              <div className="border-2 border-dashed border-border rounded-xl p-6 hover:border-primary/50 transition-colors text-center">
                {style.logo?.url ? (
                  <div className="space-y-3">
                    <img src={style.logo.url} alt="Logo" className="w-20 h-20 mx-auto object-contain" />
                    <p className="text-xs text-muted-foreground">Click to change logo</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
                    <p className="text-sm font-medium">Upload Logo</p>
                    <p className="text-xs text-muted-foreground">PNG, JPG up to 2MB</p>
                  </div>
                )}
              </div>
            </Label>
            <input
              id="logo-upload"
              type="file"
              accept="image/png,image/jpeg,image/jpg"
              onChange={handleLogoUpload}
              className="hidden"
            />
          </div>

          {style.logo?.url && (
            <>
              <div className="space-y-2">
                <Label className="text-xs">Logo Size: {style.logo.size}%</Label>
                <Slider
                  value={[style.logo.size]}
                  onValueChange={([value]) => onChange({
                    ...style,
                    logo: { ...style.logo!, size: value }
                  })}
                  min={10}
                  max={40}
                  step={1}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Logo Margin: {style.logo.margin}px</Label>
                <Slider
                  value={[style.logo.margin]}
                  onValueChange={([value]) => onChange({
                    ...style,
                    logo: { ...style.logo!, margin: value }
                  })}
                  min={0}
                  max={20}
                  step={1}
                  className="w-full"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onChange({ ...style, logo: undefined })}
                className="w-full"
              >
                <X className="w-4 h-4 mr-2" />
                Remove Logo
              </Button>
            </>
          )}
        </CollapsibleContent>
      </Collapsible>

      {/* Pattern & Corner Styles */}
      <Collapsible defaultOpen>
        <CollapsibleTrigger className="w-full">
          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-3">
              <Layers className="w-5 h-5 text-primary" />
              <div className="text-left">
                <p className="text-sm font-semibold">Pattern & Corners</p>
                <p className="text-xs text-muted-foreground">Customize QR code appearance</p>
              </div>
            </div>
            <ChevronDown className="w-4 h-4 transition-transform" />
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-4 space-y-4">
          <div>
            <Label className="text-xs font-medium">Dot Style</Label>
            <Select value={style.dotStyle} onValueChange={(value: any) => onChange({ ...style, dotStyle: value })}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="square">Square</SelectItem>
                <SelectItem value="dots">Dots</SelectItem>
                <SelectItem value="rounded">Rounded</SelectItem>
                <SelectItem value="extra-rounded">Extra Rounded</SelectItem>
                <SelectItem value="classy">Classy</SelectItem>
                <SelectItem value="classy-rounded">Classy Rounded</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs font-medium">Corner Square Style</Label>
            <Select value={style.cornerSquareStyle} onValueChange={(value: any) => onChange({ ...style, cornerSquareStyle: value })}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="square">Square</SelectItem>
                <SelectItem value="dot">Dot</SelectItem>
                <SelectItem value="extra-rounded">Extra Rounded</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs font-medium">Corner Dot Style</Label>
            <Select value={style.cornerDotStyle} onValueChange={(value: any) => onChange({ ...style, cornerDotStyle: value })}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="square">Square</SelectItem>
                <SelectItem value="dot">Dot</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Gradient System */}
      <Collapsible>
        <CollapsibleTrigger className="w-full">
          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-3">
              <Palette className="w-5 h-5 text-primary" />
              <div className="text-left">
                <p className="text-sm font-semibold">Gradient Colors</p>
                <p className="text-xs text-muted-foreground">Create beautiful color transitions</p>
              </div>
            </div>
            <Switch
              checked={style.gradient?.enabled || false}
              onCheckedChange={(enabled) => onChange({
                ...style,
                gradient: enabled ? {
                  enabled: true,
                  type: 'linear',
                  angle: 135,
                  colorStops: [
                    { offset: 0, color: '#2563EB' },
                    { offset: 1, color: '#1D4ED8' }
                  ]
                } : undefined
              })}
            />
          </div>
        </CollapsibleTrigger>
        {style.gradient?.enabled && (
          <CollapsibleContent className="pt-4 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-medium">Type</Label>
                <Select
                  value={style.gradient.type}
                  onValueChange={(value: 'linear' | 'radial') => onChange({
                    ...style,
                    gradient: { ...style.gradient!, type: value }
                  })}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="linear">Linear</SelectItem>
                    <SelectItem value="radial">Radial</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {style.gradient.type === 'linear' && (
                <div>
                  <Label className="text-xs font-medium">Angle: {style.gradient.angle}°</Label>
                  <Slider
                    value={[style.gradient.angle]}
                    onValueChange={([value]) => onChange({
                      ...style,
                      gradient: { ...style.gradient!, angle: value }
                    })}
                    min={0}
                    max={360}
                    step={15}
                    className="mt-2"
                  />
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium">Color Stops</Label>
                {style.gradient.colorStops.length < 5 && (
                  <Button size="sm" variant="outline" onClick={addGradientStop}>
                    <Plus className="w-3 h-3 mr-1" />
                    Add
                  </Button>
                )}
              </div>

              {style.gradient.colorStops.map((stop, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div
                    className="w-10 h-10 rounded-lg border-2 border-border cursor-pointer"
                    style={{ backgroundColor: stop.color }}
                    onClick={() => {
                      setActiveColorStop(index);
                      setShowGradientPicker(!showGradientPicker);
                    }}
                  />
                  <div className="flex-1">
                    <Input
                      value={stop.color}
                      onChange={(e) => updateGradientStop(index, e.target.value)}
                      className="h-9 text-xs font-mono"
                    />
                  </div>
                  {style.gradient.colorStops.length > 2 && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeGradientStop(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}

              {showGradientPicker && (
                <Card className="p-4">
                  <HexColorPicker
                    color={style.gradient.colorStops[activeColorStop].color}
                    onChange={(color) => updateGradientStop(activeColorStop, color)}
                  />
                </Card>
              )}
            </div>
          </CollapsibleContent>
        )}
      </Collapsible>

      {/* Border & Shadow */}
      <Collapsible>
        <CollapsibleTrigger className="w-full">
          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-3">
              <Square className="w-5 h-5 text-primary" />
              <div className="text-left">
                <p className="text-sm font-semibold">Border & Shadow</p>
                <p className="text-xs text-muted-foreground">Professional finishing touches</p>
              </div>
            </div>
            <ChevronDown className="w-4 h-4 transition-transform" />
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-4 space-y-4">
          {/* Border Controls */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium">Enable Border</Label>
              <Switch
                checked={style.border.enabled}
                onCheckedChange={(enabled) => onChange({
                  ...style,
                  border: { ...style.border, enabled }
                })}
              />
            </div>

            {style.border.enabled && (
              <>
                <div>
                  <Label className="text-xs">Width: {style.border.width}px</Label>
                  <Slider
                    value={[style.border.width]}
                    onValueChange={([value]) => onChange({
                      ...style,
                      border: { ...style.border, width: value }
                    })}
                    min={1}
                    max={20}
                    step={1}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label className="text-xs">Border Color</Label>
                  <Input
                    type="color"
                    value={style.border.color}
                    onChange={(e) => onChange({
                      ...style,
                      border: { ...style.border, color: e.target.value }
                    })}
                    className="h-10 mt-2"
                  />
                </div>

                <div>
                  <Label className="text-xs">Border Style</Label>
                  <Select
                    value={style.border.style}
                    onValueChange={(value: any) => onChange({
                      ...style,
                      border: { ...style.border, style: value }
                    })}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="solid">Solid</SelectItem>
                      <SelectItem value="dashed">Dashed</SelectItem>
                      <SelectItem value="dotted">Dotted</SelectItem>
                      <SelectItem value="double">Double</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs">Border Radius: {style.border.radius}px</Label>
                  <Slider
                    value={[style.border.radius]}
                    onValueChange={([value]) => onChange({
                      ...style,
                      border: { ...style.border, radius: value }
                    })}
                    min={0}
                    max={50}
                    step={1}
                    className="mt-2"
                  />
                </div>
              </>
            )}
          </div>

          {/* Shadow Controls */}
          <div className="space-y-3 pt-4 border-t border-border">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium">Enable Shadow</Label>
              <Switch
                checked={style.shadow.enabled}
                onCheckedChange={(enabled) => onChange({
                  ...style,
                  shadow: { ...style.shadow, enabled }
                })}
              />
            </div>

            {style.shadow.enabled && (
              <>
                <div>
                  <Label className="text-xs">Blur: {style.shadow.blur}px</Label>
                  <Slider
                    value={[style.shadow.blur]}
                    onValueChange={([value]) => onChange({
                      ...style,
                      shadow: { ...style.shadow, blur: value }
                    })}
                    min={0}
                    max={50}
                    step={1}
                    className="mt-2"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Offset X: {style.shadow.offsetX}px</Label>
                    <Slider
                      value={[style.shadow.offsetX]}
                      onValueChange={([value]) => onChange({
                        ...style,
                        shadow: { ...style.shadow, offsetX: value }
                      })}
                      min={-20}
                      max={20}
                      step={1}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Offset Y: {style.shadow.offsetY}px</Label>
                    <Slider
                      value={[style.shadow.offsetY]}
                      onValueChange={([value]) => onChange({
                        ...style,
                        shadow: { ...style.shadow, offsetY: value }
                      })}
                      min={-20}
                      max={20}
                      step={1}
                      className="mt-2"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-xs">Shadow Color</Label>
                  <Input
                    type="color"
                    value={style.shadow.color.replace(/rgba?\([^)]+\)/, '#000000')}
                    onChange={(e) => {
                      const hex = e.target.value;
                      const r = parseInt(hex.slice(1, 3), 16);
                      const g = parseInt(hex.slice(3, 5), 16);
                      const b = parseInt(hex.slice(5, 7), 16);
                      onChange({
                        ...style,
                        shadow: { ...style.shadow, color: `rgba(${r}, ${g}, ${b}, 0.2)` }
                      });
                    }}
                    className="h-10 mt-2"
                  />
                </div>
              </>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};
