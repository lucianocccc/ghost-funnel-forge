
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useFunnels } from '@/hooks/useFunnels';
import { Zap, Crown, Play } from 'lucide-react';

interface FunnelTemplateSelectorProps {
  leadId?: string;
  onFunnelCreated?: () => void;
}

const FunnelTemplateSelector: React.FC<FunnelTemplateSelectorProps> = ({ 
  leadId, 
  onFunnelCreated 
}) => {
  const { templates, createFunnelFromTemplate } = useFunnels();
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [funnelName, setFunnelName] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleCreateFunnel = async () => {
    if (!selectedTemplate || !funnelName.trim()) return;

    const result = await createFunnelFromTemplate(selectedTemplate, funnelName, leadId);
    if (result) {
      setIsDialogOpen(false);
      setFunnelName('');
      setSelectedTemplate(null);
      onFunnelCreated?.();
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button className="bg-golden hover:bg-golden/90 text-black">
          <Zap className="w-4 h-4 mr-2" />
          Crea Funnel
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Seleziona un Template per il Funnel</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map((template) => (
              <Card 
                key={template.id} 
                className={`cursor-pointer transition-all ${
                  selectedTemplate === template.id 
                    ? 'ring-2 ring-golden border-golden' 
                    : 'hover:shadow-md'
                }`}
                onClick={() => setSelectedTemplate(template.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    {template.is_premium && (
                      <Badge variant="secondary" className="bg-golden text-black">
                        <Crown className="w-3 h-3 mr-1" />
                        Premium
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm mb-3">{template.description}</p>
                  <div className="flex gap-2">
                    {template.industry && (
                      <Badge variant="outline">{template.industry}</Badge>
                    )}
                    {template.category && (
                      <Badge variant="outline">{template.category}</Badge>
                    )}
                  </div>
                  {template.rating && (
                    <div className="mt-2 text-sm text-gray-500">
                      ⭐ {template.rating.toFixed(1)} • {template.usage_count} utilizzi
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {selectedTemplate && (
            <div className="space-y-4 border-t pt-4">
              <div>
                <Label htmlFor="funnel-name">Nome del Funnel</Label>
                <Input
                  id="funnel-name"
                  value={funnelName}
                  onChange={(e) => setFunnelName(e.target.value)}
                  placeholder="Inserisci il nome per il tuo funnel..."
                  className="mt-1"
                />
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={handleCreateFunnel}
                  disabled={!funnelName.trim()}
                  className="bg-black hover:bg-gray-800 text-white"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Crea Funnel
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                >
                  Annulla
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FunnelTemplateSelector;
