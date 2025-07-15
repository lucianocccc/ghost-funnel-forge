
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
        setError('Token di condivisione non valido');
        setLoading(false);
        return;
      }

      // Prevent multiple simultaneous loads
      if (isLoadingRef.current) {
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
          console.error('No funnel data returned');
          setError('Funnel non trovato o non più disponibile');
        } else {
          console.log('Funnel loaded successfully. Steps count:', data.interactive_funnel_steps?.length || 0);
          console.log('Funnel steps details:', data.interactive_funnel_steps);
          
          // Verifica che il funnel abbia le proprietà necessarie
          if (!data.interactive_funnel_steps || data.interactive_funnel_steps.length === 0) {
            console.warn('Funnel loaded but missing steps. Full data:', data);
            setError('Il funnel non ha ancora contenuti configurati');
          } else {
            console.log('Setting funnel with steps:', data.interactive_funnel_steps);
            setFunnel(data);
          }
        }
      } catch (error) {
        console.error('Error loading shared funnel:', error);
        setError('Errore nel caricamento del funnel');
      } finally {
        setLoading(false);
        isLoadingRef.current = false;
      }
    };

    loadFunnel();
  }, [shareToken]);

  console.log('useSharedInteractiveFunnel state:', { funnel: funnel?.id, loading, error, stepsCount: funnel?.interactive_funnel_steps?.length });

  return { funnel, loading, error };
};
