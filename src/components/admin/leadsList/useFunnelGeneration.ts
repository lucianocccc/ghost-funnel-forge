
import { useState } from 'react';
import { AdminLead } from '@/hooks/useAdminLeads';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const useFunnelGeneration = () => {
  const [isGeneratingFunnel, setIsGeneratingFunnel] = useState(false);
  const { toast } = useToast();

  const handleGenerateSmartFunnel = async (lead: AdminLead) => {
    setIsGeneratingFunnel(true);
    toast?.({
      title: "Creazione Funnel Intelligente...",
      description: "Stiamo chiedendo a GPT di progettare il funnel ideale per questo lead.",
    });

    try {
      console.log('Calling generate-funnel-ai with leadId:', lead.id);
      
      // Usa il client Supabase per chiamare la funzione edge
      const { data, error } = await supabase.functions.invoke('generate-funnel-ai', {
        body: { leadId: lead.id }
      });

      console.log('Edge function response:', { data, error });

      if (error) {
        console.error('Edge function error:', error);
        toast?.({
          title: "Errore creazione funnel",
          description: error.message || "Errore nella chiamata alla funzione",
          variant: "destructive"
        });
        return;
      }

      if (data && data.success) {
        toast?.({
          title: "Funnel Creato!",
          description: "Il funnel personalizzato è stato generato via GPT e salvato.",
        });
      } else {
        console.error('Function returned error:', data);
        toast?.({
          title: "Errore creazione funnel",
          description: data?.error || "Errore sconosciuto",
          variant: "destructive"
        });
      }
    } catch (err) {
      console.error('Catch error:', err);
      toast?.({
        title: "Errore creazione funnel",
        description: String(err),
        variant: "destructive"
      });
    } finally {
      setIsGeneratingFunnel(false);
    }
  };

  return {
    isGeneratingFunnel,
    handleGenerateSmartFunnel
  };
};
