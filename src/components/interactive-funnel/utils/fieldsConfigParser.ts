
export interface ParsedFieldConfig {
  id: string;
  type: 'text' | 'email' | 'tel' | 'textarea' | 'select' | 'checkbox' | 'radio';
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: string[];
}

export const parseFieldsConfig = (fieldsConfig: any): ParsedFieldConfig[] => {
  console.log('🔍 Parsing fields config:', fieldsConfig);
  
  // Se è già un array, ritornalo direttamente
  if (Array.isArray(fieldsConfig)) {
    return fieldsConfig.map(field => ({
      id: field.id || field.name || `field_${Math.random()}`,
      type: field.type || 'text',
      label: field.label || field.title || 'Campo',
      placeholder: field.placeholder || '',
      required: field.required !== false,
      options: field.options || []
    }));
  }

  // Se ha una proprietà fields, usala
  if (fieldsConfig?.fields && Array.isArray(fieldsConfig.fields)) {
    return fieldsConfig.fields.map(field => ({
      id: field.id || field.name || `field_${Math.random()}`,
      type: field.type || 'text',
      label: field.label || field.title || 'Campo',
      placeholder: field.placeholder || '',
      required: field.required !== false,
      options: field.options || []
    }));
  }

  // Se è un oggetto con chiavi, convertilo
  if (fieldsConfig && typeof fieldsConfig === 'object') {
    return Object.entries(fieldsConfig).map(([key, value]: [string, any]) => ({
      id: key,
      type: value?.type || 'text',
      label: value?.label || value?.title || key,
      placeholder: value?.placeholder || '',
      required: value?.required !== false,
      options: value?.options || []
    }));
  }

  console.warn('⚠️ Configurazione campi non riconosciuta, usando fallback');
  
  // Fallback con campi base
  return [
    {
      id: 'nome',
      type: 'text',
      label: 'Nome',
      placeholder: 'Il tuo nome',
      required: true
    },
    {
      id: 'email',
      type: 'email',
      label: 'Email',
      placeholder: 'La tua email',
      required: true
    }
  ];
};
