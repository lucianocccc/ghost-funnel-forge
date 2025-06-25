
import { useToast } from '@/hooks/use-toast';
import { FormFieldConfig } from '@/types/interactiveFunnel';

export const useFunnelValidation = () => {
  const { toast } = useToast();

  const validateStep = (fieldsConfig: FormFieldConfig[], formData: Record<string, any>): boolean => {
    console.log('=== VALIDATING STEP ===');
    console.log('Fields config:', fieldsConfig);
    console.log('Form data:', formData);

    if (!fieldsConfig || fieldsConfig.length === 0) {
      console.log('No fields to validate, step is valid');
      return true;
    }

    const errors: string[] = [];

    for (const field of fieldsConfig) {
      console.log(`Validating field: ${field.id} (${field.type})`);
      const value = formData[field.id];
      console.log(`Field value:`, value);

      if (field.required) {
        console.log(`Field ${field.id} is required`);
        if (!value || (typeof value === 'string' && value.trim() === '')) {
          console.log(`Required field ${field.id} is empty`);
          errors.push(`Il campo "${field.label}" è obbligatorio.`);
          continue;
        }
      }

      // Email validation
      if (field.type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          console.log(`Invalid email format for field ${field.id}:`, value);
          errors.push(`Il campo "${field.label}" deve contenere un indirizzo email valido.`);
        }
      }

      // Phone validation
      if (field.type === 'tel' && value) {
        const phoneRegex = /^[\d\s\-\+\(\)]+$/;
        if (!phoneRegex.test(value)) {
          console.log(`Invalid phone format for field ${field.id}:`, value);
          errors.push(`Il campo "${field.label}" deve contenere un numero di telefono valido.`);
        }
      }

      // Length validation
      if (field.validation?.minLength && value && value.length < field.validation.minLength) {
        console.log(`Field ${field.id} is too short: ${value.length} < ${field.validation.minLength}`);
        errors.push(`Il campo "${field.label}" deve avere almeno ${field.validation.minLength} caratteri.`);
      }

      if (field.validation?.maxLength && value && value.length > field.validation.maxLength) {
        console.log(`Field ${field.id} is too long: ${value.length} > ${field.validation.maxLength}`);
        errors.push(`Il campo "${field.label}" deve avere al massimo ${field.validation.maxLength} caratteri.`);
      }

      console.log(`Field ${field.id} validation passed`);
    }

    if (errors.length > 0) {
      console.log('Validation failed with errors:', errors);
      toast({
        title: "Errori di validazione",
        description: errors.join(' '),
        variant: "destructive",
      });
      return false;
    }

    console.log('=== VALIDATION PASSED ===');
    return true;
  };

  return { validateStep };
};
