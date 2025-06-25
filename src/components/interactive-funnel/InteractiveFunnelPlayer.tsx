
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

  console.log('InteractiveFunnelPlayer rendered with funnel:', {
    funnelId: funnel.id,
    funnelName: funnel.name,
    isPublic: funnel.is_public,
    currentStepIndex,
    sessionId
  });

  const { formData, handleFieldChange, resetFormData } = useFunnelFormData();
  const { sortedSteps, currentStep, isLastStep, totalSteps, hasSteps } = useFunnelSteps(funnel, currentStepIndex);
  const { validateStep } = useFunnelValidation();
  const { submitting, submitStep } = useFunnelSubmission(funnel, sessionId, onComplete);

  console.log('Current step details:', {
    currentStep: currentStep ? {
      id: currentStep.id,
      title: currentStep.title,
      stepType: currentStep.step_type,
      stepOrder: currentStep.step_order,
      isRequired: currentStep.is_required,
      fieldsConfig: currentStep.fields_config
    } : null,
    currentStepIndex,
    totalSteps,
    isLastStep,
    hasSteps
  });
  console.log('Form data:', formData);
  console.log('Submitting state:', submitting);

  // Handle empty or missing steps
  if (!hasSteps) {
    console.log('No steps available in funnel');
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-gray-500">Questo funnel non ha passi configurati.</p>
        </CardContent>
      </Card>
    );
  }

  if (!currentStep) {
    console.error('Current step is null/undefined at index:', currentStepIndex);
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-gray-500">Errore nel caricamento del passo corrente.</p>
          <p className="text-xs text-gray-400 mt-2">
            Step index: {currentStepIndex}, Total steps: {totalSteps}
          </p>
        </CardContent>
      </Card>
    );
  }

  const validateCurrentStep = () => {
    console.log('Validating current step...');
    
    if (!currentStep?.fields_config) {
      console.log('No fields config, step is valid');
      return true;
    }

    const fieldsConfig = parseFieldsConfig(currentStep.fields_config);
    console.log('Fields config for validation:', fieldsConfig);
    
    const isValid = validateStep(fieldsConfig, formData);
    console.log('Validation result:', isValid);
    
    return isValid;
  };

  const handleNext = async () => {
    console.log('=== HANDLE NEXT CLICKED ===');
    console.log('Current step:', currentStep?.id);
    console.log('Current form data:', formData);
    console.log('Is last step:', isLastStep);
    console.log('Submitting state:', submitting);
    
    if (submitting) {
      console.log('Already submitting, ignoring click');
      return;
    }
    
    const isValid = validateCurrentStep();
    if (!isValid) {
      console.log('Validation failed, stopping submission');
      return;
    }

    console.log('Validation passed, proceeding with submission');
    
    try {
      await submitStep(
        currentStep,
        formData,
        isLastStep,
        resetFormData,
        () => {
          console.log('Moving to next step from index', currentStepIndex, 'to', currentStepIndex + 1);
          setCurrentStepIndex(prev => {
            const newIndex = prev + 1;
            console.log('Step index updated from', prev, 'to', newIndex);
            return newIndex;
          });
        }
      );
    } catch (error) {
      console.error('Error in handleNext:', error);
    }
  };

  const handleBack = () => {
    console.log('Going back from step index', currentStepIndex);
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => {
        const newIndex = prev - 1;
        console.log('Step index updated from', prev, 'to', newIndex);
        return newIndex;
      });
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

      {/* Debug info (rimuovi in produzione) */}
      <Card className="bg-gray-50 border-dashed">
        <CardContent className="py-4">
          <h4 className="text-sm font-medium mb-2">Debug Info:</h4>
          <div className="text-xs space-y-1">
            <p>Funnel ID: {funnel.id}</p>
            <p>Current Step: {currentStepIndex + 1}/{totalSteps}</p>
            <p>Step ID: {currentStep?.id}</p>
            <p>Is Public: {funnel.is_public ? 'Yes' : 'No'}</p>
            <p>Submitting: {submitting ? 'Yes' : 'No'}</p>
            <p>Form Data: {JSON.stringify(formData)}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InteractiveFunnelPlayer;
