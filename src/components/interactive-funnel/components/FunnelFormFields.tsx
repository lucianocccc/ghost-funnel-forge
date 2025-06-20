
import React from 'react';
import { Label } from '@/components/ui/label';
import { FormFieldConfig } from '@/types/interactiveFunnel';
import FormFieldRenderer from './FormFieldRenderer';

interface FunnelFormFieldsProps {
  fieldsConfig: FormFieldConfig[];
  formData: Record<string, any>;
  onFieldChange: (fieldId: string, value: any) => void;
}

const FunnelFormFields: React.FC<FunnelFormFieldsProps> = ({ 
  fieldsConfig, 
  formData, 
  onFieldChange 
}) => {
  return (
    <div className="space-y-4">
      {fieldsConfig.map((field: FormFieldConfig) => (
        <div key={field.id} className="space-y-2">
          <Label htmlFor={field.id} className="text-sm font-medium">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          <FormFieldRenderer
            field={field}
            value={formData[field.id]}
            onChange={(value) => onFieldChange(field.id, value)}
          />
        </div>
      ))}
    </div>
  );
};

export default FunnelFormFields;
