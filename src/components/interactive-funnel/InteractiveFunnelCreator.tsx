
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useInteractiveFunnels } from '@/hooks/useInteractiveFunnels';

const InteractiveFunnelCreator: React.FC = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);
  const { createFunnel } = useInteractiveFunnels();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: "Errore",
        description: "Il nome del funnel è obbligatorio",
        variant: "destructive",
      });
      return;
    }

    setCreating(true);
    try {
      await createFunnel(name.trim(), description.trim());
      
      // Reset form
      setName('');
      setDescription('');
      
      toast({
        title: "Successo",
        description: "Funnel creato con successo!",
      });
    } catch (error) {
      console.error('Error creating funnel:', error);
      // Error handling is done in the hook
    } finally {
      setCreating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Crea Nuovo Funnel
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="funnel-name" className="block text-sm font-medium mb-2">
              Nome Funnel *
            </label>
            <Input
              id="funnel-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Es. Lead Generation per Consulenza"
              required
              disabled={creating}
            />
          </div>
          
          <div>
            <label htmlFor="funnel-description" className="block text-sm font-medium mb-2">
              Descrizione
            </label>
            <Textarea
              id="funnel-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descrivi brevemente l'obiettivo del tuo funnel..."
              rows={3}
              disabled={creating}
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full" 
            disabled={creating || !name.trim()}
          >
            {creating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creazione in corso...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Crea Funnel
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default InteractiveFunnelCreator;
