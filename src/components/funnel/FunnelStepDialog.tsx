
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface FunnelStep {
  id: string;
  step_number: number;
  step_type: string;
  title: string;
  description?: string;
  content?: any;
  settings?: any;
}

interface StepTypeConfig {
  value: string;
  label: string;
  icon: string;
  description: string;
}

interface FunnelStepDialogProps {
  open: boolean;
  editingStep: FunnelStep | null;
  stepTypes: StepTypeConfig[];
  onChange: (step: FunnelStep) => void;
  onSave: () => void;
  onCancel: () => void;
}

const FunnelStepDialog: React.FC<FunnelStepDialogProps> = ({
  open,
  editingStep,
  stepTypes,
  onChange,
  onSave,
  onCancel
}) => (
  <Dialog open={open} onOpenChange={onCancel}>
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
              onChange={(e) => onChange({ ...editingStep, title: e.target.value })}
              placeholder="Inserisci il titolo dello step"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Tipo di Step</label>
            <Select
              value={editingStep.step_type}
              onValueChange={(value) => onChange({ ...editingStep, step_type: value as any })}
            >
              <SelectTrigger className="min-h-10 py-2">
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
              onChange={(e) => onChange({ ...editingStep, description: e.target.value })}
              placeholder="Descrivi cosa fa questo step..."
              rows={3}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onCancel}>
              Annulla
            </Button>
            <Button onClick={onSave}>Salva Step</Button>
          </div>
        </div>
      )}
    </DialogContent>
  </Dialog>
);

export default FunnelStepDialog;
