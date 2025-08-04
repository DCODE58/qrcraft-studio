import { Button } from "@/components/ui/button";
import { QrCode, Sparkles, Download, Palette, Smartphone, Zap } from "lucide-react";
import QrGenerator from "@/components/QrGenerator";
import { useState } from "react";
import heroImage from "@/assets/hero-image.jpg";

const Index = () => {
  const [showGenerator, setShowGenerator] = useState(false);

  if (showGenerator) {
    return <QrGenerator />;
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="container mx-auto px-6 py-20">
          <div className="text-center space-y-8 animate-fade-in">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <QrCode className="w-16 h-16 text-primary animate-pulse" />
                <Sparkles className="w-6 h-6 text-accent absolute -top-2 -right-2 animate-bounce" />
              </div>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                QrCraft
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Create beautiful, customizable QR codes in seconds. 
              <span className="text-primary font-medium"> Premium design</span> meets 
              <span className="text-accent font-medium"> powerful functionality</span>.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Button 
                onClick={() => setShowGenerator(true)}
                className="btn-premium text-lg px-8 py-4 h-auto"
              >
                <QrCode className="w-5 h-5 mr-2" />
                Generate QR Code
              </Button>
              <Button variant="outline" className="text-lg px-8 py-4 h-auto">
                <Download className="w-5 h-5 mr-2" />
                View Examples
              </Button>
            </div>
          </div>
          
          {/* Hero Image */}
          <div className="mt-16 relative animate-slide-up">
            <div className="relative mx-auto max-w-4xl">
              <div className="absolute inset-0 bg-gradient-primary rounded-3xl blur-3xl opacity-20"></div>
              <img 
                src={heroImage}
                alt="QR Code Generator Preview"
                className="relative z-10 w-full rounded-3xl shadow-large"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-card/30">
        <div className="container mx-auto px-6">
          <div className="text-center space-y-4 mb-16 animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-bold">
              Everything you need to create 
              <span className="text-primary"> perfect QR codes</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              From simple URLs to complex business cards, QrCraft handles it all with style.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Smartphone,
                title: "Mobile-First Design",
                description: "Optimized for touch devices with responsive layouts that work everywhere."
              },
              {
                icon: Palette,
                title: "Custom Styling",
                description: "Choose colors, sizes, and error correction levels to match your brand."
              },
              {
                icon: Zap,
                title: "Instant Generation",
                description: "Real-time preview and lightning-fast QR code generation."
              },
              {
                icon: Download,
                title: "Multiple Formats",
                description: "Export as PNG or SVG with high quality for any use case."
              },
              {
                icon: QrCode,
                title: "8+ Content Types",
                description: "URLs, text, WiFi, contacts, events, and more supported out of the box."
              },
              {
                icon: Sparkles,
                title: "Premium Quality",
                description: "Beautiful animations and premium UI for the best user experience."
              }
            ].map((feature, index) => (
              <div 
                key={index}
                className="card-premium text-center space-y-4 animate-scale-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-12 h-12 mx-auto bg-primary/10 rounded-xl flex items-center justify-center">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-primary text-primary-foreground">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-bold">
              Ready to create your first QR code?
            </h2>
            <p className="text-xl opacity-90">
              Join thousands of users who trust QrCraft for their QR code needs.
            </p>
            <Button 
              onClick={() => setShowGenerator(true)}
              variant="secondary"
              className="text-lg px-8 py-4 h-auto"
            >
              <QrCode className="w-5 h-5 mr-2" />
              Get Started Free
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-card border-t">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2">
              <QrCode className="w-6 h-6 text-primary" />
              <span className="text-lg font-semibold">QrCraft</span>
            </div>
            <p className="text-muted-foreground text-sm mt-4 md:mt-0">
              © 2025 QrCraft. Crafted with ❤️ for beautiful QR codes.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;