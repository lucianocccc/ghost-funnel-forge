
import { supabase } from '@/integrations/supabase/client';

export interface EnhancedAnalysisData {
  funnel_context: {
    funnel_name: string;
    funnel_description?: string;
    funnel_type: string;
    submission_steps: string[];
    lead_journey: any[];
  };
  behavioral_analysis: {
    engagement_level: 'high' | 'medium' | 'low';
    response_speed: number;
    form_completion_rate: number;
    session_duration: number;
    interaction_patterns: string[];
  };
  engagement_patterns: {
    preferred_contact_times: string[];
    device_preferences: string[];
    content_engagement: any[];
    communication_style: string;
  };
  predictive_insights: {
    conversion_likelihood: number;
    best_approach: string;
    potential_objections: string[];
    success_factors: string[];
  };
  personalized_strategy: {
    recommended_approach: string;
    messaging_tone: string;
    priority_pain_points: string[];
    value_propositions: string[];
    next_actions: string[];
  };
  optimal_contact_timing: {
    best_days: string[];
    best_times: string[];
    frequency_recommendation: string;
    channel_preferences: string[];
  };
}

export const analyzeLeadWithEnhancedAI = async (leadId: string): Promise<void> => {
  console.log('Starting enhanced AI analysis for lead:', leadId);

  try {
    // Fetch lead data with all related information
    const { data: leadData, error: leadError } = await supabase
      .from('consolidated_leads')
      .select(`
        *,
        business_area:business_areas(*),
        business_sub_area:business_sub_areas(*),
        lead_submissions_mapping(
          *,
          submission:funnel_submissions(*)
        ),
        lead_interactions(*),
        source_funnel:interactive_funnels(*)
      `)
      .eq('id', leadId)
      .single();

    if (leadError) throw leadError;
    if (!leadData) throw new Error('Lead not found');

    console.log('Lead data fetched:', leadData);

    // Prepare analysis data
    const analysisData = await prepareAnalysisData(leadData);
    
    // Call AI analysis edge function
    const { data: aiResponse, error: aiError } = await supabase.functions.invoke('analyze-enhanced-lead', {
      body: {
        leadData,
        analysisContext: analysisData
      }
    });

    if (aiError) throw aiError;

    console.log('AI analysis response:', aiResponse);

    // Store enhanced analysis
    await storeEnhancedAnalysis(leadId, aiResponse);

    // Update lead with basic analysis summary
    await supabase
      .from('consolidated_leads')
      .update({
        ai_analysis: aiResponse.summary,
        analyzed_at: new Date().toISOString(),
        priority_level: aiResponse.priority_level,
        lead_score: aiResponse.total_score
      })
      .eq('id', leadId);

    console.log('Enhanced analysis completed successfully');

  } catch (error) {
    console.error('Error in enhanced lead analysis:', error);
    throw error;
  }
};

const prepareAnalysisData = async (leadData: any): Promise<any> => {
  const submissions = leadData.lead_submissions_mapping || [];
  const interactions = leadData.lead_interactions || [];
  const funnel = leadData.source_funnel;

  return {
    lead_profile: {
      name: leadData.name,
      email: leadData.email,
      phone: leadData.phone,
      company: leadData.company,
      business_area: leadData.business_area?.name,
      created_at: leadData.created_at
    },
    funnel_context: {
      funnel_name: funnel?.name,
      funnel_description: funnel?.description,
      is_public: funnel?.is_public,
      total_submissions: submissions.length
    },
    submission_history: submissions.map((mapping: any) => ({
      submission_data: mapping.submission_data,
      created_at: mapping.created_at,
      funnel_context: mapping.submission_data?.funnel_context
    })),
    interaction_history: interactions.map((interaction: any) => ({
      type: interaction.interaction_type,
      content: interaction.content,
      created_at: interaction.created_at
    })),
    business_context: {
      area: leadData.business_area?.name,
      sub_area: leadData.business_sub_area?.name,
      industry_insights: true
    }
  };
};

const storeEnhancedAnalysis = async (leadId: string, aiResponse: any): Promise<void> => {
  // Store enhanced analysis
  const { error: analysisError } = await supabase
    .from('enhanced_lead_analysis')
    .upsert({
      consolidated_lead_id: leadId,
      funnel_context: aiResponse.funnel_context || {},
      behavioral_analysis: aiResponse.behavioral_analysis || {},
      engagement_patterns: aiResponse.engagement_patterns || {},
      predictive_insights: aiResponse.predictive_insights || {},
      personalized_strategy: aiResponse.personalized_strategy || {},
      optimal_contact_timing: aiResponse.optimal_contact_timing || {},
      conversion_probability: aiResponse.conversion_probability || 0,
      lead_temperature: aiResponse.lead_temperature || 'cold',
      engagement_score: aiResponse.engagement_score || 0,
      personalization_level: aiResponse.personalization_level || 'basic',
      next_action_recommendation: aiResponse.next_action_recommendation,
      confidence_score: aiResponse.confidence_score || 0
    });

  if (analysisError) throw analysisError;

  // Store advanced scoring
  const { error: scoringError } = await supabase
    .from('advanced_lead_scoring')
    .upsert({
      consolidated_lead_id: leadId,
      demographic_score: aiResponse.scoring?.demographic_score || 0,
      behavioral_score: aiResponse.scoring?.behavioral_score || 0,
      engagement_score: aiResponse.scoring?.engagement_score || 0,
      timing_score: aiResponse.scoring?.timing_score || 0,
      context_score: aiResponse.scoring?.context_score || 0,
      total_score: aiResponse.total_score || 0,
      score_breakdown: aiResponse.scoring?.breakdown || {},
      scoring_factors: aiResponse.scoring?.factors || {},
      improvement_suggestions: aiResponse.scoring?.improvements || []
    });

  if (scoringError) throw scoringError;

  // Store predictive analytics
  const { error: predictiveError } = await supabase
    .from('predictive_analytics')
    .upsert({
      consolidated_lead_id: leadId,
      conversion_probability: aiResponse.predictive?.conversion_probability || 0,
      optimal_contact_window: aiResponse.predictive?.contact_window || {},
      predicted_lifetime_value: aiResponse.predictive?.lifetime_value || 0,
      churn_risk_score: aiResponse.predictive?.churn_risk || 0,
      engagement_forecast: aiResponse.predictive?.engagement_forecast || {},
      market_trends_impact: aiResponse.predictive?.market_trends || {},
      seasonal_patterns: aiResponse.predictive?.seasonal_patterns || {},
      competitive_analysis: aiResponse.predictive?.competitive_analysis || {},
      predicted_actions: aiResponse.predictive?.predicted_actions || [],
      confidence_intervals: aiResponse.predictive?.confidence_intervals || {}
    });

  if (predictiveError) throw predictiveError;
};

export const fetchEnhancedAnalysis = async (leadId: string) => {
  const { data, error } = await supabase
    .from('enhanced_lead_analysis')
    .select('*')
    .eq('consolidated_lead_id', leadId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
};

export const fetchAdvancedScoring = async (leadId: string) => {
  const { data, error } = await supabase
    .from('advanced_lead_scoring')
    .select('*')
    .eq('consolidated_lead_id', leadId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
};

export const fetchPredictiveAnalytics = async (leadId: string) => {
  const { data, error } = await supabase
    .from('predictive_analytics')
    .select('*')
    .eq('consolidated_lead_id', leadId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
};
