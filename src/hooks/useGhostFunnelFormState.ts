
import { useState } from 'react';

export interface FormData {
  nome: string;
  email: string;
  servizio: string;
  bio: string;
}

export const useGhostFunnelFormState = () => {
  const [formData, setFormData] = useState<FormData>({
    nome: '',
    email: '',
    servizio: '',
    bio: ''
  });

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      email: '',
      servizio: '',
      bio: ''
    });
  };

  return {
    formData,
    handleInputChange,
    resetForm
  };
};
