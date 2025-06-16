
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Zap, LogIn } from 'lucide-react';

const PresentationHeader: React.FC = () => {
  return (
    <header className="relative z-10 p-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Zap className="w-8 h-8 text-golden" />
          <h1 className="text-2xl font-bold text-white">
            Ghost <span className="text-golden">Funnel</span>
          </h1>
        </div>
        <Link to="/auth" className="no-underline">
          <Button className="bg-golden hover:bg-yellow-600 text-black font-semibold">
            <LogIn className="w-4 h-4 mr-2" />
            Accedi
          </Button>
        </Link>
      </div>
    </header>
  );
};

export default PresentationHeader;
