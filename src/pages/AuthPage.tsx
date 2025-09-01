import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Zap, RefreshCw, AlertTriangle } from 'lucide-react';
import { cleanupAuthState, forceSignOut } from '@/utils/authCleanup';

const AuthPage = () => {
  const navigate = useNavigate();
  const { signIn, signUp, user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      console.log('User already authenticated, redirecting...');
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Cleanup auth state on component mount to prevent limbo states
  useEffect(() => {
    const initAuth = async () => {
      // Only cleanup if there have been failed attempts
      if (loginAttempts > 0) {
        await forceSignOut();
      }
    };
    initAuth();
  }, [loginAttempts]);

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      // Clean up any existing state before attempting login
      cleanupAuthState();
      
      // Attempt global sign out first to ensure clean state
      try {
        await forceSignOut();
      } catch (err) {
        console.log('Pre-login cleanup completed');
      }

      console.log('Attempting sign in for:', email);
      const { error } = await signIn(email, password);
      
      if (error) {
        console.error('Sign in error:', error);
        setLoginAttempts(prev => prev + 1);
        
        let errorMessage = 'Credenziali non valide';
        if (error.message?.includes('invalid_credentials')) {
          errorMessage = 'Email o password non corretti. Verifica i tuoi dati.';
        } else if (error.message?.includes('too_many_requests')) {
          errorMessage = 'Troppi tentativi. Riprova tra qualche minuto.';
        } else if (error.message?.includes('email_not_confirmed')) {
          errorMessage = 'Email non confermata. Controlla la tua casella di posta.';
        }
        
        throw new Error(errorMessage);
      }
      
      toast({
        title: "Accesso effettuato",
        description: "Benvenuto in GhostFunnel!",
      });
      
      // Force page reload for clean state
      window.location.href = '/dashboard';
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        title: "Errore di Accesso",
        description: error.message || "Credenziali non valide",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      // Clean up state before signup
      cleanupAuthState();
      
      const { error } = await signUp(email, password);
      if (error) throw error;
      
      toast({
        title: "Account creato",
        description: "Controlla la tua email per confermare l'account",
      });
    } catch (error: any) {
      console.error('Signup error:', error);
      toast({
        title: "Errore",
        description: error.message || "Errore durante la registrazione",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForceCleanup = async () => {
    setLoading(true);
    try {
      await forceSignOut();
      toast({
        title: "Stato pulito",
        description: "Stato di autenticazione ripulito. Riprova ad accedere.",
      });
      setLoginAttempts(0);
      window.location.reload();
    } catch (error) {
      toast({
        title: "Errore",
        description: "Errore durante la pulizia dello stato",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Zap className="w-8 h-8 text-golden" />
            <span className="text-2xl font-bold bg-gradient-to-r from-golden to-yellow-300 bg-clip-text text-transparent">
              GhostFunnel
            </span>
          </div>
          <CardTitle>Benvenuto</CardTitle>
          <CardDescription>
            Accedi o crea un nuovo account
            {loginAttempts > 2 && (
              <div className="mt-2 p-2 bg-orange-50 rounded-md">
                <p className="text-sm text-orange-700 flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-1" />
                  Problemi di accesso? Prova a pulire lo stato.
                </p>
              </div>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loginAttempts > 2 && (
            <div className="mb-4">
              <Button 
                onClick={handleForceCleanup}
                variant="outline" 
                className="w-full"
                disabled={loading}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Pulisci Stato Autenticazione
              </Button>
            </div>
          )}
          
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Accedi</TabsTrigger>
              <TabsTrigger value="signup">Registrati</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <Input
                    name="email"
                    type="email"
                    placeholder="Email"
                    required
                    autoComplete="email"
                  />
                </div>
                <div>
                  <Input
                    name="password"
                    type="password"
                    placeholder="Password"
                    required
                    autoComplete="current-password"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Accesso...' : 'Accedi'}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div>
                  <Input
                    name="email"
                    type="email"
                    placeholder="Email"
                    required
                    autoComplete="email"
                  />
                </div>
                <div>
                  <Input
                    name="password"
                    type="password"
                    placeholder="Password"
                    required
                    autoComplete="new-password"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Registrazione...' : 'Registrati'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthPage;