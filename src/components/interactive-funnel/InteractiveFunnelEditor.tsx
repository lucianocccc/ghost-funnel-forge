import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Plus, Move, Trash2, Save, Eye, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { InteractiveFunnelWithSteps, FormFieldConfig, StepSettings } from '@/types/interactiveFunnel';
import { fetchInteractiveFunnelById, createFunnelStep, updateFunnelStep, deleteFunnelStep } from '@/services/interactiveFunnelService';

interface InteractiveFunnelEditorProps {
  funnelId: string;
  onSave?: () => void;
}

const InteractiveFunnelEditor: React.FC<InteractiveFunnelEditorProps> = ({ funnelId, onSave }) => {
  const [funnel, setFunnel] = useState<InteractiveFunnelWithSteps | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingStep, setEditingStep] = useState<string | null>(null);
  const [newStepData, setNewStepData] = useState({
    title: '',
    description: '',
    step_type: 'form' as const,
    is_required: true,
    fields_config: [] as FormFieldConfig[],
    settings: {} as StepSettings
  });
  const { toast } = useToast();

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

  const addFormField = () => {
    const newField: FormFieldConfig = {
      id: `field_${Date.now()}`,
      type: 'text',
      label: 'Nuovo Campo',
      required: false
    };
    setNewStepData(prev => ({
      ...prev,
      fields_config: [...prev.fields_config, newField]
    }));
  };

  const updateFormField = (index: number, field: Partial<FormFieldConfig>) => {
    setNewStepData(prev => ({
      ...prev,
      fields_config: prev.fields_config.map((f, i) => 
        i === index ? { ...f, ...field } : f
      )
    }));
  };

  const removeFormField = (index: number) => {
    setNewStepData(prev => ({
      ...prev,
      fields_config: prev.fields_config.filter((_, i) => i !== index)
    }));
  };

  const saveStep = async () => {
    if (!funnel || !newStepData.title.trim()) {
      toast({
        title: "Errore",
        description: "Il titolo del passo è obbligatorio",
        variant: "destructive",
      });
      return;
    }

    try {
      const stepOrder = (funnel.interactive_funnel_steps?.length || 0) + 1;
      
      await createFunnelStep(funnel.id, {
        ...newStepData,
        step_order: stepOrder
      });

      // Reset form
      setNewStepData({
        title: '',
        description: '',
        step_type: 'form',
        is_required: true,
        fields_config: [],
        settings: {}
      });

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
      {/* Funnel Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">{funnel.name}</CardTitle>
              <p className="text-gray-600 text-sm mt-1">{funnel.description}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={previewFunnel}>
                <Eye className="w-4 h-4 mr-2" />
                Anteprima
              </Button>
              <Button onClick={onSave} className="bg-golden hover:bg-yellow-600 text-black">
                <Save className="w-4 h-4 mr-2" />
                Salva Modifiche
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Existing Steps */}
      {funnel.interactive_funnel_steps && funnel.interactive_funnel_steps.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Passi del Funnel</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {funnel.interactive_funnel_steps
              .sort((a, b) => a.step_order - b.step_order)
              .map((step, index) => (
                <div key={step.id} className="flex items-center gap-4 p-4 border rounded-lg">
                  <div className="bg-golden text-black w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{step.title}</h4>
                    <p className="text-sm text-gray-600">{step.description}</p>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="outline">{step.step_type}</Badge>
                      {step.is_required && <Badge>Obbligatorio</Badge>}
                      {step.fields_config && Array.isArray(step.fields_config) && step.fields_config.length > 0 && (
                        <Badge variant="secondary">{step.fields_config.length} campi</Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Settings className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Move className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => deleteStep(step.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
          </CardContent>
        </Card>
      )}

      {/* Add New Step */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Aggiungi Nuovo Passo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Titolo del Passo *</label>
              <Input
                value={newStepData.title}
                onChange={(e) => setNewStepData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Es: Informazioni di Contatto"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Tipo di Passo</label>
              <Select
                value={newStepData.step_type}
                onValueChange={(value) => setNewStepData(prev => ({ ...prev, step_type: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lead_capture">Lead Capture</SelectItem>
                  <SelectItem value="qualification">Qualificazione</SelectItem>
                  <SelectItem value="education">Educazione</SelectItem>
                  <SelectItem value="conversion">Conversione</SelectItem>
                  <SelectItem value="follow_up">Follow Up</SelectItem>
                  <SelectItem value="form">Form</SelectItem>
                  <SelectItem value="info">Informazioni</SelectItem>
                  <SelectItem value="survey">Sondaggio</SelectItem>
                  <SelectItem value="contact">Contatto</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Descrizione</label>
            <Textarea
              value={newStepData.description}
              onChange={(e) => setNewStepData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descrivi cosa fa questo passo..."
              className="min-h-[80px]"
            />
          </div>

          <div className="flex items-center gap-2">
            <Switch
              checked={newStepData.is_required}
              onCheckedChange={(checked) => setNewStepData(prev => ({ ...prev, is_required: checked }))}
            />
            <label className="text-sm font-medium">Passo obbligatorio</label>
          </div>

          <Separator />

          {/* Form Fields Configuration */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium">Campi del Form</h4>
              <Button size="sm" variant="outline" onClick={addFormField}>
                <Plus className="w-4 h-4 mr-1" />
                Aggiungi Campo
              </Button>
            </div>

            {newStepData.fields_config.map((field, index) => (
              <div key={field.id} className="p-4 border rounded-lg space-y-3 mb-3">
                <div className="flex items-center justify-between">
                  <h5 className="font-medium text-sm">Campo {index + 1}</h5>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => removeFormField(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">Etichetta</label>
                    <Input
                      value={field.label}
                      onChange={(e) => updateFormField(index, { label: e.target.value })}
                      placeholder="Nome del campo"
                      size="sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">Tipo</label>
                    <Select
                      value={field.type}
                      onValueChange={(value) => updateFormField(index, { type: value as any })}
                    >
                      <SelectTrigger size="sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Testo</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="tel">Telefono</SelectItem>
                        <SelectItem value="textarea">Area di Testo</SelectItem>
                        <SelectItem value="select">Selezione</SelectItem>
                        <SelectItem value="checkbox">Checkbox</SelectItem>
                        <SelectItem value="radio">Radio Button</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-600 mb-1 block">Placeholder (opzionale)</label>
                  <Input
                    value={field.placeholder || ''}
                    onChange={(e) => updateFormField(index, { placeholder: e.target.value })}
                    placeholder="Testo di aiuto per l'utente"
                    size="sm"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={field.required || false}
                    onCheckedChange={(checked) => updateFormField(index, { required: checked })}
                  />
                  <label className="text-xs text-gray-600">Campo obbligatorio</label>
                </div>
              </div>
            ))}
          </div>

          <Button onClick={saveStep} className="w-full bg-golden hover:bg-yellow-600 text-black">
            <Plus className="w-4 h-4 mr-2" />
            Aggiungi Passo al Funnel
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default InteractiveFunnelEditor;
