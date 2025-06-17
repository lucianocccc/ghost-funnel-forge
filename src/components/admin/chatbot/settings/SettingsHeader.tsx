
import React from 'react';
import { Settings } from 'lucide-react';

const SettingsHeader: React.FC = () => {
  return (
    <div className="bg-gray-800 rounded-lg p-5">
      <div className="flex items-center gap-2 mb-4">
        <Settings className="w-6 h-6 text-golden" />
        <h2 className="text-xl font-semibold text-white">Personalizza il tuo Assistente AI</h2>
      </div>
      
      <p className="text-gray-300 mb-6">
        Configura il comportamento e lo stile dell'assistente AI in base alle tue preferenze.
        Le modifiche verranno applicate a tutte le conversazioni future.
      </p>
    </div>
  );
};

export default SettingsHeader;
