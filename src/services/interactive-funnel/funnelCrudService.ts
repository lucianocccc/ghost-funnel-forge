
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
      interactive_funnel_steps (*),
      funnel_types (
        id,
        name,
        description,
        category,
        industry,
        target_audience
      )
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  
  // Transform the data to match our interface
  return (data || []).map(item => ({
    ...item,
    status: item.status as 'draft' | 'active' | 'archived',
    funnel_type: item.funnel_types ? {
      id: item.funnel_types.id,
      name: item.funnel_types.name,
      description: item.funnel_types.description,
      category: item.funnel_types.category,
      industry: item.funnel_types.industry,
      target_audience: item.funnel_types.target_audience
    } : undefined
  }));
};

export const fetchInteractiveFunnelById = async (funnelId: string): Promise<InteractiveFunnelWithSteps | null> => {
  const { data, error } = await supabase
    .from('interactive_funnels')
    .select(`
      *,
      interactive_funnel_steps (*),
      funnel_types (
        id,
        name,
        description,
        category,
        industry,
        target_audience
      )
    `)
    .eq('id', funnelId)
    .single();

  if (error) throw error;
  
  // Transform the data to match our interface
  return {
    ...data,
    status: data.status as 'draft' | 'active' | 'archived',
    funnel_type: data.funnel_types ? {
      id: data.funnel_types.id,
      name: data.funnel_types.name,
      description: data.funnel_types.description,
      category: data.funnel_types.category,
      industry: data.funnel_types.industry,
      target_audience: data.funnel_types.target_audience
    } : undefined
  };
};

export const updateFunnelStatus = async (funnelId: string, status: 'draft' | 'active' | 'archived'): Promise<void> => {
  const { error } = await supabase
    .from('interactive_funnels')
    .update({ status })
    .eq('id', funnelId);

  if (error) throw error;
};
