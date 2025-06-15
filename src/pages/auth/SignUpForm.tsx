
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Mail, Lock, User } from 'lucide-react';
import { cleanupAuthState } from './authUtils';

const SignUpForm: React.FC = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [signupInfo, setSignupInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const { toast } = useToast();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    cleanupAuthState();
    try {
      try {
        await import('@/integrations/supabase/client').then(({ supabase }) => supabase.auth.signOut({ scope: 'global' }));
      } catch {}

      const { data, error } = await signUp(email, password, firstName, lastName);

      if (error) {
        if (error.message?.toLowerCase().includes("user already registered")) {
          toast({
            title: "Utente già registrato",
            description: "Sei già registrato. Effettua il login oppure resetta la password.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }
        toast({
          title: "Errore di Registrazione",
          description: error.message,
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      setSignupInfo(
        "Registrazione completata! Controlla la tua casella email e segui il link per confermare l’account prima di effettuare il login."
      );
      toast({
        title: "Registrazione Completata",
        description: "Controlla la tua email e conferma l’account prima di accedere.",
      });
    } catch (error: any) {
      toast({
        title: "Errore",
        description: "Errore durante la registrazione",
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
