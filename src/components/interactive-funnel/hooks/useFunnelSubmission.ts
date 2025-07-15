
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ShareableFunnel } from '@/types/interactiveFunnel';

export const useFunnelSubmission = (
  funnel: ShareableFunnel,
  sessionId: string,
  onComplete: () => void
) => {
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const submitStep = async (
    currentStep: any,
    formData: Record<string, any>,
    isLastStep: boolean,
    resetFormData: () => void,
    onSuccess: () => void
  ) => {
    console.log('🚀 Submitting step:', {
      stepId: currentStep.id,
      funnelId: funnel.id,
      isLastStep,
      formData
    });

    setSubmitting(true);

    try {
      // Valida i campi richiesti
      const fieldsConfig = Array.isArray(currentStep.fields_config) 
        ? currentStep.fields_config 
        : currentStep.fields_config?.fields || [];

      for (const field of fieldsConfig) {
        if (field.required && (!formData[field.id] || formData[field.id].toString().trim() === '')) {
          toast({
            title: "Campo obbligatorio",
            description: `Il campo "${field.label}" è obbligatorio`,
            variant: "destructive",
          });
          setSubmitting(false);
          return;
        }
      }

      console.log('✅ Validazione campi completata');

      // Prepara i dati per la submission
      const submissionData = {
        funnel_id: funnel.id,
        step_id: currentStep.id,
        session_id: sessionId,
        submission_data: {
          ...formData,
          step_title: currentStep.title,
          step_type: currentStep.step_type,
          completed_at: new Date().toISOString(),
          user_agent: navigator.userAgent,
          referrer: document.referrer || 'direct'
        },
        user_name: formData.nome || formData.name || null,
        user_email: formData.email || null,
        completion_time: Date.now(),
        source: 'interactive_funnel',
        device_type: /Mobile|Android|iPhone|iPad/.test(navigator.userAgent) ? 'mobile' : 'desktop'
      };

      console.log('📤 Invio submission:', submissionData);

      // Invia la submission
      const { data, error } = await supabase
        .from('funnel_submissions')
        .insert(submissionData)
        .select()
        .single();

      if (error) {
        console.error('❌ Errore submission:', error);
        throw error;
      }

      console.log('✅ Submission completata:', data.id);

      // Mostra messaggio di successo
      toast({
        title: isLastStep ? "Completato!" : "Passaggio salvato",
        description: isLastStep 
          ? "I tuoi dati sono stati inviati con successo"
          : "Procedendo al prossimo passaggio...",
      });

      // Reset form data per il prossimo step
      resetFormData();

      // Chiama callback di successo
      onSuccess();

      // Se è l'ultimo step, chiama onComplete
      if (isLastStep) {
        setTimeout(() => {
          onComplete();
        }, 1000);
      }

    } catch (error) {
      console.error('❌ Error completing funnel:', error);
      
      let errorMessage = 'Si è verificato un errore. Riprova tra poco.';
      
      if (error.message?.includes('violates foreign key constraint')) {
        errorMessage = 'Errore di configurazione del funnel. Contatta il supporto.';
      } else if (error.message?.includes('duplicate key')) {
        errorMessage = 'Hai già completato questo passaggio.';
      } else if (error.message?.includes('network')) {
        errorMessage = 'Problema di connessione. Verifica la tua connessione internet.';
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

  return {
    submitting,
    submitStep
  };
};
