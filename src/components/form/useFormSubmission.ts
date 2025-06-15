
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface FormData {
  nome: string;
  email: string;
  servizio: string;
  bio: string;
}

export const useFormSubmission = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const analyzeWithGPT = async (leadData: FormData) => {
    setIsAnalyzing(true);
    try {
      console.log('Starting GPT analysis for lead:', leadData.email);
      
      const { data, error } = await supabase.functions.invoke('analyze-lead', {
        body: { leadData }
      });

      if (error) {
        console.error('Error calling analyze-lead function:', error);
        
        // Gestione specifica per errori di quota OpenAI
        if (error.message && error.message.includes('insufficient_quota')) {
          toast({
            title: "Quota OpenAI Esaurita",
            description: "La quota OpenAI è esaurita. I tuoi dati sono stati salvati ma l'analisi non è disponibile al momento.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Analisi GPT",
            description: "Errore durante l'analisi semantica, ma i dati sono stati salvati.",
            variant: "destructive",
          });
        }
        return;
      }

      // Verifica se la risposta indica un errore
      if (data && !data.success) {
        console.error('Analysis failed:', data.error);
        
        if (data.error && data.error.includes('Quota OpenAI esaurita')) {
          toast({
            title: "Quota OpenAI Esaurita",
            description: "La quota OpenAI è esaurita. I tuoi dati sono stati salvati ma l'analisi non è disponibile al momento.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Analisi GPT",
            description: `Errore durante l'analisi: ${data.error}. I dati sono stati salvati.`,
            variant: "destructive",
          });
        }
        return;
      }

      console.log('GPT analysis completed:', data);
      
      if (data.success) {
        toast({
          title: "🧠 Analisi Completata!",
          description: "I tuoi dati sono stati analizzati da GPT per creare un funnel personalizzato.",
        });
      }
    } catch (error) {
      console.error('Error during GPT analysis:', error);
      toast({
        title: "Analisi GPT",
        description: "Errore durante l'analisi, ma i tuoi dati sono stati salvati.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const submitForm = async (formData: FormData, resetForm: () => void) => {
    setIsSubmitting(true);

    // Validazione base
    if (!formData.nome || !formData.email || !formData.servizio) {
      toast({
        title: "Errore",
        description: "Compila tutti i campi obbligatori",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      console.log('Tentativo di inserimento dati in Supabase:', formData);
      
      const { data, error } = await supabase
        .from('leads')
        .insert([
          {
            nome: formData.nome,
            email: formData.email,
            servizio: formData.servizio,
            bio: formData.bio || null
          }
        ])
        .select();

      if (error) {
        console.error('Errore Supabase:', error);
        toast({
          title: "Errore",
          description: `Errore durante il salvataggio: ${error.message}`,
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      console.log('Dati inseriti con successo:', data);
      
      toast({
        title: "Successo!",
        description: "I tuoi dati sono stati inviati correttamente. Analisi GPT in corso...",
      });

      // Reset form
      resetForm();

      // Trigger GPT analysis
      await analyzeWithGPT(formData);

    } catch (error) {
      console.error('Errore durante il salvataggio:', error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore imprevisto. Riprova più tardi.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    isAnalyzing,
    submitForm
  };
};
