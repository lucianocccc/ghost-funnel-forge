
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
      setVerificationError(null);
      
      // Get tokens from URL
      const accessToken = searchParams.get('access_token');
      const refreshToken = searchParams.get('refresh_token');
      const type = searchParams.get('type');
      const token = searchParams.get('token');
      
      console.log('URL parameters:', { 
        hasAccessToken: !!accessToken, 
        hasRefreshToken: !!refreshToken, 
        type,
        hasToken: !!token
      });

      // Method 1: Direct session setup with access_token and refresh_token
      if (accessToken && refreshToken && type === 'recovery') {
        try {
          console.log('Setting session with recovery tokens...');
          
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            console.error('Error setting session:', error);
            setVerificationError('Link di reset non valido o scaduto. Richiedi un nuovo link.');
            return;
          }

          console.log('Session set successfully:', data);
          setSessionReady(true);
          return;

        } catch (error) {
          console.error('Error in recovery setup:', error);
          setVerificationError('Errore nell\'impostazione della sessione di recovery.');
          return;
        }
      }

      // Method 2: OTP verification with token
      if (token && type === 'recovery' && !accessToken) {
        try {
          console.log('Attempting to verify OTP with token...');
          
          const { data, error } = await supabase.auth.verifyOtp({
            token_hash: token,
            type: 'recovery'
          });

          if (error) {
            console.error('Error verifying OTP:', error);
            setVerificationError('Link di reset non valido o scaduto. Richiedi un nuovo link.');
            return;
          }

          console.log('OTP verification successful:', data);
          setSessionReady(true);
          return;

        } catch (error) {
          console.error('Error in OTP verification:', error);
          setVerificationError('Errore nella verifica del token.');
          return;
        }
      }

      // If we get here, we don't have the right parameters
      console.log('Missing or invalid recovery tokens');
      setVerificationError('Link di reset non valido. Richiedi un nuovo link di reset.');
    };

    setupRecoverySession();
  }, [searchParams, toast]);

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

  return {
    loading,
    success,
    sessionReady,
    verificationError,
    handleResetPassword
  };
};
