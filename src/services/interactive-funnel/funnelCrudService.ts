
import { supabase } from '@/integrations/supabase/client';
import { InteractiveFunnel, InteractiveFunnelStep, InteractiveFunnelWithSteps } from '@/types/interactiveFunnel';

export const createInteractiveFunnel = async (
  name: string,
  description: string,
  aiGeneratedFunnelId?: string,
  funnelTypeId?: string
): Promise<InteractiveFunnel> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('interactive_funnels')
    .insert({
      name,
      description,
      ai_funnel_id: aiGeneratedFunnelId,
      funnel_type_id: funnelTypeId,
      created_by: user.id
    })
    .select()
    .single();

  if (error) throw error;
  
  // Ensure the returned data matches our expected type
  return {
    ...data,
    status: data.status as 'draft' | 'active' | 'archived',
  } as InteractiveFunnel;
};

export const fetchInteractiveFunnels = async (): Promise<InteractiveFunnelWithSteps[]> => {
  const { data, error } = await supabase
    .from('interactive_funnels')
    .select(`
      *,
      interactive_funnel_steps (*)
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  
  // Transform the data to match our interface
  return (data || []).map(item => ({
    ...item,
    status: item.status as 'draft' | 'active' | 'archived',
    funnel_type: undefined // Since we're not joining funnel_types due to relation issues
  }));
};

export const fetchInteractiveFunnelById = async (funnelId: string): Promise<InteractiveFunnelWithSteps | null> => {
  const { data, error } = await supabase
    .from('interactive_funnels')
    .select(`
      *,
      interactive_funnel_steps (*)
    `)
    .eq('id', funnelId)
    .single();

  if (error) throw error;
  
  // Transform the data to match our interface
  return {
    ...data,
    status: data.status as 'draft' | 'active' | 'archived',
    funnel_type: undefined // Since we're not joining funnel_types due to relation issues
  };
};

export const updateFunnelStatus = async (funnelId: string, status: 'draft' | 'active' | 'archived'): Promise<void> => {
  const { error } = await supabase
    .from('interactive_funnels')
    .update({ status })
    .eq('id', funnelId);

  if (error) throw error;
};
