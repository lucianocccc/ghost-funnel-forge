
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GeneratedFunnel } from '@/types/chatbotFunnel';

interface AIFunnelGeneratedListProps {
  generatedFunnels: GeneratedFunnel[];
}

const AIFunnelGeneratedList: React.FC<AIFunnelGeneratedListProps> = ({
  generatedFunnels
}) => {
  if (generatedFunnels.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-golden">Funnel Generati dall'AI</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {generatedFunnels.map((funnel) => (
            <div key={funnel.id} className="border border-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-white">{funnel.name}</h4>
                <Badge variant={funnel.is_active ? 'default' : 'secondary'}>
                  {funnel.is_active ? 'Attivo' : 'Bozza'}
                </Badge>
              </div>
              <p className="text-gray-300 text-sm mb-3">{funnel.description}</p>
              <div className="flex gap-2">
                <Button size="sm" className="bg-golden hover:bg-yellow-600 text-black">
                  Visualizza Dettagli
                </Button>
                <Button size="sm" variant="outline">
                  Condividi
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AIFunnelGeneratedList;
