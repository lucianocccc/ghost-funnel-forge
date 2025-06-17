
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { FunnelWithSteps, FunnelTemplate, Funnel } from '@/types/funnel';
import { fetchFunnelsWithDetails } from '@/services/funnelQueryService';
import { updateFunnelStatus } from '@/services/funnelMutationService';
import { fetchTemplates, createFunnelFromTemplateInDb } from '@/services/templateService';

export const useFunnels = () => {
  const [funnels, setFunnels] = useState<FunnelWithSteps[]>([]);
  const [templates, setTemplates] = useState<FunnelTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadFunnels = async () => {
    try {
      const data = await fetchFunnelsWithDetails();
      setFunnels(data);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Errore",
        description: "Errore nel caricamento dei funnel",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadTemplates = async () => {
    try {
      const data = await fetchTemplates();
      setTemplates(data);
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const createFunnelFromTemplate = async (
    templateId: string, 
    name: string, 
    leadId?: string
  ) => {
    try {
      const result = await createFunnelFromTemplateInDb(templateId, name, leadId);
      
      toast({
        title: "Successo",
        description: `Funnel "${name}" creato con successo`,
      });

      await loadFunnels();
      return result;
    } catch (error) {
      console.error('Error creating funnel:', error);
      
      if (error instanceof Error && error.message === 'User not authenticated') {
        toast({
          title: "Errore",
          description: "Devi essere autenticato per creare un funnel",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Errore",
          description: "Errore nella creazione del funnel",
          variant: "destructive",
        });
      }
      return null;
    }
  };

  const updateFunnelStatusLocal = async (funnelId: string, status: Funnel['status']) => {
    try {
      await updateFunnelStatus(funnelId, status);

      setFunnels(prev =>
        prev.map(funnel =>
          funnel.id === funnelId ? { ...funnel, status } : funnel
        )
      );

      toast({
        title: "Successo",
        description: "Status del funnel aggiornato",
      });
    } catch (error) {
      console.error('Error updating funnel status:', error);
      toast({
        title: "Errore",
        description: "Errore nell'aggiornamento dello status",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    loadFunnels();
    loadTemplates();
  }, []);

  return {
    funnels,
    templates,
    loading,
    createFunnelFromTemplate,
    updateFunnelStatus: updateFunnelStatusLocal,
    refetchFunnels: loadFunnels
  };
};
