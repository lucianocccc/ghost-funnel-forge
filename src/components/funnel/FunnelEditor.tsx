
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useFunnels } from '@/hooks/useFunnels';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Move, 
  Eye, 
  Settings,
  ArrowDown,
  ArrowUp,
  Save,
  Copy
} from 'lucide-react';

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

const FunnelEditor: React.FC<FunnelEditorProps> = ({ 
  funnelId, 
  initialSteps = [], 
  onSave 
}) => {
  const [steps, setSteps] = useState<FunnelStep[]>(initialSteps);
  const [editingStep, setEditingStep] = useState<FunnelStep | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const stepTypes = [
    { value: 'landing', label: 'Landing Page', icon: '🏠', description: 'Pagina di atterraggio' },
    { value: 'form', label: 'Form', icon: '📝', description: 'Modulo di contatto' },
    { value: 'payment', label: 'Payment', icon: '💳', description: 'Pagina di pagamento' },
    { value: 'email', label: 'Email', icon: '📧', description: 'Email automatica' },
    { value: 'video', label: 'Video', icon: '🎥', description: 'Contenuto video' },
    { value: 'thank_you', label: 'Thank You', icon: '🙏', description: 'Pagina di ringraziamento' }
  ];

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
    
    // Update step numbers
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
    
    // Update step numbers
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

  const getStepTypeConfig = (type: string) => {
    return stepTypes.find(t => t.value === type) || stepTypes[0];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Editor Funnel</h2>
          <p className="text-gray-600">Crea e modifica i passaggi del tuo funnel</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={addStep}>
            <Plus className="w-4 h-4 mr-2" />
            Aggiungi Step
          </Button>
          <Button onClick={saveFunnel}>
            <Save className="w-4 h-4 mr-2" />
            Salva Funnel
          </Button>
        </div>
      </div>

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
                <Plus className="w-4 h-4 mr-2" />
                Aggiungi Primo Step
              </Button>
            </CardContent>
          </Card>
        ) : (
          steps.map((step, index) => {
            const typeConfig = getStepTypeConfig(step.step_type);
            return (
              <Card key={step.id} className="relative">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-golden rounded-full flex items-center justify-center text-white font-bold">
                        {step.step_number}
                      </div>
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <span>{typeConfig.icon}</span>
                          {step.title}
                        </CardTitle>
                        <Badge variant="outline">{typeConfig.label}</Badge>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      {index > 0 && (
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => moveStep(step.id, 'up')}
                        >
                          <ArrowUp className="w-4 h-4" />
                        </Button>
                      )}
                      {index < steps.length - 1 && (
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => moveStep(step.id, 'down')}
                        >
                          <ArrowDown className="w-4 h-4" />
                        </Button>
                      )}
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => duplicateStep(step)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => editStep(step)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => deleteStep(step.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{step.description || typeConfig.description}</p>
                </CardContent>
                
                {/* Connection Arrow */}
                {index < steps.length - 1 && (
                  <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 z-10">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <ArrowDown className="w-4 h-4 text-gray-600" />
                    </div>
                  </div>
                )}
              </Card>
            );
          })
        )}
      </div>

      {/* Edit Step Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingStep ? `Modifica Step: ${editingStep.title}` : 'Nuovo Step'}
            </DialogTitle>
          </DialogHeader>
          
          {editingStep && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Titolo</label>
                <Input
                  value={editingStep.title}
                  onChange={(e) => setEditingStep({
                    ...editingStep,
                    title: e.target.value
                  })}
                  placeholder="Inserisci il titolo dello step"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Tipo di Step</label>
                <Select 
                  value={editingStep.step_type} 
                  onValueChange={(value) => setEditingStep({
                    ...editingStep,
                    step_type: value as any
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {stepTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <span>{type.icon}</span>
                          <div>
                            <div>{type.label}</div>
                            <div className="text-xs text-gray-500">{type.description}</div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Descrizione</label>
                <Textarea
                  value={editingStep.description || ''}
                  onChange={(e) => setEditingStep({
                    ...editingStep,
                    description: e.target.value
                  })}
                  placeholder="Descrivi cosa fa questo step..."
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Annulla
                </Button>
                <Button onClick={saveStep}>
                  Salva Step
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FunnelEditor;
