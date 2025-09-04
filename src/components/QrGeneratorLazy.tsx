import { Suspense, lazy } from 'react';
import { Loader2 } from 'lucide-react';

// Lazy load the heavy QrGenerator component
const QrGenerator = lazy(() => import('./QrGenerator'));

interface QrGeneratorLazyProps {
  onBack?: () => void;
}

const QrGeneratorLazy = ({ onBack }: QrGeneratorLazyProps) => {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-subtle">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            Loading QR Generator
          </h3>
          <p className="text-sm text-muted-foreground">
            Preparing your QR code toolkit...
          </p>
        </div>
      </div>
    }>
      <QrGenerator onBack={onBack} />
    </Suspense>
  );
};

export default QrGeneratorLazy;