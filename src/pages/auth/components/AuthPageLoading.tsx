
import React from 'react';
import { Shield } from 'lucide-react';

const AuthPageLoading: React.FC = () => {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <Shield className="w-12 h-12 text-golden mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-white mb-2">
            Ghost <span className="text-golden">Funnel</span>
          </h1>
          <p className="text-gray-300">Verifica autenticazione...</p>
        </div>
      </div>
    </div>
  );
};

export default AuthPageLoading;
