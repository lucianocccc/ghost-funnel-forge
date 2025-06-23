
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Circle } from 'lucide-react';

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
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="space-y-4">
        {/* Progress visualization */}
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-gray-700">
            Progresso
          </span>
          <span className="text-blue-600 font-semibold">
            {currentStepIndex + 1} di {totalSteps}
          </span>
        </div>
        
        <Progress 
          value={progressPercentage} 
          className="h-3 bg-gray-100"
        />
        
        {/* Step indicators */}
        <div className="flex justify-between items-center">
          {Array.from({ length: totalSteps }, (_, index) => (
            <div key={index} className="flex flex-col items-center gap-2">
              <div className="relative">
                {index <= currentStepIndex ? (
                  <CheckCircle className="w-6 h-6 text-blue-600 fill-current" />
                ) : (
                  <Circle className="w-6 h-6 text-gray-300" />
                )}
              </div>
              <span className={`text-xs ${
                index <= currentStepIndex ? 'text-blue-600 font-medium' : 'text-gray-400'
              }`}>
                Step {index + 1}
              </span>
            </div>
          ))}
        </div>
        
        {/* Motivational message */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            {currentStepIndex === totalSteps - 1 
              ? "🎉 Ci siamo quasi! Un ultimo step e hai finito!"
              : `✨ Ottimo lavoro! Ancora ${totalSteps - currentStepIndex - 1} step da completare.`
            }
          </p>
        </div>
      </div>
    </div>
  );
};

export default FunnelProgressBar;
