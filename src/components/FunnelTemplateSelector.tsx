
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Sparkles, FileText, Zap } from 'lucide-react';
import { useFunnels } from '@/hooks/useFunnels';
import { useToast } from '@/hooks/use-toast';
import AIFunnelCreator from '@/components/ai-funnel/AIFunnelCreator';

interface FunnelTemplateSelectorProps {
  leadId?: string;
  onFunnelCreated?: () => void;
}

const FunnelTemplateSelector: React.FC<FunnelTemplateSelectorProps> = ({ 
  leadId, 
  onFunnelCreated 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [funnelName, setFunnelName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const { templates, createFunnelFromTemplate } = useFunnels();
  const { toast } = useToast();

  const handleCreateFromTemplate = async () => {
    if (!selectedTemplate || !funnelName.trim()) {
      toast({
        title: "Errore",
        description: "Seleziona un template e inserisci un nome per il funnel",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    try {
      await createFunnelFromTemplate(selectedTemplate, funnelName, leadId);
      setIsOpen(false);
      setSelectedTemplate('');
      setFunnelName('');
      onFunnelCreated?.();
    } catch (error) {
      console.error('Error creating funnel:', error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <>
      <div className="flex gap-3">
        {/* AI Funnel Creator Button */}
        <Button
          onClick={() => setIsAIOpen(true)}
          className="bg-golden hover:bg-yellow-600 text-black font-medium"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Crea con AI
        </Button>

        {/* Template Selector Button */}
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="border-golden text-golden hover:bg-golden hover:text-black">
              <FileText className="w-4 h-4 mr-2" />
              Da Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Crea Nuovo Funnel da Template
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="funnel-name">Nome del Funnel</Label>
                <Input
                  id="funnel-name"
                  value={funnelName}
                  onChange={(e) => setFunnelName(e.target.value)}
                  placeholder="Inserisci il nome del tuo funnel..."
                  className="w-full"
                />
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Seleziona un Template</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {templates.map((template) => (
                    <Card
                      key={template.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        selectedTemplate === template.id 
                          ? 'ring-2 ring-golden border-golden' 
                          : 'border-gray-200'
                      }`}
                      onClick={() => setSelectedTemplate(template.id)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">{template.name}</CardTitle>
                          {template.is_premium && (
                            <Badge variant="secondary" className="bg-golden text-black">
                              Premium
                            </Badge>
                          )}
                        </div>
                        <CardDescription className="text-sm">
                          {template.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <span>{template.category}</span>
                          <span>★ {template.rating}/5</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  disabled={isCreating}
                >
                  Annulla
                </Button>
                <Button
                  onClick={handleCreateFromTemplate}
                  disabled={!selectedTemplate || !funnelName.trim() || isCreating}
                  className="bg-golden hover:bg-yellow-600 text-black"
                >
                  {isCreating ? (
                    <>Creazione...</>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Crea Funnel
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* AI Funnel Creator Dialog */}
      <Dialog open={isAIOpen} onOpenChange={setIsAIOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden p-0">
          <div className="p-6">
            <AIFunnelCreator />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FunnelTemplateSelector;
