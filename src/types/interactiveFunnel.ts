
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

export interface ShareableFunnel extends InteractiveFunnelWithSteps {
  share_token: string;
  is_public: boolean;
  views_count: number;
  submissions_count: number;
}
