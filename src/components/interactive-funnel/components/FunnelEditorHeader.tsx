
import React from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, Save } from 'lucide-react';
import { InteractiveFunnelWithSteps } from '@/types/interactiveFunnel';

interface FunnelEditorHeaderProps {
  funnel: InteractiveFunnelWithSteps;
  onSave?: () => void;
  onPreview: () => void;
}

const FunnelEditorHeader: React.FC<FunnelEditorHeaderProps> = ({
  funnel,
  onSave,
  onPreview
}) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl">{funnel.name}</CardTitle>
            <p className="text-gray-600 text-sm mt-1">{funnel.description}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onPreview}>
              <Eye className="w-4 h-4 mr-2" />
              Anteprima
            </Button>
            <Button onClick={onSave} className="bg-golden hover:bg-yellow-600 text-black">
              <Save className="w-4 h-4 mr-2" />
              Salva Modifiche
            </Button>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
};

export default FunnelEditorHeader;
