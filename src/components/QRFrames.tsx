import React from 'react';
import { motion } from 'framer-motion';

interface QRFrameProps {
  children: React.ReactNode;
  frameType: string;
  customText?: string;
  size: number;
}

export const QRFrame: React.FC<QRFrameProps> = ({ children, frameType, customText = "Scan Me", size }) => {
  const frameSize = size + 120; // Add padding for frame

  const renderFrame = () => {
    switch (frameType) {
      case 'modern':
        return (
          <div 
            className="relative bg-gradient-to-br from-background to-surface-elevated border-2 border-border/30 rounded-3xl shadow-xl overflow-hidden"
            style={{ width: frameSize, height: frameSize }}
          >
            {/* Gradient border effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-3xl"></div>
            <div className="absolute inset-1 bg-background rounded-3xl flex flex-col items-center justify-center p-8">
              <div className="mb-4 text-center">
                <div className="text-lg font-bold text-foreground mb-1">{customText}</div>
                <div className="w-12 h-0.5 bg-primary rounded-full mx-auto"></div>
              </div>
              <div className="rounded-2xl overflow-hidden shadow-lg">
                {children}
              </div>
              <div className="mt-4 text-xs text-muted-foreground text-center">
                Point your camera here
              </div>
            </div>
          </div>
        );

      case 'minimal':
        return (
          <div 
            className="relative bg-background border border-border rounded-2xl shadow-md overflow-hidden"
            style={{ width: frameSize, height: frameSize }}
          >
            <div className="flex flex-col items-center justify-center p-8 h-full">
              <div className="rounded-xl overflow-hidden">
                {children}
              </div>
              <div className="mt-4 text-sm font-medium text-foreground">{customText}</div>
            </div>
          </div>
        );

      case 'bold':
        return (
          <div 
            className="relative bg-gradient-to-br from-primary to-primary-hover rounded-3xl shadow-2xl overflow-hidden"
            style={{ width: frameSize, height: frameSize }}
          >
            <div className="absolute inset-4 bg-background rounded-2xl flex flex-col items-center justify-center p-6">
              <div className="mb-6 text-center">
                <div className="text-xl font-bold text-primary mb-2">{customText}</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider">QR Code</div>
              </div>
              <div className="rounded-xl overflow-hidden shadow-lg border-2 border-primary/20">
                {children}
              </div>
              <div className="mt-6 flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <div className="text-xs text-muted-foreground">Powered by QR Studio</div>
                <div className="w-2 h-2 bg-primary rounded-full"></div>
              </div>
            </div>
          </div>
        );

      case 'elegant':
        return (
          <div 
            className="relative bg-gradient-to-br from-background via-surface-elevated to-background border border-border/50 rounded-[2rem] shadow-xl overflow-hidden"
            style={{ width: frameSize, height: frameSize }}
          >
            {/* Decorative corners */}
            <div className="absolute top-4 left-4 w-6 h-6 border-l-2 border-t-2 border-primary/30 rounded-tl-lg"></div>
            <div className="absolute top-4 right-4 w-6 h-6 border-r-2 border-t-2 border-primary/30 rounded-tr-lg"></div>
            <div className="absolute bottom-4 left-4 w-6 h-6 border-l-2 border-b-2 border-primary/30 rounded-bl-lg"></div>
            <div className="absolute bottom-4 right-4 w-6 h-6 border-r-2 border-b-2 border-primary/30 rounded-br-lg"></div>
            
            <div className="flex flex-col items-center justify-center p-8 h-full">
              <div className="mb-6 text-center">
                <div className="text-lg font-semibold text-foreground mb-2">{customText}</div>
                <div className="w-16 h-px bg-gradient-to-r from-transparent via-primary to-transparent"></div>
              </div>
              <div className="rounded-2xl overflow-hidden shadow-lg">
                {children}
              </div>
              <div className="mt-6 text-xs text-muted-foreground italic">
                Scan with your camera
              </div>
            </div>
          </div>
        );

      case 'tech':
        return (
          <div 
            className="relative bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden"
            style={{ width: frameSize, height: frameSize }}
          >
            {/* Tech grid pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="grid grid-cols-8 grid-rows-8 h-full">
                {Array.from({ length: 64 }).map((_, i) => (
                  <div key={i} className="border border-slate-600"></div>
                ))}
              </div>
            </div>
            
            <div className="relative flex flex-col items-center justify-center p-8 h-full">
              <div className="mb-6 text-center">
                <div className="text-lg font-mono font-bold text-emerald-400 mb-2">
                  {'>'} {customText.toUpperCase()}
                </div>
                <div className="text-xs text-slate-400 font-mono">SCAN_TO_CONTINUE</div>
              </div>
              <div className="rounded-lg overflow-hidden shadow-2xl border border-emerald-500/30">
                {children}
              </div>
              <div className="mt-6 text-xs text-slate-400 font-mono">
                [QR_CODE_ACTIVE]
              </div>
            </div>
          </div>
        );

      case 'none':
      default:
        return <div>{children}</div>;
    }
  };

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="flex items-center justify-center"
    >
      {renderFrame()}
    </motion.div>
  );
};

export const frameOptions = [
  { id: 'none', name: 'No Frame', preview: '⬜' },
  { id: 'modern', name: 'Modern', preview: '🎨' },
  { id: 'minimal', name: 'Minimal', preview: '⭕' },
  { id: 'bold', name: 'Bold', preview: '🔥' },
  { id: 'elegant', name: 'Elegant', preview: '✨' },
  { id: 'tech', name: 'Tech', preview: '🤖' },
];