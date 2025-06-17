
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { cleanupAuthState } from '../authUtils';

export const useSignIn = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const validateInput = (email: string, password: string) => {
    if (!email.trim() || !password.trim()) {
      toast({
        title: "Campi obbligatori",
        description: "Inserisci email e password per continuare.",
        variant: "destructive",
      });
      return false;
    }

    if (!email.includes('@')) {
      toast({
        title: "Email non valida",
        description: "Inserisci un indirizzo email valido.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleError = (error: any) => {
    console.error('Sign in error:', error);
    
    if (error.message?.toLowerCase().includes('email not confirmed')) {
      toast({
        title: "Email non confermata",
        description: "Controlla la tua casella email e conferma l'account prima di accedere.",
        variant: "destructive",
      });
      return;
    }
    
    if (error.message?.toLowerCase().includes('invalid login credentials') || 
        error.message?.toLowerCase().includes('invalid email or password') ||
        error.message?.toLowerCase().includes('invalid credentials')) {
      toast({
        title: "Credenziali non valide",
        description: "Email o password non corretti. Riprova.",
        variant: "destructive",
      });
      return;
    }

    if (error.message?.toLowerCase().includes('too many requests')) {
      toast({
        title: "Troppi tentativi",
        description: "Aspetta qualche minuto prima di riprovare.",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Errore di Accesso",
      description: error.message || "Si è verificato un errore durante l'accesso",
      variant: "destructive",
    });
  };

  const signIn = async (email: string, password: string) => {
    if (!validateInput(email, password)) {
      return;
    }

    setLoading(true);
    
    try {
      console.log('Attempting sign in for:', email);
      
      cleanupAuthState();
      
      try {
        await supabase.auth.signOut({ scope: 'global' });
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (err) {
        console.log('Cleanup signout error (expected):', err);
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        handleError(error);
        return;
      }

      if (!data?.user) {
        toast({
          title: "Errore di Autenticazione",
          description: "Dati utente non validi. Riprova.",
          variant: "destructive",
        });
        return;
      }

      if (!data.user.email_confirmed_at) {
        toast({
          title: "Email non confermata",
          description: "Conferma la tua email tramite il link ricevuto prima di effettuare il login.",
          variant: "destructive",
        });
        return;
      }

      console.log('Sign in successful for user:', data.user.email);
      
      toast({
        title: "Accesso Effettuato",
        description: "Benvenuto! Reindirizzamento in corso...",
      });
      
    } catch (error: any) {
      console.error('Unexpected error during sign in:', error);
      toast({
        title: "Errore di Connessione",
        description: "Problema di connessione. Controlla la tua connessione internet e riprova.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    signIn
  };
};
