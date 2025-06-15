
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
      
      // Get all URL parameters
      const urlParams = new URLSearchParams(window.location.search);
      const accessToken = urlParams.get('access_token') || searchParams.get('access_token');
      const refreshToken = urlParams.get('refresh_token') || searchParams.get('refresh_token');
      const type = urlParams.get('type') || searchParams.get('type');
      const tokenHash = urlParams.get('token_hash') || searchParams.get('token_hash');
      
      console.log('URL parameters found:', { 
        hasAccessToken: !!accessToken, 
        hasRefreshToken: !!refreshToken, 
        type,
        hasTokenHash: !!tokenHash
      });

      // Check if this is a recovery request
      if (type !== 'recovery') {
        console.log('Not a recovery type request, type is:', type);
        setVerificationError('Link di reset non valido. Richiedi un nuovo link di reset.');
        return;
      }

      // Try to set session with tokens from URL
      if (accessToken && refreshToken) {
        try {
          console.log('Attempting to set session with tokens from URL...');
          
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            console.error('Error setting session with URL tokens:', error);
            throw error;
          }

          if (data.session) {
            console.log('Session set successfully with URL tokens');
            setSessionReady(true);
            
            // Clean up URL parameters
            const newUrl = window.location.pathname;
            window.history.replaceState({}, document.title, newUrl);
            return;
          }

        } catch (error) {
          console.error('Failed to set session with URL tokens:', error);
        }
      }

      // Try using exchangeCodeForSession if we have other parameters
      try {
        console.log('Checking current session...');
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
        }
        
        if (sessionData.session) {
          console.log('Valid session found');
          setSessionReady(true);
          return;
        }
        
        console.log('No valid session found');
        
      } catch (error) {
        console.error('Error checking session:', error);
      }

      // If we get here, verification failed
      console.log('All verification methods failed');
      setVerificationError('Link di reset scaduto o non valido. Richiedi un nuovo link di reset.');
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
