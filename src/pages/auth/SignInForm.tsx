
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Mail, Lock } from 'lucide-react';
import { cleanupAuthState } from './authUtils';

interface SignInFormProps {
  onForgotPassword: () => void;
}

const SignInForm: React.FC<SignInFormProps> = ({ onForgotPassword }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      console.log('Attempting sign in for:', email);
      
      const { data, error } = await signIn(email, password);

      if (error) {
        console.error('Sign in error:', error);
        
        const notConfirmed = error.message?.toLowerCase().includes('email not confirmed');
        if (notConfirmed) {
          toast({
            title: "Devi confermare l'email",
            description: "Controlla la tua casella email e conferma l'account prima di accedere.",
            variant: "destructive",
          });
          return;
        }
        
        const invalidCredentials = error.message?.toLowerCase().includes('invalid login credentials');
        if (invalidCredentials) {
          toast({
            title: "Credenziali non valide",
            description: "Email o password non corretti. Riprova.",
            variant: "destructive",
          });
          return;
        }
        
        toast({
          title: "Errore di Accesso",
          description: error.message || "Si è verificato un errore durante l'accesso",
          variant: "destructive",
        });
        return;
      }

      if (data?.user && !data.user.email_confirmed_at) {
        toast({
          title: "Email non confermata",
          description: "Conferma la tua email tramite il link ricevuto prima di effettuare il login.",
          variant: "destructive",
        });
        return;
      }

      if (data.user) {
        console.log('Sign in successful, redirecting...');
        toast({
          title: "Accesso Effettuato",
          description: "Benvenuto!",
        });
        
        // Use window.location for a clean redirect
        window.location.href = '/';
      }
    } catch (error: any) {
      console.error('Unexpected error during sign in:', error);
      toast({
        title: "Errore",
        description: "Errore durante l'accesso. Riprova più tardi.",
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
        disabled={loading}
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
