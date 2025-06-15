
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
      
      // Get all possible tokens from URL
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

      // Check if this is a recovery type request
      if (type !== 'recovery') {
        console.log('Not a recovery type request');
        setVerificationError('Link di reset non valido. Richiedi un nuovo link di reset.');
        return;
      }

      // Method 1: Direct session setup with access_token and refresh_token (Supabase format)
      if (accessToken && refreshToken) {
        try {
          console.log('Setting session with access and refresh tokens...');
          
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            console.error('Error setting session:', error);
            throw error;
          }

          console.log('Session set successfully:', data);
          setSessionReady(true);
          return;

        } catch (error) {
          console.error('Error in direct session setup:', error);
          // Continue to try other methods
        }
      }

      // Method 2: Use token hash for OTP verification
      if (token) {
        try {
          console.log('Attempting to verify OTP with token hash...');
          
          const { data, error } = await supabase.auth.verifyOtp({
            token_hash: token,
            type: 'recovery'
          });

          if (error) {
            console.error('Error verifying OTP:', error);
            throw error;
          }

          console.log('OTP verification successful:', data);
          
          // Check if we now have a valid session
          const { data: sessionData } = await supabase.auth.getSession();
          if (sessionData.session) {
            setSessionReady(true);
            return;
          } else {
            throw new Error('No session after OTP verification');
          }

        } catch (error) {
          console.error('Error in OTP verification:', error);
          // Continue to final error
        }
      }

      // If we get here, all methods failed
      console.log('All verification methods failed');
      setVerificationError('Link di reset non valido o scaduto. Richiedi un nuovo link di reset.');
    };

    setupRecoverySession();
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
      
      // Verify we have a valid session before attempting password update
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !sessionData.session) {
        console.error('No valid session for password update:', sessionError);
        throw new Error('Sessione non valida. Richiedi un nuovo link di reset.');
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
