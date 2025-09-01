
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ShareableFunnel } from '@/types/interactiveFunnel';
import { intelligentLeadService } from '@/services/interactive-funnel/intelligentLeadService';

// Helper function to get browser info
const getBrowserInfo = (): string => {
  const userAgent = navigator.userAgent;
  if (userAgent.includes('Chrome')) return 'Chrome';
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Safari')) return 'Safari';
  if (userAgent.includes('Edge')) return 'Edge';
  return 'Unknown';
};

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
    console.log('🚀 Submitting step with intelligent processing:', {
      stepId: currentStep.id,
      funnelId: funnel.id,
      isLastStep,
      formData,
      fieldsConfig: currentStep.fields_config
    });

    setSubmitting(true);

    try {
      // Validate required fields - Fix: handle both array and object formats
      let fieldsConfig = [];
      if (Array.isArray(currentStep.fields_config)) {
        fieldsConfig = currentStep.fields_config;
      } else if (currentStep.fields_config?.fields) {
        fieldsConfig = currentStep.fields_config.fields;
      }

      console.log('📋 Parsed fields config:', fieldsConfig);

      // Skip validation if no fields are configured
      if (fieldsConfig.length > 0) {
        for (const field of fieldsConfig) {
          if (field.required && (!formData[field.id] || formData[field.id].toString().trim() === '')) {
            console.log('❌ Required field missing:', field.id, field.label);
            toast({
              title: "Campo obbligatorio",
              description: `Il campo "${field.label}" è obbligatorio`,
              variant: "destructive",
            });
            setSubmitting(false);
            return;
          }
        }
      } else {
        console.log('✅ No fields to validate, proceeding...');
      }

      console.log('✅ Field validation completed');

      // Prepare submission data matching the database schema exactly
      const submissionData = {
        funnel_id: funnel.id,
        step_id: currentStep.id,
        submission_data: {
          ...formData,
          step_title: currentStep.title,
          step_type: currentStep.step_type,
          completed_at: new Date().toISOString(),
        },
        user_name: formData.nome || formData.name || null,
        user_email: formData.email || null,
        session_id: sessionId,
        user_agent: navigator.userAgent,
        source: 'interactive_funnel',
        referrer_url: document.referrer || window.location.href,
        device_type: /Mobile|Android|iPhone|iPad/.test(navigator.userAgent) ? 'mobile' : 'desktop',
        browser_info: getBrowserInfo(),
        completion_time: Date.now(),
        lead_status: 'new'
      };

      console.log('📤 Submitting data:', submissionData);

      // Submit to database with better error handling
      const { data, error } = await supabase
        .from('funnel_submissions')
        .insert(submissionData)
        .select()
        .single();

      if (error) {
        console.error('❌ Submission error details:', {
          error,
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
          submissionData
        });
        throw error;
      }

      console.log('✅ Submission completed:', data.id);

      // Process with intelligent lead service if this is the last step or contains email
      if (isLastStep || formData.email) {
        try {
          console.log('🧠 Processing with intelligent lead service...');
          const leadProcessing = await intelligentLeadService.processLeadSubmission({
            funnel_id: funnel.id,
            step_id: currentStep.id,
            submission_data: formData,
            user_email: formData.email,
            user_name: formData.nome || formData.name,
            session_id: sessionId
          });

          console.log('🎯 Lead processing result:', leadProcessing);

          // Show appropriate success message based on lead qualification
          const qualificationMessages = {
            hot: "Perfetto! I tuoi dati sono stati analizzati e sei un candidato ideale. Ti contatteremo entro 2 ore!",
            warm: "Ottimo! Abbiamo analizzato il tuo profilo e ti contatteremo entro 24 ore con una proposta personalizzata.",
            cold: "Grazie! Ti invieremo materiale utile e resteremo in contatto per supportarti nel tuo percorso."
          };

          toast({
            title: isLastStep ? "Analisi Completata!" : "Dati Salvati",
            description: isLastStep 
              ? qualificationMessages[leadProcessing.qualification as keyof typeof qualificationMessages]
              : "Procedendo al prossimo passaggio...",
          });

        } catch (leadError) {
          console.error('❌ Lead processing error (non-blocking):', leadError);
          // Continue with normal flow even if lead processing fails
          toast({
            title: isLastStep ? "Completato!" : "Passaggio salvato",
            description: isLastStep 
              ? "I tuoi dati sono stati inviati con successo"
              : "Procedendo al prossimo passaggio...",
          });
        }
      } else {
        toast({
          title: "Passaggio salvato",
          description: "Procedendo al prossimo passaggio...",
        });
      }

      // Reset form data for next step
      resetFormData();

      // Call success callback
      onSuccess();

      // If last step, complete the funnel
      if (isLastStep) {
        setTimeout(() => {
          onComplete();
        }, 1000);
      }

    } catch (error) {
      console.error('❌ Error completing funnel:', error);
      
      let errorMessage = 'Si è verificato un errore. Riprova tra poco.';
      
      if (error?.message?.includes('violates row-level security')) {
        errorMessage = 'Errore di sicurezza: il funnel potrebbe non essere pubblico.';
        console.error('RLS Policy violation - check funnel public status and step validity');
      } else if (error?.message?.includes('violates foreign key constraint')) {
        errorMessage = 'Errore di configurazione del funnel. Contatta il supporto.';
      } else if (error?.message?.includes('duplicate key')) {
        errorMessage = 'Hai già completato questo passaggio.';
      } else if (error?.message?.includes('network') || error?.code === 'NETWORK_ERROR') {
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
