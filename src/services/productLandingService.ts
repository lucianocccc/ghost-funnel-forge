
import { supabase } from '@/integrations/supabase/client';

export const submitFunnelData = async (funnelId: string, formData: Record<string, any>) => {
  console.log('Submitting funnel data:', { funnelId, formData });
  
  try {
    const { data, error } = await supabase
      .from('funnel_submissions')
      .insert({
        funnel_id: funnelId,
        step_id: funnelId, // Using funnel_id as step_id for product landing pages
        submission_data: formData,
        user_name: formData.name || formData.nome,
        user_email: formData.email,
        source: 'product_landing'
      })
      .select()
      .single();

    if (error) {
      console.error('Error submitting funnel data:', error);
      throw error;
    }

    console.log('Funnel data submitted successfully:', data);
    return data;
  } catch (error) {
    console.error('Error in submitFunnelData:', error);
    throw error;
  }
};

export const trackPageView = async (funnelId: string, shareToken: string) => {
  console.log('Tracking page view:', { funnelId, shareToken });
  
  try {
    // Use the public function to increment views
    const { error } = await supabase.rpc('increment_interactive_funnel_views', {
      share_token_param: shareToken
    });

    if (error) {
      console.error('Error tracking page view:', error);
      // Don't throw here, as this is not critical for the user experience
    } else {
      console.log('Page view tracked successfully');
    }
  } catch (error) {
    console.error('Error in trackPageView:', error);
    // Don't throw here, as this is not critical for the user experience
  }
};
