
import React from 'react';
import { Progress } from '@/components/ui/progress';

interface FunnelProgressBarProps {
  currentStepIndex: number;
  totalSteps: number;
}

const FunnelProgressBar: React.FC<FunnelProgressBarProps> = ({ 
  currentStepIndex, 
  totalSteps 
}) => {
  const progressPercentage = ((currentStepIndex + 1) / totalSteps) * 100;

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm text-gray-600">
        <span>Passo {currentStepIndex + 1} di {totalSteps}</span>
        <span>{Math.round(progressPercentage)}% completato</span>
      </div>
      <Progress value={progressPercentage} className="h-2" />
    </div>
  );
};

export default FunnelProgressBar;
