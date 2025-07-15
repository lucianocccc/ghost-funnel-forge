
import React, { useState } from 'react';
import { ShareableFunnel } from '@/types/interactiveFunnel';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { useFunnelSteps } from '../hooks/useFunnelSteps';
import StepRenderer from './StepRenderer';

interface ConsumerFriendlyFunnelPlayerProps {
  funnel: ShareableFunnel;
  onComplete: () => void;
}

const ConsumerFriendlyFunnelPlayer: React.FC<ConsumerFriendlyFunnelPlayerProps> = ({ 
  funnel, 
  onComplete 
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>({});
  
  const { sortedSteps, currentStep, isLastStep, totalSteps, hasSteps } = useFunnelSteps(funnel, currentStepIndex);

  console.log('ConsumerFriendlyFunnelPlayer rendered:', {
    funnelId: funnel.id,
    currentStepIndex,
    totalSteps,
    hasSteps,
    currentStep: currentStep?.id,
    sortedSteps: sortedSteps.map(s => ({ id: s.id, title: s.title, step_type: s.step_type }))
  });

  if (!hasSteps) {
    console.error('No steps available in ConsumerFriendlyFunnelPlayer');
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="text-center py-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Funnel Non Configurato
            </h2>
            <p className="text-gray-600 mb-4">
              Questo funnel non ha ancora step configurati.
            </p>
            <Button onClick={() => window.history.back()}>
              Torna Indietro
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleNext = () => {
    console.log('Moving to next step from:', currentStepIndex);
    if (isLastStep) {
      console.log('Completing funnel');
      onComplete();
    } else {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    console.log('Moving to previous step from:', currentStepIndex);
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const handleStepData = (stepId: string, data: any) => {
    console.log('Updating step data:', { stepId, data });
    setFormData(prev => ({ ...prev, [stepId]: data }));
  };

  const progressPercentage = ((currentStepIndex + 1) / totalSteps) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              Passo {currentStepIndex + 1} di {totalSteps}
            </span>
            <span className="text-sm text-gray-500">
              {Math.round(progressPercentage)}% completato
            </span>
          </div>
          <Progress value={progressPercentage} className="h-3" />
        </div>

        {/* Current Step Content */}
        <Card className="mb-8">
          <CardContent className="p-8">
            {currentStep && (
              <StepRenderer
                step={currentStep}
                onDataChange={(data) => handleStepData(currentStep.id, data)}
                existingData={formData[currentStep.id]}
              />
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStepIndex === 0}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Precedente
          </Button>

          <div className="flex gap-2">
            {sortedSteps.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full ${
                  index === currentStepIndex
                    ? 'bg-primary'
                    : index < currentStepIndex
                    ? 'bg-primary/60'
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          <Button
            onClick={handleNext}
            className="flex items-center gap-2"
          >
            {isLastStep ? 'Completa' : 'Avanti'}
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConsumerFriendlyFunnelPlayer;
