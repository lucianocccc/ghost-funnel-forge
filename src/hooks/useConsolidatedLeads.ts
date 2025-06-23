
import { useState, useEffect } from 'react';
import { 
  ConsolidatedLeadWithDetails, 
  LeadFilters, 
  BusinessAreaWithSubAreas 
} from '@/types/consolidatedLeads';
import { 
  fetchConsolidatedLeads, 
  updateConsolidatedLead
} from '@/services/consolidatedLeadsService';
import { fetchBusinessAreas } from '@/services/businessAreasService';
import { getLeadStats } from '@/services/leadStatsService';
import { analyzeLeadWithAI } from '@/services/leadAnalysisService';
import { createLeadInteraction } from '@/services/leadInteractionsService';
import { useToast } from '@/hooks/use-toast';

export const useConsolidatedLeads = () => {
  const [leads, setLeads] = useState<ConsolidatedLeadWithDetails[]>([]);
  const [businessAreas, setBusinessAreas] = useState<BusinessAreaWithSubAreas[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<LeadFilters>({});
  const [stats, setStats] = useState<any>(null);
  const { toast } = useToast();

  const loadLeads = async () => {
    try {
      setLoading(true);
      const data = await fetchConsolidatedLeads(filters);
      setLeads(data);
    } catch (error) {
      console.error('Error loading consolidated leads:', error);
      toast({
        title: "Errore",
        description: "Errore nel caricamento dei lead consolidati",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadBusinessAreas = async () => {
    try {
      const data = await fetchBusinessAreas();
      setBusinessAreas(data);
    } catch (error) {
      console.error('Error loading business areas:', error);
    }
  };

  const loadStats = async () => {
    try {
      const data = await getLeadStats();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const analyzeLead = async (leadId: string) => {
    try {
      await analyzeLeadWithAI(leadId);
      toast({
        title: "Successo",
        description: "Lead analizzato con successo",
      });
      loadLeads(); // Refresh leads
      loadStats(); // Refresh stats
    } catch (error) {
      console.error('Error analyzing lead:', error);
      toast({
        title: "Errore",
        description: "Errore nell'analisi del lead",
        variant: "destructive",
      });
    }
  };

  const updateLead = async (leadId: string, updates: any) => {
    try {
      await updateConsolidatedLead(leadId, updates);
      toast({
        title: "Successo",
        description: "Lead aggiornato con successo",
      });
      loadLeads();
    } catch (error) {
      console.error('Error updating lead:', error);
      toast({
        title: "Errore",
        description: "Errore nell'aggiornamento del lead",
        variant: "destructive",
      });
    }
  };

  const addInteraction = async (interaction: any) => {
    try {
      await createLeadInteraction(interaction);
      toast({
        title: "Successo",
        description: "Interazione aggiunta con successo",
      });
      loadLeads();
    } catch (error) {
      console.error('Error adding interaction:', error);
      toast({
        title: "Errore",
        description: "Errore nell'aggiunta dell'interazione",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    loadLeads();
  }, [filters]);

  useEffect(() => {
    loadBusinessAreas();
    loadStats();
  }, []);

  return {
    leads,
    businessAreas,
    loading,
    filters,
    setFilters,
    stats,
    analyzeLead,
    updateLead,
    addInteraction,
    refreshLeads: loadLeads,
    refreshStats: loadStats
  };
};
