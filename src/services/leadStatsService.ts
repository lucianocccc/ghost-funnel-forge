
import { supabase } from '@/integrations/supabase/client';

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
