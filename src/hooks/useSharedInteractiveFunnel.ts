
import { useState, useEffect } from 'react';
import { ShareableFunnel } from '@/types/interactiveFunnel';
import { fetchSharedFunnel } from '@/services/interactiveFunnelService';

export const useSharedInteractiveFunnel = (shareToken: string | undefined) => {
  const [funnel, setFunnel] = useState<ShareableFunnel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSharedFunnel = async () => {
      if (!shareToken) {
        setError('Token di condivisione non valido');
        setLoading(false);
        return;
      }

      try {
        const data = await fetchSharedFunnel(shareToken);
        if (!data) {
          setError('Funnel non trovato o non disponibile pubblicamente');
        } else {
          setFunnel(data);
        }
      } catch (error) {
        console.error('Error loading shared funnel:', error);
        setError('Errore nel caricamento del funnel');
      } finally {
        setLoading(false);
      }
    };

    loadSharedFunnel();
  }, [shareToken]);

  return { funnel, loading, error };
};
