import { Button } from "@/components/ui/button";
import { QrCode, Sparkles, Download, Palette, Smartphone, Zap, Star, Globe, Shield, Users } from "lucide-react";
import QrGenerator from "@/components/QrGenerator";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CookieConsent from "@/components/CookieConsent";
import { useState } from "react";
import heroImage from "@/assets/hero-image.jpg";

const Index = () => {
  const [showGenerator, setShowGenerator] = useState(false);

  if (showGenerator) {
    return <QrGenerator onBack={() => setShowGenerator(false)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8">
        <div className="container mx-auto px-4 sm:px-6 py-12 lg:py-20">
          <div className="text-center space-y-8 animate-fade-in">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <QrCode className="w-16 h-16 text-primary animate-pulse" />
                <Sparkles className="w-6 h-6 text-accent absolute -top-2 -right-2 animate-bounce" />
              </div>
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
              <span className="bg-gradient-hero bg-clip-text text-transparent">
                Qr Studio
              </span>
            </h1>
            
            <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              The professional QR code generator trusted by 
              <span className="text-primary font-semibold"> thousands of businesses</span>. 
              Create beautiful, customizable QR codes with 
              <span className="text-accent font-semibold"> premium design</span> and 
              <span className="text-primary font-semibold"> powerful features</span>.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
              <Button 
                onClick={() => setShowGenerator(true)}
                className="btn-premium text-lg px-8 py-4 h-auto group"
              >
                <QrCode className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform duration-200" />
                Generate QR Code
              </Button>
              <Button variant="outline" className="text-lg px-8 py-4 h-auto btn-ghost">
                <Download className="w-5 h-5 mr-2" />
                View Examples
              </Button>
            </div>

            {/* Social Proof */}
            <div className="flex items-center justify-center gap-6 pt-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full border-2 border-white"></div>
                  <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-green-600 rounded-full border-2 border-white"></div>
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full border-2 border-white"></div>
                </div>
                <span>Used by 10,000+ users</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="ml-1">4.9 rating</span>
              </div>
            </div>
          </div>
          
          {/* Hero Image */}
          <div className="mt-16 relative animate-slide-up">
            <div className="relative mx-auto max-w-5xl">
              <div className="absolute inset-0 bg-gradient-hero rounded-3xl blur-3xl opacity-20"></div>
              <div className="relative z-10 p-2 bg-white/10 backdrop-blur-sm rounded-3xl">
                <img 
                  src={heroImage}
                  alt="QR Code Generator Preview - Professional interface showing QR code creation tools"
                  className="w-full rounded-2xl shadow-xl"
                />
              </div>
              {/* Floating elements */}
              <div className="absolute -top-6 -left-6 w-12 h-12 bg-primary/20 rounded-full animate-bounce delay-1000"></div>
              <div className="absolute -bottom-6 -right-6 w-8 h-8 bg-accent/20 rounded-full animate-bounce delay-500"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 lg:py-24 bg-surface-container/50">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center space-y-6 mb-16 animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-primary-light text-primary px-4 py-2 rounded-full text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              Professional Features
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold max-w-3xl mx-auto">
              Everything you need to create 
              <span className="text-primary"> perfect QR codes</span>
            </h2>
            <p className="text-muted-foreground text-lg lg:text-xl max-w-3xl mx-auto leading-relaxed">
              From simple URLs to complex business cards, Qr Studio handles it all with professional-grade features and beautiful design.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {[
              {
                icon: Smartphone,
                title: "Mobile-First Design",
                description: "Responsive interface optimized for touch devices with intuitive controls that work everywhere."
              },
              {
                icon: Palette,
                title: "Custom Styling",
                description: "Professional color picker, size controls, and error correction levels to match your brand."
              },
              {
                icon: Zap,
                title: "Real-Time Preview",
                description: "Instant QR code generation with live preview as you type. No waiting, no delays."
              },
              {
                icon: Download,
                title: "High-Quality Export",
                description: "Download as PNG or SVG with 3x resolution for crisp, professional results."
              },
              {
                icon: QrCode,
                title: "8+ Content Types",
                description: "URLs, text, WiFi, contacts, events, SMS, phone numbers, and email support."
              },
              {
                icon: Shield,
                title: "Privacy Focused",
                description: "All processing happens locally in your browser. Your data never leaves your device."
              }
            ].map((feature, index) => (
              <div 
                key={index}
                className="card-elevated text-center space-y-4 hover:scale-[1.02] transition-transform duration-300 animate-scale-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-14 h-14 mx-auto bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-16 bg-gradient-hero text-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-3xl md:text-4xl font-bold">10,000+</div>
              <div className="text-white/80">QR Codes Generated</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl md:text-4xl font-bold">50+</div>
              <div className="text-white/80">Countries</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl md:text-4xl font-bold">99.9%</div>
              <div className="text-white/80">Uptime</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl md:text-4xl font-bold">4.9★</div>
              <div className="text-white/80">User Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24 bg-gradient-subtle">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-accent-light text-accent px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Users className="w-4 h-4" />
              Join 10,000+ Happy Users
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold">
              Ready to create your first 
              <span className="text-primary"> professional QR code</span>?
            </h2>
            <p className="text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Start generating beautiful, customizable QR codes in seconds. No account required, completely free to use.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Button 
                onClick={() => setShowGenerator(true)}
                className="btn-premium text-lg px-8 py-4 h-auto group"
              >
                <QrCode className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform duration-200" />
                Get Started Free
              </Button>
              <Button variant="outline" className="text-lg px-8 py-4 h-auto btn-ghost">
                <Globe className="w-5 h-5 mr-2" />
                View Live Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <CookieConsent />
    </div>
  );
};

export default Index;