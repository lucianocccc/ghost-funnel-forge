
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface SharedFunnelErrorProps {
  error: string;
}

const SharedFunnelError: React.FC<SharedFunnelErrorProps> = ({ error }) => {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center text-white">
        <h1 className="text-2xl font-bold mb-4">Funnel non trovato</h1>
        <p className="text-gray-400 mb-6">{error || 'Il funnel che stai cercando non esiste o è stato rimosso.'}</p>
        <Button 
          onClick={() => window.location.href = '/'}
          className="bg-golden hover:bg-yellow-600 text-black"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Torna alla Home
        </Button>
      </div>
    </div>
  );
};

export default SharedFunnelError;
