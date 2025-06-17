
import React from 'react';

const LoadingState: React.FC = () => {
  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="text-center">
        <div className="animate-spin w-8 h-8 border-4 border-golden border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-gray-600">Caricamento...</p>
      </div>
    </div>
  );
};

export default LoadingState;
