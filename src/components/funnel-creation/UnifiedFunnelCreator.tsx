
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Rocket, MessageSquare, Brain, Target } from 'lucide-react';

const UnifiedFunnelCreator = () => {
  const creationMethods = [
    {
      title: 'AI Conversazionale',
      description: 'Chatta con l\'AI per creare il tuo funnel personalizzato',
      icon: MessageSquare,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Generazione Intelligente',
      description: 'L\'AI analizza il tuo business e crea funnel ottimizzati',
      icon: Brain,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Product Discovery',
      description: 'Scopri il potenziale del tuo prodotto con analisi guidate',
      icon: Target,
      color: 'text-green-500',
      bgColor: 'bg-green-50',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <Rocket className="w-6 h-6 text-golden" />
          Crea il Tuo Funnel
        </h2>
        <p className="text-muted-foreground">
          Scegli il metodo di creazione che preferisci per il tuo nuovo funnel.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {creationMethods.map((method, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="text-center">
              <div className={`w-16 h-16 ${method.bgColor} rounded-full flex items-center justify-center mx-auto mb-4`}>
                <method.icon className={`w-8 h-8 ${method.color}`} />
              </div>
              <CardTitle className="text-lg">{method.title}</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground mb-4 text-sm">
                {method.description}
              </p>
              <Button className="w-full bg-golden hover:bg-yellow-600 text-black">
                Inizia
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-dashed border-2">
        <CardContent className="pt-6">
          <div className="text-center">
            <Rocket className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Funzionalità in Sviluppo</h3>
            <p className="text-muted-foreground">
              I metodi di creazione funnel saranno presto disponibili.
              Per ora puoi esplorare le altre sezioni della dashboard.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UnifiedFunnelCreator;
