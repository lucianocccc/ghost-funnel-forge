
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { cleanupAuthState } from '../authUtils';
import { supabase } from '@/integrations/supabase/client';
import { getCurrentPlan } from '../utils/planConfig';

interface SubscriptionFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  companyName: string;
  vatNumber: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  province: string;
  selectedPlan: string;
  billingType: string;
  newsletter: boolean;
}

export const useSubscriptionSignUp = () => {
  const [loading, setLoading] = useState(false);
  const [signupInfo, setSignupInfo] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSignUp = async (formData: SubscriptionFormData, agreeTerms: boolean, agreePrivacy: boolean) => {
    if (!agreeTerms || !agreePrivacy) {
      toast({
        title: "Termini e Privacy",
        description: "Devi accettare i termini di servizio e la privacy policy per continuare.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    cleanupAuthState();
    setSignupInfo(null);

    try {
      console.log('Starting subscription signup for:', formData.email);
      
      const subscriptionData = {
        // Dati personali
        email: formData.email,
        password: formData.password,
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: formData.phone,
        
        // Dati aziendali
        company_name: formData.companyName,
        vat_number: formData.vatNumber,
        address: formData.address,
        city: formData.city,
        postal_code: formData.postalCode,
        province: formData.province,
        country: formData.country,
        
        // Dati sottoscrizione
        selected_plan: formData.selectedPlan,
        billing_type: formData.billingType,
        newsletter_consent: formData.newsletter,
        
        redirectTo: `${window.location.origin}/`,
      };

      const { data, error } = await supabase.functions.invoke(
        "signup",
        {
          body: subscriptionData,
        }
      );

      console.log('Subscription signup response:', { data, error });

      if (error) {
        console.error('Subscription signup error:', error);
        
        if (error.name === 'FunctionsHttpError') {
          try {
            const response = await fetch(`https://velasbzeojyjsysiuftf.supabase.co/functions/v1/signup`, {
              method: 'POST',
              headers: {
                'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZlbGFzYnplb2p5anN5c2l1ZnRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwMTYxNDIsImV4cCI6MjA2NDU5MjE0Mn0.1yYgkc1RiDl7Wis-nOAyDunn8l8FDRXY-3eQiCFyhBc',
                'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZlbGFzYnplb2p5anN5c2l1ZnRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwMTYxNDIsImV4cCI6MjA2NDU5MjE0Mn0.1yYgkc1RiDl7Wis-nOAyDunn8l8FDRXY-3eQiCFyhBc`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(subscriptionData),
            });

            if (response.status === 409) {
              toast({
                title: "Utente già registrato",
                description: "Questo indirizzo email è già in uso. Effettua il login o resetta la password.",
                variant: "destructive",
              });
              return;
            }
          } catch (fetchError) {
            console.error('Error parsing response:', fetchError);
          }
        }
        
        let errorMessage = "Si è verificato un errore durante la registrazione.";
        
        if (error.message && error.message.toLowerCase().includes('user already registered')) {
          toast({
            title: "Utente già registrato",
            description: "Questo indirizzo email è già in uso. Effettua il login o resetta la password.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Errore di Registrazione",
            description: errorMessage,
            variant: "destructive",
          });
        }
        return;
      }

      // Success case
      console.log('Subscription signup successful');
      const currentPlan = getCurrentPlan(formData.selectedPlan);
      setSignupInfo(
        `Registrazione completata per il piano ${currentPlan.name}! Controlla la tua email e clicca sul link per confermare il tuo account e accedere alla dashboard.`
      );
      toast({
        title: "Sottoscrizione Creata",
        description: "Controlla la tua email per il link di conferma.",
      });

    } catch (error: any) {
      console.error('Network error during subscription signup:', error);
      toast({
        title: "Errore di Rete",
        description: error.message || "Impossibile comunicare con il server. Riprova più tardi.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    signupInfo,
    handleSignUp
  };
};
