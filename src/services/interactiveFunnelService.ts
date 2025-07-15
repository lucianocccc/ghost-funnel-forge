
import { supabase } from '@/integrations/supabase/client';
import { InteractiveFunnelWithSteps, ShareableFunnel, FunnelSettings, FunnelSubmission } from '@/types/interactiveFunnel';

// Re-export functions from modular services
export { createFunnelStep, updateFunnelStep, deleteFunnelStep } from './interactive-funnel/funnelStepsService';
export { createInteractiveFunnel, fetchInteractiveFunnelById } from './interactive-funnel/funnelCrudService';
export { submitFunnelStep, fetchFunnelSubmissions } from './interactive-funnel/funnelSubmissionService';
export { fetchSharedFunnel, toggleFunnelPublic, regenerateShareToken } from './interactive-funnel/funnelSharingService';

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
