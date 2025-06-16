
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
  const { isSubmitting, isAnalyzing, submitForm } = useFormSubmission();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitForm(formData, resetForm);
  };

  return (
    <Card className="bg-white border-golden border-2 shadow-2xl">
      <CardContent className="p-8">
        <FormHeader isAnalyzing={isAnalyzing} />

        <form onSubmit={handleSubmit} className="space-y-6">
          <GhostFunnelFormFields
            formData={formData}
            onInputChange={handleInputChange}
          />

          <SubmitButton isSubmitting={isSubmitting} isAnalyzing={isAnalyzing} />
        </form>

        <FormFooter isAnalyzing={isAnalyzing} />
      </CardContent>
    </Card>
  );
};

export default GhostFunnelForm;
