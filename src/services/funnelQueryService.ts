
import { supabase } from '@/integrations/supabase/client';
import { FunnelWithSteps } from '@/types/funnel';

export const fetchFunnelsWithDetails = async (): Promise<FunnelWithSteps[]> => {
  const { data, error } = await supabase
    .from('funnels')
    .select(`
      *,
      funnel_steps (*),
      funnel_templates:template_id (*)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching funnels:', error);
    throw error;
  }

  return (data || []) as FunnelWithSteps[];
};

export const fetchFunnelById = async (funnelId: string): Promise<FunnelWithSteps | null> => {
  const { data, error } = await supabase
    .from('funnels')
    .select(`
      *,
      funnel_steps (*),
      funnel_templates:template_id (*)
    `)
    .eq('id', funnelId)
    .single();

  if (error) {
    console.error('Error fetching funnel:', error);
    throw error;
  }

  return data as FunnelWithSteps;
};
