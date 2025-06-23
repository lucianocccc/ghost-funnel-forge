
import { supabase } from '@/integrations/supabase/client';
import { 
  BusinessArea, 
  BusinessAreaWithSubAreas, 
  ConsolidatedLead, 
  ConsolidatedLeadWithDetails,
  LeadFilters,
  InteractionCreate,
  LeadAnalysisResult
} from '@/types/consolidatedLeads';

export const fetchBusinessAreas = async (): Promise<BusinessAreaWithSubAreas[]> => {
  const { data, error } = await supabase
    .from('business_areas')
    .select(`
      *,
      business_sub_areas (*)
    `)
    .eq('is_active', true)
    .order('name');

  if (error) throw error;
  return data || [];
};

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

export const createLeadInteraction = async (interaction: InteractionCreate): Promise<void> => {
  const { error } = await supabase
    .from('lead_interactions')
    .insert({
      ...interaction,
      created_by: (await supabase.auth.getUser()).data.user?.id
    });

  if (error) throw error;
};

export const analyzeLeadWithAI = async (leadId: string): Promise<LeadAnalysisResult> => {
  // Get lead details
  const lead = await fetchConsolidatedLeadById(leadId);
  if (!lead) throw new Error('Lead not found');

  // Prepare data for AI analysis
  const analysisData = {
    lead_info: {
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      company: lead.company,
      business_area: lead.business_area?.name,
      business_sub_area: lead.business_sub_area?.name
    },
    submissions: lead.lead_submissions_mapping?.map(mapping => mapping.submission_data) || [],
    interactions: lead.lead_interactions || []
  };

  // Call AI analysis (placeholder - you would implement actual AI logic)
  const analysisResult: LeadAnalysisResult = {
    lead_score: Math.floor(Math.random() * 100) + 1, // Placeholder scoring
    priority_level: 'medium',
    insights: [
      'Cliente potenzialmente interessato basato sui dati forniti',
      'Necessita di follow-up entro 3 giorni'
    ],
    recommendations: [
      'Inviare email di follow-up personalizzata',
      'Programmare chiamata conoscitiva'
    ],
    action_plan: [
      {
        action: 'Invia email di benvenuto',
        priority: 'high',
        estimated_days: 1
      },
      {
        action: 'Programma chiamata di qualificazione',
        priority: 'medium',
        estimated_days: 3
      }
    ]
  };

  // Update lead with analysis results
  await updateConsolidatedLead(leadId, {
    ai_analysis: analysisResult,
    ai_insights: analysisResult.insights,
    ai_recommendations: analysisResult.recommendations,
    action_plan: analysisResult.action_plan,
    lead_score: analysisResult.lead_score,
    priority_level: analysisResult.priority_level,
    analyzed_at: new Date().toISOString(),
    next_follow_up: analysisResult.next_follow_up_suggestion?.toISOString().split('T')[0]
  });

  return analysisResult;
};

export const getLeadStats = async () => {
  const { data: leads, error } = await supabase
    .from('consolidated_leads')
    .select('status, priority_level, lead_score, analyzed_at');

  if (error) throw error;

  const stats = {
    total: leads?.length || 0,
    by_status: {
      new: 0,
      contacted: 0,
      in_progress: 0,
      qualified: 0,
      converted: 0,
      lost: 0
    },
    by_priority: {
      low: 0,
      medium: 0,
      high: 0,
      urgent: 0
    },
    analyzed: 0,
    avg_score: 0
  };

  leads?.forEach(lead => {
    stats.by_status[lead.status as keyof typeof stats.by_status]++;
    stats.by_priority[lead.priority_level as keyof typeof stats.by_priority]++;
    
    if (lead.analyzed_at) {
      stats.analyzed++;
    }
  });

  const scores = leads?.filter(l => l.lead_score).map(l => l.lead_score) || [];
  stats.avg_score = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;

  return stats;
};
