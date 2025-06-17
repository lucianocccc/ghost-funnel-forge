
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { GeneratedFunnel } from '@/hooks/useChatBotFunnels';

export const useSharedFunnel = (shareToken: string | undefined) => {
  const [funnel, setFunnel] = useState<GeneratedFunnel | null>(null);
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
        // First, increment the view count using a proper SQL function call
        const { error: updateError } = await (supabase as any).rpc('increment_funnel_views', {
          share_token_param: shareToken
        });

        if (updateError) {
          console.error('Error updating view count:', updateError);
          // Continue even if view count update fails
        }

        // Then fetch the funnel data
        const { data, error } = await supabase
          .from('ai_generated_funnels')
          .select('*')
          .eq('share_token', shareToken)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            setError('Funnel non trovato');
          } else {
            setError('Errore nel caricamento del funnel');
          }
          return;
        }

        setFunnel(data);
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
