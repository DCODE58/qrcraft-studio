import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, Eye, EyeOff, Lock, Unlock, 
  AlertCircle, CheckCircle, ExternalLink, Loader2 
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function SecureQR() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [contentUrl, setContentUrl] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    if (!id) {
      setError("Invalid QR code");
      return;
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setError("Please enter a password");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const { data, error: functionError } = await supabase.functions.invoke('verifyPassword', {
        body: { id, password: password.trim() }
      });

      if (functionError) {
        throw new Error(functionError.message || 'Verification failed');
      }

      if (!data.success) {
        throw new Error(data.error || 'Invalid password');
      }

      setContentUrl(data.url);
      setIsUnlocked(true);
      
      toast({
        title: "🔓 Access Granted!",
        description: "Password verified successfully.",
        className: "bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200",
      });

    } catch (err: any) {
      console.error('Verification error:', err);
      setAttempts(prev => prev + 1);
      
      if (err.message.includes('expired')) {
        setError("This QR code has expired");
      } else if (err.message.includes('not found')) {
        setError("Invalid QR code");
      } else {
        setError(attempts >= 2 ? "Too many failed attempts. Please check your password." : "Incorrect password");
      }

      toast({
        title: "Access Denied",
        description: err.message || "Invalid password",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenContent = () => {
    if (contentUrl) {
      // Check if it's a URL or just text content
      try {
        new URL(contentUrl);
        // It's a valid URL, open in new tab
        window.open(contentUrl, '_blank', 'noopener,noreferrer');
      } catch {
        // It's text content, copy to clipboard
        navigator.clipboard.writeText(contentUrl).then(() => {
          toast({
            title: "📋 Copied!",
            description: "Content copied to clipboard.",
            className: "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200",
          });
        }).catch(() => {
          // Fallback: show content in alert
          alert(contentUrl);
        });
      }
    }
  };

  if (error && (error.includes("Invalid QR code") || error.includes("expired"))) {
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
              <h2 className="text-2xl font-semibold text-foreground">Access Denied</h2>
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
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <AnimatePresence mode="wait">
          {!isUnlocked ? (
            <motion.div
              key="locked"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <Card className="card-elevated space-y-6">
                <div className="text-center space-y-4">
                  <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                    <Lock className="w-10 h-10 text-primary" />
                  </div>
                  
                  <div className="space-y-2">
                    <h2 className="text-2xl font-semibold">Protected Content</h2>
                    <p className="text-muted-foreground">
                      This QR code is password-protected. Enter the password to access the content.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter password"
                        className="pr-10"
                        disabled={isLoading}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLoading}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-2 text-destructive text-sm"
                    >
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      {error}
                    </motion.div>
                  )}

                  <Button 
                    type="submit" 
                    className="w-full btn-primary"
                    disabled={isLoading || !password.trim()}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        <Unlock className="w-4 h-4 mr-2" />
                        Unlock Content
                      </>
                    )}
                  </Button>
                </form>

                <div className="text-center">
                  <Button 
                    onClick={() => navigate('/')} 
                    variant="ghost"
                    size="sm"
                  >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Back to Home
                  </Button>
                </div>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              key="unlocked"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Card className="card-elevated text-center space-y-6">
                <div className="w-20 h-20 mx-auto bg-success/10 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-10 h-10 text-success" />
                </div>
                
                <div className="space-y-2">
                  <h2 className="text-2xl font-semibold text-success">Access Granted!</h2>
                  <p className="text-muted-foreground">
                    Password verified successfully. Click below to access your content.
                  </p>
                </div>

                <Button 
                  onClick={handleOpenContent}
                  className="btn-premium w-full"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open Content
                </Button>

                <div className="text-center">
                  <Button 
                    onClick={() => navigate('/')} 
                    variant="ghost"
                    size="sm"
                  >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Create Another QR Code
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}