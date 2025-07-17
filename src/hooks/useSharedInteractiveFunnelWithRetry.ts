
import { useState, useEffect, useRef, useCallback } from 'react';
import { ShareableFunnel } from '@/types/interactiveFunnel';
import { fetchSharedFunnel } from '@/services/interactive-funnel/funnelSharingService';
import { validateAndFixFunnel } from '@/services/interactive-funnel/funnelValidationService';

export const useSharedInteractiveFunnelWithRetry = (shareToken: string | undefined) => {
  const [funnel, setFunnel] = useState<ShareableFunnel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [lastRetryTime, setLastRetryTime] = useState<number>(0);
  const isLoadingRef = useRef(false);
  const maxRetries = 3;
  const retryDelay = 2000; // 2 secondi tra i retry

  const loadFunnel = useCallback(async (isRetry = false) => {
    if (!shareToken) {
      console.error('No shareToken provided');
      setError('Token di condivisione non valido o mancante');
      setLoading(false);
      return false;
    }

    // Validate shareToken format
    if (shareToken.length < 10 || !/^[a-fA-F0-9]+$/.test(shareToken)) {
      console.error('Invalid shareToken format:', shareToken);
      setError('Token di condivisione non valido');
      setLoading(false);
      return false;
    }

    // Prevent multiple simultaneous loads
    if (isLoadingRef.current) {
      console.log('Already loading, skipping duplicate request');
      return false;
    }

    // Rate limiting per i retry
    if (isRetry) {
      const now = Date.now();
      if (now - lastRetryTime < retryDelay) {
        console.log('Retry too soon, waiting...');
        return false;
      }
      setLastRetryTime(now);
    }

    isLoadingRef.current = true;

    try {
      console.log(`Loading shared funnel with token: ${shareToken} (retry: ${isRetry})`);
      setLoading(true);
      setError(null);
      
      const data = await fetchSharedFunnel(shareToken);
      console.log('Raw funnel data received:', data);
      
      if (!data) {
        console.error('No funnel data returned from API');
        setError('Funnel non trovato o non più disponibile');
        setFunnel(null);
        return false;
      }

      // Validate funnel structure
      if (!data.id || !data.name) {
        console.error('Invalid funnel structure - missing required fields:', data);
        setError('Struttura del funnel non valida');
        setFunnel(null);
        return false;
      }

      // Validate that funnel is public
      if (!data.is_public) {
        console.error('Funnel is not public:', data);
        setError('Questo funnel non è pubblico');
        setFunnel(null);
        return false;
      }

      // Check if funnel has steps
      const hasSteps = data.interactive_funnel_steps && 
                      Array.isArray(data.interactive_funnel_steps) && 
                      data.interactive_funnel_steps.length > 0;

      if (!hasSteps) {
        console.warn('Funnel has no steps, attempting validation and repair...');
        setIsValidating(true);
        
        try {
          const validationResult = await validateAndFixFunnel(data.id);
          
          if (validationResult) {
            console.log('Funnel validation successful, reloading...');
            // Aspetta un momento per permettere al database di aggiornarsi
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Reload the funnel data after validation
            const updatedData = await fetchSharedFunnel(shareToken);
            
            if (updatedData && updatedData.interactive_funnel_steps && updatedData.interactive_funnel_steps.length > 0) {
              console.log('Funnel successfully repaired with steps');
              setFunnel(updatedData);
              setError(null);
              setRetryCount(0); // Reset retry count on success
              return true;
            }
          }
        } catch (validationError) {
          console.error('Validation failed:', validationError);
        } finally {
          setIsValidating(false);
        }
        
        // Se la validazione non ha funzionato, segnala che il funnel è in preparazione
        console.log('Funnel still has no steps after validation');
        return false;
      }

      console.log('Funnel loaded successfully:', {
        id: data.id,
        name: data.name,
        stepsCount: data.interactive_funnel_steps.length,
        isPublic: data.is_public,
        shareToken: data.share_token
      });
      
      setFunnel(data);
      setError(null);
      setRetryCount(0); // Reset retry count on success
      return true;
    } catch (error) {
      console.error('Error loading shared funnel:', error);
      
      // Provide more specific error messages
      if (error instanceof Error) {
        if (error.message.includes('not found') || error.message.includes('non trovato')) {
          setError('Funnel non trovato');
        } else if (error.message.includes('not public') || error.message.includes('non pubblico')) {
          setError('Questo funnel non è pubblico');
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          setError('Errore di connessione. Controlla la tua connessione internet.');
        } else {
          setError(error.message);
        }
      } else {
        setError('Errore nel caricamento del funnel');
      }
      
      setFunnel(null);
      return false;
    } finally {
      setLoading(false);
      setIsValidating(false);
      isLoadingRef.current = false;
    }
  }, [shareToken, lastRetryTime]);

  const retryLoadFunnel = useCallback(async () => {
    if (retryCount >= maxRetries) {
      console.log('Max retries reached');
      return;
    }

    setRetryCount(prev => prev + 1);
    const success = await loadFunnel(true);
    
    if (!success && retryCount + 1 < maxRetries) {
      // Schedule another retry if this one failed and we haven't hit max retries
      console.log(`Retry ${retryCount + 1} failed, scheduling next retry...`);
    }
  }, [loadFunnel, retryCount, maxRetries]);

  // Initial load
  useEffect(() => {
    loadFunnel(false);
  }, [shareToken]);

  console.log('useSharedInteractiveFunnelWithRetry state:', { 
    funnel: funnel?.id, 
    loading, 
    error, 
    isValidating,
    retryCount,
    maxRetries,
    stepsCount: funnel?.interactive_funnel_steps?.length,
    shareToken 
  });

  return { 
    funnel, 
    loading, 
    error, 
    isValidating, 
    retryCount, 
    maxRetries,
    retryLoadFunnel,
    hasSteps: funnel?.interactive_funnel_steps && funnel.interactive_funnel_steps.length > 0
  };
};
