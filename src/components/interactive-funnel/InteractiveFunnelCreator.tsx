
import React from 'react';
import TypedFunnelGenerator from '@/components/funnel-types/TypedFunnelGenerator';
import RevolutionChatInterface from '@/components/revolution/RevolutionChatInterface';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import usePersonalizedFunnelGenerator from '@/hooks/usePersonalizedFunnelGenerator';

const InteractiveFunnelCreator: React.FC = () => {
  const { lastGeneratedFunnel } = usePersonalizedFunnelGenerator();
  
  const handleFunnelGenerated = (funnel: any) => {
    console.log('✅ Personalized funnel created successfully:', funnel);
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="revolution" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="revolution">🚀 Revolution AI</TabsTrigger>
          <TabsTrigger value="classic">📝 Generatore Classico</TabsTrigger>
        </TabsList>
        
        <TabsContent value="revolution" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Funnel Personalizzato con Revolution AI</CardTitle>
              <CardDescription>
                L'AI conversazionale raccoglie dati sul tuo business per creare funnel ottimizzati
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RevolutionChatInterface onFunnelGenerated={handleFunnelGenerated} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="classic">
          <TypedFunnelGenerator onFunnelGenerated={handleFunnelGenerated} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InteractiveFunnelCreator;
