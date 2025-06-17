
import React from 'react';
import { Shield } from 'lucide-react';

interface AuthPageHeaderProps {
  subtitle: string;
}

const AuthPageHeader: React.FC<AuthPageHeaderProps> = ({ subtitle }) => {
  return (
    <div className="text-center mb-8">
      <Shield className="w-12 h-12 text-golden mx-auto mb-4" />
      <h1 className="text-3xl font-bold text-white mb-2">
        Ghost <span className="text-golden">Funnel</span>
      </h1>
      <p className="text-gray-300">{subtitle}</p>
    </div>
  );
};

export default AuthPageHeader;
