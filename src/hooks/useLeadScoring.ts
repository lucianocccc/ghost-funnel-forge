import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface LeadScoringRule {
  id: string;
  name: string;
  description?: string;
  rule_type: 'response_time' | 'message_length' | 'source' | 'tone';
  condition_operator: 'less_than' | 'greater_than' | 'equals' | 'contains';
  condition_value: string;
  points: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LeadScore {
  id: string;
  lead_id: string;
  total_score: number;
  score_breakdown: Record<string, any>;
  motivation?: string;
  tone_analysis?: Record<string, any>;
  calculated_at: string;
}

export const useLeadScoring = () => {
  const [rules, setRules] = useState<LeadScoringRule[]>([]);
  const [scores, setScores] = useState<LeadScore[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchRules = async () => {
    try {
      const { data, error } = await supabase
        .from('lead_scoring_rules')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform the data to match our interface
      const transformedData = (data || []).map(item => ({
        ...item,
        rule_type: item.rule_type as LeadScoringRule['rule_type'],
        condition_operator: item.condition_operator as LeadScoringRule['condition_operator']
      })) as LeadScoringRule[];
      
      setRules(transformedData);
    } catch (error) {
      console.error('Error fetching scoring rules:', error);
      toast({
        title: "Errore",
        description: "Errore nel caricamento delle regole di scoring",
        variant: "destructive",
      });
    }
  };

  const fetchScores = async () => {
    try {
      const { data, error } = await supabase
        .from('lead_scores')
        .select('*')
        .order('calculated_at', { ascending: false });

      if (error) throw error;
      
      // Transform the data to match our interface
      const transformedData = (data || []).map(item => ({
        ...item,
        score_breakdown: typeof item.score_breakdown === 'object' ? item.score_breakdown : {},
        tone_analysis: typeof item.tone_analysis === 'object' ? item.tone_analysis : undefined
      })) as LeadScore[];
      
      setScores(transformedData);
    } catch (error) {
      console.error('Error fetching lead scores:', error);
      toast({
        title: "Errore",
        description: "Errore nel caricamento dei punteggi",
        variant: "destructive",
      });
    }
  };

  const createRule = async (rule: Omit<LeadScoringRule, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('lead_scoring_rules')
        .insert(rule)
        .select()
        .single();

      if (error) throw error;

      const transformedData = {
        ...data,
        rule_type: data.rule_type as LeadScoringRule['rule_type'],
        condition_operator: data.condition_operator as LeadScoringRule['condition_operator']
      } as LeadScoringRule;

      setRules(prev => [transformedData, ...prev]);
      toast({
        title: "Successo",
        description: "Regola di scoring creata",
      });

      return transformedData;
    } catch (error) {
      console.error('Error creating scoring rule:', error);
      toast({
        title: "Errore",
        description: "Errore nella creazione della regola",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateRule = async (id: string, updates: Partial<LeadScoringRule>) => {
    try {
      const { data, error } = await supabase
        .from('lead_scoring_rules')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const transformedData = {
        ...data,
        rule_type: data.rule_type as LeadScoringRule['rule_type'],
        condition_operator: data.condition_operator as LeadScoringRule['condition_operator']
      } as LeadScoringRule;

      setRules(prev => prev.map(rule => rule.id === id ? transformedData : rule));
      toast({
        title: "Successo",
        description: "Regola aggiornata",
      });

      return transformedData;
    } catch (error) {
      console.error('Error updating scoring rule:', error);
      toast({
        title: "Errore",
        description: "Errore nell'aggiornamento della regola",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteRule = async (id: string) => {
    try {
      const { error } = await supabase
        .from('lead_scoring_rules')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setRules(prev => prev.filter(rule => rule.id !== id));
      toast({
        title: "Successo",
        description: "Regola eliminata",
      });
    } catch (error) {
      console.error('Error deleting scoring rule:', error);
      toast({
        title: "Errore",
        description: "Errore nell'eliminazione della regola",
        variant: "destructive",
      });
      throw error;
    }
  };

  const calculateLeadScore = async (leadId: string) => {
    try {
      const { data: leadData, error: leadError } = await supabase
        .from('leads')
        .select('*')
        .eq('id', leadId)
        .single();

      if (leadError) throw leadError;

      const activeRules = rules.filter(rule => rule.is_active);
      let totalScore = 0;
      const breakdown: Record<string, any> = {};

      // Calculate scores based on rules
      for (const rule of activeRules) {
        let ruleScore = 0;
        let applies = false;

        switch (rule.rule_type) {
          case 'response_time':
            if (leadData.response_time_minutes !== null) {
              const value = leadData.response_time_minutes;
              applies = evaluateCondition(value, rule.condition_operator, parseInt(rule.condition_value));
            }
            break;
          case 'message_length':
            if (leadData.message_length !== null) {
              const value = leadData.message_length;
              applies = evaluateCondition(value, rule.condition_operator, parseInt(rule.condition_value));
            }
            break;
          case 'source':
            if (leadData.source) {
              applies = evaluateCondition(leadData.source, rule.condition_operator, rule.condition_value);
            }
            break;
        }

        if (applies) {
          ruleScore = rule.points;
          totalScore += ruleScore;
        }

        breakdown[rule.name] = {
          applies,
          points: ruleScore,
          rule_type: rule.rule_type
        };
      }

      // Upsert the score
      const { data, error } = await supabase
        .from('lead_scores')
        .upsert({
          lead_id: leadId,
          total_score: totalScore,
          score_breakdown: breakdown,
          calculated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      // Update lead's last calculation time
      await supabase
        .from('leads')
        .update({ last_score_calculation: new Date().toISOString() })
        .eq('id', leadId);

      const transformedData = {
        ...data,
        score_breakdown: typeof data.score_breakdown === 'object' ? data.score_breakdown : {},
        tone_analysis: typeof data.tone_analysis === 'object' ? data.tone_analysis : undefined
      } as LeadScore;

      setScores(prev => {
        const existing = prev.findIndex(s => s.lead_id === leadId);
        if (existing >= 0) {
          const newScores = [...prev];
          newScores[existing] = transformedData;
          return newScores;
        }
        return [transformedData, ...prev];
      });

      toast({
        title: "Successo",
        description: `Punteggio calcolato: ${totalScore} punti`,
      });

      return transformedData;
    } catch (error) {
      console.error('Error calculating lead score:', error);
      toast({
        title: "Errore",
        description: "Errore nel calcolo del punteggio",
        variant: "destructive",
      });
      throw error;
    }
  };

  const evaluateCondition = (value: any, operator: string, conditionValue: any): boolean => {
    switch (operator) {
      case 'less_than':
        return Number(value) < Number(conditionValue);
      case 'greater_than':
        return Number(value) > Number(conditionValue);
      case 'equals':
        return String(value).toLowerCase() === String(conditionValue).toLowerCase();
      case 'contains':
        return String(value).toLowerCase().includes(String(conditionValue).toLowerCase());
      default:
        return false;
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchRules(), fetchScores()]);
      setLoading(false);
    };

    loadData();
  }, []);

  return {
    rules,
    scores,
    loading,
    createRule,
    updateRule,
    deleteRule,
    calculateLeadScore,
    refetchRules: fetchRules,
    refetchScores: fetchScores
  };
};
