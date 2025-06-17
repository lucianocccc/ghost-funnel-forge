
import React from 'react';
import { Button } from '@/components/ui/button';
import { Save, RotateCcw } from 'lucide-react';

interface SettingsActionsProps {
  onSave: () => void;
  onReset: () => void;
}

const SettingsActions: React.FC<SettingsActionsProps> = ({
  onSave,
  onReset
}) => {
  return (
    <div className="flex justify-end space-x-3 pt-4">
      <Button
        variant="outline"
        onClick={onReset}
        className="border-gray-600 text-gray-300 hover:bg-gray-700"
      >
        <RotateCcw className="w-4 h-4 mr-2" />
        Ripristina
      </Button>
      <Button
        onClick={onSave}
        className="bg-golden hover:bg-yellow-600 text-black"
      >
        <Save className="w-4 h-4 mr-2" />
        Salva Impostazioni
      </Button>
    </div>
  );
};

export default SettingsActions;
