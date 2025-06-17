
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const SharedFunnelHeader: React.FC = () => {
  return (
    <div className="mb-8">
      <Button 
        onClick={() => window.history.back()}
        variant="outline"
        className="mb-4 border-gray-600 text-gray-300 hover:bg-gray-800"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Indietro
      </Button>
      
      <div className="text-center">
        <h1 className="text-3xl font-bold text-golden mb-2">Funnel Condiviso</h1>
        <p className="text-gray-400">Creato con Ghost Funnel AI</p>
      </div>
    </div>
  );
};

export default SharedFunnelHeader;
