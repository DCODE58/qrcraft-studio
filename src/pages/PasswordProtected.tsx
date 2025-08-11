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
        setError('Invalid protected QR code data');
      }
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
          title: "Access Granted!",
          description: "QR code content unlocked successfully.",
        });
        
        // Display the protected content
        window.location.href = protectedData.content;
      } else {
        setError('Incorrect password. Please try again.');
        toast({
          title: "Access Denied",
          description: "The password you entered is incorrect.",
          variant: "destructive",
        });
      }
      setIsLoading(false);
    }, 1000);
  };

  if (!protectedData) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 text-center">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h1 className="text-xl font-semibold mb-2">Invalid QR Code</h1>
          <p className="text-muted-foreground">
            This protected QR code data appears to be invalid or corrupted.
          </p>
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