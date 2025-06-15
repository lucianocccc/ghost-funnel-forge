
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Lock, ArrowLeft, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ResetPasswordFormProps {
  onBackToLogin: () => void;
}

const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({ onBackToLogin }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const setupRecoverySession = async () => {
      console.log('Setting up recovery session...');
      
      // Get tokens from URL
      const accessToken = searchParams.get('access_token');
      const refreshToken = searchParams.get('refresh_token');
      const type = searchParams.get('type');
      
      console.log('URL parameters:', { 
        hasAccessToken: !!accessToken, 
        hasRefreshToken: !!refreshToken, 
        type 
      });

      if (accessToken && refreshToken && type === 'recovery') {
        try {
          console.log('Setting session with recovery tokens...');
          
          // Set the session with the recovery tokens
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            console.error('Error setting session:', error);
            toast({
              title: "Errore",
              description: "Link di reset non valido o scaduto. Richiedi un nuovo link.",
              variant: "destructive",
            });
            return;
          }

          console.log('Session set successfully:', data);
          setSessionReady(true);

        } catch (error) {
          console.error('Error in recovery setup:', error);
          toast({
            title: "Errore",
            description: "Errore nell'impostazione della sessione di recovery.",
            variant: "destructive",
          });
        }
      } else {
        console.log('Missing recovery tokens or wrong type');
        toast({
          title: "Errore",
          description: "Link di reset non valido. Richiedi un nuovo link di reset.",
          variant: "destructive",
        });
      }
    };

    setupRecoverySession();
  }, [searchParams, toast]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!sessionReady) {
      toast({
        title: "Errore",
        description: "Sessione di recovery non pronta. Riprova o richiedi un nuovo link.",
        variant: "destructive",
      });
      return;
    }
    
    if (password !== confirmPassword) {
      toast({
        title: "Errore",
        description: "Le password non corrispondono.",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Errore",
        description: "La password deve essere lunga almeno 6 caratteri.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      console.log('Attempting to update password...');
      
      // Get current session to verify we're authenticated
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !sessionData.session) {
        console.error('No valid session for password update:', sessionError);
        throw new Error('Sessione non valida per l\'aggiornamento della password');
      }

      console.log('Current session valid, updating password...');
      
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        console.error('Password update error:', error);
        throw error;
      }

      console.log('Password updated successfully');
      setSuccess(true);
      
      toast({
        title: "Password Aggiornata",
        description: "La tua password è stata aggiornata con successo.",
      });

      // Clear the recovery URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);

      // Sign out to clear the recovery session
      await supabase.auth.signOut();

      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/auth');
      }, 3000);

    } catch (error: any) {
      console.error('Error updating password:', error);
      toast({
        title: "Errore",
        description: error.message || "Impossibile aggiornare la password. Riprova più tardi.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="space-y-4 text-center">
        <div className="space-y-2">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
          <h3 className="text-lg font-semibold text-black">Password Aggiornata!</h3>
          <p className="text-gray-600">
            La tua password è stata aggiornata con successo.
            Sarai reindirizzato al login tra pochi secondi.
          </p>
        </div>
        <Button 
          onClick={onBackToLogin}
          variant="outline"
          className="w-full"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Vai al Login Ora
        </Button>
      </div>
    );
  }

  if (!sessionReady) {
    return (
      <div className="space-y-4 text-center">
        <div className="space-y-2">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-golden" />
          <h3 className="text-lg font-semibold text-black">Verifica del Link...</h3>
          <p className="text-gray-600 text-sm">
            Stiamo verificando il tuo link di reset password.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleResetPassword} className="space-y-4">
      <div className="space-y-2 text-center mb-4">
        <h3 className="text-lg font-semibold text-black">Imposta Nuova Password</h3>
        <p className="text-gray-600 text-sm">
          Inserisci la tua nuova password qui sotto.
        </p>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="new-password" className="text-black">Nuova Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            id="new-password"
            type="password"
            placeholder="inserisci la nuova password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="pl-10"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirm-password" className="text-black">Conferma Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            id="confirm-password"
            type="password"
            placeholder="conferma la nuova password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={6}
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
            Aggiornamento...
          </>
        ) : (
          'Aggiorna Password'
        )}
      </Button>
      
      <Button 
        type="button"
        onClick={onBackToLogin}
        variant="outline"
        className="w-full"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Torna al Login
      </Button>
    </form>
  );
};

export default ResetPasswordForm;
