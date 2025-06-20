
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
        {
          email: formData.email,
          name: formData.nome || formData.name
        },
        {
          session_id: sessionId,
          completion_time: Date.now(),
          source: 'public_link'
        }
      );

      console.log('Step submission successful:', result);

      toast({
        title: "Successo!",
        description: isLastStep ? "Dati inviati con successo!" : "Passo completato, continua al prossimo.",
      });

      if (isLastStep) {
        console.log('Last step completed, calling onComplete');
        onComplete();
      } else {
        console.log('Moving to next step');
        resetFormData();
        goToNextStep();
      }

    } catch (error) {
      console.error('Error submitting step:', error);
      
      let errorMessage = "Errore nell'invio dei dati. Riprova.";
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Errore",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return { submitting, submitStep };
};
