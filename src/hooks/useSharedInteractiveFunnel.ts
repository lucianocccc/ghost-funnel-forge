
import { useState, useEffect, useRef } from 'react';
import { ShareableFunnel } from '@/types/interactiveFunnel';
import { fetchSharedFunnel } from '@/services/interactiveFunnelService';

export const useSharedInteractiveFunnel = (shareToken: string | undefined) => {
  const [funnel, setFunnel] = useState<ShareableFunnel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isLoadingRef = useRef(false);

  useEffect(() => {
    const loadFunnel = async () => {
      if (!shareToken) {
        console.error('No shareToken provided');
        setError('Token di condivisione non valido o mancante');
        setLoading(false);
        return;
      }

      // Validate shareToken format (should be a reasonable hex string)
      if (shareToken.length < 10 || !/^[a-fA-F0-9]+$/.test(shareToken)) {
        console.error('Invalid shareToken format:', shareToken);
        setError('Token di condivisione non valido');
        setLoading(false);
        return;
      }

      // Prevent multiple simultaneous loads
      if (isLoadingRef.current) {
        console.log('Already loading, skipping duplicate request');
        return;
      }

      isLoadingRef.current = true;

      try {
        console.log('Loading shared funnel with token:', shareToken);
        setLoading(true);
        setError(null);
        
        const data = await fetchSharedFunnel(shareToken);
        console.log('Raw funnel data received:', data);
        
        if (!data) {
          console.error('No funnel data returned from API');
          setError('Funnel non trovato o non più disponibile');
          setFunnel(null);
          return;
        }

        // Validate funnel structure
        if (!data.id || !data.name) {
          console.error('Invalid funnel structure - missing required fields:', data);
          setError('Struttura del funnel non valida');
          setFunnel(null);
          return;
        }

        // Validate steps
        if (!data.interactive_funnel_steps) {
          console.warn('Funnel has no steps property:', data);
          setError('Il funnel non ha step configurati');
          setFunnel(null);
          return;
        }

        if (!Array.isArray(data.interactive_funnel_steps)) {
          console.error('Steps is not an array:', data.interactive_funnel_steps);
          setError('Configurazione step non valida');
          setFunnel(null);
          return;
        }

        if (data.interactive_funnel_steps.length === 0) {
          console.warn('Funnel has empty steps array:', data);
          setError('Il funnel non ha ancora contenuti configurati');
          setFunnel(null);
          return;
        }

        // Validate that funnel is public
        if (!data.is_public) {
          console.error('Funnel is not public:', data);
          setError('Questo funnel non è pubblico');
          setFunnel(null);
          return;
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
      } finally {
        setLoading(false);
        isLoadingRef.current = false;
      }
    };

    loadFunnel();
  }, [shareToken]);

  console.log('useSharedInteractiveFunnel state:', { 
    funnel: funnel?.id, 
    loading, 
    error, 
    stepsCount: funnel?.interactive_funnel_steps?.length,
    shareToken 
  });

  return { funnel, loading, error };
};
