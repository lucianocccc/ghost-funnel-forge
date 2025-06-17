
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Zap } from 'lucide-react';

interface AIFunnelWelcomeScreenProps {
  onStart: () => void;
}

const AIFunnelWelcomeScreen: React.FC<AIFunnelWelcomeScreenProps> = ({ onStart }) => {
  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <div className="w-16 h-16 bg-golden rounded-full flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-8 h-8 text-black" />
        </div>
        <CardTitle className="text-2xl text-golden">
          AI Funnel Creator
        </CardTitle>
        <p className="text-gray-300 mt-2">
          Lascia che l'intelligenza artificiale ti guidi nella creazione del funnel perfetto per il tuo business. 
          Scegli tra template preconfezionati o crea un funnel completamente personalizzato.
        </p>
      </CardHeader>
      <CardContent className="text-center">
        <Button 
          onClick={onStart}
          className="bg-golden hover:bg-yellow-600 text-black text-lg px-8 py-3"
        >
          <Zap className="w-5 h-5 mr-2" />
          Inizia Creazione AI
        </Button>
      </CardContent>
    </Card>
  );
};

export default AIFunnelWelcomeScreen;
