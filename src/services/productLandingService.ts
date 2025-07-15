
import { supabase } from '@/integrations/supabase/client';

export interface FormSubmissionData {
  [key: string]: string | boolean;
}

export const submitFunnelData = async (funnelId: string, formData: FormSubmissionData) => {
  try {
    // Get the funnel steps to find the form step
    const { data: steps, error: stepsError } = await supabase
      .from('interactive_funnel_steps')
      .select('*')
      .eq('funnel_id', funnelId)
      .eq('step_type', 'form')
      .order('step_order')
      .limit(1);

    if (stepsError || !steps || steps.length === 0) {
      throw new Error('Funnel step not found');
    }

    const formStep = steps[0];

    // Extract email and name for easier processing
    const userEmail = formData.email || formData.Email || '';
    const userName = formData.nome || formData.name || formData.Nome || '';

    // Submit the form data
    const { data: submission, error: submissionError } = await supabase
      .from('funnel_submissions')
      .insert({
        funnel_id: funnelId,
        step_id: formStep.id,
        submission_data: formData,
        user_email: userEmail as string,
        user_name: userName as string,
        lead_status: 'new',
        source: 'product_landing_page'
      })
      .select()
      .single();

    if (submissionError) {
      throw submissionError;
    }

    // Track analytics event
    await supabase
      .from('funnel_analytics_events')
      .insert({
        funnel_id: funnelId,
        step_id: formStep.id,
        event_type: 'form_submission',
        event_data: {
          submission_id: submission.id,
          form_data: formData,
          timestamp: new Date().toISOString()
        },
        user_email: userEmail as string
      });

    return submission;
  } catch (error) {
    console.error('Error submitting form data:', error);
    throw error;
  }
};

export const trackPageView = async (funnelId: string, shareToken: string) => {
  try {
    // Increment view count
    await supabase.rpc('increment_interactive_funnel_views', {
      share_token_param: shareToken
    });

    // Track analytics event
    await supabase
      .from('funnel_analytics_events')
      .insert({
        funnel_id: funnelId,
        event_type: 'page_view',
        event_data: {
          timestamp: new Date().toISOString(),
          page_type: 'product_landing_page'
        }
      });
  } catch (error) {
    console.error('Error tracking page view:', error);
  }
};
