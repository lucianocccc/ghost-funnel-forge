
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Plus } from 'lucide-react';
import { FormFieldConfig, StepSettings } from '@/types/interactiveFunnel';
import FieldConfigEditor from './FieldConfigEditor';

interface StepFormCreatorProps {
  stepData: {
    title: string;
    description: string;
    step_type: string;
    is_required: boolean;
    fields_config: FormFieldConfig[];
    settings: StepSettings;
  };
  onUpdateStepData: (updates: any) => void;
  onSave: () => void;
}

const StepFormCreator: React.FC<StepFormCreatorProps> = ({
  stepData,
  onUpdateStepData,
  onSave
}) => {
  const addFormField = () => {
    const newField: FormFieldConfig = {
      id: `field_${Date.now()}`,
      type: 'text',
      label: 'Nuovo Campo',
      required: false
    };
    onUpdateStepData({
      fields_config: [...stepData.fields_config, newField]
    });
  };

  const updateFormField = (index: number, field: Partial<FormFieldConfig>) => {
    onUpdateStepData({
      fields_config: stepData.fields_config.map((f, i) => 
        i === index ? { ...f, ...field } : f
      )
    });
  };

  const removeFormField = (index: number) => {
    onUpdateStepData({
      fields_config: stepData.fields_config.filter((_, i) => i !== index)
    });
  };

  return (
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
              value={stepData.title}
              onChange={(e) => onUpdateStepData({ title: e.target.value })}
              placeholder="Es: Informazioni di Contatto"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Tipo di Passo</label>
            <Select
              value={stepData.step_type}
              onValueChange={(value) => onUpdateStepData({ step_type: value })}
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
            value={stepData.description}
            onChange={(e) => onUpdateStepData({ description: e.target.value })}
            placeholder="Descrivi cosa fa questo passo..."
            className="min-h-[80px]"
          />
        </div>

        <div className="flex items-center gap-2">
          <Switch
            checked={stepData.is_required}
            onCheckedChange={(checked) => onUpdateStepData({ is_required: checked })}
          />
          <label className="text-sm font-medium">Passo obbligatorio</label>
        </div>

        <FieldConfigEditor
          fieldsConfig={stepData.fields_config}
          onAddField={addFormField}
          onUpdateField={updateFormField}
          onRemoveField={removeFormField}
        />

        <Button onClick={onSave} className="w-full bg-golden hover:bg-yellow-600 text-black">
          <Plus className="w-4 h-4 mr-2" />
          Aggiungi Passo al Funnel
        </Button>
      </CardContent>
    </Card>
  );
};

export default StepFormCreator;
