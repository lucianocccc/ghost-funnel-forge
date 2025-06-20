
import { useState } from 'react';
import { FormFieldConfig, StepSettings } from '@/types/interactiveFunnel';

export const useStepFormData = () => {
  const [stepData, setStepData] = useState({
    title: '',
    description: '',
    step_type: 'form' as const,
    is_required: true,
    fields_config: [] as FormFieldConfig[],
    settings: {} as StepSettings
  });

  const updateStepData = (updates: any) => {
    setStepData(prev => ({ ...prev, ...updates }));
  };

  const resetStepData = () => {
    setStepData({
      title: '',
      description: '',
      step_type: 'form',
      is_required: true,
      fields_config: [],
      settings: {}
    });
  };

  return {
    stepData,
    updateStepData,
    resetStepData
  };
};
