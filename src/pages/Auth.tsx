
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Mail, Lock, User, Loader2 } from 'lucide-react';

// Utility per pulire localStorage/sessionStorage (vedi Supabase limbo state)
const cleanupAuthState = () => {
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      localStorage.removeItem(key);
    }
  });
  Object.keys(sessionStorage || {}).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      sessionStorage.removeItem(key);
    }
  });
};

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('signin');
  const [signupInfo, setSignupInfo] = useState<string | null>(null);
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  React.useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  // Login: check confirmed email
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    cleanupAuthState();
    try {
      // Tentativo di logout globale prima di login per pulire limbo
      try {
        await import('@/integrations/supabase/client').then(({ supabase }) => supabase.auth.signOut({ scope: 'global' }));
      } catch { /* ignorare errori signOut */ }

      const { data, error } = await signIn(email, password);

      // Verifica errori
      if (error) {
        // Supabase: errore "Email not confirmed"
        const notConfirmed = error.message?.toLowerCase().includes('email not confirmed');
        if (notConfirmed) {
          toast({
            title: "Devi confermare l'email",
            description: "Controlla la tua casella email e conferma l'account prima di accedere.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }
        toast({
          title: "Errore di Accesso",
          description: error.message,
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Se l'utente non è confermato, mostro errore
      if (data?.user && !data.user.confirmed_at) {
        toast({
          title: "Email non confermata",
          description: "Conferma la tua email tramite il link ricevuto prima di effettuare il login.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      if (data.user) {
        toast({
          title: "Accesso Effettuato",
          description: "Benvenuto!",
        });
        // Navigation gestita da useAuth
      }
    } catch (error: any) {
      toast({
        title: "Errore",
        description: "Errore durante l'accesso",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Signup: mostra messaggio conferma email
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    cleanupAuthState();
    try {
      // Precauzione ulteriore: signOut globale prima di signup
      try {
        await import('@/integrations/supabase/client').then(({ supabase }) => supabase.auth.signOut({ scope: 'global' }));
      } catch {}

      const { data, error } = await signUp(email, password, firstName, lastName);

      if (error) {
        // Error user already registered
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

      // Mostra messaggio informativo: invitare l’utente a controllare la mail
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
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Shield className="w-12 h-12 text-golden mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-white mb-2">
            Lead <span className="text-golden">Manager</span>
          </h1>
          <p className="text-gray-300">Accedi alla tua dashboard</p>
        </div>

        <Card className="bg-white border-golden border">
          <CardHeader>
            <CardTitle className="text-center text-black">Autenticazione</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="signin">Accedi</TabsTrigger>
                <TabsTrigger value="signup">Registrati</TabsTrigger>
              </TabsList>

              <TabsContent value="signin">
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
                        Accesso in corso...
                      </>
                    ) : (
                      'Accedi'
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
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
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        <div className="text-center mt-6">
          <p className="text-gray-400 text-sm">
            Problemi con l'accesso? Contatta il supporto.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
