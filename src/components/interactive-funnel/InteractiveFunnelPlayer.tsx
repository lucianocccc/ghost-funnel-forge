
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

  console.log('Current step:', currentStep);
  console.log('Form data:', formData);

  // Se non ci sono passi configurati
  if (sortedSteps.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-gray-500">Questo funnel non ha passi configurati.</p>
        </CardContent>
      </Card>
    );
  }

  // Se non c'è uno step corrente
  if (!currentStep) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-gray-500">Errore nel caricamento del passo corrente.</p>
        </CardContent>
      </Card>
    );
  }

  const handleFieldChange = (fieldId: string, value: any) => {
    console.log('Field change:', fieldId, value);
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const validateCurrentStep = () => {
    // Se non ci sono configurazioni dei campi, considera il passo valido
    if (!currentStep?.fields_config) {
      console.log('No fields config, step is valid');
      return true;
    }

    let fieldsConfig: FormFieldConfig[] = [];
    try {
      // Prova a convertire fields_config in FormFieldConfig[]
      if (Array.isArray(currentStep.fields_config)) {
        fieldsConfig = currentStep.fields_config as FormFieldConfig[];
      } else if (currentStep.fields_config && typeof currentStep.fields_config === 'object') {
        // Se è un oggetto, prova a estrarre un array
        const configObj = currentStep.fields_config as any;
        if (Array.isArray(configObj.fields)) {
          fieldsConfig = configObj.fields;
        }
      }
    } catch (error) {
      console.error('Error parsing fields config:', error);
      return true; // Se c'è un errore nel parsing, permetti di continuare
    }

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
      () => {
        console.log('Resetting form data');
        setFormData({});
      },
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

  // Gestione dei campi del form
  let fieldsConfig: FormFieldConfig[] = [];
  let hasFields = false;

  try {
    if (currentStep.fields_config) {
      if (Array.isArray(currentStep.fields_config)) {
        fieldsConfig = currentStep.fields_config as FormFieldConfig[];
        hasFields = fieldsConfig.length > 0;
      } else if (typeof currentStep.fields_config === 'object') {
        const configObj = currentStep.fields_config as any;
        if (Array.isArray(configObj.fields)) {
          fieldsConfig = configObj.fields;
          hasFields = fieldsConfig.length > 0;
        }
      }
    }
  } catch (error) {
    console.error('Error processing fields config:', error);
  }

  console.log('Rendered fields config:', fieldsConfig);
  console.log('Has fields:', hasFields);

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
          {/* Mostra sempre qualcosa per il contenuto */}
          {hasFields ? (
            <FunnelFormFields
              fieldsConfig={fieldsConfig}
              formData={formData}
              onFieldChange={handleFieldChange}
            />
          ) : (
            <div className="space-y-4">
              <p className="text-gray-600">
                {currentStep.description || "Clicca 'Avanti' per continuare al prossimo passo."}
              </p>
              
              {/* Aggiungi alcuni campi di esempio se non ci sono configurazioni */}
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">
                  Questo passo non ha campi configurati. Ecco alcuni campi di esempio:
                </p>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nome *
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-golden"
                      placeholder="Inserisci il tuo nome"
                      value={formData.nome || ''}
                      onChange={(e) => handleFieldChange('nome', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-golden"
                      placeholder="Inserisci la tua email"
                      value={formData.email || ''}
                      onChange={(e) => handleFieldChange('email', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Messaggio
                    </label>
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-golden min-h-[100px]"
                      placeholder="Inserisci il tuo messaggio"
                      value={formData.messaggio || ''}
                      onChange={(e) => handleFieldChange('messaggio', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
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
