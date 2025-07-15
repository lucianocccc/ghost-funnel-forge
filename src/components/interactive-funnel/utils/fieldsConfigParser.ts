
import { FormFieldConfig } from '@/types/interactiveFunnel';
import { getStepTypeConfig } from '../config/stepTypes';

export const parseFieldsConfig = (fieldsConfig: any): FormFieldConfig[] => {
  console.log('🔍 Parsing fields config:', fieldsConfig);

  // Handle different input formats
  if (!fieldsConfig) {
    console.warn('⚠️ No fields config provided');
    return [];
  }

  // If it's already an array of FormFieldConfig, return it
  if (Array.isArray(fieldsConfig)) {
    console.log('✅ Fields config is already an array');
    return fieldsConfig.filter(field => field && field.id && field.type);
  }

  // If it's a string, try to parse as JSON
  if (typeof fieldsConfig === 'string') {
    try {
      const parsed = JSON.parse(fieldsConfig);
      return parseFieldsConfig(parsed);
    } catch (error) {
      console.error('❌ Failed to parse fields config string:', error);
      return [];
    }
  }

  // If it's an object with fields property
  if (fieldsConfig.fields && Array.isArray(fieldsConfig.fields)) {
    console.log('✅ Found fields array in config object');
    return fieldsConfig.fields.filter(field => field && field.id && field.type);
  }

  // If it's an object, try to extract field definitions
  if (typeof fieldsConfig === 'object') {
    const keys = Object.keys(fieldsConfig);
    console.log('📋 Object keys found:', keys);

    // Check if it's a single field definition
    if (fieldsConfig.id && fieldsConfig.type) {
      return [fieldsConfig];
    }

    // Try to convert object properties to fields
    const fields: FormFieldConfig[] = [];
    for (const key of keys) {
      const value = fieldsConfig[key];
      if (value && typeof value === 'object' && value.type) {
        fields.push({
          id: key,
          ...value
        });
      }
    }

    if (fields.length > 0) {
      console.log('✅ Converted object to fields array');
      return fields;
    }
  }

  console.warn('⚠️ Could not parse fields config, returning empty array');
  return [];
};

export const getDefaultFieldsForStepType = (stepType: string): FormFieldConfig[] => {
  const config = getStepTypeConfig(stepType);
  return config?.defaultFields || [];
};
