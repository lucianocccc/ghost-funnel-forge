
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
    console.log('=== STARTING STEP SUBMISSION ===');
    console.log('Step details:', {
      stepId: step.id,
      stepTitle: step.title,
      stepType: step.step_type,
      stepOrder: step.step_order,
      isRequired: step.is_required
    });
    console.log('Funnel details:', {
      funnelId: funnel.id,
      funnelName: funnel.name,
      isPublic: funnel.is_public,
      shareToken: funnel.share_token
    });
    console.log('Submission details:', {
      formData,
      isLastStep,
      sessionId
    });

    // Check if the funnel is public before attempting submission
    if (!funnel.is_public) {
      console.error('SUBMISSION BLOCKED: Funnel is not public');
      toast({
        title: "Errore",
        description: "Questo funnel non è disponibile per le sottomissioni pubbliche.",
        variant: "destructive",
      });
      return;
    }

    console.log('Funnel is public, proceeding with submission...');
    setSubmitting(true);
    
    try {
      console.log('Calling submitFunnelStep service...');
      
      const submissionPayload = {
        funnelId: funnel.id,
        stepId: step.id,
        formData,
        userInfo: {
          email: formData.email,
          name: formData.nome || formData.name
        },
        analytics: {
          session_id: sessionId,
          completion_time: Date.now(),
          source: 'public_link'
        }
      };
      
      console.log('Submission payload:', submissionPayload);
      
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

      console.log('=== SUBMISSION SUCCESSFUL ===');
      console.log('Result:', result);

      toast({
        title: "Successo!",
        description: isLastStep ? "Dati inviati con successo!" : "Passo completato, continua al prossimo.",
      });

      if (isLastStep) {
        console.log('Last step completed, calling onComplete callback');
        onComplete();
      } else {
        console.log('Not last step, moving to next step');
        console.log('Resetting form data...');
        resetFormData();
        console.log('Calling goToNextStep...');
        goToNextStep();
      }

    } catch (error) {
      console.error('=== SUBMISSION FAILED ===');
      console.error('Error details:', error);
      
      let errorMessage = "Errore nell'invio dei dati. Riprova.";
      
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        
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
      console.log('Setting submitting state to false');
      setSubmitting(false);
    }
  };

  return { submitting, submitStep };
};
