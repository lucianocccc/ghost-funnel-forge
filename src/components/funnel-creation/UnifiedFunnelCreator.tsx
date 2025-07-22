
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Zap, Brain, MessageCircle, Plus, Wand2 } from 'lucide-react';
import QuickFunnelGenerator from '@/components/ai-funnel/QuickFunnelGenerator';
import TypedFunnelGenerator from '@/components/funnel-types/TypedFunnelGenerator';
import AIFunnelCreator from '@/components/ai-funnel/AIFunnelCreator';
import ManualFunnelCreator from './ManualFunnelCreator';

const UnifiedFunnelCreator: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'quick' | 'typed' | 'conversation' | 'manual'>('quick');
  const [createdFunnel, setCreatedFunnel] = useState<any>(null);

  const handleFunnelCreated = (funnel: any) => {
    setCreatedFunnel(funnel);
  };

  const resetCreatedFunnel = () => {
    setCreatedFunnel(null);
  };

  // Show success state when funnel is created
  if (createdFunnel) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={resetCreatedFunnel}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Crea Nuovo Funnel
          </Button>
          <h2 className="text-xl font-semibold">Funnel Creato: {createdFunnel.name}</h2>
        </div>
        
        <Card className="border-green-200">
          <CardHeader>
            <CardTitle className="text-xl text-green-700">
              ✅ {createdFunnel.name}
            </CardTitle>
            <p className="text-gray-600 mt-2">{createdFunnel.description}</p>
          </CardHeader>
          <CardContent>
            <div className="text-center py-4">
              <p className="text-gray-600 mb-4">
                Il tuo funnel è stato creato con successo! Puoi ora gestirlo dalla sezione "I Miei Funnel".
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
                    Visualizza Anteprima
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
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Crea il Tuo Funnel</h1>
        <p className="text-gray-600">
          Scegli il metodo che preferisci per creare il tuo funnel di conversione
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="quick" className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            <span className="hidden sm:inline">Rapido</span>
          </TabsTrigger>
          <TabsTrigger value="typed" className="flex items-center gap-2">
            <Brain className="w-4 h-4" />
            <span className="hidden sm:inline">Per Tipologia</span>
          </TabsTrigger>
          <TabsTrigger value="conversation" className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Conversazione</span>
          </TabsTrigger>
          <TabsTrigger value="manual" className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Manuale</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="quick" className="mt-6">
          <Card className="mb-4 bg-gradient-to-r from-golden/10 to-yellow-50 border-golden/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-golden">
                <Zap className="w-5 h-5" />
                Generazione Rapida
              </CardTitle>
              <p className="text-gray-700">
                Descrivi il tuo funnel e l'AI creerà automaticamente tutti i passaggi necessari in pochi secondi.
              </p>
            </CardHeader>
          </Card>
          <QuickFunnelGenerator />
        </TabsContent>

        <TabsContent value="typed" className="mt-6">
          <Card className="mb-4 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-900">
                <Brain className="w-5 h-5" />
                Generazione per Tipologia
              </CardTitle>
              <p className="text-purple-700">
                Seleziona un tipo di funnel specifico e lascia che l'AI crei un'esperienza ottimizzata per il tuo settore.
              </p>
            </CardHeader>
          </Card>
          <TypedFunnelGenerator onFunnelGenerated={handleFunnelCreated} />
        </TabsContent>

        <TabsContent value="conversation" className="mt-6">
          <Card className="mb-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-900">
                <MessageCircle className="w-5 h-5" />
                Creazione Conversazionale
              </CardTitle>
              <p className="text-blue-700">
                Conversa con l'AI per definire ogni aspetto del tuo funnel attraverso domande guidate.
              </p>
            </CardHeader>
          </Card>
          <AIFunnelCreator />
        </TabsContent>

        <TabsContent value="manual" className="mt-6">
          <Card className="mb-4 bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <Plus className="w-5 h-5" />
                Creazione Manuale
              </CardTitle>
              <p className="text-gray-700">
                Crea un funnel vuoto e personalizzalo completamente secondo le tue esigenze specifiche.
              </p>
            </CardHeader>
          </Card>
          <ManualFunnelCreator onFunnelCreated={handleFunnelCreated} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UnifiedFunnelCreator;
