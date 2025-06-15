
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import FunnelEditorHeader from './FunnelEditorHeader';
import FunnelStepCard from './FunnelStepCard';
import FunnelStepDialog from './FunnelStepDialog';

interface FunnelStep {
  id: string;
  step_number: number;
  step_type: 'landing' | 'form' | 'payment' | 'thank_you' | 'email' | 'video';
  title: string;
  description?: string;
  content?: any;
  settings?: any;
}

interface FunnelEditorProps {
  funnelId?: string;
  initialSteps?: FunnelStep[];
  onSave?: (steps: FunnelStep[]) => void;
}

const stepTypes = [
  { value: 'landing', label: 'Landing Page', icon: '🏠', description: 'Pagina di atterraggio' },
  { value: 'form', label: 'Form', icon: '📝', description: 'Modulo di contatto' },
  { value: 'payment', label: 'Payment', icon: '💳', description: 'Pagina di pagamento' },
  { value: 'email', label: 'Email', icon: '📧', description: 'Email automatica' },
  { value: 'video', label: 'Video', icon: '🎥', description: 'Contenuto video' },
  { value: 'thank_you', label: 'Thank You', icon: '🙏', description: 'Pagina di ringraziamento' }
];

const FunnelEditor: React.FC<FunnelEditorProps> = ({
  funnelId,
  initialSteps = [],
  onSave
}) => {
  const [steps, setSteps] = useState<FunnelStep[]>(initialSteps);
  const [editingStep, setEditingStep] = useState<FunnelStep | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const addStep = () => {
    const newStep: FunnelStep = {
      id: `step_${Date.now()}`,
      step_number: steps.length + 1,
      step_type: 'landing',
      title: `Step ${steps.length + 1}`,
      description: '',
      content: {},
      settings: {}
    };
    setSteps([...steps, newStep]);
    setEditingStep(newStep);
    setIsDialogOpen(true);
  };

  const editStep = (step: FunnelStep) => {
    setEditingStep(step);
    setIsDialogOpen(true);
  };

  const deleteStep = (stepId: string) => {
    const updatedSteps = steps
      .filter(step => step.id !== stepId)
      .map((step, index) => ({ ...step, step_number: index + 1 }));

    setSteps(updatedSteps);
    toast({
      title: "Step Eliminato",
      description: "Lo step è stato rimosso dal funnel",
    });
  };

  const moveStep = (stepId: string, direction: 'up' | 'down') => {
    const stepIndex = steps.findIndex(step => step.id === stepId);
    if (stepIndex === -1) return;
    const newIndex = direction === 'up' ? stepIndex - 1 : stepIndex + 1;
    if (newIndex < 0 || newIndex >= steps.length) return;
    const updatedSteps = [...steps];
    [updatedSteps[stepIndex], updatedSteps[newIndex]] = [updatedSteps[newIndex], updatedSteps[stepIndex]];
    updatedSteps.forEach((step, index) => {
      step.step_number = index + 1;
    });
    setSteps(updatedSteps);
  };

  const duplicateStep = (step: FunnelStep) => {
    const duplicatedStep: FunnelStep = {
      ...step,
      id: `step_${Date.now()}`,
      step_number: step.step_number + 1,
      title: `${step.title} (Copia)`
    };
    const updatedSteps = [...steps];
    updatedSteps.splice(step.step_number, 0, duplicatedStep);
    updatedSteps.forEach((step, index) => {
      step.step_number = index + 1;
    });
    setSteps(updatedSteps);
  };

  const saveStep = () => {
    if (!editingStep) return;
    const updatedSteps = steps.map(step =>
      step.id === editingStep.id ? editingStep : step
    );
    setSteps(updatedSteps);
    setIsDialogOpen(false);
    setEditingStep(null);
    toast({
      title: "Step Salvato",
      description: "Le modifiche sono state salvate con successo",
    });
  };

  const saveFunnel = () => {
    onSave?.(steps);
    toast({
      title: "Funnel Salvato",
      description: "Il funnel è stato salvato con successo",
    });
  };

  const getStepTypeConfig = (type: string) => stepTypes.find(t => t.value === type) || stepTypes[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <FunnelEditorHeader onAddStep={addStep} onSaveFunnel={saveFunnel} />

      {/* Steps List */}
      <div className="space-y-4">
        {steps.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <div className="text-6xl mb-4">🚀</div>
              <h3 className="text-lg font-semibold mb-2">Inizia a Costruire il Tuo Funnel</h3>
              <p className="text-gray-600 mb-4">
                Aggiungi il primo step per iniziare a creare il tuo funnel personalizzato
              </p>
              <Button onClick={addStep}>
                <span className="inline-block mr-2 align-middle">+</span>
                Aggiungi Primo Step
              </Button>
            </CardContent>
          </Card>
        ) : (
          steps.map((step, idx) => (
            <FunnelStepCard
              key={step.id}
              step={step}
              index={idx}
              total={steps.length}
              typeConfig={getStepTypeConfig(step.step_type)}
              onMoveUp={() => moveStep(step.id, 'up')}
              onMoveDown={() => moveStep(step.id, 'down')}
              onDuplicate={() => duplicateStep(step)}
              onEdit={() => editStep(step)}
              onDelete={() => deleteStep(step.id)}
            />
          ))
        )}
      </div>

      {/* Edit Step Dialog */}
      <FunnelStepDialog
        open={isDialogOpen}
        editingStep={editingStep}
        stepTypes={stepTypes}
        onChange={setEditingStep as (step: FunnelStep) => void}
        onSave={saveStep}
        onCancel={() => {
          setIsDialogOpen(false);
          setEditingStep(null);
        }}
      />
    </div>
  );
};

export default FunnelEditor;
