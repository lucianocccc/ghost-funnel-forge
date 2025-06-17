
import React from 'react';
import { Button } from '@/components/ui/button';
import { Crown } from 'lucide-react';

const PremiumRequiredState: React.FC = () => {
  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="text-center">
        <Crown className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Piano Premium Richiesto</h3>
        <p className="text-gray-600 mb-4 text-sm">
          Il chatbot AI personalizzato è disponibile solo per gli abbonamenti premium. 
          Aggiorna il tuo piano per accedere a funzionalità avanzate come:
        </p>
        <ul className="text-sm text-gray-600 mb-4 text-left space-y-1">
          <li>• Conversazioni personalizzate</li>
          <li>• Cronologia conservata</li>
          <li>• Suggerimenti di funnel su misura</li>
          <li>• Supporto AI 24/7</li>
        </ul>
        <Button 
          onClick={() => window.location.href = '/auth?subscribe=true&plan=professional'} 
          className="bg-golden hover:bg-yellow-600 text-black"
        >
          Aggiorna Piano
        </Button>
      </div>
    </div>
  );
};

export default PremiumRequiredState;
