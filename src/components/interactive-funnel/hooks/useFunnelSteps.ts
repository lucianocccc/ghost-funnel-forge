
import { useMemo } from 'react';
import { ShareableFunnel } from '@/types/interactiveFunnel';

export const useFunnelSteps = (funnel: ShareableFunnel, currentStepIndex: number) => {
  const sortedSteps = useMemo(() => {
    return funnel.interactive_funnel_steps?.sort((a, b) => a.step_order - b.step_order) || [];
  }, [funnel.interactive_funnel_steps]);

  const currentStep = sortedSteps[currentStepIndex];
  const isLastStep = currentStepIndex === sortedSteps.length - 1;
  const totalSteps = sortedSteps.length;

  return {
    sortedSteps,
    currentStep,
    isLastStep,
    totalSteps,
    hasSteps: totalSteps > 0
  };
};
