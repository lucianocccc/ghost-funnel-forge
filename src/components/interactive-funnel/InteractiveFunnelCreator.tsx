
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Plus, Zap } from 'lucide-react';
import { useInteractiveFunnels } from '@/hooks/useInteractiveFunnels';

interface InteractiveFunnelCreatorProps {
  aiGeneratedFunnelId?: string;
  onFunnelCreated?: () => void;
}

const InteractiveFunnelCreator: React.FC<InteractiveFunnelCreatorProps> = ({ 
  aiGeneratedFunnelId, 
  onFunnelCreated 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const { createFunnel } = useInteractiveFunnels();

  const handleCreate = async () => {
    if (!name.trim()) return;

    setIsCreating(true);
    try {
      await createFunnel(name, description, aiGeneratedFunnelId);
      setIsOpen(false);
      setName('');
      setDescription('');
      onFunnelCreated?.();
    } catch (error) {
      console.error('Error creating funnel:', error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-golden hover:bg-yellow-600 text-black">
          <Zap className="w-4 h-4 mr-2" />
          Crea Funnel Interattivo
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Nuovo Funnel Interattivo
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="funnel-name">Nome del Funnel</Label>
            <Input
              id="funnel-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Es. Lead Magnet Quiz"
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="funnel-description">Descrizione (opzionale)</Label>
            <Textarea
              id="funnel-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descrivi il tuo funnel interattivo..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isCreating}
            >
              Annulla
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!name.trim() || isCreating}
              className="bg-golden hover:bg-yellow-600 text-black"
            >
              {isCreating ? 'Creazione...' : 'Crea Funnel'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InteractiveFunnelCreator;
