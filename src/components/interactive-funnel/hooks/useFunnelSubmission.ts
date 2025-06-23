
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
      sessionId,
      funnelIsPublic: funnel.is_public
    });

    // Check if the funnel is public before attempting submission
    if (!funnel.is_public) {
      console.error('Funnel is not public, cannot submit');
      toast({
        title: "Errore",
        description: "Questo funnel non è disponibile per le sottomissioni pubbliche.",
        variant: "destructive",
      });
      return;
    }

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
        // More specific error messages based on the error type
        if (error.message.includes('row-level security')) {
          errorMessage = "Questo funnel non è accessibile pubblicamente. Contatta l'amministratore.";
        } else if (error.message.includes('not found')) {
          errorMessage = "Funnel non trovato o non disponibile.";
        } else if (error.message.includes('not available')) {
          errorMessage = error.message;
        } else {
          errorMessage = error.message;
        }
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
