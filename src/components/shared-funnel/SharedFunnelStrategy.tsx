
import React from 'react';

interface SharedFunnelStrategyProps {
  strategy: string;
}

const SharedFunnelStrategy: React.FC<SharedFunnelStrategyProps> = ({ strategy }) => {
  if (!strategy) return null;

  return (
    <div>
      <h3 className="text-xl font-bold text-white mb-4">Strategia di Distribuzione</h3>
      <div className="p-4 bg-gray-900 rounded-lg">
        <p className="text-gray-300 leading-relaxed">
          {strategy}
        </p>
      </div>
    </div>
  );
};

export default SharedFunnelStrategy;
