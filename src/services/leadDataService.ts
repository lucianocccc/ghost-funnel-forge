
import { supabase } from '@/integrations/supabase/client';

export const leadDataService = {
  async fetchLeadById(leadId: string) {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('id', leadId)
      .single();

    if (error) {
      console.error('Error fetching lead by ID:', error);
      throw error;
    }
    return data;
  },

  async updateLeadScoreCalculation(leadId: string): Promise<void> {
    const { error } = await supabase
      .from('leads')
      .update({ last_score_calculation: new Date().toISOString() })
      .eq('id', leadId);

    if (error) {
      console.error('Error updating lead score calculation:', error);
      throw error;
    }
  },

  async createLead(leadData: {
    nome?: string;
    email?: string;
    servizio?: string;
    bio?: string;
    source?: string;
  }) {
    // Get current user - now required for all leads
    const { data: userData } = await supabase.auth.getUser();
    
    if (!userData.user) {
      throw new Error('User must be authenticated to create leads');
    }
    
    const { data, error } = await supabase
      .from('leads')
      .insert([{
        ...leadData,
        user_id: userData.user.id // Now required and validated
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating lead:', error);
      throw error;
    }
    
    return data;
  }
};
