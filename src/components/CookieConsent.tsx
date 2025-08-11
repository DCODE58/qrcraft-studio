import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Cookie, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const CookieConsent = () => {
  const [showConsent, setShowConsent] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      setShowConsent(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    setShowConsent(false);
    toast({
      title: "Cookies Accepted",
      description: "Thank you! We'll use cookies to improve your experience.",
    });
  };

  const handleReject = () => {
    localStorage.setItem('cookieConsent', 'rejected');
    setShowConsent(false);
    toast({
      title: "Cookies Rejected",
      description: "No problem! We'll only use essential cookies.",
    });
  };

  if (!showConsent) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 animate-slide-in-bottom">
      <Card className="p-4 bg-background/95 backdrop-blur-sm border shadow-lg">
        <div className="flex items-start gap-3">
          <Cookie className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-foreground">
              We use cookies to enhance your experience. By continuing to visit this site you agree to our use of cookies.
            </p>
            <div className="flex gap-2 mt-3">
              <Button onClick={handleAccept} size="sm" className="h-8 px-3">
                Accept
              </Button>
              <Button onClick={handleReject} variant="outline" size="sm" className="h-8 px-3">
                Reject
              </Button>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReject}
            className="h-8 w-8 p-0 flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default CookieConsent;