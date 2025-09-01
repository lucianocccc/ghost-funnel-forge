import { useMemo } from 'react';
import { ShareableFunnel } from '@/types/interactiveFunnel';

export const useFunnelSteps = (funnel: ShareableFunnel, currentStepIndex: number) => {
  // Sort steps by step_order
  const sortedSteps = useMemo(() => {
    if (!funnel.interactive_funnel_steps || !Array.isArray(funnel.interactive_funnel_steps)) {
      return [];
    }
    
    return [...funnel.interactive_funnel_steps].sort((a, b) => {
      return (a.step_order || 0) - (b.step_order || 0);
    });
  }, [funnel.interactive_funnel_steps]);

  // Get current step
  const currentStep = useMemo(() => {
    return sortedSteps[currentStepIndex] || null;
  }, [sortedSteps, currentStepIndex]);

  // Calculate derived properties
  const totalSteps = sortedSteps.length;
  const hasSteps = totalSteps > 0;
  const isLastStep = currentStepIndex === totalSteps - 1;
  const isFirstStep = currentStepIndex === 0;

  return {
    sortedSteps,
    currentStep,
    totalSteps,
    hasSteps,
    isLastStep,
    isFirstStep
  };
};