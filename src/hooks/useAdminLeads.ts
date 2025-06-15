
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface AdminLead {
  id: string;
  nome: string;
  email: string;
  servizio: string;
  bio: string;
  status: 'nuovo' | 'contattato' | 'in_trattativa' | 'chiuso_vinto' | 'chiuso_perso';
  gpt_analysis: any;
  analyzed_at: string | null;
  created_at: string;
}

interface LeadFilters {
  status?: string;
  searchQuery?: string;
  hasAnalysis?: boolean;
}

export const useAdminLeads = () => {
  const [leads, setLeads] = useState<AdminLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<LeadFilters>({});
  const { toast } = useToast();

  const fetchLeads = async () => {
    try {
      let query = supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      if (filters.searchQuery) {
        query = query.or(`nome.ilike.%${filters.searchQuery}%,email.ilike.%${filters.searchQuery}%`);
      }

      if (filters.hasAnalysis !== undefined) {
        if (filters.hasAnalysis) {
          query = query.not('gpt_analysis', 'is', null);
        } else {
          query = query.is('gpt_analysis', null);
        }
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching leads:', error);
        toast({
          title: "Errore",
          description: "Errore nel caricamento dei leads",
          variant: "destructive",
        });
        return;
      }

      setLeads(data || []);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Errore",
        description: "Errore generale nel caricamento dei leads",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateLeadStatus = async (leadId: string, newStatus: AdminLead['status']) => {
    try {
      const { error } = await supabase
        .from('leads')
        .update({ status: newStatus })
        .eq('id', leadId);

      if (error) {
        throw error;
      }

      // Update local state
      setLeads(prev =>
        prev.map(lead =>
          lead.id === leadId ? { ...lead, status: newStatus } : lead
        )
      );

      toast({
        title: "Successo",
        description: "Status del lead aggiornato",
      });
    } catch (error) {
      console.error('Error updating lead status:', error);
      toast({
        title: "Errore",
        description: "Errore nell'aggiornamento dello status",
        variant: "destructive",
      });
    }
  };

  const triggerAnalysis = async (lead: AdminLead): Promise<AdminLead | null> => {
    try {
      console.log(`Iniziando analisi per lead: ${lead.email}`);
      
      const { data, error } = await supabase.functions.invoke('analyze-lead', {
        body: { 
          leadData: {
            nome: lead.nome,
            email: lead.email,
            servizio: lead.servizio,
            bio: lead.bio
          }
        }
      });

      if (error) {
        console.error('Error from edge function:', error);
        
        if (error.message && error.message.includes('insufficient_quota')) {
          toast({
            title: "Quota OpenAI Esaurita",
            description: "La quota OpenAI è esaurita. Controlla il tuo piano OpenAI.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Errore Analisi",
            description: `Errore durante l'analisi di ${lead.nome}: ${error.message}`,
            variant: "destructive",
          });
        }
        throw error;
      }

      if (data && !data.success) {
        console.error('Analysis failed:', data.error);
        
        if (data.error && data.error.includes('Quota OpenAI esaurita')) {
          toast({
            title: "Quota OpenAI Esaurita",
            description: "La quota OpenAI è esaurita. Controlla il tuo piano OpenAI.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Errore Analisi",
            description: `Errore durante l'analisi di ${lead.nome}: ${data.error}`,
            variant: "destructive",
          });
        }
        throw new Error(data.error);
      }

      console.log(`Analisi completata per lead: ${lead.email}`);
      
      toast({
        title: "Analisi Completata",
        description: `Il lead ${lead.nome} è stato analizzato con GPT`,
      });

      const updatedLead = { 
        ...lead, 
        gpt_analysis: data.analysis, 
        analyzed_at: new Date().toISOString() 
      };

      setLeads(prev =>
        prev.map(l => (l.id === lead.id ? updatedLead : l))
      );

      return updatedLead;
    } catch (error) {
      console.error('Error triggering analysis:', error);
      return null;
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [filters]);

  return {
    leads,
    loading,
    filters,
    setFilters,
    updateLeadStatus,
    triggerAnalysis,
    refetchLeads: fetchLeads
  };
};
