
import { supabase } from '@/integrations/supabase/client';
import { InteractiveFunnel, InteractiveFunnelStep, InteractiveFunnelWithSteps } from '@/types/interactiveFunnel';

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

export {
  submitFunnelStep,
  fetchFunnelSubmissions
} from './interactive-funnel/funnelSubmissionService';

// Add missing functions that are imported by hooks
export const toggleFunnelPublic = async (funnelId: string, isPublic: boolean): Promise<void> => {
  const { error } = await supabase
    .from('interactive_funnels')
    .update({ is_public: isPublic })
    .eq('id', funnelId);

  if (error) throw error;
};

export const regenerateShareToken = async (funnelId: string): Promise<string> => {
  const newToken = `share_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const { error } = await supabase
    .from('interactive_funnels')
    .update({ share_token: newToken })
    .eq('id', funnelId);

  if (error) throw error;
  return newToken;
};

export const getFunnelAnalytics = async (funnelId: string): Promise<any> => {
  const { data, error } = await supabase
    .from('funnel_submissions')
    .select('*')
    .eq('funnel_id', funnelId);

  if (error) throw error;
  
  return {
    totalSubmissions: data?.length || 0,
    submissionsByDate: data || []
  };
};

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
