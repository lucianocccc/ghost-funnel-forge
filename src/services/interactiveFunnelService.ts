import { supabase } from '@/integrations/supabase/client';
import { InteractiveFunnel, InteractiveFunnelStep, InteractiveFunnelWithSteps, FunnelSubmission, ShareableFunnel } from '@/types/interactiveFunnel';

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

export const fetchSharedFunnel = async (shareToken: string): Promise<ShareableFunnel | null> => {
  // Increment view count
  const { error: updateError } = await supabase.rpc('increment_interactive_funnel_views', {
    share_token_param: shareToken
  });

  if (updateError) {
    console.error('Error updating view count:', updateError);
  }

  // Fetch the funnel data
  const { data, error } = await supabase
    .from('interactive_funnels')
    .select(`
      *,
      interactive_funnel_steps (*)
    `)
    .eq('share_token', shareToken)
    .eq('is_public', true)
    .single();

  if (error) throw error;
  return data;
};

export const toggleFunnelPublic = async (funnelId: string, isPublic: boolean): Promise<void> => {
  const { error } = await supabase
    .from('interactive_funnels')
    .update({ is_public: isPublic })
    .eq('id', funnelId);

  if (error) throw error;
};

export const regenerateShareToken = async (funnelId: string): Promise<string> => {
  const { data, error } = await supabase
    .from('interactive_funnels')
    .update({ share_token: null }) // This will trigger the default value generation
    .eq('id', funnelId)
    .select('share_token')
    .single();

  if (error) throw error;
  return data.share_token;
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
  userInfo?: { email?: string; name?: string },
  analytics?: { source?: string; referrer_url?: string; session_id?: string; completion_time?: number }
): Promise<FunnelSubmission> => {
  console.log('submitFunnelStep called with:', {
    funnelId,
    stepId,
    submissionData,
    userInfo,
    analytics
  });

  try {
    // First, let's try to insert the submission
    const submissionPayload = {
      funnel_id: funnelId,
      step_id: stepId,
      submission_data: submissionData,
      user_email: userInfo?.email,
      user_name: userInfo?.name,
      source: analytics?.source || 'direct',
      referrer_url: analytics?.referrer_url,
      session_id: analytics?.session_id,
      completion_time: analytics?.completion_time
    };

    console.log('Inserting submission with payload:', submissionPayload);

    const { data, error } = await supabase
      .from('funnel_submissions')
      .insert(submissionPayload)
      .select()
      .single();

    if (error) {
      console.error('Supabase error during submission:', error);
      throw new Error(`Failed to submit data: ${error.message}`);
    }

    console.log('Submission successful:', data);

    // Increment the submissions count for the funnel
    try {
      await supabase.rpc('increment_interactive_funnel_submissions', {
        funnel_id_param: funnelId
      });
    } catch (countError) {
      console.error('Error updating submission count:', countError);
      // Don't throw here, the submission was successful
    }

    return data;
  } catch (error) {
    console.error('Error in submitFunnelStep:', error);
    throw error;
  }
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

export const getFunnelAnalytics = async (funnelId: string) => {
  const { data: funnel, error: funnelError } = await supabase
    .from('interactive_funnels')
    .select('views_count, submissions_count')
    .eq('id', funnelId)
    .single();

  if (funnelError) throw funnelError;

  const { data: submissions, error: submissionsError } = await supabase
    .from('funnel_submissions')
    .select('created_at, source')
    .eq('funnel_id', funnelId);

  if (submissionsError) throw submissionsError;

  return {
    views: funnel.views_count,
    submissions: funnel.submissions_count,
    submissionDetails: submissions || []
  };
};
