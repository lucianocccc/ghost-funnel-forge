
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Mail, Lock, User } from 'lucide-react';
import { cleanupAuthState } from './authUtils';
import { supabase } from '@/integrations/supabase/client';

const SignUpForm: React.FC = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [signupInfo, setSignupInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    cleanupAuthState();
    setSignupInfo(null);

    try {
      console.log('Starting signup process for:', email);
      
      const { data, error } = await supabase.functions.invoke(
        "signup",
        {
          body: {
            email,
            password,
            first_name: firstName,
            last_name: lastName,
            redirectTo: `${window.location.origin}/`,
          },
        }
      );

      console.log('Signup response:', { data, error });

      if (error) {
        console.error('Signup error:', error);
        
        // Handle FunctionsHttpError specifically
        if (error.name === 'FunctionsHttpError') {
          try {
            // Try to get the response from the edge function
            const response = await fetch(`https://velasbzeojyjsysiuftf.supabase.co/functions/v1/signup`, {
              method: 'POST',
              headers: {
                'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZlbGFzYnplb2p5anN5c2l1ZnRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwMTYxNDIsImV4cCI6MjA2NDU5MjE0Mn0.1yYgkc1RiDl7Wis-nOAyDunn8l8FDRXY-3eQiCFyhBc',
                'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZlbGFzYnplb2p5anN5c2l1ZnRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwMTYxNDIsImV4cCI6MjA2NDU5MjE0Mn0.1yYgkc1RiDl7Wis-nOAyDunn8l8FDRXY-3eQiCFyhBc`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                email,
                password,
                first_name: firstName,
                last_name: lastName,
                redirectTo: `${window.location.origin}/`,
              }),
            });

            if (response.status === 409) {
              const errorData = await response.json();
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
        
        // Handle other types of errors
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
      console.log('Signup successful');
      setSignupInfo(
        "Registrazione quasi completata! Controlla la tua email e clicca sul link per confermare il tuo account e accedere."
      );
      toast({
        title: "Registrazione Inviata",
        description: "Controlla la tua email per il link di conferma.",
      });

    } catch (error: any) {
      console.error('Network error during signup:', error);
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
    <form onSubmit={handleSignUp} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName" className="text-black">Nome</Label>
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
          <Label htmlFor="lastName" className="text-black">Cognome</Label>
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
        <Label htmlFor="signup-email" className="text-black">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            id="signup-email"
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
        <Label htmlFor="signup-password" className="text-black">Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            id="signup-password"
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
      <Button 
        type="submit" 
        className="w-full bg-golden hover:bg-yellow-600 text-black"
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Registrazione in corso...
          </>
        ) : (
          'Registrati'
        )}
      </Button>
      {signupInfo &&
        <div className="bg-yellow-100 border border-yellow-300 p-3 rounded text-yellow-800 mt-2 text-sm">
          {signupInfo}
        </div>
      }
    </form>
  );
};

export default SignUpForm;
