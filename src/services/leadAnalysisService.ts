
import { supabase } from '@/integrations/supabase/client';
import { LeadAnalysisResult, ConsolidatedLead } from '@/types/consolidatedLeads';
import { fetchConsolidatedLeadById, updateConsolidatedLead } from './consolidatedLeadsService';

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

  // Update lead with analysis results - properly serialize the data for JSON storage
  await updateConsolidatedLead(leadId, {
    ai_analysis: analysisResult as any, // Cast to any for JSON storage
    ai_insights: analysisResult.insights as any, // Cast to any for JSON storage
    ai_recommendations: analysisResult.recommendations as any, // Cast to any for JSON storage
    action_plan: analysisResult.action_plan as any, // Cast to any for JSON storage
    lead_score: analysisResult.lead_score,
    priority_level: analysisResult.priority_level,
    analyzed_at: new Date().toISOString(),
    next_follow_up: analysisResult.next_follow_up_suggestion?.toISOString().split('T')[0]
  });

  return analysisResult;
};
