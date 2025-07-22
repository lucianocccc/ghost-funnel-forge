
export interface InteractiveFunnel {
  id: string;
  name: string;
  description?: string;
  status: 'draft' | 'active' | 'archived';
  is_public: boolean;
  share_token?: string;
  settings?: any;
  views_count: number;
  submissions_count: number;
  created_by: string;
  ai_funnel_id?: string;
  funnel_type_id?: string;
  created_at: string;
  updated_at: string;
}

export interface InteractiveFunnelStep {
  id: string;
  funnel_id: string;
  title: string;
  description?: string;
  step_type: string;
  step_order: number;
  fields_config?: any;
  settings?: any;
  is_required: boolean;
  created_at: string;
  updated_at: string;
}

export interface InteractiveFunnelWithSteps extends InteractiveFunnel {
  interactive_funnel_steps: InteractiveFunnelStep[];
  funnel_type?: {
    id: string;
    name: string;
    description?: string;
    category: string;
    industry?: string;
    target_audience?: string;
  };
}

export interface FunnelSubmission {
  id: string;
  funnel_id: string;
  step_id: string;
  submission_data: any;
  session_id: string;
  user_email?: string;
  user_name?: string;
  user_agent?: string;
  source?: string;
  referrer_url?: string;
  device_type?: string;
  browser_info?: string;
  created_at: string;
  lead_status?: string;
  completion_time?: number;
}

export interface SubmissionWithAnalysis extends FunnelSubmission {
  interactive_funnel_steps?: {
    title: string;
    step_type: string;
  };
}

// Form field configuration
export interface FormFieldConfig {
  id: string;
  type: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: string[] | { label: string; value: string }[];
  defaultValue?: any;
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    message?: string;
  };
}

// Step settings
export interface StepSettings {
  showProgressBar?: boolean;
  allowBack?: boolean;
  submitButtonText?: string;
  backgroundColor?: string;
  textColor?: string;
  customer_description?: string;
  customer_motivation?: string;
  [key: string]: any;
}

// Shareable funnel type
export interface ShareableFunnel extends InteractiveFunnelWithSteps {
  is_public: boolean;
  share_token: string;
  // Additional properties for shareable funnels
  customer_facing_data?: {
    title?: string;
    subtitle?: string;
    theme?: string;
  };
}

// Smart funnel types
export interface EmpathicAnalysis {
  customer_pain_points: string[];
  emotional_triggers: string[];
  decision_factors: string[];
  communication_style: string;
  // Added missing properties
  business_model_insights?: string[];
  market_opportunities?: string[];
  psychological_triggers?: string[];
  competitive_advantages?: string[];
  growth_potential?: string;
}

export interface AdvancedTargetAudience {
  demographics: {
    age_range?: string;
    gender?: string;
    income_level?: string;
    education?: string;
    occupation?: string;
  };
  psychographics: {
    interests: string[];
    values: string[];
    lifestyle: string;
    personality_traits: string[];
  };
  behavior_patterns: string[];
  // Added missing properties
  primary?: string;
  pain_points?: string[];
  desires?: string[];
  objections?: string[];
}

export interface AdvancedStrategy {
  usp_points: string[];
  conversion_triggers: string[];
  trust_building_elements: string[];
  objection_handling: Record<string, string>;
  // Added missing properties
  implementation_approach?: string;
  traffic_sources?: string[];
  kpi_tracking?: string[];
  ab_testing_priorities?: string[];
  scaling_roadmap?: string;
}

export interface PersonalizationData {
  dynamic_content_rules?: any[];
  conditional_paths?: any[];
  personalized_offers?: any[];
  // Added missing properties
  behavioral_triggers?: string[];
  segmentation_logic?: string;
}

export interface SmartFunnelRequest {
  // Updated with the fields used in SmartFunnelWizard
  business_description: string;
  targetAudience: string; // Consistently use targetAudience not target_audience
  main_goal: string;
  budget_range: string;
  timeline: string;
  industry: string;
  experience_level: string;
  specific_requirements: string;
  preferred_style: string;
}
