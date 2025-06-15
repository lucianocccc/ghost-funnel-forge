
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { LeadScoringRule } from '@/types/leadScoring';

interface LeadScoringRuleFormProps {
  formData: {
    name: string;
    description: string;
    rule_type: LeadScoringRule['rule_type'];
    condition_operator: LeadScoringRule['condition_operator'];
    condition_value: string;
    points: number;
    is_active: boolean;
  };
  setFormData: React.Dispatch<React.SetStateAction<{
    name: string;
    description: string;
    rule_type: LeadScoringRule['rule_type'];
    condition_operator: LeadScoringRule['condition_operator'];
    condition_value: string;
    points: number;
    is_active: boolean;
  }>>;
  onSubmit: () => void;
  onCancel: () => void;
  isEditing: boolean;
}

const LeadScoringRuleForm: React.FC<LeadScoringRuleFormProps> = ({
  formData,
  setFormData,
  onSubmit,
  onCancel,
  isEditing
}) => {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="name">Nome Regola</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Es: Lead premium da LinkedIn"
        />
      </div>
      
      <div>
        <Label htmlFor="description">Descrizione</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Descrizione della regola..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="rule_type">Tipo di Regola</Label>
          <Select
            value={formData.rule_type}
            onValueChange={(value: LeadScoringRule['rule_type']) => setFormData({ ...formData, rule_type: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="response_time">Tempo di Risposta</SelectItem>
              <SelectItem value="message_length">Lunghezza Messaggio</SelectItem>
              <SelectItem value="source">Fonte</SelectItem>
              <SelectItem value="tone">Tono</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="condition_operator">Operatore</Label>
          <Select
            value={formData.condition_operator}
            onValueChange={(value: LeadScoringRule['condition_operator']) => setFormData({ ...formData, condition_operator: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="less_than">Minore di</SelectItem>
              <SelectItem value="greater_than">Maggiore di</SelectItem>
              <SelectItem value="equals">Uguale a</SelectItem>
              <SelectItem value="contains">Contiene</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="condition_value">Valore</Label>
          <Input
            id="condition_value"
            value={formData.condition_value}
            onChange={(e) => setFormData({ ...formData, condition_value: e.target.value })}
            placeholder="Es: 60, LinkedIn, urgente"
          />
        </div>

        <div>
          <Label htmlFor="points">Punti</Label>
          <Input
            id="points"
            type="number"
            value={formData.points}
            onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) || 0 })}
            placeholder="Es: 10, -5"
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="is_active"
          checked={formData.is_active}
          onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
        />
        <Label htmlFor="is_active">Regola attiva</Label>
      </div>

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onCancel}>
          Annulla
        </Button>
        <Button onClick={onSubmit}>
          {isEditing ? 'Aggiorna' : 'Crea'}
        </Button>
      </div>
    </div>
  );
};

export default LeadScoringRuleForm;
