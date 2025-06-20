
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ShareableFunnel, FormFieldConfig } from '@/types/interactiveFunnel';
import { useFunnelValidation } from './hooks/useFunnelValidation';
import { useFunnelSubmission } from './hooks/useFunnelSubmission';
import FunnelProgressBar from './components/FunnelProgressBar';
import FunnelStepHeader from './components/FunnelStepHeader';
import FunnelFormFields from './components/FunnelFormFields';
import FunnelNavigationButtons from './components/FunnelNavigationButtons';

interface InteractiveFunnelPlayerProps {
  funnel: ShareableFunnel;
  onComplete: () => void;
}

const InteractiveFunnelPlayer: React.FC<InteractiveFunnelPlayerProps> = ({ funnel, onComplete }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [sessionId] = useState(() => crypto.randomUUID());

  const { validateStep } = useFunnelValidation();
  const { submitting, submitStep } = useFunnelSubmission(funnel, sessionId, onComplete);

  const sortedSteps = funnel.interactive_funnel_steps?.sort((a, b) => a.step_order - b.step_order) || [];
  const currentStep = sortedSteps[currentStepIndex];
  const isLastStep = currentStepIndex === sortedSteps.length - 1;

  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const validateCurrentStep = () => {
    if (!currentStep?.fields_config) {
      return true;
    }

    const fieldsConfig = currentStep.fields_config as unknown as FormFieldConfig[];
    return validateStep(fieldsConfig, formData);
  };

  const handleNext = async () => {
    if (!validateCurrentStep()) {
      return;
    }

    await submitStep(
      currentStep,
      formData,
      isLastStep,
      () => setFormData({}),
      () => setCurrentStepIndex(prev => prev + 1)
    );
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  if (sortedSteps.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-gray-500">Questo funnel non ha passi configurati.</p>
        </CardContent>
      </Card>
    );
  }

  const fieldsConfig = currentStep.fields_config as unknown as FormFieldConfig[];
  const hasFields = fieldsConfig && Array.isArray(fieldsConfig);

  return (
    <div className="space-y-6">
      <FunnelProgressBar 
        currentStepIndex={currentStepIndex}
        totalSteps={sortedSteps.length}
      />

      <Card>
        <FunnelStepHeader 
          step={currentStep}
          stepIndex={currentStepIndex}
        />
        
        <CardContent className="space-y-6">
          {hasFields && (
            <FunnelFormFields
              fieldsConfig={fieldsConfig}
              formData={formData}
              onFieldChange={handleFieldChange}
            />
          )}

          <FunnelNavigationButtons
            currentStepIndex={currentStepIndex}
            isLastStep={isLastStep}
            submitting={submitting}
            onBack={handleBack}
            onNext={handleNext}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default InteractiveFunnelPlayer;
