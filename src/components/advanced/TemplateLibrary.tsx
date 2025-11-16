import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Briefcase, Utensils, Zap, Calendar, Heart, Search, Star, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  style_settings: any;
  is_premium: boolean;
}

interface TemplateLibraryProps {
  onApplyTemplate: (style: any) => void;
}

const categoryIcons: Record<string, any> = {
  business: Briefcase,
  restaurant: Utensils,
  tech: Zap,
  event: Calendar,
  healthcare: Heart,
};

export const TemplateLibrary = ({ onApplyTemplate }: TemplateLibraryProps) => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('qr_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error loading templates:', error);
      toast.error('Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch = 
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = !selectedCategory || template.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(templates.map(t => t.category)));

  const applyTemplate = (template: Template) => {
    const style = {
      ...template.style_settings,
      fgColor: template.style_settings.fgColor || '#000000',
      bgColor: template.style_settings.bgColor || '#ffffff',
      dotStyle: template.style_settings.dotStyle || 'square',
      cornerStyle: template.style_settings.cornerStyle || 'square',
    };

    onApplyTemplate(style);
    toast.success(`Applied "${template.name}" template`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search & Filter */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant={selectedCategory === null ? 'default' : 'outline'}
            onClick={() => setSelectedCategory(null)}
          >
            All
          </Button>
          {categories.map((category) => {
            const Icon = categoryIcons[category] || Briefcase;
            return (
              <Button
                key={category}
                size="sm"
                variant={selectedCategory === category ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(category)}
              >
                <Icon className="w-3 h-3 mr-1" />
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTemplates.map((template) => {
          const Icon = categoryIcons[template.category] || Briefcase;
          
          return (
            <Card key={template.id} className="p-4 hover:shadow-lg transition-shadow">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">{template.name}</h4>
                      <p className="text-xs text-muted-foreground">{template.category}</p>
                    </div>
                  </div>
                  {template.is_premium && (
                    <Badge variant="secondary" className="text-xs">
                      <Star className="w-3 h-3 mr-1" />
                      Premium
                    </Badge>
                  )}
                </div>

                {template.description && (
                  <p className="text-sm text-muted-foreground">{template.description}</p>
                )}

                {/* Preview */}
                <div className="flex items-center gap-3">
                  <div 
                    className="w-16 h-16 rounded border-2"
                    style={{
                      backgroundColor: template.style_settings.bgColor || '#ffffff',
                      borderColor: template.style_settings.fgColor || '#000000',
                    }}
                  >
                    <div 
                      className="w-full h-full p-2"
                      style={{
                        background: template.style_settings.gradient
                          ? `linear-gradient(135deg, ${template.style_settings.fgColor}, ${template.style_settings.fgColor}88)`
                          : template.style_settings.fgColor || '#000000',
                      }}
                    />
                  </div>

                  <Button
                    size="sm"
                    onClick={() => applyTemplate(template)}
                    className="flex-1"
                  >
                    Apply Template
                  </Button>
                </div>

                {/* Style Tags */}
                <div className="flex flex-wrap gap-1">
                  {template.style_settings.dotStyle && (
                    <Badge variant="outline" className="text-xs">
                      {template.style_settings.dotStyle}
                    </Badge>
                  )}
                  {template.style_settings.gradient && (
                    <Badge variant="outline" className="text-xs">
                      Gradient
                    </Badge>
                  )}
                  {template.style_settings.logo && (
                    <Badge variant="outline" className="text-xs">
                      Logo Support
                    </Badge>
                  )}
                  {template.style_settings.border && (
                    <Badge variant="outline" className="text-xs">
                      Border
                    </Badge>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No templates found</p>
        </div>
      )}
    </div>
  );
};