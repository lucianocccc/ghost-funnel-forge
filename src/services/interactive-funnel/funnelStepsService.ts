
import { supabase } from '@/integrations/supabase/client';
import { InteractiveFunnelStep } from '@/types/interactiveFunnel';

export const createFunnelStep = async (
  funnelId: string,
  stepData: Omit<InteractiveFunnelStep, 'id' | 'created_at' | 'updated_at' | 'funnel_id'>
): Promise<InteractiveFunnelStep> => {
  const { data, error } = await supabase
    .from('interactive_funnel_steps')
    .insert({
      ...stepData,
      funnel_id: funnelId
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateFunnelStep = async (
  stepId: string,
  updates: Partial<Omit<InteractiveFunnelStep, 'id' | 'created_at' | 'updated_at' | 'funnel_id'>>
): Promise<void> => {
  const { error } = await supabase
    .from('interactive_funnel_steps')
    .update(updates)
    .eq('id', stepId);

  if (error) throw error;
};

export const deleteFunnelStep = async (stepId: string): Promise<void> => {
  const { error } = await supabase
    .from('interactive_funnel_steps')
    .delete()
    .eq('id', stepId);

  if (error) throw error;
};
