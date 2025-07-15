
import { supabase } from '@/integrations/supabase/client';
import { FunnelSubmission, SubmissionWithAnalysis } from '@/types/interactiveFunnel';

export interface SubmissionData {
  step_data: Record<string, any>;
  session_id: string;
  user_agent?: string;
  source?: string;
  referrer_url?: string;
}

export const submitFunnelStep = async (
  funnelId: string,
  stepId: string,
  submissionData: SubmissionData
): Promise<FunnelSubmission> => {
  console.log('📤 Submitting funnel step:', {
    funnelId,
    stepId,
    submissionData
  });

  // Extract user info from step data if available
  const userEmail = submissionData.step_data?.email || submissionData.step_data?.user_email;
  const userName = submissionData.step_data?.name || submissionData.step_data?.user_name;

  const submission = {
    funnel_id: funnelId,
    step_id: stepId,
    submission_data: submissionData.step_data,
    session_id: submissionData.session_id,
    user_email: userEmail,
    user_name: userName,
    user_agent: submissionData.user_agent,
    source: submissionData.source || 'direct',
    referrer_url: submissionData.referrer_url || window.location.href,
    device_type: getDeviceType(),
    browser_info: getBrowserInfo()
  };

  console.log('📋 Submission payload:', submission);

  const { data, error } = await supabase
    .from('funnel_submissions')
    .insert(submission)
    .select()
    .single();

  if (error) {
    console.error('❌ Submission error:', error);
    throw error;
  }

  console.log('✅ Submission successful:', data);
  return data;
};

export const fetchFunnelSubmissions = async (
  funnelId: string
): Promise<SubmissionWithAnalysis[]> => {
  const { data, error } = await supabase
    .from('funnel_submissions')
    .select(`
      *,
      interactive_funnel_steps (
        title,
        step_type
      )
    `)
    .eq('funnel_id', funnelId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

// Helper functions
const getDeviceType = (): string => {
  const userAgent = navigator.userAgent.toLowerCase();
  if (/mobile|android|ios|iphone|ipad|tablet/.test(userAgent)) {
    return 'mobile';
  }
  if (/tablet|ipad/.test(userAgent)) {
    return 'tablet';
  }
  return 'desktop';
};

const getBrowserInfo = (): string => {
  const userAgent = navigator.userAgent;
  let browser = 'Unknown';
  
  if (userAgent.indexOf('Chrome') > -1) {
    browser = 'Chrome';
  } else if (userAgent.indexOf('Firefox') > -1) {
    browser = 'Firefox';
  } else if (userAgent.indexOf('Safari') > -1) {
    browser = 'Safari';
  } else if (userAgent.indexOf('Edge') > -1) {
    browser = 'Edge';
  }
  
  return browser;
};
