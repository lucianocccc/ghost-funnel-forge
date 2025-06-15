
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AdminLead } from './useLeadTypes';

export const useLeadActions = (setLeads: React.Dispatch<React.SetStateAction<AdminLead[]>>) => {
  const { toast } = useToast();

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

  return {
    updateLeadStatus,
    triggerAnalysis
  };
};
