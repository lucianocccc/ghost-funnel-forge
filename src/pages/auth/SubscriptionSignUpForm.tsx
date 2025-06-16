
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CreditCard } from 'lucide-react';
import { cleanupAuthState } from './authUtils';
import { supabase } from '@/integrations/supabase/client';
import PlanSummary from './components/PlanSummary';
import PersonalDataSection from './components/PersonalDataSection';
import CompanyDataSection from './components/CompanyDataSection';
import ConsentSection from './components/ConsentSection';

interface SubscriptionSignUpFormProps {
  selectedPlan: string;
}

const SubscriptionSignUpForm: React.FC<SubscriptionSignUpFormProps> = ({ selectedPlan }) => {
  // Dati personali
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');

  // Dati aziendali
  const [companyName, setCompanyName] = useState('');
  const [vatNumber, setVatNumber] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('IT');
  const [province, setProvince] = useState('');

  // Preferenze
  const [billingType, setBillingType] = useState('monthly');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [newsletter, setNewsletter] = useState(true);

  const [signupInfo, setSignupInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const planDetails = {
    starter: { name: 'Starter', price: 29, description: 'Perfetto per iniziare' },
    professional: { name: 'Professional', price: 79, description: 'La scelta più popolare' },
    enterprise: { name: 'Enterprise', price: 199, description: 'Per team e aziende' }
  };

  const currentPlan = planDetails[selectedPlan as keyof typeof planDetails] || planDetails.professional;

  // Checkbox handlers to properly handle CheckedState
  const handleAgreeTermsChange = (checked: boolean | "indeterminate") => {
    setAgreeTerms(checked === true);
  };

  const handleAgreePrivacyChange = (checked: boolean | "indeterminate") => {
    setAgreePrivacy(checked === true);
  };

  const handleNewsletterChange = (checked: boolean | "indeterminate") => {
    setNewsletter(checked === true);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
      console.log('Starting subscription signup for:', email);
      
      const subscriptionData = {
        // Dati personali
        email,
        password,
        first_name: firstName,
        last_name: lastName,
        phone,
        
        // Dati aziendali
        company_name: companyName,
        vat_number: vatNumber,
        address,
        city,
        postal_code: postalCode,
        province,
        country,
        
        // Dati sottoscrizione
        selected_plan: selectedPlan,
        billing_type: billingType,
        newsletter_consent: newsletter,
        
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

  return (
    <form onSubmit={handleSignUp} className="space-y-6">
      <PlanSummary
        selectedPlan={selectedPlan}
        billingType={billingType}
        onBillingTypeChange={setBillingType}
      />

      <PersonalDataSection
        firstName={firstName}
        lastName={lastName}
        email={email}
        password={password}
        phone={phone}
        onFirstNameChange={setFirstName}
        onLastNameChange={setLastName}
        onEmailChange={setEmail}
        onPasswordChange={setPassword}
        onPhoneChange={setPhone}
      />

      <CompanyDataSection
        companyName={companyName}
        vatNumber={vatNumber}
        address={address}
        city={city}
        postalCode={postalCode}
        country={country}
        province={province}
        onCompanyNameChange={setCompanyName}
        onVatNumberChange={setVatNumber}
        onAddressChange={setAddress}
        onCityChange={setCity}
        onPostalCodeChange={setPostalCode}
        onCountryChange={setCountry}
        onProvinceChange={setProvince}
      />

      <ConsentSection
        agreeTerms={agreeTerms}
        agreePrivacy={agreePrivacy}
        newsletter={newsletter}
        onAgreeTermsChange={handleAgreeTermsChange}
        onAgreePrivacyChange={handleAgreePrivacyChange}
        onNewsletterChange={handleNewsletterChange}
      />

      <Button 
        type="submit" 
        className="w-full bg-golden hover:bg-yellow-600 text-black text-lg py-3"
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Creazione account in corso...
          </>
        ) : (
          <>
            <CreditCard className="w-4 h-4 mr-2" />
            Completa Sottoscrizione - €{currentPlan.price}/{billingType === 'monthly' ? 'mese' : 'anno'}
          </>
        )}
      </Button>

      {signupInfo && (
        <div className="bg-yellow-100 border border-yellow-300 p-3 rounded text-yellow-800 mt-2 text-sm">
          {signupInfo}
        </div>
      )}
    </form>
  );
};

export default SubscriptionSignUpForm;
