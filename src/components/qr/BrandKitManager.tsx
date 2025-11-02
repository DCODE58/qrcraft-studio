import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Briefcase, Plus, Save, Trash2, Check, X, Edit3 
} from 'lucide-react';
import { AdvancedQRStyle } from './AdvancedCustomization';
import { useToast } from '@/hooks/use-toast';

export interface BrandKit {
  id: string;
  name: string;
  style: AdvancedQRStyle;
  primaryColor: string;
  secondaryColor: string;
}

interface BrandKitManagerProps {
  onApplyKit: (kit: BrandKit) => void;
}

export const BrandKitManager = ({ onApplyKit }: BrandKitManagerProps) => {
  const [brandKits, setBrandKits] = useState<BrandKit[]>(() => {
    const saved = localStorage.getItem('qr-brand-kits');
    return saved ? JSON.parse(saved) : [];
  });
  const [isCreating, setIsCreating] = useState(false);
  const [newKitName, setNewKitName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const { toast } = useToast();

  const saveToLocalStorage = (kits: BrandKit[]) => {
    localStorage.setItem('qr-brand-kits', JSON.stringify(kits));
    setBrandKits(kits);
  };

  const createBrandKit = (currentStyle: AdvancedQRStyle, primaryColor: string, secondaryColor: string) => {
    if (!newKitName.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a name for your brand kit",
        variant: "destructive"
      });
      return;
    }

    const newKit: BrandKit = {
      id: Date.now().toString(),
      name: newKitName,
      style: currentStyle,
      primaryColor,
      secondaryColor
    };

    const updated = [...brandKits, newKit];
    saveToLocalStorage(updated);
    setNewKitName('');
    setIsCreating(false);

    toast({
      title: "Brand Kit Saved!",
      description: `"${newKitName}" has been added to your brand kits`,
      className: "bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200"
    });
  };

  const deleteKit = (id: string) => {
    const updated = brandKits.filter(kit => kit.id !== id);
    saveToLocalStorage(updated);

    toast({
      title: "Brand Kit Deleted",
      description: "The brand kit has been removed"
    });
  };

  const renameKit = (id: string, newName: string) => {
    const updated = brandKits.map(kit => 
      kit.id === id ? { ...kit, name: newName } : kit
    );
    saveToLocalStorage(updated);
    setEditingId(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-primary" />
          <Label className="text-sm font-semibold">Brand Kits</Label>
        </div>
        {!isCreating && (
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => setIsCreating(true)}
          >
            <Plus className="w-4 h-4 mr-1" />
            Save Current
          </Button>
        )}
      </div>

      {isCreating && (
        <Card className="p-4 space-y-3 border-primary/50">
          <Label className="text-xs font-medium">Brand Kit Name</Label>
          <Input
            value={newKitName}
            onChange={(e) => setNewKitName(e.target.value)}
            placeholder="e.g., Company Brand, Event Theme..."
            className="input-elevated"
            autoFocus
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => {
                // This would be passed from parent component with current style
                // For now, we'll show the UI
                toast({
                  title: "Feature Ready",
                  description: "This will save your current QR style as a brand kit",
                });
                setIsCreating(false);
              }}
              className="flex-1"
            >
              <Save className="w-4 h-4 mr-1" />
              Save Kit
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setIsCreating(false);
                setNewKitName('');
              }}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      )}

      {brandKits.length === 0 && !isCreating && (
        <Card className="p-6 text-center border-dashed">
          <Briefcase className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">
            No brand kits saved yet. Create one to quickly apply your brand style!
          </p>
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {brandKits.map((kit) => (
          <Card key={kit.id} className="p-4 space-y-3">
            {editingId === kit.id ? (
              <div className="flex gap-2">
                <Input
                  defaultValue={kit.name}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      renameKit(kit.id, e.currentTarget.value);
                    }
                  }}
                  className="h-8 text-sm"
                  autoFocus
                />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setEditingId(null)}
                >
                  <Check className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">{kit.name}</p>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setEditingId(kit.id)}
                >
                  <Edit3 className="w-3 h-3" />
                </Button>
              </div>
            )}

            <div className="flex gap-2">
              <div
                className="flex-1 h-8 rounded border-2 border-border"
                style={{ backgroundColor: kit.primaryColor }}
              />
              <div
                className="flex-1 h-8 rounded border-2 border-border"
                style={{ backgroundColor: kit.secondaryColor }}
              />
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="flex-1"
                onClick={() => onApplyKit(kit)}
              >
                Apply
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => deleteKit(kit.id)}
              >
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
