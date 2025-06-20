
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { InteractiveFunnelWithSteps } from '@/types/interactiveFunnel';
import { 
  fetchInteractiveFunnelById, 
  createFunnelStep, 
  deleteFunnelStep 
} from '@/services/interactiveFunnelService';
import { useStepFormData } from './useStepFormData';

export const useInteractiveFunnelEditor = (funnelId: string) => {
  const [funnel, setFunnel] = useState<InteractiveFunnelWithSteps | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { stepData, resetStepData } = useStepFormData();

  const loadFunnel = async () => {
    try {
      const data = await fetchInteractiveFunnelById(funnelId);
      setFunnel(data);
    } catch (error) {
      console.error('Error loading funnel:', error);
      toast({
        title: "Errore",
        description: "Errore nel caricamento del funnel",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveStep = async () => {
    if (!funnel || !stepData.title.trim()) {
      toast({
        title: "Errore",
        description: "Il titolo del passo è obbligatorio",
        variant: "destructive",
      });
      return;
    }

    try {
      const stepOrder = (funnel.interactive_funnel_steps?.length || 0) + 1;
      
      const stepDataToSave = {
        ...stepData,
        step_order: stepOrder,
        fields_config: stepData.fields_config as any,
        settings: stepData.settings as any
      };
      
      await createFunnelStep(funnel.id, stepDataToSave);

      resetStepData();
      await loadFunnel();
      
      toast({
        title: "Successo",
        description: "Passo aggiunto con successo",
      });
    } catch (error) {
      console.error('Error saving step:', error);
      toast({
        title: "Errore",
        description: "Errore nel salvataggio del passo",
        variant: "destructive",
      });
    }
  };

  const deleteStep = async (stepId: string) => {
    try {
      await deleteFunnelStep(stepId);
      await loadFunnel();
      toast({
        title: "Successo",
        description: "Passo eliminato con successo",
      });
    } catch (error) {
      console.error('Error deleting step:', error);
      toast({
        title: "Errore",
        description: "Errore nell'eliminazione del passo",
        variant: "destructive",
      });
    }
  };

  const previewFunnel = () => {
    if (funnel?.share_token) {
      window.open(`/shared-interactive-funnel/${funnel.share_token}`, '_blank');
    }
  };

  useEffect(() => {
    loadFunnel();
  }, [funnelId]);

  return {
    funnel,
    loading,
    saveStep,
    deleteStep,
    previewFunnel,
    refetchFunnel: loadFunnel
  };
};
