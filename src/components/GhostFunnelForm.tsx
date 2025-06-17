
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import FormHeader from './form/FormHeader';
import GhostFunnelFormFields from './form/GhostFunnelFormFields';
import SubmitButton from './form/SubmitButton';
import FormFooter from './form/FormFooter';
import { useFormSubmission } from './form/useFormSubmission';
import { useGhostFunnelFormState } from '@/hooks/useGhostFunnelFormState';

const GhostFunnelForm = () => {
  const { formData, handleInputChange, resetForm } = useGhostFunnelFormState();
  const { handleSubmit, isSubmitting } = useFormSubmission();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData = {
      nome: formData.nome,
      email: formData.email,
      servizio: formData.servizio,
      bio: formData.bio,
      source: 'website'
    };

    await handleSubmit(submitData);
    
    // Reset form after successful submission
    resetForm();
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-white border-golden border">
        <CardContent className="p-8">
          <form onSubmit={onSubmit} className="space-y-6">
            <FormHeader isAnalyzing={false} />
            <GhostFunnelFormFields
              formData={formData}
              onInputChange={handleInputChange}
            />
            <SubmitButton isSubmitting={isSubmitting} isAnalyzing={false} />
            <FormFooter isAnalyzing={false} />
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default GhostFunnelForm;
