
import React from 'react';
import { Button } from '@/components/ui/button';
import { Lock, ArrowLeft } from 'lucide-react';

interface ResetPasswordErrorProps {
  error: string;
  onBackToLogin: () => void;
}

const ResetPasswordError: React.FC<ResetPasswordErrorProps> = ({ error, onBackToLogin }) => {
  return (
    <div className="space-y-4 text-center">
      <div className="space-y-2">
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto">
          <Lock className="w-6 h-6 text-red-500" />
        </div>
        <h3 className="text-lg font-semibold text-black">Errore di Verifica</h3>
        <p className="text-gray-600 text-sm">
          {error}
        </p>
      </div>
      <Button 
        onClick={onBackToLogin}
        variant="outline"
        className="w-full"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Torna al Login
      </Button>
    </div>
  );
};

export default ResetPasswordError;
