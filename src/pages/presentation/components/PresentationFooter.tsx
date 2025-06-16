
import React from 'react';
import { Zap } from 'lucide-react';

const PresentationFooter: React.FC = () => {
  return (
    <footer className="py-12 px-6 bg-gray-900">
      <div className="max-w-7xl mx-auto text-center">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <Zap className="w-6 h-6 text-golden" />
          <span className="text-xl font-bold text-white">
            Ghost <span className="text-golden">Funnel</span>
          </span>
        </div>
        <p className="text-gray-400">
          © 2024 Ghost Funnel. Tutti i diritti riservati.
        </p>
      </div>
    </footer>
  );
};

export default PresentationFooter;
