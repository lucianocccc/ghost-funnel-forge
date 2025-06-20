
import { FormFieldConfig } from '@/types/interactiveFunnel';

// Type guard to validate FormFieldConfig
const isValidFormFieldConfig = (obj: any): obj is FormFieldConfig => {
  return (
    obj &&
    typeof obj === 'object' &&
    typeof obj.id === 'string' &&
    typeof obj.type === 'string' &&
    typeof obj.label === 'string'
  );
};

// Helper function to safely convert Json to FormFieldConfig[]
export const parseFieldsConfig = (fieldsConfig: any): FormFieldConfig[] => {
  if (!fieldsConfig) {
    return [];
  }

  try {
    // If it's already an array, validate each item
    if (Array.isArray(fieldsConfig)) {
      return fieldsConfig.filter(isValidFormFieldConfig);
    }

    // If it's an object with a fields property
    if (typeof fieldsConfig === 'object' && Array.isArray(fieldsConfig.fields)) {
      return fieldsConfig.fields.filter(isValidFormFieldConfig);
    }

    return [];
  } catch (error) {
    console.error('Error parsing fields config:', error);
    return [];
  }
};
