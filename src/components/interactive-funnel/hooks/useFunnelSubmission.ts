
import { useState } from 'react';
import { submitFunnelStep } from '@/services/interactiveFunnelService';
import { useToast } from '@/hooks/use-toast';
import { ShareableFunnel, InteractiveFunnelStep } from '@/types/interactiveFunnel';

export const useFunnelSubmission = (
  funnel: ShareableFunnel,
  sessionId: string,
  onComplete: () => void
) => {
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const submitStep = async (
    step: InteractiveFunnelStep,
    formData: Record<string, any>,
    isLastStep: boolean,
    resetFormData: () => void,
    goToNextStep: () => void
  ) => {
    setSubmitting(true);
    
    try {
      await submitFunnelStep(
        funnel.id,
        step.id,
        formData,
        undefined,
        {
          session_id: sessionId,
          completion_time: Date.now(),
          source: 'public_link'
        }
      );

      if (isLastStep) {
        onComplete();
      } else {
        goToNextStep();
        resetFormData();
      }
    } catch (error) {
      console.error('Error submitting step:', error);
      toast({
        title: "Errore",
        description: "Errore nell'invio dei dati. Riprova.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return { submitting, submitStep };
};
