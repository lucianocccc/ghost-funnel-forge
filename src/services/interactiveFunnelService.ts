
import { supabase } from '@/integrations/supabase/client';
import { InteractiveFunnelWithSteps, ShareableFunnel, FunnelSettings, FunnelSubmission } from '@/types/interactiveFunnel';

// Re-export functions from modular services
export { createFunnelStep, updateFunnelStep, deleteFunnelStep } from './interactive-funnel/funnelStepsService';
export { createInteractiveFunnel, fetchInteractiveFunnelById } from './interactive-funnel/funnelCrudService';
export { submitFunnelStep, fetchFunnelSubmissions } from './interactive-funnel/funnelSubmissionService';

export const fetchInteractiveFunnels = async (): Promise<InteractiveFunnelWithSteps[]> => {
  const { data, error } = await supabase
    .from('interactive_funnels')
    .select(`
      *,
      interactive_funnel_steps (*)
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const updateFunnelStatus = async (
  funnelId: string,
  status: 'draft' | 'active' | 'archived'
): Promise<void> => {
  const { error } = await supabase
    .from('interactive_funnels')
    .update({ status })
    .eq('id', funnelId);

  if (error) throw error;
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
    .update({ share_token: null })
    .eq('id', funnelId)
    .select('share_token')
    .single();

  if (error) throw error;
  return data.share_token;
};

export const getFunnelAnalytics = async (funnelId: string) => {
  const { data, error } = await supabase
    .from('funnel_analytics_events')
    .select('*')
    .eq('funnel_id', funnelId)
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) throw error;
  return data;
};

export const fetchSharedFunnel = async (shareToken: string): Promise<ShareableFunnel | null> => {
  try {
    console.log('fetchSharedFunnel called with token:', shareToken);
    
    // First, try to increment view count (non-critical operation)
    try {
      const { error: updateError } = await supabase.rpc('increment_interactive_funnel_views', {
        share_token_param: shareToken
      });
      
      if (updateError) {
        console.warn('Warning: Could not increment view count:', updateError);
      }
    } catch (viewError) {
      console.warn('Warning: View count increment failed:', viewError);
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

    console.log('Database query result:', { data, error });

    if (error) {
      console.error('Error fetching shared funnel:', error);
      if (error.code === 'PGRST116') {
        throw new Error('Funnel non trovato o non pubblico');
      }
      throw error;
    }
    
    if (!data) {
      console.warn('No funnel data returned from database');
      return null;
    }

    console.log('Funnel data fetched successfully:', {
      id: data.id,
      name: data.name,
      stepsCount: data.interactive_funnel_steps?.length || 0,
      steps: data.interactive_funnel_steps,
      isPublic: data.is_public,
      shareToken: data.share_token
    });

    // Parse settings as FunnelSettings type
    const parsedSettings: FunnelSettings | undefined = data.settings as FunnelSettings;

    const result = {
      ...data,
      settings: parsedSettings
    } as ShareableFunnel;

    console.log('Returning funnel result:', result);
    return result;
  } catch (error) {
    console.error('Error in fetchSharedFunnel:', error);
    throw error;
  }
};
