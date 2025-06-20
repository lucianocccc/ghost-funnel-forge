
import { FormFieldConfig } from '@/types/interactiveFunnel';
import { useToast } from '@/hooks/use-toast';

export const useFunnelValidation = () => {
  const { toast } = useToast();

  const validateStep = (fieldsConfig: FormFieldConfig[], formData: Record<string, any>) => {
    console.log('Validating step with config:', fieldsConfig);
    console.log('Form data for validation:', formData);
    
    // Se non ci sono configurazioni di campi, considera il passo valido
    if (!Array.isArray(fieldsConfig) || fieldsConfig.length === 0) {
      console.log('No fields to validate, step is valid');
      return true;
    }

    const requiredFields = fieldsConfig.filter((field: FormFieldConfig) => field.required);
    console.log('Required fields:', requiredFields);
    
    for (const field of requiredFields) {
      const value = formData[field.id];
      console.log(`Checking field ${field.id}:`, value);
      
      if (!value || (typeof value === 'string' && !value.trim())) {
        toast({
          title: "Campo obbligatorio",
          description: `Il campo "${field.label}" è obbligatorio`,
          variant: "destructive",
        });
        return false;
      }
    }
    
    console.log('All validations passed');
    return true;
  };

  return { validateStep };
};
