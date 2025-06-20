
import React from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Plus } from 'lucide-react';
import { FormFieldConfig } from '@/types/interactiveFunnel';
import FieldConfigItem from './FieldConfigItem';

interface FieldConfigEditorProps {
  fieldsConfig: FormFieldConfig[];
  onAddField: () => void;
  onUpdateField: (index: number, field: Partial<FormFieldConfig>) => void;
  onRemoveField: (index: number) => void;
}

const FieldConfigEditor: React.FC<FieldConfigEditorProps> = ({
  fieldsConfig,
  onAddField,
  onUpdateField,
  onRemoveField
}) => {
  return (
    <>
      <Separator />
      
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium">Campi del Form</h4>
          <Button size="sm" variant="outline" onClick={onAddField}>
            <Plus className="w-4 h-4 mr-1" />
            Aggiungi Campo
          </Button>
        </div>

        {fieldsConfig.map((field, index) => (
          <FieldConfigItem
            key={field.id}
            field={field}
            index={index}
            onUpdate={(updatedField) => onUpdateField(index, updatedField)}
            onRemove={() => onRemoveField(index)}
          />
        ))}
      </div>
    </>
  );
};

export default FieldConfigEditor;
