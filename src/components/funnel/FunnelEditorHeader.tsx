
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Save } from 'lucide-react';

interface FunnelEditorHeaderProps {
  onAddStep: () => void;
  onSaveFunnel: () => void;
}

const FunnelEditorHeader: React.FC<FunnelEditorHeaderProps> = ({
  onAddStep,
  onSaveFunnel,
}) => (
  <div className="flex items-center justify-between">
    <div>
      <h2 className="text-2xl font-bold">Editor Funnel</h2>
      <p className="text-gray-600">Crea e modifica i passaggi del tuo funnel</p>
    </div>
    <div className="flex gap-2">
      <Button variant="outline" onClick={onAddStep}>
        <Plus className="w-4 h-4 mr-2" />
        Aggiungi Step
      </Button>
      <Button onClick={onSaveFunnel}>
        <Save className="w-4 h-4 mr-2" />
        Salva Funnel
      </Button>
    </div>
  </div>
);

export default FunnelEditorHeader;
