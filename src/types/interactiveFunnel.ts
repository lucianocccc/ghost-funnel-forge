
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
}

export interface SubmissionWithAnalysis extends FunnelSubmission {
  interactive_funnel_steps?: {
    title: string;
    step_type: string;
  };
}
