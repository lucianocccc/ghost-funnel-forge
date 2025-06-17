
import React from 'react';

interface SharedFunnelStepsProps {
  steps: string[];
}

const SharedFunnelSteps: React.FC<SharedFunnelStepsProps> = ({ steps }) => {
  if (steps.length === 0) return null;

  return (
    <div>
      <h3 className="text-xl font-bold text-white mb-4">Step del Funnel</h3>
      <div className="space-y-4">
        {steps.map((step: string, index: number) => (
          <div key={index} className="flex items-start gap-4 p-4 bg-gray-900 rounded-lg">
            <div className="bg-golden text-black w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
              {index + 1}
            </div>
            <div className="flex-1">
              <p className="text-gray-300 leading-relaxed">
                {step.replace(/^\d+\.\s*/, '')}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SharedFunnelSteps;
