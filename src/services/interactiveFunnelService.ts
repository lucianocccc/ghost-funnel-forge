import { supabase } from '@/integrations/supabase/client';
import { InteractiveFunnel, InteractiveFunnelStep, InteractiveFunnelWithSteps } from '@/types/interactiveFunnel';

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
      ai_funnel_id: aiGeneratedFunnelId, // Use ai_funnel_id instead of ai_generated_funnel_id
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

export const updateFunnelStatus = async (funnelId: string, status: 'draft' | 'active' | 'archived'): Promise<void> => {
  const { error } = await supabase
    .from('interactive_funnels')
    .update({ status })
    .eq('id', funnelId);

  if (error) throw error;
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

// Re-export from focused services for backward compatibility  
export { 
  fetchInteractiveFunnels, 
  fetchInteractiveFunnelById,
  createInteractiveFunnel,
  updateFunnelStatus
} from './interactive-funnel/funnelCrudService';

export { 
  createFunnelStep, 
  updateFunnelStep, 
  deleteFunnelStep 
} from './interactive-funnel/funnelStepsService';

// Add new AI generation function
export const generateInteractiveFunnelAI = async (
  prompt: string, 
  funnelTypeId?: string, 
  saveToLibrary = true
): Promise<any> => {
  const response = await fetch('/api/generate-interactive-funnel-ai', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt,
      funnelTypeId,
      saveToLibrary
    }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.error || 'Errore nella generazione del funnel');
  }

  return data.funnel;
};
