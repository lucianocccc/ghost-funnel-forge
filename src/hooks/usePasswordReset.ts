
import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const usePasswordReset = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const setupRecoverySession = async () => {
      console.log('Setting up recovery session...');
      console.log('Current URL:', window.location.href);
      setVerificationError(null);
      
      // Get URL parameters
      const urlParams = new URLSearchParams(window.location.search);
      const accessToken = urlParams.get('access_token');
      const refreshToken = urlParams.get('refresh_token');
      const type = urlParams.get('type');
      
      console.log('URL parameters found:', { 
        hasAccessToken: !!accessToken, 
        hasRefreshToken: !!refreshToken, 
        type
      });

      // Check if this is a recovery request
      if (type !== 'recovery') {
        console.log('Not a recovery type request, type is:', type);
        setVerificationError('Link di reset non valido. Richiedi un nuovo link di reset.');
        return;
      }

      if (!accessToken || !refreshToken) {
        console.log('Missing tokens in URL');
        setVerificationError('Link di reset incompleto. Richiedi un nuovo link di reset.');
        return;
      }

      try {
        console.log('Setting session with recovery tokens...');
        
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (error) {
          console.error('Error setting session:', error);
          throw error;
        }

        if (data.session) {
          console.log('Recovery session set successfully');
          setSessionReady(true);
          
          // Clean up URL parameters
          const newUrl = window.location.pathname + '?reset=true';
          window.history.replaceState({}, document.title, newUrl);
        } else {
          console.log('No session returned from setSession');
          throw new Error('Impossibile stabilire la sessione di recovery');
        }

      } catch (error: any) {
        console.error('Recovery session setup failed:', error);
        setVerificationError('Link di reset scaduto o non valido. Richiedi un nuovo link di reset.');
      }
    };

    // Only run if we have URL parameters indicating a recovery flow
    const urlParams = new URLSearchParams(window.location.search);
    const hasRecoveryParams = urlParams.get('access_token') && urlParams.get('refresh_token') && urlParams.get('type');
    
    if (hasRecoveryParams) {
      setupRecoverySession();
    } else if (searchParams.get('reset') === 'true') {
      // If we're on the reset page but don't have tokens, check if we already have a valid session
      supabase.auth.getSession().then(({ data: { session }, error }) => {
        if (error || !session) {
          setVerificationError('Sessione di reset non trovata. Richiedi un nuovo link di reset.');
        } else {
          console.log('Existing session found for reset');
          setSessionReady(true);
        }
      });
    }
  }, [searchParams]);

  const handleResetPassword = async (password: string, confirmPassword: string) => {
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

  return {
    loading,
    success,
    sessionReady,
    verificationError,
    handleResetPassword
  };
};
