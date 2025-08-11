import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download, Smartphone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const PwaInstallButton = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsVisible(true);
    };

    const handleAppInstalled = () => {
      setIsVisible(false);
      setDeferredPrompt(null);
      toast({
        title: "App Installed! 🎉",
        description: "Qr Studio has been installed on your device.",
        className: "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200",
      });
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Always show install button
    setIsVisible(true);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [toast]);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      // Show fallback instructions for manual installation
      toast({
        title: "📱 Install Qr Studio",
        description: "On mobile: Tap the share button and 'Add to Home Screen'. On desktop: Look for the install button in your address bar.",
        className: "border-blue-200 bg-blue-50 text-blue-900",
        duration: 6000,
      });
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      toast({
        title: "🎉 Installing...",
        description: "Qr Studio is being installed on your device.",
        className: "border-green-200 bg-green-50 text-green-900",
      });
    }
    
    setDeferredPrompt(null);
    setIsVisible(false);
  };

  // Always show the install button
  if (!isVisible) return null;

  return (
    <Button 
      onClick={handleInstall}
      variant="outline" 
      className="text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 h-auto btn-ghost w-full sm:w-auto max-w-xs group"
    >
      <Download className="w-4 h-4 sm:w-5 sm:h-5 mr-2 group-hover:scale-110 transition-transform duration-200" />
      Install App
    </Button>
  );
};

export default PwaInstallButton;