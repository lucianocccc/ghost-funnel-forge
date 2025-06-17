
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import FormHeader from './form/FormHeader';
import GhostFunnelFormFields from './form/GhostFunnelFormFields';
import SubmitButton from './form/SubmitButton';
import FormFooter from './form/FormFooter';
import { useFormSubmission } from './form/useFormSubmission';
import { useGhostFunnelFormState } from '@/hooks/useGhostFunnelFormState';

const GhostFunnelForm = () => {
  const formState = useGhostFunnelFormState();
  const { handleSubmit, isSubmitting } = useFormSubmission();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const formData = {
      nome: formState.name,
      email: formState.email,
      servizio: formState.service,
      bio: formState.bio,
      source: 'website'
    };

    await handleSubmit(formData);
    
    // Reset form after successful submission
    formState.setName('');
    formState.setEmail('');
    formState.setService('');
    formState.setBio('');
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-white border-golden border">
        <CardContent className="p-8">
          <form onSubmit={onSubmit} className="space-y-6">
            <FormHeader />
            <GhostFunnelFormFields
              name={formState.name}
              email={formState.email}
              service={formState.service}
              bio={formState.bio}
              onNameChange={formState.setName}
              onEmailChange={formState.setEmail}
              onServiceChange={formState.setService}
              onBioChange={formState.setBio}
            />
            <SubmitButton isSubmitting={isSubmitting} />
            <FormFooter />
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default GhostFunnelForm;
