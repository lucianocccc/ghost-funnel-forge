
import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { FormFieldConfig } from '@/types/interactiveFunnel';
import { Star, Mail, Phone, User } from 'lucide-react';

interface FormFieldRendererProps {
  field: FormFieldConfig;
  value: any;
  onChange: (value: any) => void;
}

const FormFieldRenderer: React.FC<FormFieldRendererProps> = ({
  field,
  value,
  onChange
}) => {
  const getFieldIcon = () => {
    switch (field.type) {
      case 'email':
        return <Mail className="w-4 h-4 text-gray-400" />;
      case 'tel':
        return <Phone className="w-4 h-4 text-gray-400" />;
      case 'text':
        if (field.id.toLowerCase().includes('name') || field.id.toLowerCase().includes('nome')) {
          return <User className="w-4 h-4 text-gray-400" />;
        }
        return null;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={field.id} className="text-base font-medium text-gray-700">
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </Label>

      {(field.type === 'text' || field.type === 'email' || field.type === 'tel') && (
        <div className="relative">
          {getFieldIcon() && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              {getFieldIcon()}
            </div>
          )}
          <Input
            id={field.id}
            type={field.type}
            placeholder={field.placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            required={field.required}
            className={`${getFieldIcon() ? 'pl-10' : ''} h-12 text-base border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200`}
          />
        </div>
      )}

      {field.type === 'textarea' && (
        <Textarea
          id={field.id}
          placeholder={field.placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={field.required}
          className="min-h-[100px] text-base border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
          rows={4}
        />
      )}

      {field.type === 'select' && (
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger className="h-12 text-base border-2 border-gray-200 focus:border-blue-500">
            <SelectValue placeholder={field.placeholder} />
          </SelectTrigger>
          <SelectContent>
            {field.options?.map((option) => (
              <SelectItem key={option} value={option} className="text-base">
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {field.type === 'checkbox' && (
        <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <Checkbox
            id={field.id}
            checked={value}
            onCheckedChange={onChange}
            required={field.required}
            className="mt-1"
          />
          <Label htmlFor={field.id} className="text-base leading-relaxed cursor-pointer">
            {field.placeholder || field.label}
          </Label>
        </div>
      )}

      {field.type === 'radio' && (
        <RadioGroup value={value} onValueChange={onChange} className="space-y-3">
          {field.options?.map((option) => (
            <div key={option} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
              <RadioGroupItem 
                value={option} 
                id={`${field.id}-${option}`}
                className="text-blue-600"
              />
              <Label htmlFor={`${field.id}-${option}`} className="text-base cursor-pointer flex-1">
                {option}
              </Label>
            </div>
          ))}
        </RadioGroup>
      )}

      {/* Help text for important fields */}
      {field.type === 'email' && (
        <p className="text-sm text-gray-500 flex items-center gap-1">
          <Star className="w-3 h-3" />
          Useremo la tua email solo per inviarti informazioni rilevanti
        </p>
      )}
    </div>
  );
};

export default FormFieldRenderer;
