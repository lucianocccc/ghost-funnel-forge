
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { InteractiveFunnelWithSteps } from '@/types/interactiveFunnel';
import { 
  fetchInteractiveFunnelById, 
  createFunnelStep, 
  deleteFunnelStep 
} from '@/services/interactiveFunnelService';
import FunnelEditorHeader from './components/FunnelEditorHeader';
import ExistingStepsList from './components/ExistingStepsList';
import StepFormCreator from './components/StepFormCreator';
import { useStepFormData } from './hooks/useStepFormData';

interface InteractiveFunnelEditorProps {
  funnelId: string;
  onSave?: () => void;
}

const InteractiveFunnelEditor: React.FC<InteractiveFunnelEditorProps> = ({ 
  funnelId, 
  onSave 
}) => {
  const [funnel, setFunnel] = useState<InteractiveFunnelWithSteps | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { stepData, updateStepData, resetStepData } = useStepFormData();

  useEffect(() => {
    loadFunnel();
  }, [funnelId]);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-2 border-golden border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!funnel) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Funnel non trovato</h3>
        <p className="text-gray-500">Il funnel richiesto non esiste o non hai i permessi per visualizzarlo.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <FunnelEditorHeader
        funnel={funnel}
        onSave={onSave}
        onPreview={previewFunnel}
      />

      <ExistingStepsList
        steps={funnel.interactive_funnel_steps || []}
        onDeleteStep={deleteStep}
      />

      <StepFormCreator
        stepData={stepData}
        onUpdateStepData={updateStepData}
        onSave={saveStep}
      />
    </div>
  );
};

export default InteractiveFunnelEditor;
