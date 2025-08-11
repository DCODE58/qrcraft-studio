import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X, Download, Smartphone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const PwaInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Check if user has dismissed the prompt before and if enough time has passed
      const dismissed = localStorage.getItem('pwa-install-dismissed');
      const dismissTime = localStorage.getItem('pwa-dismiss-time');
      const now = Date.now();
      const daysPassed = dismissTime ? (now - parseInt(dismissTime)) / (1000 * 60 * 60 * 24) : Infinity;
      
      if (!dismissed || daysPassed > 7) {
        // Show prompt after a short delay to not interrupt initial page load
        setTimeout(() => {
          setShowPrompt(true);
        }, 3000);
      }
    };

    const handleAppInstalled = () => {
      setShowPrompt(false);
      setDeferredPrompt(null);
      toast({
        title: "App Installed! 🎉",
        description: "Qr Studio has been installed on your device.",
        className: "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200",
      });
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [toast]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      toast({
        title: "Installing...",
        description: "Qr Studio is being installed on your device.",
        className: "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200",
      });
    }
    
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', 'true');
    localStorage.setItem('pwa-dismiss-time', Date.now().toString());
    
    // Show prompt again after 7 days
    setTimeout(() => {
      localStorage.removeItem('pwa-install-dismissed');
    }, 7 * 24 * 60 * 60 * 1000);
  };

  if (!showPrompt || !deferredPrompt) return null;

  return (
    <div className="fixed bottom-2 sm:bottom-4 left-2 sm:left-4 right-2 sm:right-4 z-50 animate-slide-up">
      <Card className="p-3 sm:p-4 bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20 shadow-lg backdrop-blur-sm">
        <div className="flex items-start gap-2 sm:gap-3">
          <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 rounded-full flex items-center justify-center">
            <Smartphone className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          </div>
          
          <div className="flex-1 space-y-2">
            <h4 className="font-semibold text-xs sm:text-sm">Install Qr Studio</h4>
            <p className="text-xs text-muted-foreground hidden sm:block">
              Get quick access to QR generation with our mobile app experience.
            </p>
            <p className="text-xs text-muted-foreground sm:hidden">
              Quick access to QR generation on your device.
            </p>
            
            <div className="flex gap-2">
              <Button 
                size="sm" 
                onClick={handleInstall}
                className="bg-primary hover:bg-primary/90 text-white text-xs px-2 sm:px-3 py-1 h-auto"
              >
                <Download className="w-3 h-3 mr-1" />
                Install
              </Button>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={handleDismiss}
                className="text-xs px-2 sm:px-3 py-1 h-auto"
              >
                Not now
              </Button>
            </div>
          </div>
          
          <Button
            size="sm"
            variant="ghost"
            onClick={handleDismiss}
            className="flex-shrink-0 p-1 h-auto w-auto"
          >
            <X className="w-3 h-3 sm:w-4 sm:h-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default PwaInstallPrompt;