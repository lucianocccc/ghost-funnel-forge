
import { supabase } from '@/integrations/supabase/client';

export const getFunnelAnalytics = async (funnelId: string) => {
  const { data: funnel, error: funnelError } = await supabase
    .from('interactive_funnels')
    .select('views_count, submissions_count')
    .eq('id', funnelId)
    .single();

  if (funnelError) throw funnelError;

  const { data: submissions, error: submissionsError } = await supabase
    .from('funnel_submissions')
    .select('created_at, source')
    .eq('funnel_id', funnelId);

  if (submissionsError) throw submissionsError;

  return {
    views: funnel.views_count,
    submissions: funnel.submissions_count,
    submissionDetails: submissions || []
  };
};
