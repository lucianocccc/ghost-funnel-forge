
import { supabase } from '@/integrations/supabase/client';
import { FunnelSubmission } from '@/types/interactiveFunnel';

export const submitFunnelStep = async (
  funnelId: string,
  stepId: string,
  submissionData: Record<string, any>,
  userInfo?: { email?: string; name?: string },
  analytics?: { source?: string; referrer_url?: string; session_id?: string; completion_time?: number }
): Promise<FunnelSubmission> => {
  console.log('=== FUNNEL SUBMISSION SERVICE ===');
  console.log('submitFunnelStep called with:', {
    funnelId,
    stepId,
    submissionData,
    userInfo,
    analytics
  });

  try {
    // First check if the funnel is public to ensure we can submit to it
    console.log('Checking if funnel is public...');
    const { data: funnelData, error: funnelError } = await supabase
      .from('interactive_funnels')
      .select('is_public, name, created_by')
      .eq('id', funnelId)
      .single();

    if (funnelError) {
      console.error('Error checking funnel:', funnelError);
      throw new Error(`Funnel not found: ${funnelError.message}`);
    }

    console.log('Funnel data:', funnelData);

    if (!funnelData.is_public) {
      console.error('Attempting to submit to non-public funnel');
      throw new Error('This funnel is not available for public submissions');
    }

    console.log('Funnel is public, proceeding with submission');

    const submissionPayload = {
      funnel_id: funnelId,
      step_id: stepId,
      submission_data: submissionData,
      user_email: userInfo?.email,
      user_name: userInfo?.name,
      source: analytics?.source || 'public_link',
      referrer_url: analytics?.referrer_url,
      session_id: analytics?.session_id,
      completion_time: analytics?.completion_time
    };

    console.log('Inserting submission with payload:', submissionPayload);

    // Use anon client for public submissions
    const { data, error } = await supabase
      .from('funnel_submissions')
      .insert(submissionPayload)
      .select()
      .single();

    if (error) {
      console.error('Supabase error during submission:', error);
      console.error('Error code:', error.code);
      console.error('Error details:', error.details);
      console.error('Error hint:', error.hint);
      console.error('Error message:', error.message);
      
      // More specific error handling
      if (error.message.includes('row-level security')) {
        throw new Error('Unable to submit to this funnel. Please check if the funnel is publicly accessible.');
      }
      
      throw new Error(`Failed to submit data: ${error.message}`);
    }

    console.log('Submission successful:', data);
    console.log('Trigger should now consolidate this submission into consolidated_leads');

    // Increment the submissions count for the funnel using the RPC function
    try {
      console.log('Incrementing funnel submissions count...');
      const { error: countError } = await supabase.rpc('increment_interactive_funnel_submissions', {
        funnel_id_param: funnelId
      });

      if (countError) {
        console.error('Error updating submission count:', countError);
        // Don't throw here as the main submission was successful
      } else {
        console.log('Successfully incremented submissions count');
      }
    } catch (countError) {
      console.error('Error updating submission count:', countError);
      // Don't throw here as the main submission was successful
    }

    console.log('=== SUBMISSION COMPLETED SUCCESSFULLY ===');
    return data;
  } catch (error) {
    console.error('=== SUBMISSION FAILED ===');
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
