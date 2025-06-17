
import { supabase } from '@/integrations/supabase/client';
import { FunnelWithSteps, Funnel } from '@/types/funnel';

export const fetchFunnels = async (): Promise<FunnelWithSteps[]> => {
  const { data, error } = await supabase
    .from('funnels')
    .select(`
      *,
      funnel_steps (*),
      funnel_templates (*)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching funnels:', error);
    throw error;
  }

  return (data || []) as FunnelWithSteps[];
};

export const updateFunnelStatusInDb = async (funnelId: string, status: Funnel['status']) => {
  const { error } = await supabase
    .from('funnels')
    .update({ status })
    .eq('id', funnelId);

  if (error) {
    throw error;
  }
};
