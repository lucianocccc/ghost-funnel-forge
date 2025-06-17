
import React from 'react';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';

const SharedFunnelCTA: React.FC = () => {
  return (
    <div className="text-center py-6">
      <h3 className="text-xl font-bold text-white mb-4">
        Vuoi creare il tuo funnel personalizzato?
      </h3>
      <p className="text-gray-400 mb-6">
        Scopri Ghost Funnel e crea funnel marketing professionali con l'aiuto dell'AI
      </p>
      <Button 
        onClick={() => window.location.href = '/'}
        size="lg"
        className="bg-golden hover:bg-yellow-600 text-black"
      >
        <ExternalLink className="w-4 h-4 mr-2" />
        Inizia Gratis con Ghost Funnel
      </Button>
    </div>
  );
};

export default SharedFunnelCTA;
