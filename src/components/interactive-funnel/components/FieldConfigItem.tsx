
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Trash2 } from 'lucide-react';
import { FormFieldConfig } from '@/types/interactiveFunnel';

interface FieldConfigItemProps {
  field: FormFieldConfig;
  index: number;
  onUpdate: (field: Partial<FormFieldConfig>) => void;
  onRemove: () => void;
}

const FieldConfigItem: React.FC<FieldConfigItemProps> = ({
  field,
  index,
  onUpdate,
  onRemove
}) => {
  return (
    <div className="p-4 border rounded-lg space-y-3 mb-3">
      <div className="flex items-center justify-between">
        <h5 className="font-medium text-sm">Campo {index + 1}</h5>
        <Button 
          size="sm" 
          variant="ghost" 
          onClick={onRemove}
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
            onChange={(e) => onUpdate({ label: e.target.value })}
            placeholder="Nome del campo"
          />
        </div>
        <div>
          <label className="text-xs text-gray-600 mb-1 block">Tipo</label>
          <Select
            value={field.type}
            onValueChange={(value) => onUpdate({ type: value as any })}
          >
            <SelectTrigger>
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
          onChange={(e) => onUpdate({ placeholder: e.target.value })}
          placeholder="Testo di aiuto per l'utente"
        />
      </div>

      <div className="flex items-center gap-2">
        <Switch
          checked={field.required || false}
          onCheckedChange={(checked) => onUpdate({ required: checked })}
        />
        <label className="text-xs text-gray-600">Campo obbligatorio</label>
      </div>
    </div>
  );
};

export default FieldConfigItem;
