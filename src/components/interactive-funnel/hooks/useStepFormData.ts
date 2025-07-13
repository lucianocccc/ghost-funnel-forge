
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

  const loadStepData = (step: any) => {
    setStepData({
      title: step.title || '',
      description: step.description || '',
      step_type: step.step_type || 'form',
      is_required: step.is_required ?? true,
      fields_config: step.fields_config || [],
      settings: step.settings || {}
    });
  };

  return {
    stepData,
    updateStepData,
    resetStepData,
    loadStepData
  };
};
