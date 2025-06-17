
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { leadDataService } from '@/services/leadDataService';

export const useFormSubmission = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (formData: {
    nome: string;
    email: string;
    servizio: string;
    bio: string;
    source?: string;
  }) => {
    if (!formData.nome.trim() || !formData.email.trim() || !formData.servizio || !formData.bio.trim()) {
      toast({
        title: "Errore",
        description: "Tutti i campi sono obbligatori",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('Submitting lead data:', formData);
      
      const newLead = await leadDataService.createLead(formData);
      
      console.log('Lead created successfully:', newLead);
      
      toast({
        title: "Successo!",
        description: "La tua richiesta è stata inviata con successo. Ti contatteremo presto!",
      });
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore nell'invio. Riprova più tardi.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    handleSubmit,
    isSubmitting
  };
};
