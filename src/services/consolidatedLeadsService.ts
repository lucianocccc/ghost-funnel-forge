
import { supabase } from '@/integrations/supabase/client';
import { 
  ConsolidatedLead, 
  ConsolidatedLeadWithDetails,
  LeadFilters
} from '@/types/consolidatedLeads';

export const fetchConsolidatedLeads = async (filters: LeadFilters = {}): Promise<ConsolidatedLeadWithDetails[]> => {
  let query = supabase
    .from('consolidated_leads')
    .select(`
      *,
      business_area:business_areas(*),
      business_sub_area:business_sub_areas(*),
      lead_submissions_mapping(
        *,
        submission:funnel_submissions(*)
      ),
      lead_interactions(*)
    `)
    .order('created_at', { ascending: false });

  // Apply filters
  if (filters.business_area_id) {
    query = query.eq('business_area_id', filters.business_area_id);
  }
  if (filters.business_sub_area_id) {
    query = query.eq('business_sub_area_id', filters.business_sub_area_id);
  }
  if (filters.status) {
    query = query.eq('status', filters.status);
  }
  if (filters.priority_level) {
    query = query.eq('priority_level', filters.priority_level);
  }
  if (filters.has_ai_analysis !== undefined) {
    if (filters.has_ai_analysis) {
      query = query.not('ai_analysis', 'is', null);
    } else {
      query = query.is('ai_analysis', null);
    }
  }
  if (filters.search_query) {
    query = query.or(`name.ilike.%${filters.search_query}%,email.ilike.%${filters.search_query}%,company.ilike.%${filters.search_query}%`);
  }
  if (filters.date_range) {
    query = query
      .gte('created_at', filters.date_range.start.toISOString())
      .lte('created_at', filters.date_range.end.toISOString());
  }

  const { data, error } = await query;

  if (error) throw error;
  
  // Add submissions count to each lead
  return (data || []).map(lead => ({
    ...lead,
    submissions_count: lead.lead_submissions_mapping?.length || 0
  }));
};

export const fetchConsolidatedLeadById = async (id: string): Promise<ConsolidatedLeadWithDetails | null> => {
  const { data, error } = await supabase
    .from('consolidated_leads')
    .select(`
      *,
      business_area:business_areas(*),
      business_sub_area:business_sub_areas(*),
      lead_submissions_mapping(
        *,
        submission:funnel_submissions(*)
      ),
      lead_interactions(*)
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  
  return data ? {
    ...data,
    submissions_count: data.lead_submissions_mapping?.length || 0
  } : null;
};

export const updateConsolidatedLead = async (
  id: string, 
  updates: Partial<ConsolidatedLead>
): Promise<ConsolidatedLead> => {
  const { data, error } = await supabase
    .from('consolidated_leads')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};
