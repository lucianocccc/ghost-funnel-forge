
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Mail, Lock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { cleanupAuthState } from './authUtils';

interface SignInFormProps {
  onForgotPassword: () => void;
}

const SignInForm: React.FC<SignInFormProps> = ({ onForgotPassword }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validazione client-side
    if (!email.trim() || !password.trim()) {
      toast({
        title: "Campi obbligatori",
        description: "Inserisci email e password per continuare.",
        variant: "destructive",
      });
      return;
    }

    if (!email.includes('@')) {
      toast({
        title: "Email non valida",
        description: "Inserisci un indirizzo email valido.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      console.log('Attempting sign in for:', email);
      
      // Clean up any existing auth state
      cleanupAuthState();
      
      // Attempt to sign out any existing session
      try {
        await supabase.auth.signOut({ scope: 'global' });
        // Wait a moment for cleanup
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (err) {
        console.log('Cleanup signout error (expected):', err);
      }

      // Attempt sign in with email and password
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        console.error('Sign in error:', error);
        
        // Handle specific error cases
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
        
        // Generic error handling
        toast({
          title: "Errore di Accesso",
          description: error.message || "Si è verificato un errore durante l'accesso",
          variant: "destructive",
        });
        return;
      }

      // Verifica che l'utente esista e sia autenticato
      if (!data?.user) {
        toast({
          title: "Errore di Autenticazione",
          description: "Dati utente non validi. Riprova.",
          variant: "destructive",
        });
        return;
      }

      // Check email confirmation
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
      
      // Let the auth state change handle the redirect
      // The auth state will automatically redirect based on role
      
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

  return (
    <form onSubmit={handleSignIn} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email" className="text-black">Email</Label>
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
            disabled={loading}
            autoComplete="email"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="password" className="text-black">Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            id="password"
            type="password"
            placeholder="inserisci la tua password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="pl-10"
            disabled={loading}
            autoComplete="current-password"
          />
        </div>
      </div>
      
      <div className="text-right">
        <button
          type="button"
          onClick={onForgotPassword}
          className="text-sm text-golden hover:text-yellow-600 hover:underline"
          disabled={loading}
        >
          Password dimenticata?
        </button>
      </div>
      
      <Button 
        type="submit" 
        className="w-full bg-golden hover:bg-yellow-600 text-black"
        disabled={loading || !email.trim() || !password.trim()}
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Accesso in corso...
          </>
        ) : (
          'Accedi'
        )}
      </Button>
    </form>
  );
};

export default SignInForm;
