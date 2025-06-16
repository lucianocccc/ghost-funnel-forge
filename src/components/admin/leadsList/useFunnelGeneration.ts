
import { useState } from 'react';
import { AdminLead } from '@/hooks/useAdminLeads';
import { useToast } from '@/hooks/use-toast';

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
      const resp = await fetch(
        "/functions/v1/generate-funnel-ai", 
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ leadId: lead.id })
        }
      );
      const res = await resp.json();
      if (res.success) {
        toast?.({
          title: "Funnel Creato!",
          description: "Il funnel personalizzato è stato generato via GPT e salvato.",
        });
      } else {
        toast?.({
          title: "Errore creazione funnel",
          description: res.error || "",
          variant: "destructive"
        });
      }
    } catch (err) {
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
