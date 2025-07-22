
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { createInteractiveFunnel } from '@/services/interactive-funnel/funnelCrudService';
import { useAuth } from '@/hooks/useAuth';

interface ManualFunnelCreatorProps {
  onFunnelCreated?: (funnel: any) => void;
}

const ManualFunnelCreator: React.FC<ManualFunnelCreatorProps> = ({ onFunnelCreated }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleCreate = async () => {
    if (!name.trim()) {
      toast({
        title: "Errore",
        description: "Il nome del funnel è richiesto",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Errore",
        description: "Devi essere autenticato per creare un funnel",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const funnel = await createInteractiveFunnel(name, description);
      
      toast({
        title: "Successo!",
        description: "Funnel creato con successo",
      });
      
      onFunnelCreated?.(funnel);
      
      // Reset form
      setName('');
      setDescription('');
    } catch (error) {
      console.error('Error creating funnel:', error);
      toast({
        title: "Errore",
        description: "Errore nella creazione del funnel",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Crea Funnel da Zero</CardTitle>
        <p className="text-gray-600">
          Crea un funnel vuoto che potrai personalizzare completamente aggiungendo i tuoi step personalizzati.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Nome Funnel *
          </label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Es: Lead Generation B2B, Sondaggio Clienti..."
            disabled={loading}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">
            Descrizione (opzionale)
          </label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descrivi l'obiettivo del tuo funnel e il target di riferimento..."
            rows={3}
            disabled={loading}
          />
        </div>
        
        <Button 
          onClick={handleCreate}
          disabled={loading || !name.trim()}
          className="w-full"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Creazione...
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 mr-2" />
              Crea Funnel Vuoto
            </>
          )}
        </Button>

        <div className="text-xs text-gray-500 mt-4 p-3 bg-gray-50 rounded-lg">
          💡 <strong>Suggerimento:</strong> Dopo aver creato il funnel vuoto, potrai aggiungere e personalizzare tutti gli step dalla sezione "I Miei Funnel".
        </div>
      </CardContent>
    </Card>
  );
};

export default ManualFunnelCreator;
