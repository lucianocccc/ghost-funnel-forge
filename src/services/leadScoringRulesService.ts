
import { supabase } from '@/integrations/supabase/client';
import { LeadScoringRule, CreateRuleData, UpdateRuleData } from '@/types/leadScoring';

export const leadScoringRulesService = {
  async fetchRules(): Promise<LeadScoringRule[]> {
    const { data, error } = await supabase
      .from('lead_scoring_rules')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    // Transform the data to match our interface
    return (data || []).map(item => ({
      ...item,
      rule_type: item.rule_type as LeadScoringRule['rule_type'],
      condition_operator: item.condition_operator as LeadScoringRule['condition_operator']
    })) as LeadScoringRule[];
  },

  async createRule(rule: CreateRuleData): Promise<LeadScoringRule> {
    const { data, error } = await supabase
      .from('lead_scoring_rules')
      .insert(rule)
      .select()
      .single();

    if (error) throw error;

    return {
      ...data,
      rule_type: data.rule_type as LeadScoringRule['rule_type'],
      condition_operator: data.condition_operator as LeadScoringRule['condition_operator']
    } as LeadScoringRule;
  },

  async updateRule(id: string, updates: UpdateRuleData): Promise<LeadScoringRule> {
    const { data, error } = await supabase
      .from('lead_scoring_rules')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return {
      ...data,
      rule_type: data.rule_type as LeadScoringRule['rule_type'],
      condition_operator: data.condition_operator as LeadScoringRule['condition_operator']
    } as LeadScoringRule;
  },

  async deleteRule(id: string): Promise<void> {
    const { error } = await supabase
      .from('lead_scoring_rules')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};
