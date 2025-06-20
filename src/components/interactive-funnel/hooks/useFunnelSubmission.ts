
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
    console.log('Starting step submission:', {
      stepId: step.id,
      funnelId: funnel.id,
      formData,
      isLastStep,
      sessionId
    });

    setSubmitting(true);
    
    try {
      console.log('Calling submitFunnelStep service...');
      
      const result = await submitFunnelStep(
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

      console.log('Step submission successful:', result);

      if (isLastStep) {
        console.log('Last step completed, calling onComplete');
        onComplete();
      } else {
        console.log('Moving to next step');
        goToNextStep();
        resetFormData();
      }

      toast({
        title: "Successo!",
        description: isLastStep ? "Dati inviati con successo!" : "Passo completato, continua al prossimo.",
      });

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
