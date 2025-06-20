
import { supabase } from '@/integrations/supabase/client';
import { ShareableFunnel } from '@/types/interactiveFunnel';

export const fetchSharedFunnel = async (shareToken: string): Promise<ShareableFunnel | null> => {
  // Increment view count
  const { error: updateError } = await supabase.rpc('increment_interactive_funnel_views', {
    share_token_param: shareToken
  });

  if (updateError) {
    console.error('Error updating view count:', updateError);
  }

  // Fetch the funnel data
  const { data, error } = await supabase
    .from('interactive_funnels')
    .select(`
      *,
      interactive_funnel_steps (*)
    `)
    .eq('share_token', shareToken)
    .eq('is_public', true)
    .single();

  if (error) throw error;
  return data;
};

export const toggleFunnelPublic = async (funnelId: string, isPublic: boolean): Promise<void> => {
  const { error } = await supabase
    .from('interactive_funnels')
    .update({ is_public: isPublic })
    .eq('id', funnelId);

  if (error) throw error;
};

export const regenerateShareToken = async (funnelId: string): Promise<string> => {
  const { data, error } = await supabase
    .from('interactive_funnels')
    .update({ share_token: null }) // This will trigger the default value generation
    .eq('id', funnelId)
    .select('share_token')
    .single();

  if (error) throw error;
  return data.share_token;
};
