
import React from 'react';
import { Loader2 } from 'lucide-react';

const ResetPasswordLoading: React.FC = () => {
  return (
    <div className="space-y-4 text-center">
      <div className="space-y-2">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-golden" />
        <h3 className="text-lg font-semibold text-black">Verifica del Link...</h3>
        <p className="text-gray-600 text-sm">
          Stiamo verificando il tuo link di reset password.
        </p>
      </div>
    </div>
  );
};

export default ResetPasswordLoading;
