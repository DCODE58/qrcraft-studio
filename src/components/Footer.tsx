import { QrCode, Heart, Github, Twitter, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border/40 bg-surface-container/30">
      <div className="container mx-auto px-4 sm:px-6 py-12">
        {/* Main footer content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand section */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <QrCode className="w-8 h-8 text-primary" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full" />
              </div>
              <div>
                <h3 className="text-xl font-bold bg-gradient-hero bg-clip-text text-transparent">
                  QrCraft
                </h3>
                <p className="text-sm text-muted-foreground">
                  Professional QR Generator
                </p>
              </div>
            </div>
            <p className="text-muted-foreground max-w-md leading-relaxed">
              Create beautiful, customizable QR codes in seconds. From simple URLs to complex business cards, 
              QrCraft handles it all with premium design and powerful functionality.
            </p>
            <div className="flex space-x-2">
              <Button variant="ghost" size="sm" className="btn-ghost w-9 h-9 p-0">
                <Github className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="btn-ghost w-9 h-9 p-0">
                <Twitter className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="btn-ghost w-9 h-9 p-0">
                <Mail className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Product links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Product</h4>
            <nav className="flex flex-col space-y-2">
              <a href="#features" className="nav-link">Features</a>
              <a href="#pricing" className="nav-link">Pricing</a>
              <a href="#templates" className="nav-link">Templates</a>
              <a href="#api" className="nav-link">API</a>
            </nav>
          </div>

          {/* Support links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Support</h4>
            <nav className="flex flex-col space-y-2">
              <a href="#help" className="nav-link">Help Center</a>
              <a href="#contact" className="nav-link">Contact</a>
              <a href="#privacy" className="nav-link">Privacy</a>
              <a href="#terms" className="nav-link">Terms</a>
            </nav>
          </div>
        </div>

        {/* Bottom section */}
        <div className="mt-12 pt-8 border-t border-border/40">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <span>© {currentYear} QrCraft. Made with</span>
              <Heart className="w-4 h-4 text-accent fill-current" />
              <span>for beautiful QR codes.</span>
            </div>
            <div className="flex items-center space-x-6 text-sm">
              <a href="#status" className="nav-link">Status</a>
              <a href="#changelog" className="nav-link">Changelog</a>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                <span className="text-muted-foreground">All systems operational</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;