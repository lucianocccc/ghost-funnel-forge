
import { useState, useEffect } from 'react';
import { ShareableFunnel } from '@/types/interactiveFunnel';
import { fetchSharedFunnel } from '@/services/interactiveFunnelService';

export const useSharedInteractiveFunnel = (shareToken: string | undefined) => {
  const [funnel, setFunnel] = useState<ShareableFunnel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadFunnel = async () => {
      if (!shareToken) {
        setError('Token di condivisione non valido');
        setLoading(false);
        return;
      }

      try {
        console.log('Loading shared funnel with token:', shareToken);
        setLoading(true);
        const data = await fetchSharedFunnel(shareToken);
        
        if (!data) {
          setError('Funnel non trovato o non più disponibile');
        } else {
          console.log('Funnel loaded successfully:', data);
          setFunnel(data);
        }
      } catch (error) {
        console.error('Error loading shared funnel:', error);
        setError('Errore nel caricamento del funnel');
      } finally {
        setLoading(false);
      }
    };

    loadFunnel();
  }, [shareToken]);

  return { funnel, loading, error };
};
