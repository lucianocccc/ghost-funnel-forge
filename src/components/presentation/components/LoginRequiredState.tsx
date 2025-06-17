
import React from 'react';
import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';

const LoginRequiredState: React.FC = () => {
  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="text-center">
        <Lock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Accesso Richiesto</h3>
        <p className="text-gray-600 mb-4 text-sm">
          Devi effettuare l'accesso per utilizzare il chatbot AI personalizzato.
        </p>
        <Button 
          onClick={() => window.location.href = '/auth'} 
          className="bg-blue-500 hover:bg-blue-600 text-white"
        >
          Accedi
        </Button>
      </div>
    </div>
  );
};

export default LoginRequiredState;
