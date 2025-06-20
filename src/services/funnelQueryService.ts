
import { supabase } from '@/integrations/supabase/client';
import { FunnelWithSteps } from '@/types/funnel';

export const fetchFunnelsWithDetails = async (): Promise<FunnelWithSteps[]> => {
  const { data, error } = await supabase
    .from('funnels')
    .select(`
      *,
      funnel_steps (*)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching funnels:', error);
    throw error;
  }

  // Clean the data and add null funnel_templates for compatibility
  const cleaned = (data || []).map((funnel) => ({
    ...funnel,
    funnel_templates: null,
  }));

  return cleaned as FunnelWithSteps[];
};

export const fetchFunnelById = async (funnelId: string): Promise<FunnelWithSteps | null> => {
  const { data, error } = await supabase
    .from('funnels')
    .select(`
      *,
      funnel_steps (*)
    `)
    .eq('id', funnelId)
    .single();

  if (error) {
    console.error('Error fetching funnel:', error);
    throw error;
  }

  // Add null funnel_templates for compatibility
  const cleanedFunnel = {
    ...data,
    funnel_templates: null,
  };

  return cleanedFunnel as FunnelWithSteps;
};
