
import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { FormFieldConfig } from '@/types/interactiveFunnel';

interface FormFieldRendererProps {
  field: FormFieldConfig;
  value: any;
  onChange: (value: any) => void;
}

const FormFieldRenderer: React.FC<FormFieldRendererProps> = ({ field, value, onChange }) => {
  switch (field.type) {
    case 'text':
    case 'email':
    case 'tel':
      return (
        <Input
          type={field.type}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          required={field.required}
        />
      );

    case 'textarea':
      return (
        <Textarea
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          required={field.required}
          className="min-h-[100px]"
        />
      );

    case 'select':
      return (
        <Select value={value || ''} onValueChange={onChange}>
          <SelectTrigger>
            <SelectValue placeholder={field.placeholder || "Seleziona un'opzione"} />
          </SelectTrigger>
          <SelectContent>
            {field.options?.map((option, index) => (
              <SelectItem key={index} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );

    case 'radio':
      return (
        <RadioGroup value={value || ''} onValueChange={onChange}>
          {field.options?.map((option, index) => (
            <div key={index} className="flex items-center space-x-2">
              <RadioGroupItem value={option} id={`${field.id}-${index}`} />
              <Label htmlFor={`${field.id}-${index}`}>{option}</Label>
            </div>
          ))}
        </RadioGroup>
      );

    case 'checkbox':
      return (
        <div className="flex items-center space-x-2">
          <Checkbox
            checked={value === true}
            onCheckedChange={onChange}
            id={field.id}
          />
          <Label htmlFor={field.id}>{field.label}</Label>
        </div>
      );

    default:
      return (
        <Input
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          required={field.required}
        />
      );
  }
};

export default FormFieldRenderer;
