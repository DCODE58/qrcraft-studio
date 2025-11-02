import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Sparkles } from 'lucide-react';

export interface QRTemplate {
  id: string;
  name: string;
  category: string;
  style: {
    fgColor: string;
    bgColor: string;
    dotStyle: 'square' | 'dots' | 'rounded' | 'extra-rounded' | 'classy' | 'classy-rounded';
    cornerSquareStyle: 'square' | 'dot' | 'extra-rounded';
    cornerDotStyle: 'square' | 'dot';
    gradient?: {
      type: 'linear' | 'radial';
      colorStops: Array<{ offset: number; color: string }>;
    };
    border?: {
      enabled: boolean;
      width: number;
      color: string;
      style: 'solid' | 'dashed' | 'dotted';
    };
    shadow?: {
      enabled: boolean;
      blur: number;
      color: string;
      offsetX: number;
      offsetY: number;
    };
  };
}

export const qrTemplates: QRTemplate[] = [
  {
    id: 'modern-blue',
    name: 'Modern Blue',
    category: 'Business',
    style: {
      fgColor: '#2563EB',
      bgColor: '#FFFFFF',
      dotStyle: 'rounded',
      cornerSquareStyle: 'extra-rounded',
      cornerDotStyle: 'dot',
      gradient: {
        type: 'linear',
        colorStops: [
          { offset: 0, color: '#2563EB' },
          { offset: 1, color: '#1D4ED8' }
        ]
      },
      border: {
        enabled: true,
        width: 8,
        color: '#F0F9FF',
        style: 'solid'
      },
      shadow: {
        enabled: true,
        blur: 20,
        color: 'rgba(37, 99, 235, 0.15)',
        offsetX: 0,
        offsetY: 4
      }
    }
  },
  {
    id: 'elegant-purple',
    name: 'Elegant Purple',
    category: 'Luxury',
    style: {
      fgColor: '#7C3AED',
      bgColor: '#FFFFFF',
      dotStyle: 'classy-rounded',
      cornerSquareStyle: 'extra-rounded',
      cornerDotStyle: 'dot',
      gradient: {
        type: 'linear',
        colorStops: [
          { offset: 0, color: '#7C3AED' },
          { offset: 1, color: '#A78BFA' }
        ]
      },
      border: {
        enabled: true,
        width: 10,
        color: '#FAF5FF',
        style: 'solid'
      },
      shadow: {
        enabled: true,
        blur: 25,
        color: 'rgba(124, 58, 237, 0.2)',
        offsetX: 0,
        offsetY: 6
      }
    }
  },
  {
    id: 'tech-green',
    name: 'Tech Green',
    category: 'Technology',
    style: {
      fgColor: '#059669',
      bgColor: '#FFFFFF',
      dotStyle: 'extra-rounded',
      cornerSquareStyle: 'square',
      cornerDotStyle: 'square',
      gradient: {
        type: 'radial',
        colorStops: [
          { offset: 0, color: '#10B981' },
          { offset: 1, color: '#059669' }
        ]
      },
      border: {
        enabled: true,
        width: 6,
        color: '#ECFDF5',
        style: 'solid'
      },
      shadow: {
        enabled: true,
        blur: 15,
        color: 'rgba(5, 150, 105, 0.12)',
        offsetX: 0,
        offsetY: 3
      }
    }
  },
  {
    id: 'minimal-black',
    name: 'Minimal Black',
    category: 'Professional',
    style: {
      fgColor: '#000000',
      bgColor: '#FFFFFF',
      dotStyle: 'square',
      cornerSquareStyle: 'square',
      cornerDotStyle: 'square',
      border: {
        enabled: true,
        width: 4,
        color: '#F3F4F6',
        style: 'solid'
      },
      shadow: {
        enabled: false,
        blur: 0,
        color: 'rgba(0, 0, 0, 0)',
        offsetX: 0,
        offsetY: 0
      }
    }
  },
  {
    id: 'vibrant-gradient',
    name: 'Vibrant Gradient',
    category: 'Creative',
    style: {
      fgColor: '#EC4899',
      bgColor: '#FFFFFF',
      dotStyle: 'dots',
      cornerSquareStyle: 'dot',
      cornerDotStyle: 'dot',
      gradient: {
        type: 'linear',
        colorStops: [
          { offset: 0, color: '#EC4899' },
          { offset: 0.5, color: '#8B5CF6' },
          { offset: 1, color: '#3B82F6' }
        ]
      },
      border: {
        enabled: true,
        width: 12,
        color: '#FDF2F8',
        style: 'solid'
      },
      shadow: {
        enabled: true,
        blur: 30,
        color: 'rgba(236, 72, 153, 0.25)',
        offsetX: 0,
        offsetY: 8
      }
    }
  },
  {
    id: 'sunset-orange',
    name: 'Sunset Orange',
    category: 'Creative',
    style: {
      fgColor: '#F59E0B',
      bgColor: '#FFFFFF',
      dotStyle: 'rounded',
      cornerSquareStyle: 'extra-rounded',
      cornerDotStyle: 'dot',
      gradient: {
        type: 'linear',
        colorStops: [
          { offset: 0, color: '#F59E0B' },
          { offset: 1, color: '#EF4444' }
        ]
      },
      border: {
        enabled: true,
        width: 8,
        color: '#FFFBEB',
        style: 'solid'
      },
      shadow: {
        enabled: true,
        blur: 20,
        color: 'rgba(245, 158, 11, 0.18)',
        offsetX: 0,
        offsetY: 5
      }
    }
  }
];

interface QRTemplatesProps {
  onSelectTemplate: (template: QRTemplate) => void;
  selectedTemplateId?: string;
}

export const QRTemplates = ({ onSelectTemplate, selectedTemplateId }: QRTemplatesProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-primary" />
        <Label className="text-sm font-semibold">Professional Templates</Label>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {qrTemplates.map((template) => (
          <button
            key={template.id}
            onClick={() => onSelectTemplate(template)}
            className={`p-3 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${
              selectedTemplateId === template.id
                ? 'border-primary bg-primary/5 shadow-lg'
                : 'border-border hover:border-primary/50 bg-card'
            }`}
          >
            <div className="flex flex-col gap-2">
              <div 
                className="w-full aspect-square rounded-lg flex items-center justify-center"
                style={{
                  background: template.style.gradient 
                    ? `linear-gradient(135deg, ${template.style.gradient.colorStops[0].color}, ${template.style.gradient.colorStops[template.style.gradient.colorStops.length - 1].color})`
                    : template.style.fgColor,
                  boxShadow: template.style.shadow?.enabled 
                    ? `0 4px 12px ${template.style.shadow.color}`
                    : 'none'
                }}
              >
                <div className="w-8 h-8 bg-white rounded"></div>
              </div>
              <div className="text-left">
                <p className="text-xs font-medium">{template.name}</p>
                <p className="text-xs text-muted-foreground">{template.category}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
