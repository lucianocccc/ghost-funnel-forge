
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Wand2, ArrowRight, Zap, CheckCircle } from 'lucide-react';
import { GeneratedFunnel } from '@/types/chatbotFunnel';
import { useToast } from '@/hooks/use-toast';
import { createInteractiveFunnel } from '@/services/interactiveFunnelService';

interface AIFunnelTransformModalProps {
  funnel: GeneratedFunnel | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AIFunnelTransformModal: React.FC<AIFunnelTransformModalProps> = ({
  funnel,
  isOpen,
  onClose,
  onSuccess
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  React.useEffect(() => {
    if (funnel) {
      setName(funnel.name);
      setDescription(funnel.description || '');
    }
  }, [funnel]);

  const handleTransform = async () => {
    if (!funnel || !name.trim()) return;

    setIsCreating(true);
    try {
      await createInteractiveFunnel(name, description, funnel.id);
      
      toast({
        title: "Successo!",
        description: "Funnel interattivo creato con successo dalla configurazione AI",
      });
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error transforming funnel:', error);
      toast({
        title: "Errore",
        description: "Errore nella trasformazione del funnel",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  if (!funnel) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-golden" />
            Trasforma in Funnel Interattivo
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Preview del funnel AI */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="outline" className="bg-purple-100 text-purple-800">
                Funnel AI
              </Badge>
              <ArrowRight className="w-4 h-4 text-gray-400" />
              <Badge className="bg-golden text-black">
                Funnel Interattivo
              </Badge>
            </div>
            
            <h4 className="font-medium text-gray-900 mb-2">{funnel.name}</h4>
            <p className="text-sm text-gray-600">{funnel.description}</p>
            
            {funnel.funnel_data?.steps && (
              <div className="mt-3">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Passi del funnel ({funnel.funnel_data.steps.length}):
                </p>
                <div className="space-y-1">
                  {funnel.funnel_data.steps.slice(0, 3).map((step: string, index: number) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-3 h-3 text-green-600" />
                      <span>{step.length > 50 ? step.substring(0, 50) + '...' : step}</span>
                    </div>
                  ))}
                  {funnel.funnel_data.steps.length > 3 && (
                    <p className="text-sm text-gray-500">
                      ...e altri {funnel.funnel_data.steps.length - 3} passi
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Form di configurazione */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="funnel-name">Nome del Funnel Interattivo</Label>
              <Input
                id="funnel-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Inserisci il nome del funnel..."
              />
            </div>
            
            <div>
              <Label htmlFor="funnel-description">Descrizione</Label>
              <Textarea
                id="funnel-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descrivi il tuo funnel interattivo..."
                rows={3}
              />
            </div>
          </div>

          {/* Benefici della trasformazione */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Cosa otterrai:
            </h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Raccolta dati lead automatica</li>
              <li>• Link condivisibile pubblico</li>
              <li>• Analytics e statistiche dettagliate</li>
              <li>• Form personalizzabili per ogni step</li>
              <li>• Gestione completa dei lead raccolti</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose} disabled={isCreating}>
              Annulla
            </Button>
            <Button
              onClick={handleTransform}
              disabled={!name.trim() || isCreating}
              className="bg-golden hover:bg-yellow-600 text-black"
            >
              {isCreating ? (
                <>Creazione...</>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 mr-2" />
                  Trasforma in Interattivo
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AIFunnelTransformModal;
