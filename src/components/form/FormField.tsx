
import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { LucideIcon } from 'lucide-react';

interface FormFieldProps {
  id: string;
  label: string;
  icon: LucideIcon;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  required?: boolean;
  type?: 'text' | 'email' | 'textarea';
  rows?: number;
}

const FormField: React.FC<FormFieldProps> = ({
  id,
  label,
  icon: Icon,
  value,
  onChange,
  placeholder,
  required = false,
  type = 'text',
  rows = 4
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-black font-semibold flex items-center gap-2">
        <Icon className="w-4 h-4 text-golden" />
        {label} {required && '*'}
      </Label>
      {type === 'textarea' ? (
        <Textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="border-gray-300 focus:border-golden focus:ring-golden text-black min-h-[100px]"
          rows={rows}
        />
      ) : (
        <Input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="border-gray-300 focus:border-golden focus:ring-golden text-black"
          required={required}
        />
      )}
    </div>
  );
};

export default FormField;
