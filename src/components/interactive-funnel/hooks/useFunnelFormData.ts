
import { useState, useCallback } from 'react';

export const useFunnelFormData = () => {
  const [formData, setFormData] = useState<Record<string, any>>({});

  const handleFieldChange = useCallback((fieldId: string, value: any) => {
    console.log('Field change:', fieldId, value);
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));
  }, []);

  const resetFormData = useCallback(() => {
    console.log('Resetting form data');
    setFormData({});
  }, []);

  return {
    formData,
    handleFieldChange,
    resetFormData
  };
};
