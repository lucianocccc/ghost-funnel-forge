
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface LeadAnalysis {
  id: string;
  nome: string;
  email: string;
  servizio: string;
  bio: string;
  gpt_analysis: any;
  analyzed_at: string | null;
  created_at: string;
}

export const useLeadsV2 = () => {
  const [leads, setLeads] = useState<LeadAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchLeads = async () => {
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

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

      // Filtra i lead non analizzati e avvia l'analisi automatica
      const unanalyzedLeads = (data || []).filter(lead => lead.gpt_analysis === null);
      
      if (unanalyzedLeads.length > 0) {
        console.log(`Avvio analisi automatica per ${unanalyzedLeads.length} lead non analizzati`);
        
        // Analizza ogni lead non analizzato in modo asincrono
        for (const lead of unanalyzedLeads) {
          try {
            const updated = await triggerAnalysis(lead);
            if (updated) {
              setLeads(prev =>
                prev.map(l => (l.id === updated.id ? updated : l))
              );
            }
          } catch (error) {
            console.error(`Errore nell'analisi automatica del lead ${lead.id}:`, error);
            toast({
              title: "Errore Analisi",
              description: `Errore nell'analisi del lead ${lead.nome}`,
              variant: "destructive",
            });
            // Non interrompere il ciclo, continua con il prossimo lead
          }
        }
      }
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

  const triggerAnalysis = async (lead: LeadAnalysis): Promise<LeadAnalysis | null> => {
    try {
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

      if (error) throw error;

      toast({
        title: "Analisi Completata",
        description: `Il lead ${lead.nome} è stato analizzato con GPT`,
      });

      // Restituisce il lead aggiornato con i nuovi campi
      const updatedLead = { 
        ...lead, 
        gpt_analysis: data.analysis, 
        analyzed_at: new Date().toISOString() 
      };

      // Aggiorna lo state localmente senza richiamare fetchLeads
      setLeads(prev =>
        prev.map(l => (l.id === lead.id ? updatedLead : l))
      );

      return updatedLead;
    } catch (error) {
      console.error('Error triggering analysis:', error);
      toast({
        title: "Errore",
        description: `Errore durante l'analisi di ${lead.nome}`,
        variant: "destructive",
      });
      return null;
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  return {
    leads,
    loading,
    triggerAnalysis,
    refetchLeads: fetchLeads
  };
};
