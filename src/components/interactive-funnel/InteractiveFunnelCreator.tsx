
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Plus, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { createInteractiveFunnel } from '@/services/interactive-funnel/funnelCrudService';
import { useAuth } from '@/hooks/useAuth';

const InteractiveFunnelCreator: React.FC = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [createdFunnel, setCreatedFunnel] = useState<any>(null);
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
      setCreatedFunnel(funnel);
      toast({
        title: "Successo!",
        description: "Funnel creato con successo",
      });
      
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

  const resetCreatedFunnel = () => {
    setCreatedFunnel(null);
  };

  if (createdFunnel) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={resetCreatedFunnel}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Crea Nuovo Funnel
          </Button>
          <h2 className="text-xl font-semibold">Funnel Creato: {createdFunnel.name}</h2>
        </div>
        
        <Card className="border-green-200">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-xl text-green-700">
                  ✅ {createdFunnel.name}
                </CardTitle>
                <p className="text-gray-600 mt-2">{createdFunnel.description}</p>
              </div>
              {createdFunnel.share_token && (
                <Button
                  onClick={() => window.open(`/shared-interactive-funnel/${createdFunnel.share_token}`, '_blank')}
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  Anteprima
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center py-4">
              <p className="text-gray-600 mb-4">
                Il tuo funnel è stato creato con successo! Puoi ora personalizzarlo o visualizzarne l'anteprima.
              </p>
              <div className="flex justify-center gap-4">
                <Button onClick={resetCreatedFunnel}>
                  Crea Altro Funnel
                </Button>
                {createdFunnel.share_token && (
                  <Button
                    variant="outline"
                    onClick={() => window.open(`/shared-interactive-funnel/${createdFunnel.share_token}`, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Visualizza
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Crea Nuovo Funnel Interattivo</h2>
        <p className="text-gray-600">
          Crea un funnel vuoto e personalizzalo completamente secondo le tue esigenze.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Crea Funnel da Zero</CardTitle>
          <p className="text-gray-600">
            Crea un funnel vuoto e personalizzalo completamente secondo le tue esigenze.
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
              placeholder="Es: Lead Generation B2B"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              Descrizione
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descrivi l'obiettivo del tuo funnel..."
              rows={3}
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
                Crea Funnel
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default InteractiveFunnelCreator;
