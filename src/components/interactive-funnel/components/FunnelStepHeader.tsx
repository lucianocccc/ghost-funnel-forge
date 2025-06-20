
import React from 'react';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { InteractiveFunnelStep } from '@/types/interactiveFunnel';

interface FunnelStepHeaderProps {
  step: InteractiveFunnelStep;
  stepIndex: number;
}

const FunnelStepHeader: React.FC<FunnelStepHeaderProps> = ({ step, stepIndex }) => {
  return (
    <CardHeader>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-golden rounded-full flex items-center justify-center text-black font-bold">
          {stepIndex + 1}
        </div>
        <div>
          <CardTitle className="text-xl">{step.title}</CardTitle>
          {step.description && (
            <p className="text-gray-600 mt-1">{step.description}</p>
          )}
        </div>
      </div>
      <div className="flex gap-2 mt-4">
        <Badge variant="outline">{step.step_type}</Badge>
        {step.is_required && (
          <Badge>Obbligatorio</Badge>
        )}
      </div>
    </CardHeader>
  );
};

export default FunnelStepHeader;
