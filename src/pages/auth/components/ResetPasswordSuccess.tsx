
import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowLeft } from 'lucide-react';

interface ResetPasswordSuccessProps {
  onBackToLogin: () => void;
}

const ResetPasswordSuccess: React.FC<ResetPasswordSuccessProps> = ({ onBackToLogin }) => {
  return (
    <div className="space-y-4 text-center">
      <div className="space-y-2">
        <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
        <h3 className="text-lg font-semibold text-black">Password Aggiornata!</h3>
        <p className="text-gray-600">
          La tua password è stata aggiornata con successo.
          Sarai reindirizzato al login tra pochi secondi.
        </p>
      </div>
      <Button 
        onClick={onBackToLogin}
        variant="outline"
        className="w-full"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Vai al Login Ora
      </Button>
    </div>
  );
};

export default ResetPasswordSuccess;
