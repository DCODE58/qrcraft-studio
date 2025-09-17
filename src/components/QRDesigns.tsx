import React from 'react';
import { motion } from 'framer-motion';

export interface QRDesign {
  id: string;
  name: string;
  preview: string;
  colors: {
    foreground: string;
    background: string;
  };
  dotStyle?: 'square' | 'dots' | 'rounded';
  cornerStyle?: 'square' | 'dot' | 'rounded';
}

export const qrDesigns: QRDesign[] = [
  {
    id: 'classic',
    name: 'Classic',
    preview: '⬛',
    colors: { foreground: '#000000', background: '#FFFFFF' },
    dotStyle: 'square',
    cornerStyle: 'square'
  },
  {
    id: 'modern-blue',
    name: 'Modern Blue',
    preview: '🔵',
    colors: { foreground: '#2563EB', background: '#F8FAFC' },
    dotStyle: 'rounded',
    cornerStyle: 'rounded'
  },
  {
    id: 'gradient-purple',
    name: 'Purple Gradient',
    preview: '🟣',
    colors: { foreground: '#7C3AED', background: '#FAF5FF' },
    dotStyle: 'dots',
    cornerStyle: 'rounded'
  },
  {
    id: 'emerald',
    name: 'Emerald',
    preview: '🟢',
    colors: { foreground: '#059669', background: '#F0FDF4' },
    dotStyle: 'rounded',
    cornerStyle: 'rounded'
  },
  {
    id: 'sunset',
    name: 'Sunset',
    preview: '🟠',
    colors: { foreground: '#EA580C', background: '#FFF7ED' },
    dotStyle: 'dots',
    cornerStyle: 'dot'
  },
  {
    id: 'rose',
    name: 'Rose',
    preview: '🌹',
    colors: { foreground: '#E11D48', background: '#FFF1F2' },
    dotStyle: 'rounded',
    cornerStyle: 'rounded'
  },
  {
    id: 'dark-mode',
    name: 'Dark Mode',
    preview: '⚫',
    colors: { foreground: '#F8FAFC', background: '#0F172A' },
    dotStyle: 'square',
    cornerStyle: 'square'
  },
  {
    id: 'neon',
    name: 'Neon',
    preview: '🟡',
    colors: { foreground: '#10B981', background: '#000000' },
    dotStyle: 'dots',
    cornerStyle: 'dot'
  }
];

interface QRDesignSelectorProps {
  selectedDesign: string;
  onDesignChange: (design: QRDesign) => void;
}

export const QRDesignSelector: React.FC<QRDesignSelectorProps> = ({ 
  selectedDesign, 
  onDesignChange 
}) => {
  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-foreground">QR Code Design</label>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {qrDesigns.map((design) => (
          <motion.button
            key={design.id}
            type="button"
            onClick={() => onDesignChange(design)}
            className={`relative p-4 rounded-xl border-2 transition-all duration-200 ${
              selectedDesign === design.id
                ? 'border-primary bg-primary/10 shadow-md'
                : 'border-border hover:border-primary/50 bg-card hover:shadow-sm'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex flex-col items-center gap-2">
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center text-lg shadow-sm"
                style={{
                  backgroundColor: design.colors.background,
                  color: design.colors.foreground,
                  border: `1px solid ${design.colors.foreground}20`
                }}
              >
                {design.preview}
              </div>
              <span className="text-xs font-medium text-foreground">{design.name}</span>
            </div>
            {selectedDesign === design.id && (
              <motion.div
                className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </motion.div>
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
};