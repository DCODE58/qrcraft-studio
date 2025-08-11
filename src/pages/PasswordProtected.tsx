import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const PasswordProtected = () => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [protectedData, setProtectedData] = useState<any>(null);
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    // Parse the protected data from URL hash
    const hash = location.hash;
    if (hash.startsWith('#protected=')) {
      try {
        const encodedData = hash.replace('#protected=', '');
        const decodedData = JSON.parse(atob(encodedData));
        setProtectedData(decodedData);
      } catch (error) {
        console.error('Error parsing protected data:', error);
        setError('Invalid protected QR code data');
      }
    } else {
      // If no hash is provided, it's not a protected QR code
      setError('This page is for password-protected QR codes only');
    }
  }, [location]);

  const handleUnlock = () => {
    if (!protectedData) return;
    
    setIsLoading(true);
    setError('');

    // Simulate password checking delay
    setTimeout(() => {
      if (password === protectedData.password) {
        toast({
          title: "🎉 Access Granted!",
          description: "QR code content unlocked successfully.",
          className: "border-green-200 bg-green-50 text-green-900",
        });
        
        // Display the protected content based on type
        if (protectedData.type === 'url' && protectedData.content.startsWith('http')) {
          window.open(protectedData.content, '_blank');
        } else {
          // For other content types, display in a new window or copy to clipboard
          if (navigator.clipboard) {
            navigator.clipboard.writeText(protectedData.content).then(() => {
              toast({
                title: "📋 Content Copied!",
                description: "The protected content has been copied to your clipboard.",
                className: "border-blue-200 bg-blue-50 text-blue-900",
              });
            }).catch(() => {
              // Fallback for clipboard API
              displayContentInModal(protectedData.content);
            });
          } else {
            displayContentInModal(protectedData.content);
          }
        }
      } else {
        setError('Incorrect password. Please try again.');
        toast({
          title: "🚫 Access Denied",
          description: "The password you entered is incorrect.",
          variant: "destructive",
          className: "border-red-200 bg-red-50 text-red-900",
        });
      }
      setIsLoading(false);
    }, 1000);
  };

  const displayContentInModal = (content: string) => {
    // Create a simple modal to display content
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
      background: rgba(0,0,0,0.8); display: flex; align-items: center; 
      justify-content: center; z-index: 9999;
    `;
    
    const contentDiv = document.createElement('div');
    contentDiv.style.cssText = `
      background: white; padding: 2rem; border-radius: 0.5rem; 
      max-width: 90%; max-height: 90%; overflow: auto; margin: 1rem;
    `;
    
    contentDiv.innerHTML = `
      <h3 style="margin-bottom: 1rem; font-weight: bold;">Protected Content:</h3>
      <p style="word-break: break-all; margin-bottom: 1rem;">${content}</p>
      <button onclick="this.closest('[style*=fixed]').remove()" 
              style="background: #2563EB; color: white; padding: 0.5rem 1rem; 
                     border: none; border-radius: 0.25rem; cursor: pointer;">
        Close
      </button>
    `;
    
    modal.appendChild(contentDiv);
    document.body.appendChild(modal);
    
    // Close on outside click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });
  };

  if (!protectedData && !error) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <h1 className="text-xl font-semibold mb-2">Loading...</h1>
          <p className="text-muted-foreground">
            Processing protected QR code data...
          </p>
        </Card>
      </div>
    );
  }

  if (!protectedData || error) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 text-center">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h1 className="text-xl font-semibold mb-2">Invalid QR Code</h1>
          <p className="text-muted-foreground mb-4">
            {error || "This protected QR code data appears to be invalid or corrupted."}
          </p>
          <Button 
            onClick={() => window.location.href = '/'}
            variant="outline"
            className="w-full"
          >
            Go to QR Studio
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Protected Content</h1>
          <p className="text-muted-foreground">
            This QR code is password protected. Enter the password to access the content.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="password" className="text-sm font-medium">Password</Label>
            <div className="relative mt-2">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                className={`pr-10 ${error ? 'border-destructive' : ''}`}
                onKeyPress={(e) => e.key === 'Enter' && handleUnlock()}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <Eye className="w-4 h-4 text-muted-foreground" />
                )}
              </Button>
            </div>
            {error && (
              <p className="text-sm text-destructive mt-1">{error}</p>
            )}
          </div>

          <Button 
            onClick={handleUnlock} 
            className="w-full"
            disabled={!password || isLoading}
          >
            {isLoading ? (
              <>
                <Lock className="w-4 h-4 mr-2 animate-pulse" />
                Unlocking...
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 mr-2" />
                Unlock Content
              </>
            )}
          </Button>
        </div>

        <div className="mt-6 pt-6 border-t text-center">
          <p className="text-xs text-muted-foreground">
            Protected by <span className="font-semibold text-primary">Qr Studio</span>
          </p>
        </div>
      </Card>
    </div>
  );
};

export default PasswordProtected;