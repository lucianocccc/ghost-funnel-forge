
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

    // Use the secure function to fetch only safe funnel data (no sensitive business info)
    const { data: funnelData, error: funnelError } = await supabase
      .rpc('get_shared_funnel_safe', {
        share_token_param: shareToken
      });

    if (funnelError) {
      console.error('❌ Error fetching shared funnel:', funnelError);
      if (funnelError.code === 'PGRST116') {
        throw new Error('Funnel non trovato o non più disponibile');
      }
      throw new Error('Errore nel caricamento del funnel');
    }

    if (!funnelData || funnelData.length === 0) {
      console.error('❌ No funnel returned from secure query');
      throw new Error('Funnel non trovato');
    }

    const funnel = funnelData[0];

    console.log('✅ Successfully fetched shared funnel safely:', {
      id: funnel.id,
      name: funnel.name,
      stepsCount: funnel.steps ? (typeof funnel.steps === 'string' ? JSON.parse(funnel.steps).length : Array.isArray(funnel.steps) ? funnel.steps.length : 0) : 0
    });

    // Parse steps safely
    let parsedSteps = [];
    if (funnel.steps) {
      try {
        parsedSteps = typeof funnel.steps === 'string' ? JSON.parse(funnel.steps) : funnel.steps;
      } catch (error) {
        console.warn('Failed to parse steps data:', error);
        parsedSteps = [];
      }
    }

    // Transform the data to match our interface
    // Note: For security, we don't expose created_by and other sensitive fields
    const shareableFunnel: ShareableFunnel = {
      ...funnel,
      status: (funnel.status as 'draft' | 'active' | 'archived') || 'active',
      interactive_funnel_steps: parsedSteps,
      // Add required fields that are hidden for security
      created_by: '', // Hidden for security - competitors shouldn't know who created it
      ai_funnel_id: undefined, // Hidden sensitive business strategy data
      funnel_type_id: undefined, // Hidden sensitive business strategy data
      settings: {} // Using safe settings from the function instead of full config
    };

    return shareableFunnel;
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
