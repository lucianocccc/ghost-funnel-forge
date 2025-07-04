
import { Database } from '@/integrations/supabase/types';

export type BusinessArea = Database['public']['Tables']['business_areas']['Row'];
export type BusinessSubArea = Database['public']['Tables']['business_sub_areas']['Row'];
export type ConsolidatedLead = Database['public']['Tables']['consolidated_leads']['Row'];
export type LeadSubmissionsMapping = Database['public']['Tables']['lead_submissions_mapping']['Row'];
export type LeadInteraction = Database['public']['Tables']['lead_interactions']['Row'];
export type EnhancedLeadAnalysis = Database['public']['Tables']['enhanced_lead_analysis']['Row'];
export type AdvancedLeadScoring = Database['public']['Tables']['advanced_lead_scoring']['Row'];
export type PredictiveAnalytics = Database['public']['Tables']['predictive_analytics']['Row'];

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
  enhanced_lead_analysis?: EnhancedLeadAnalysis[]; // This is an array since it's one-to-many
  advanced_lead_scoring?: AdvancedLeadScoring; // This is a single object (one-to-one)
  predictive_analytics?: PredictiveAnalytics; // This is a single object (one-to-one)
  submissions_count?: number;
  has_enhanced_analysis?: boolean;
  has_advanced_scoring?: boolean;
  has_predictive_analytics?: boolean;
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

// Helper function to safely parse JSON arrays
export const parseJsonArray = (jsonValue: any): any[] => {
  if (Array.isArray(jsonValue)) {
    return jsonValue;
  }
  if (typeof jsonValue === 'string') {
    try {
      const parsed = JSON.parse(jsonValue);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
};

// Helper function to safely get array length
export const getJsonArrayLength = (jsonValue: any): number => {
  return parseJsonArray(jsonValue).length;
};

// Helper to safely parse AI analysis JSON
export const parseAiAnalysis = (aiAnalysis: any): { summary?: string } | null => {
  if (!aiAnalysis) return null;
  
  if (typeof aiAnalysis === 'object' && aiAnalysis !== null) {
    return aiAnalysis as { summary?: string };
  }
  
  if (typeof aiAnalysis === 'string') {
    try {
      return JSON.parse(aiAnalysis) as { summary?: string };
    } catch {
      return null;
    }
  }
  
  return null;
};
