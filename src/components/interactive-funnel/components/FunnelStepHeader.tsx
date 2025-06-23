
import React from 'react';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { InteractiveFunnelStep } from '@/types/interactiveFunnel';
import { Badge } from '@/components/ui/badge';

interface FunnelStepHeaderProps {
  step: InteractiveFunnelStep;
  stepIndex: number;
}

const FunnelStepHeader: React.FC<FunnelStepHeaderProps> = ({
  step,
  stepIndex
}) => {
  const customerSettings = step.settings as any;
  
  // Use customer title if available, otherwise fall back to admin title
  const displayTitle = customerSettings?.customer_title || step.title;
  
  return (
    <CardHeader className="text-center space-y-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-xl">
      <div className="flex items-center justify-center gap-3">
        <Badge 
          variant="secondary" 
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium px-3 py-1"
        >
          Step {stepIndex + 1}
        </Badge>
      </div>
      
      <CardTitle className="text-xl md:text-2xl font-bold text-gray-900">
        {displayTitle}
      </CardTitle>
    </CardHeader>
  );
};

export default FunnelStepHeader;
