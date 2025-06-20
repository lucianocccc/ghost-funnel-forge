
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Move, Trash2, Settings } from 'lucide-react';
import { InteractiveFunnelStep } from '@/types/interactiveFunnel';

interface ExistingStepsListProps {
  steps: InteractiveFunnelStep[];
  onDeleteStep: (stepId: string) => void;
}

const ExistingStepsList: React.FC<ExistingStepsListProps> = ({
  steps,
  onDeleteStep
}) => {
  if (!steps || steps.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Passi del Funnel</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {steps
          .sort((a, b) => a.step_order - b.step_order)
          .map((step, index) => (
            <div key={step.id} className="flex items-center gap-4 p-4 border rounded-lg">
              <div className="bg-golden text-black w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                {index + 1}
              </div>
              <div className="flex-1">
                <h4 className="font-medium">{step.title}</h4>
                <p className="text-sm text-gray-600">{step.description}</p>
                <div className="flex gap-2 mt-2">
                  <Badge variant="outline">{step.step_type}</Badge>
                  {step.is_required && <Badge>Obbligatorio</Badge>}
                  {step.fields_config && Array.isArray(step.fields_config) && step.fields_config.length > 0 && (
                    <Badge variant="secondary">{step.fields_config.length} campi</Badge>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  <Settings className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="outline">
                  <Move className="w-4 h-4" />
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => onDeleteStep(step.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
      </CardContent>
    </Card>
  );
};

export default ExistingStepsList;
