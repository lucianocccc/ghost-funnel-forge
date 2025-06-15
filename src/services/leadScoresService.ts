
import { supabase } from '@/integrations/supabase/client';
import { LeadScore } from '@/types/leadScoring';

export const leadScoresService = {
  async fetchScores(): Promise<LeadScore[]> {
    const { data, error } = await supabase
      .from('lead_scores')
      .select('*')
      .order('calculated_at', { ascending: false });

    if (error) throw error;
    
    // Transform the data to match our interface
    return (data || []).map(item => ({
      ...item,
      score_breakdown: typeof item.score_breakdown === 'object' ? item.score_breakdown : {},
      tone_analysis: typeof item.tone_analysis === 'object' ? item.tone_analysis : undefined
    })) as LeadScore[];
  },

  async upsertScore(score: {
    lead_id: string;
    total_score: number;
    score_breakdown: Record<string, any>;
    calculated_at: string;
  }): Promise<LeadScore> {
    const { data, error } = await supabase
      .from('lead_scores')
      .upsert(score)
      .select()
      .single();

    if (error) throw error;

    return {
      ...data,
      score_breakdown: typeof data.score_breakdown === 'object' ? data.score_breakdown : {},
      tone_analysis: typeof data.tone_analysis === 'object' ? data.tone_analysis : undefined
    } as LeadScore;
  }
};
