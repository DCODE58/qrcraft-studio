import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Download, FileImage, FileCode, Mail, Share2, Code, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { toPng, toSvg } from 'html-to-image';
import jsPDF from 'jspdf';

interface ExportOptionsProps {
  qrRef: React.RefObject<HTMLDivElement>;
  qrValue: string;
  settings: any;
  onSettingsChange: (settings: any) => void;
}

export const ExportOptions = ({ qrRef, qrValue, settings, onSettingsChange }: ExportOptionsProps) => {
  
  const downloadQR = async (format: 'png' | 'svg' | 'pdf' | 'webp') => {
    if (!qrRef.current) {
      toast.error('QR code not ready');
      return;
    }

    try {
      const fileName = `qr-code-${Date.now()}`;

      if (format === 'png' || format === 'webp') {
        const dataUrl = await toPng(qrRef.current, {
          quality: 1.0,
          pixelRatio: settings.resolution || 2,
          backgroundColor: settings.transparentBackground ? 'transparent' : '#ffffff',
        });

        if (format === 'webp') {
          // Convert PNG to WebP
          const img = new Image();
          img.src = dataUrl;
          await new Promise((resolve) => { img.onload = resolve; });
          
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            canvas.toBlob((blob) => {
              if (blob) {
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.download = `${fileName}.webp`;
                link.href = url;
                link.click();
              }
            }, 'image/webp', 0.95);
          }
        } else {
          const link = document.createElement('a');
          link.download = `${fileName}.png`;
          link.href = dataUrl;
          link.click();
        }

        toast.success(`Downloaded as ${format.toUpperCase()}`);
      } else if (format === 'svg') {
        const svgData = await toSvg(qrRef.current, {
          backgroundColor: settings.transparentBackground ? 'transparent' : '#ffffff',
        });
        
        const link = document.createElement('a');
        link.download = `${fileName}.svg`;
        link.href = svgData;
        link.click();
        
        toast.success('Downloaded as SVG');
      } else if (format === 'pdf') {
        const dataUrl = await toPng(qrRef.current, {
          quality: 1.0,
          pixelRatio: 3,
        });

        const pdf = new jsPDF();
        const imgWidth = 150;
        const imgHeight = 150;
        const x = (pdf.internal.pageSize.getWidth() - imgWidth) / 2;
        const y = (pdf.internal.pageSize.getHeight() - imgHeight) / 2;
        
        pdf.addImage(dataUrl, 'PNG', x, y, imgWidth, imgHeight);
        pdf.save(`${fileName}.pdf`);
        
        toast.success('Downloaded as PDF');
      }
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download QR code');
    }
  };

  const generateEmbedCode = () => {
    const embedCode = `<iframe src="${window.location.origin}/embed/qr?data=${encodeURIComponent(qrValue)}" width="300" height="300" frameborder="0"></iframe>`;
    
    navigator.clipboard.writeText(embedCode);
    toast.success('Embed code copied to clipboard');
  };

  const generateApiCode = () => {
    const apiCode = `// JavaScript/TypeScript
const response = await fetch('${window.location.origin}/api/qr', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    data: '${qrValue}',
    size: ${settings.size || 300},
    fgColor: '${settings.fgColor || '#000000'}',
    bgColor: '${settings.bgColor || '#ffffff'}'
  })
});
const qrCodeUrl = await response.json();`;

    navigator.clipboard.writeText(apiCode);
    toast.success('API code copied to clipboard');
  };

  const shareQR = async () => {
    if (!qrRef.current) return;

    try {
      const dataUrl = await toPng(qrRef.current);
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], 'qr-code.png', { type: 'image/png' });

      if (navigator.share) {
        await navigator.share({
          title: 'QR Code',
          text: 'Check out this QR code',
          files: [file],
        });
        toast.success('Shared successfully');
      } else {
        toast.error('Sharing not supported on this browser');
      }
    } catch (error) {
      console.error('Share error:', error);
      toast.error('Failed to share');
    }
  };

  return (
    <div className="space-y-6">
      {/* Export Settings */}
      <Card className="p-4">
        <h3 className="font-semibold mb-4">Export Settings</h3>
        
        <div className="space-y-4">
          <div>
            <Label className="text-sm">Resolution</Label>
            <Select
              value={(settings.resolution || 2).toString()}
              onValueChange={(value) => 
                onSettingsChange({ ...settings, resolution: parseInt(value) })
              }
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Standard (1x)</SelectItem>
                <SelectItem value="2">High (2x)</SelectItem>
                <SelectItem value="3">Very High (3x)</SelectItem>
                <SelectItem value="4">Ultra (4x)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
              Higher resolution for print quality
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm">Transparent Background</Label>
              <p className="text-xs text-muted-foreground">For overlays and designs</p>
            </div>
            <Switch
              checked={settings.transparentBackground || false}
              onCheckedChange={(checked) => 
                onSettingsChange({ ...settings, transparentBackground: checked })
              }
            />
          </div>
        </div>
      </Card>

      {/* Download Formats */}
      <Card className="p-4">
        <h3 className="font-semibold mb-4">Download Formats</h3>
        
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            onClick={() => downloadQR('png')}
            className="w-full"
          >
            <FileImage className="w-4 h-4 mr-2" />
            PNG
          </Button>

          <Button
            variant="outline"
            onClick={() => downloadQR('svg')}
            className="w-full"
          >
            <FileCode className="w-4 h-4 mr-2" />
            SVG
          </Button>

          <Button
            variant="outline"
            onClick={() => downloadQR('pdf')}
            className="w-full"
          >
            <Download className="w-4 h-4 mr-2" />
            PDF
          </Button>

          <Button
            variant="outline"
            onClick={() => downloadQR('webp')}
            className="w-full"
          >
            <FileImage className="w-4 h-4 mr-2" />
            WebP
          </Button>
        </div>
      </Card>

      {/* Share Options */}
      <Card className="p-4">
        <h3 className="font-semibold mb-4">Share & Integration</h3>
        
        <div className="space-y-2">
          <Button
            variant="outline"
            onClick={shareQR}
            className="w-full"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share QR Code
          </Button>

          <Button
            variant="outline"
            onClick={generateEmbedCode}
            className="w-full"
          >
            <Code className="w-4 h-4 mr-2" />
            Copy Embed Code
          </Button>

          <Button
            variant="outline"
            onClick={generateApiCode}
            className="w-full"
          >
            <Copy className="w-4 h-4 mr-2" />
            Copy API Code
          </Button>
        </div>
      </Card>

      {/* Print Guide */}
      <Card className="p-4 bg-muted/50">
        <h4 className="font-medium mb-2 text-sm">Print Guidelines</h4>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>• Use Ultra (4x) resolution for professional printing</li>
          <li>• Minimum size: 2cm x 2cm for close-range scanning</li>
          <li>• Test scan before mass printing</li>
          <li>• Use SVG or PDF for scalable vector prints</li>
        </ul>
      </Card>
    </div>
  );
};