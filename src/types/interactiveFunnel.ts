import { Database } from '@/integrations/supabase/types';

export type InteractiveFunnel = Database['public']['Tables']['interactive_funnels']['Row'];
export type InteractiveFunnelStep = Database['public']['Tables']['interactive_funnel_steps']['Row'];
export type FunnelSubmission = Database['public']['Tables']['funnel_submissions']['Row'];
export type LeadAnalysisInteractive = Database['public']['Tables']['lead_analysis_interactive']['Row'];

export interface InteractiveFunnelWithSteps extends InteractiveFunnel {
  interactive_funnel_steps: InteractiveFunnelStep[];
}

export interface FormFieldConfig {
  id: string;
  type: 'text' | 'email' | 'tel' | 'textarea' | 'select' | 'checkbox' | 'radio';
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: string[];
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
  };
}

export interface StepSettings {
  showProgressBar?: boolean;
  allowBack?: boolean;
  submitButtonText?: string;
  backgroundColor?: string;
  textColor?: string;
}

export interface SubmissionWithAnalysis extends FunnelSubmission {
  analysis_results?: {
    score: number;
    insights: string[];
    recommendations: string[];
    priority_level: 'low' | 'medium' | 'high';
  };
}

export interface AdvancedTargetAudience {
  primary: string;
  demographics?: string;
  psychographics?: string;
  pain_points?: string[];
  desires?: string[];
  objections?: string[];
  preferred_communication?: string;
}

export interface EmpathicAnalysis {
  business_model_insights?: string[];
  target_psychology?: string[];
  market_opportunities?: string[];
  competitive_gaps?: string[];
  growth_potential?: 'alto' | 'medio' | 'basso';
  risk_factors?: string[];
  user_challenges?: string[];
  psychological_triggers?: string[];
  competitive_advantages?: string[];
}

export interface PersonalizationData {
  dynamic_content_areas?: string[];
  behavioral_triggers?: string[];
  segmentation_logic?: string;
  adaptive_messaging?: string;
  progressive_profiling?: string;
}

export interface AdvancedFeatures {
  ai_personalization?: string;
  predictive_analytics?: string;
  automation_workflows?: string[];
  integration_recommendations?: string[];
}

export interface AdvancedStrategy {
  implementation_approach?: string;
  traffic_sources?: string[];
  budget_allocation?: string;
  kpi_tracking?: string[];
  ab_testing_priorities?: string[];
  follow_up_strategy?: string;
  scaling_roadmap?: string;
  risk_mitigation?: string;
}

export interface CreationContext {
  business_description?: string;
  target_audience?: string;
  main_goal?: string;
  budget_range?: string;
  timeline?: string;
  industry?: string;
  experience_level?: string;
  specific_requirements?: string;
  preferred_style?: string;
  created_at?: string;
}

export interface MagneticElements {
  primaryHook?: string;
  secondaryHook?: string;
  urgencyTrigger?: string;
  socialProof?: string;
  valueProposition?: string;
  emotionalTriggers?: string[];
}

export interface FunnelSettings {
  customer_facing?: {
    hero_title?: string;
    hero_subtitle?: string;
    value_proposition?: string;
    social_proof_elements?: string[];
    brand_colors?: {
      primary?: string;
      secondary?: string;
      accent?: string;
    };
    style_theme?: string;
    psychological_approach?: string;
    trust_building_strategy?: string;
  };
  target_audience?: string | AdvancedTargetAudience;
  industry?: string;
  strategy?: string | AdvancedStrategy;
  personalization_data?: PersonalizationData;
  advanced_features?: AdvancedFeatures;
  empathic_analysis?: EmpathicAnalysis;
  roi_projection?: string;
  estimated_conversion_rate?: string;
  personalization_level?: 'basic' | 'intermediate' | 'advanced';
  creation_context?: CreationContext;
  magneticElements?: MagneticElements;
}

export interface SmartFunnelRequest {
  business_description: string;
  target_audience?: string;
  main_goal?: string;
  budget_range?: string;
  timeline?: string;
  industry?: string;
  experience_level?: string;
  specific_requirements?: string;
  preferred_style?: string;
}

export interface ShareableFunnel extends Omit<InteractiveFunnelWithSteps, 'settings'> {
  share_token: string;
  is_public: boolean;
  views_count: number;
  submissions_count: number;
  settings?: FunnelSettings;
}
