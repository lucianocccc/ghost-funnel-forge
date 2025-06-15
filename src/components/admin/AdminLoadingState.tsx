
import React from 'react';
import { Loader2 } from 'lucide-react';

const AdminLoadingState: React.FC = () => {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="flex items-center gap-2 text-white">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span>Caricamento dashboard admin...</span>
      </div>
    </div>
  );
};

export default AdminLoadingState;
