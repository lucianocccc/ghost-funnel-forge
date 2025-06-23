
import { Database } from '@/integrations/supabase/types';

export type BusinessArea = Database['public']['Tables']['business_areas']['Row'];
export type BusinessSubArea = Database['public']['Tables']['business_sub_areas']['Row'];
export type ConsolidatedLead = Database['public']['Tables']['consolidated_leads']['Row'];
export type LeadSubmissionsMapping = Database['public']['Tables']['lead_submissions_mapping']['Row'];
export type LeadInteraction = Database['public']['Tables']['lead_interactions']['Row'];

export interface BusinessAreaWithSubAreas extends BusinessArea {
  business_sub_areas: BusinessSubArea[];
}

export interface ConsolidatedLeadWithDetails extends ConsolidatedLead {
  business_area?: BusinessArea;
  business_sub_area?: BusinessSubArea;
  lead_submissions_mapping?: (LeadSubmissionsMapping & {
    submission: any; // Will contain funnel_submissions data
  })[];
  lead_interactions?: LeadInteraction[];
  submissions_count?: number;
}

export interface LeadFilters {
  business_area_id?: string;
  business_sub_area_id?: string;
  status?: ConsolidatedLead['status'];
  priority_level?: ConsolidatedLead['priority_level'];
  has_ai_analysis?: boolean;
  search_query?: string;
  date_range?: {
    start: Date;
    end: Date;
  };
}

export interface LeadAnalysisResult {
  lead_score: number;
  priority_level: 'low' | 'medium' | 'high' | 'urgent';
  business_area_recommendation?: string;
  business_sub_area_recommendation?: string;
  insights: string[];
  recommendations: string[];
  action_plan: Array<{
    action: string;
    priority: 'high' | 'medium' | 'low';
    estimated_days: number;
  }>;
  next_follow_up_suggestion?: Date;
}

export interface InteractionCreate {
  consolidated_lead_id: string;
  interaction_type: 'email' | 'call' | 'meeting' | 'note' | 'task' | 'automation';
  subject?: string;
  content?: string;
  metadata?: Record<string, any>;
}
