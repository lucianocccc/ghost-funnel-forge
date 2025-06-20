
import { FormFieldConfig } from '@/types/interactiveFunnel';
import { useToast } from '@/hooks/use-toast';

export const useFunnelValidation = () => {
  const { toast } = useToast();

  const validateStep = (fieldsConfig: FormFieldConfig[], formData: Record<string, any>) => {
    if (!Array.isArray(fieldsConfig)) {
      return true;
    }

    const requiredFields = fieldsConfig.filter((field: FormFieldConfig) => field.required);
    
    for (const field of requiredFields) {
      const value = formData[field.id];
      if (!value || (typeof value === 'string' && !value.trim())) {
        toast({
          title: "Campo obbligatorio",
          description: `Il campo "${field.label}" è obbligatorio`,
          variant: "destructive",
        });
        return false;
      }
    }
    
    return true;
  };

  return { validateStep };
};
