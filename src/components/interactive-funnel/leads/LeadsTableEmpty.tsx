
import React from 'react';
import { User } from 'lucide-react';

const LeadsTableEmpty: React.FC = () => {
  return (
    <div className="text-center py-12">
      <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">Nessun lead ancora</h3>
      <p className="text-gray-500">I lead verranno visualizzati qui quando qualcuno compilerà il funnel</p>
    </div>
  );
};

export default LeadsTableEmpty;
