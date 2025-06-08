
import React from 'react';
import GhostFunnelForm from '../components/GhostFunnelForm';

const Index = () => {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            Ghost <span className="text-golden">Funnel</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-lg mx-auto">
            Trasforma la tua presenza online in risultati concreti
          </p>
        </div>
        <GhostFunnelForm />
      </div>
    </div>
  );
};

export default Index;
