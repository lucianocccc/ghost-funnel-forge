
import { supabase } from '@/integrations/supabase/client';
import { ShareableFunnel } from '@/types/interactiveFunnel';

export const fetchSharedFunnel = async (shareToken: string): Promise<ShareableFunnel | null> => {
  console.log('🔍 Fetching shared funnel with token:', shareToken);

  try {
    // First increment the view count
    const { error: incrementError } = await supabase.rpc('increment_interactive_funnel_views', {
      share_token_param: shareToken
    });

    if (incrementError) {
      console.warn('⚠️ Failed to increment views:', incrementError);
      // Continue even if view increment fails
    }

    // Fetch the funnel with its steps
    const { data: funnel, error } = await supabase
      .from('interactive_funnels')
      .select(`
        *,
        interactive_funnel_steps (*)
      `)
      .eq('share_token', shareToken)
      .eq('is_public', true)
      .single();

    if (error) {
      console.error('❌ Error fetching shared funnel:', error);
      if (error.code === 'PGRST116') {
        throw new Error('Funnel non trovato o non più disponibile');
      }
      throw new Error('Errore nel caricamento del funnel');
    }

    if (!funnel) {
      console.error('❌ No funnel returned from query');
      throw new Error('Funnel non trovato');
    }

    console.log('✅ Successfully fetched shared funnel:', {
      id: funnel.id,
      name: funnel.name,
      stepsCount: funnel.interactive_funnel_steps?.length || 0
    });

    return funnel as ShareableFunnel;
  } catch (error) {
    console.error('❌ Error in fetchSharedFunnel:', error);
    throw error;
  }
};

export const toggleFunnelPublic = async (funnelId: string, isPublic: boolean): Promise<void> => {
  const { error } = await supabase
    .from('interactive_funnels')
    .update({ is_public: isPublic })
    .eq('id', funnelId);

  if (error) throw error;
};

export const regenerateShareToken = async (funnelId: string): Promise<string> => {
  // Generate a new token on the client side
  const newToken = Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  const { error } = await supabase
    .from('interactive_funnels')
    .update({ share_token: newToken })
    .eq('id', funnelId);

  if (error) throw error;
  return newToken;
};
