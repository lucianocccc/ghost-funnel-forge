
import { supabase } from '@/integrations/supabase/client';
import { GeneratedFunnel } from '@/types/chatbotFunnel';

export const fetchGeneratedFunnels = async (userId: string, sessionId: string): Promise<GeneratedFunnel[]> => {
  const { data: funnels, error } = await supabase
    .from('ai_generated_funnels')
    .select('*')
    .eq('user_id', userId)
    .eq('session_id', sessionId)
    .eq('is_from_chatbot', true)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error loading generated funnels:', error);
    return [];
  }

  return funnels || [];
};

export const updateFunnelStatus = async (funnelId: string, userId: string, isActive: boolean): Promise<void> => {
  const { error } = await supabase
    .from('ai_generated_funnels')
    .update({ is_active: isActive })
    .eq('id', funnelId)
    .eq('user_id', userId);

  if (error) throw error;
};

export const deleteFunnelById = async (funnelId: string, userId: string): Promise<void> => {
  const { error } = await supabase
    .from('ai_generated_funnels')
    .delete()
    .eq('id', funnelId)
    .eq('user_id', userId);

  if (error) throw error;
};

export const createMainFunnel = async (generatedFunnel: GeneratedFunnel, userId: string) => {
  const funnelData = generatedFunnel.funnel_data;
  
  // Create a funnel in the main funnels table
  const { data: funnel, error: funnelError } = await supabase
    .from('funnels')
    .insert({
      name: generatedFunnel.name,
      description: generatedFunnel.description,
      target_audience: funnelData.target_audience || '',
      industry: funnelData.industry || '',
      created_by: userId,
      status: 'draft'
    })
    .select()
    .single();

  if (funnelError) throw funnelError;

  // Create funnel steps if present
  if (funnelData.steps && Array.isArray(funnelData.steps)) {
    const steps = funnelData.steps.map((step: string, index: number) => ({
      funnel_id: funnel.id,
      step_number: index + 1,
      step_type: 'content',
      title: step.split(' - ')[0] || `Step ${index + 1}`,
      description: step.split(' - ')[1] || step,
      content: { text: step }
    }));

    const { error: stepsError } = await supabase
      .from('funnel_steps')
      .insert(steps);

    if (stepsError) {
      console.error('Error creating funnel steps:', stepsError);
    }
  }

  return funnel;
};

export const copyShareUrl = async (shareToken: string): Promise<string> => {
  const shareUrl = `${window.location.origin}/shared-funnel/${shareToken}`;
  await navigator.clipboard.writeText(shareUrl);
  return shareUrl;
};
