
import { supabase } from '@/integrations/supabase/client';
import { InteractiveFunnel, InteractiveFunnelStep, InteractiveFunnelWithSteps, FunnelSubmission } from '@/types/interactiveFunnel';

export const createInteractiveFunnel = async (
  name: string,
  description: string,
  aiGeneratedFunnelId?: string
): Promise<InteractiveFunnel> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('interactive_funnels')
    .insert({
      name,
      description,
      ai_funnel_id: aiGeneratedFunnelId,
      created_by: user.id
    })
    .select()
    .single();

  if (error) throw error;
  return data;
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
  return data || [];
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
  return data;
};

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

export const submitFunnelStep = async (
  funnelId: string,
  stepId: string,
  submissionData: Record<string, any>,
  userInfo?: { email?: string; name?: string }
): Promise<FunnelSubmission> => {
  const { data, error } = await supabase
    .from('funnel_submissions')
    .insert({
      funnel_id: funnelId,
      step_id: stepId,
      submission_data: submissionData,
      user_email: userInfo?.email,
      user_name: userInfo?.name
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const fetchFunnelSubmissions = async (funnelId: string): Promise<FunnelSubmission[]> => {
  const { data, error } = await supabase
    .from('funnel_submissions')
    .select('*')
    .eq('funnel_id', funnelId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const updateFunnelStatus = async (funnelId: string, status: 'draft' | 'active' | 'archived'): Promise<void> => {
  const { error } = await supabase
    .from('interactive_funnels')
    .update({ status })
    .eq('id', funnelId);

  if (error) throw error;
};
