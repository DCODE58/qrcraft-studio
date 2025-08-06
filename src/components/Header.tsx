import { Button } from "@/components/ui/button";
import { QrCode, ArrowLeft, Home, Github, Sun, Moon } from "lucide-react";
import { useState, useEffect } from "react";

interface HeaderProps {
  showBackButton?: boolean;
  onBackClick?: () => void;
  title?: string;
}

const Header = ({ showBackButton = false, onBackClick, title }: HeaderProps) => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const darkMode = localStorage.getItem('darkMode') === 'true';
    setIsDark(darkMode);
    document.documentElement.classList.toggle('dark', darkMode);
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !isDark;
    setIsDark(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
    document.documentElement.classList.toggle('dark', newDarkMode);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Left side */}
          <div className="flex items-center space-x-4">
            {showBackButton && onBackClick ? (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={onBackClick}
                className="btn-ghost"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            ) : (
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <QrCode className="w-8 h-8 text-primary" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full animate-pulse" />
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-xl font-bold bg-gradient-hero bg-clip-text text-transparent">
                    QrCraft
                  </h1>
                  <p className="text-xs text-muted-foreground -mt-1">
                    Professional QR Generator
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Center title (mobile) */}
          {title && (
            <div className="flex-1 text-center sm:hidden">
              <h1 className="text-lg font-semibold text-foreground truncate">
                {title}
              </h1>
            </div>
          )}

          {/* Right side */}
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={toggleDarkMode}
              className="btn-ghost w-9 h-9 p-0"
              aria-label="Toggle dark mode"
            >
              {isDark ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm"
              asChild
              className="btn-ghost w-9 h-9 p-0 hidden sm:flex"
            >
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="View on GitHub"
              >
                <Github className="w-4 h-4" />
              </a>
            </Button>

            {showBackButton && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={onBackClick}
                className="btn-ghost w-9 h-9 p-0 sm:hidden"
                aria-label="Go home"
              >
                <Home className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;