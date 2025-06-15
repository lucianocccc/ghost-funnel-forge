
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { LeadScoringRule, LeadScore, CreateRuleData, UpdateRuleData } from '@/types/leadScoring';
import { leadScoringRulesService } from '@/services/leadScoringRulesService';
import { leadScoresService } from '@/services/leadScoresService';
import { leadDataService } from '@/services/leadDataService';
import { calculateScoreForRules } from '@/utils/scoringCalculation';

export const useLeadScoring = () => {
  const [rules, setRules] = useState<LeadScoringRule[]>([]);
  const [scores, setScores] = useState<LeadScore[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchRules = useCallback(async () => {
    try {
      const data = await leadScoringRulesService.fetchRules();
      setRules(data);
    } catch (error) {
      console.error('Error fetching scoring rules:', error);
      toast({
        title: "Errore",
        description: "Errore nel caricamento delle regole di scoring",
        variant: "destructive",
      });
    }
  }, [toast]);

  const fetchScores = useCallback(async () => {
    try {
      const data = await leadScoresService.fetchScores();
      setScores(data);
    } catch (error) {
      console.error('Error fetching lead scores:', error);
      toast({
        title: "Errore",
        description: "Errore nel caricamento dei punteggi",
        variant: "destructive",
      });
    }
  }, [toast]);

  const createRule = useCallback(async (rule: CreateRuleData) => {
    try {
      const data = await leadScoringRulesService.createRule(rule);
      setRules(prev => [data, ...prev]);
      toast({
        title: "Successo",
        description: "Regola di scoring creata",
      });
      return data;
    } catch (error) {
      console.error('Error creating scoring rule:', error);
      toast({
        title: "Errore",
        description: "Errore nella creazione della regola",
        variant: "destructive",
      });
      throw error;
    }
  }, [toast]);

  const updateRule = useCallback(async (id: string, updates: UpdateRuleData) => {
    try {
      const data = await leadScoringRulesService.updateRule(id, updates);
      setRules(prev => prev.map(rule => rule.id === id ? data : rule));
      toast({
        title: "Successo",
        description: "Regola aggiornata",
      });
      return data;
    } catch (error) {
      console.error('Error updating scoring rule:', error);
      toast({
        title: "Errore",
        description: "Errore nell'aggiornamento della regola",
        variant: "destructive",
      });
      throw error;
    }
  }, [toast]);

  const deleteRule = useCallback(async (id: string) => {
    try {
      await leadScoringRulesService.deleteRule(id);
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
  }, [toast]);

  const calculateLeadScore = useCallback(async (leadId: string) => {
    try {
      const leadData = await leadDataService.fetchLeadById(leadId);
      const { totalScore, breakdown } = calculateScoreForRules(leadData, rules);

      // Upsert the score
      const scoreData = await leadScoresService.upsertScore({
        lead_id: leadId,
        total_score: totalScore,
        score_breakdown: breakdown,
        calculated_at: new Date().toISOString()
      });

      // Update lead's last calculation time
      await leadDataService.updateLeadScoreCalculation(leadId);

      setScores(prev => {
        const existing = prev.findIndex(s => s.lead_id === leadId);
        if (existing >= 0) {
          const newScores = [...prev];
          newScores[existing] = scoreData;
          return newScores;
        }
        return [scoreData, ...prev];
      });

      toast({
        title: "Successo",
        description: `Punteggio calcolato: ${totalScore} punti`,
      });

      return scoreData;
    } catch (error) {
      console.error('Error calculating lead score:', error);
      toast({
        title: "Errore",
        description: "Errore nel calcolo del punteggio",
        variant: "destructive",
      });
      throw error;
    }
  }, [rules, toast]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchRules(), fetchScores()]);
      setLoading(false);
    };

    loadData();
  }, [fetchRules, fetchScores]);

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

export type { LeadScoringRule, LeadScore } from '@/types/leadScoring';
