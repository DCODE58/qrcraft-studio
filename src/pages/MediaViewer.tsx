import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, AlertCircle, Download, 
  Loader2, Clock, FileImage, Video 
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function MediaViewer() {
  const { bucket, path } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [mediaUrl, setMediaUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [expiresIn, setExpiresIn] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    if (!bucket || !path) {
      setError("Invalid media link");
      setIsLoading(false);
      return;
    }

    fetchSignedUrl();
  }, [bucket, path]);

  // Countdown timer
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && mediaUrl) {
      // Link expired
      setError("This link has expired");
      setMediaUrl("");
    }
  }, [timeLeft, mediaUrl]);

  const fetchSignedUrl = async () => {
    try {
      const decodedPath = decodeURIComponent(path!);
      
      const { data, error: functionError } = await supabase.functions.invoke('getSignedUrl', {
        body: { bucket, path: decodedPath }
      });

      if (functionError) {
        throw new Error(functionError.message || 'Failed to load media');
      }

      if (!data.success) {
        throw new Error(data.error || 'Media not found or expired');
      }

      setMediaUrl(data.url);
      setExpiresIn(data.expiresIn);
      setTimeLeft(data.expiresIn);
      
    } catch (err: any) {
      console.error('Media loading error:', err);
      setError(err.message || 'Failed to load media');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimeLeft = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const downloadMedia = () => {
    if (mediaUrl) {
      const link = document.createElement('a');
      link.href = mediaUrl;
      link.download = path?.split('/').pop() || 'download';
      link.click();
    }
  };

  const isImage = bucket === 'images' || path?.match(/\.(jpg|jpeg|png|gif|webp)$/i);
  const isVideo = bucket === 'videos' || path?.match(/\.(mp4|webm|mov|avi)$/i);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-4"
        >
          <Loader2 className="w-12 h-12 mx-auto animate-spin text-primary" />
          <p className="text-muted-foreground">Loading media...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <Card className="card-elevated text-center space-y-6">
            <div className="w-20 h-20 mx-auto bg-destructive/10 rounded-full flex items-center justify-center">
              <AlertCircle className="w-10 h-10 text-destructive" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold">Media Unavailable</h2>
              <p className="text-muted-foreground">{error}</p>
            </div>

            <Button 
              onClick={() => navigate('/')} 
              variant="outline"
              className="w-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Return to Homepage
            </Button>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle p-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <Button
            onClick={() => navigate('/')}
            variant="ghost"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>

          {timeLeft > 0 && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-card px-3 py-1 rounded-full border">
              <Clock className="w-4 h-4" />
              Expires in {formatTimeLeft(timeLeft)}
            </div>
          )}
        </motion.div>

        {/* Media Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-6"
        >
          <Card className="card-elevated overflow-hidden">
            {isImage && (
              <div className="relative">
                <img
                  src={mediaUrl}
                  alt="Shared content"
                  className="w-full h-auto max-h-[80vh] object-contain"
                  onError={() => setError("Failed to load image")}
                />
              </div>
            )}

            {isVideo && (
              <div className="relative">
                <video
                  src={mediaUrl}
                  controls
                  className="w-full h-auto max-h-[80vh]"
                  onError={() => setError("Failed to load video")}
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            )}

            {!isImage && !isVideo && (
              <div className="p-8 text-center space-y-4">
                <div className="w-20 h-20 mx-auto bg-muted rounded-full flex items-center justify-center">
                  <FileImage className="w-10 h-10 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">
                  Media type not supported for preview
                </p>
              </div>
            )}
          </Card>

          {/* Actions */}
          <div className="flex justify-center space-x-4">
            <Button
              onClick={downloadMedia}
              className="btn-primary"
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
            
            {mediaUrl && (
              <Button
                onClick={() => window.open(mediaUrl, '_blank')}
                variant="outline"
              >
                Open in New Tab
              </Button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}