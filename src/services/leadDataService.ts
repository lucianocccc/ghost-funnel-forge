
import { supabase } from '@/integrations/supabase/client';

export const leadDataService = {
  async fetchLeadById(leadId: string) {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('id', leadId)
      .single();

    if (error) throw error;
    return data;
  },

  async updateLeadScoreCalculation(leadId: string): Promise<void> {
    const { error } = await supabase
      .from('leads')
      .update({ last_score_calculation: new Date().toISOString() })
      .eq('id', leadId);

    if (error) throw error;
  }
};
