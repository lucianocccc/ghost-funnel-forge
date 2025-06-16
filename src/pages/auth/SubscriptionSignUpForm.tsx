import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Mail, Lock, User, Building, MapPin, Phone, CreditCard } from 'lucide-react';
import { cleanupAuthState } from './authUtils';
import { supabase } from '@/integrations/supabase/client';

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
      {/* Piano selezionato */}
      <div className="bg-golden/10 border border-golden rounded-lg p-4 mb-6">
        <h3 className="font-bold text-lg text-black mb-2">Piano Selezionato: {currentPlan.name}</h3>
        <p className="text-gray-700 mb-2">{currentPlan.description}</p>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-black">€{currentPlan.price}</span>
          <Select value={billingType} onValueChange={setBillingType}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Mensile</SelectItem>
              <SelectItem value="yearly">Annuale (-15%)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Dati personali */}
      <div className="space-y-4">
        <h4 className="font-semibold text-black border-b pb-2">Dati Personali</h4>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName" className="text-black">Nome *</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="firstName"
                type="text"
                placeholder="Nome"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                className="pl-10"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName" className="text-black">Cognome *</Label>
            <Input
              id="lastName"
              type="text"
              placeholder="Cognome"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-black">Email *</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              id="email"
              type="email"
              placeholder="inserisci la tua email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="pl-10"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-black">Password *</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              id="password"
              type="password"
              placeholder="crea una password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="pl-10"
              minLength={6}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className="text-black">Telefono</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              id="phone"
              type="tel"
              placeholder="+39 123 456 7890"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Dati aziendali */}
      <div className="space-y-4">
        <h4 className="font-semibold text-black border-b pb-2">Dati Aziendali</h4>
        
        <div className="space-y-2">
          <Label htmlFor="companyName" className="text-black">Nome Azienda</Label>
          <div className="relative">
            <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              id="companyName"
              type="text"
              placeholder="Nome della tua azienda"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="vatNumber" className="text-black">Partita IVA</Label>
          <Input
            id="vatNumber"
            type="text"
            placeholder="IT12345678901"
            value={vatNumber}
            onChange={(e) => setVatNumber(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="address" className="text-black">Indirizzo</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              id="address"
              type="text"
              placeholder="Via/Piazza e numero civico"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="city" className="text-black">Città</Label>
            <Input
              id="city"
              type="text"
              placeholder="Città"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="postalCode" className="text-black">CAP</Label>
            <Input
              id="postalCode"
              type="text"
              placeholder="00000"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="province" className="text-black">Provincia</Label>
            <Input
              id="province"
              type="text"
              placeholder="RM"
              value={province}
              onChange={(e) => setProvince(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="country" className="text-black">Paese</Label>
            <Select value={country} onValueChange={setCountry}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="IT">Italia</SelectItem>
                <SelectItem value="US">Stati Uniti</SelectItem>
                <SelectItem value="GB">Regno Unito</SelectItem>
                <SelectItem value="DE">Germania</SelectItem>
                <SelectItem value="FR">Francia</SelectItem>
                <SelectItem value="ES">Spagna</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Consensi */}
      <div className="space-y-4">
        <h4 className="font-semibold text-black border-b pb-2">Consensi</h4>
        
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="agreeTerms" 
            checked={agreeTerms}
            onCheckedChange={handleAgreeTermsChange}
            required
          />
          <Label htmlFor="agreeTerms" className="text-sm text-black">
            Accetto i <span className="text-golden underline cursor-pointer">Termini di Servizio</span> *
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox 
            id="agreePrivacy" 
            checked={agreePrivacy}
            onCheckedChange={handleAgreePrivacyChange}
            required
          />
          <Label htmlFor="agreePrivacy" className="text-sm text-black">
            Accetto la <span className="text-golden underline cursor-pointer">Privacy Policy</span> *
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox 
            id="newsletter" 
            checked={newsletter}
            onCheckedChange={handleNewsletterChange}
          />
          <Label htmlFor="newsletter" className="text-sm text-black">
            Desidero ricevere newsletter e aggiornamenti sui prodotti
          </Label>
        </div>
      </div>

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
