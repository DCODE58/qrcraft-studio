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
      description: "Thank you! We'll use cookies to enhance your experience.",
    });
  };

  const handleReject = () => {
    localStorage.setItem('cookieConsent', 'rejected');
    setShowConsent(false);
    toast({
      title: "Cookies Rejected",
      description: "We respect your choice. Basic functionality will continue to work.",
    });
  };

  if (!showConsent) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 animate-slide-up">
      <Card className="p-4 shadow-lg max-w-md mx-auto">
        <div className="flex items-start gap-3">
          <Cookie className="w-5 h-5 text-primary mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-sm mb-1">Cookie Consent</h3>
            <p className="text-xs text-muted-foreground mb-3">
              We use cookies to enhance your experience and analyze usage. Accept to continue with full functionality.
            </p>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleAccept} className="text-xs">
                Accept
              </Button>
              <Button size="sm" variant="outline" onClick={handleReject} className="text-xs">
                Reject
              </Button>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowConsent(false)}
            className="h-6 w-6 p-0"
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default CookieConsent;