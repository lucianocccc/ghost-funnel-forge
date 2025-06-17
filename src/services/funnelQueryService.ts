
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

  // Clean the data to handle SelectQueryError in funnel_templates
  const cleaned = (data || []).map(({ funnel_templates, ...rest }) => ({
    ...rest,
    funnel_templates: Array.isArray(funnel_templates) ? funnel_templates[0] : null,
  }));

  return cleaned as FunnelWithSteps[];
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

  // Clean the single funnel data to handle SelectQueryError in funnel_templates
  const { funnel_templates, ...rest } = data;
  const cleanedFunnel = {
    ...rest,
    funnel_templates: Array.isArray(funnel_templates) ? funnel_templates[0] : null,
  };

  return cleanedFunnel as FunnelWithSteps;
};
