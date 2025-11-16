import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Upload, Download, FileSpreadsheet, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface BulkGeneratorProps {
  style: any;
}

export const BulkGenerator = ({ style }: BulkGeneratorProps) => {
  const [csvData, setCsvData] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<any>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCsvData(event.target?.result as string);
        toast.success('File loaded successfully');
      };
      reader.readAsText(file);
    }
  };

  const parseCSV = (csv: string): any[] => {
    const lines = csv.trim().split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const qrCodes = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const qrData: any = { type: 'url' };

      headers.forEach((header, index) => {
        if (header === 'url' || header === 'link') qrData.url = values[index];
        else if (header === 'title' || header === 'name') qrData.title = values[index];
        else if (header === 'description') qrData.description = values[index];
        else if (header === 'type') qrData.type = values[index];
        else if (header === 'text' || header === 'content') qrData.text = values[index];
      });

      if (qrData.url || qrData.text) {
        qrCodes.push(qrData);
      }
    }

    return qrCodes;
  };

  const handleGenerate = async () => {
    if (!csvData) {
      toast.error('Please upload a CSV file or paste data');
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    try {
      const qrCodes = parseCSV(csvData);
      
      if (qrCodes.length === 0) {
        toast.error('No valid QR codes found in CSV');
        return;
      }

      toast.info(`Processing ${qrCodes.length} QR codes...`);

      const { data, error } = await supabase.functions.invoke('bulkGenerate', {
        body: {
          qrCodes,
          settings: {
            colorScheme: { primary: style.fgColor, background: style.bgColor },
            styleOptions: {
              dotStyle: style.dotStyle,
              cornerStyle: style.cornerStyle,
            },
            isDynamic: false,
          },
        },
      });

      if (error) throw error;

      setResults(data);
      setProgress(100);
      
      if (data.successful.length > 0) {
        toast.success(`Successfully generated ${data.successful.length} QR codes`);
      }
      
      if (data.failed.length > 0) {
        toast.error(`Failed to generate ${data.failed.length} QR codes`);
      }

    } catch (error) {
      console.error('Bulk generation error:', error);
      toast.error('Failed to generate QR codes');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadResults = () => {
    if (!results) return;

    const csv = [
      ['Title', 'QR ID', 'Status', 'Short Code'].join(','),
      ...results.successful.map((r: any) => 
        [r.title, r.id, 'Success', r.shortCode || 'N/A'].join(',')
      ),
      ...results.failed.map((r: any) => 
        [r.data.title, 'N/A', 'Failed', r.error].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bulk-qr-results-${Date.now()}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Bulk QR Code Generation</h3>
        
        <div className="space-y-4">
          {/* File Upload */}
          <div>
            <Label>Upload CSV File</Label>
            <div className="mt-2">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
                id="csv-upload"
              />
              <Button
                variant="outline"
                className="w-full"
                onClick={() => document.getElementById('csv-upload')?.click()}
              >
                <Upload className="w-4 h-4 mr-2" />
                Choose CSV File
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              CSV format: url,title,description (first row is header)
            </p>
          </div>

          {/* Or Paste Data */}
          <div>
            <Label>Or Paste CSV Data</Label>
            <Textarea
              placeholder="url,title,description&#10;https://example.com,Example,Description&#10;https://example2.com,Example 2,Description 2"
              value={csvData}
              onChange={(e) => setCsvData(e.target.value)}
              rows={8}
              className="font-mono text-xs mt-2"
            />
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={isProcessing || !csvData}
            className="w-full"
            size="lg"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Generate QR Codes
              </>
            )}
          </Button>

          {/* Progress */}
          {isProcessing && (
            <div>
              <Progress value={progress} className="w-full" />
              <p className="text-xs text-center text-muted-foreground mt-2">
                Generating QR codes...
              </p>
            </div>
          )}

          {/* Results */}
          {results && (
            <Card className="p-4 bg-muted/50">
              <h4 className="font-medium mb-3">Results</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>{results.successful.length} successful</span>
                </div>
                {results.failed.length > 0 && (
                  <div className="flex items-center gap-2 text-sm">
                    <XCircle className="w-4 h-4 text-red-500" />
                    <span>{results.failed.length} failed</span>
                  </div>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadResults}
                className="w-full mt-4"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Results CSV
              </Button>
            </Card>
          )}
        </div>
      </Card>

      {/* Template CSV */}
      <Card className="p-4 bg-muted/50">
        <h4 className="font-medium mb-2">CSV Template</h4>
        <pre className="text-xs bg-background p-3 rounded overflow-x-auto">
{`url,title,description
https://example.com,My Website,Check out my website
https://shop.example.com,My Shop,Visit our online store
https://contact.example.com,Contact Us,Get in touch`}
        </pre>
      </Card>
    </div>
  );
};