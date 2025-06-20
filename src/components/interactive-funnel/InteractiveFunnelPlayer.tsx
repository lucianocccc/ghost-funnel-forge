
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ShareableFunnel } from '@/types/interactiveFunnel';
import { useFunnelValidation } from './hooks/useFunnelValidation';
import { useFunnelSubmission } from './hooks/useFunnelSubmission';
import { useFunnelSteps } from './hooks/useFunnelSteps';
import { useFunnelFormData } from './hooks/useFunnelFormData';
import { parseFieldsConfig } from './utils/fieldsConfigParser';
import FunnelProgressBar from './components/FunnelProgressBar';
import FunnelStepHeader from './components/FunnelStepHeader';
import FunnelStepContent from './components/FunnelStepContent';
import FunnelNavigationButtons from './components/FunnelNavigationButtons';

interface InteractiveFunnelPlayerProps {
  funnel: ShareableFunnel;
  onComplete: () => void;
}

const InteractiveFunnelPlayer: React.FC<InteractiveFunnelPlayerProps> = ({ funnel, onComplete }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [sessionId] = useState(() => crypto.randomUUID());

  const { formData, handleFieldChange, resetFormData } = useFunnelFormData();
  const { sortedSteps, currentStep, isLastStep, totalSteps, hasSteps } = useFunnelSteps(funnel, currentStepIndex);
  const { validateStep } = useFunnelValidation();
  const { submitting, submitStep } = useFunnelSubmission(funnel, sessionId, onComplete);

  console.log('Current step:', currentStep);
  console.log('Form data:', formData);

  // Handle empty or missing steps
  if (!hasSteps) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-gray-500">Questo funnel non ha passi configurati.</p>
        </CardContent>
      </Card>
    );
  }

  if (!currentStep) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-gray-500">Errore nel caricamento del passo corrente.</p>
        </CardContent>
      </Card>
    );
  }

  const validateCurrentStep = () => {
    if (!currentStep?.fields_config) {
      console.log('No fields config, step is valid');
      return true;
    }

    const fieldsConfig = parseFieldsConfig(currentStep.fields_config);
    console.log('Fields config for validation:', fieldsConfig);
    return validateStep(fieldsConfig, formData);
  };

  const handleNext = async () => {
    console.log('Handle next clicked');
    
    if (!validateCurrentStep()) {
      console.log('Validation failed');
      return;
    }

    console.log('Submitting step:', currentStep.id);
    await submitStep(
      currentStep,
      formData,
      isLastStep,
      resetFormData,
      () => {
        console.log('Going to next step');
        setCurrentStepIndex(prev => prev + 1);
      }
    );
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  return (
    <div className="space-y-6">
      <FunnelProgressBar 
        currentStepIndex={currentStepIndex}
        totalSteps={totalSteps}
      />

      <Card>
        <FunnelStepHeader 
          step={currentStep}
          stepIndex={currentStepIndex}
        />
        
        <CardContent className="space-y-6">
          <FunnelStepContent
            step={currentStep}
            formData={formData}
            onFieldChange={handleFieldChange}
          />

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
