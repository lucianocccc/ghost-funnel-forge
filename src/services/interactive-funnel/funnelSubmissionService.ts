
import { supabase } from '@/integrations/supabase/client';
import { FunnelSubmission } from '@/types/interactiveFunnel';

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

    // Increment the submissions count for the funnel using the RPC function
    try {
      const { error: countError } = await supabase.rpc('increment_interactive_funnel_submissions', {
        funnel_id_param: funnelId
      });

      if (countError) {
        console.error('Error updating submission count:', countError);
      }
    } catch (countError) {
      console.error('Error updating submission count:', countError);
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
