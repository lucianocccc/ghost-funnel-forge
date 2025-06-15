
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { User, Mail, Briefcase, FileText } from 'lucide-react';
import FormHeader from './form/FormHeader';
import FormField from './form/FormField';
import SubmitButton from './form/SubmitButton';
import FormFooter from './form/FormFooter';
import { useFormSubmission } from './form/useFormSubmission';

interface FormData {
  nome: string;
  email: string;
  servizio: string;
  bio: string;
}

const GhostFunnelForm = () => {
  const [formData, setFormData] = useState<FormData>({
    nome: '',
    email: '',
    servizio: '',
    bio: ''
  });

  const { isSubmitting, isAnalyzing, submitForm } = useFormSubmission();

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitForm(formData, resetForm);
  };

  return (
    <Card className="bg-white border-golden border-2 shadow-2xl">
      <CardContent className="p-8">
        <FormHeader isAnalyzing={isAnalyzing} />

        <form onSubmit={handleSubmit} className="space-y-6">
          <FormField
            id="nome"
            label="Nome Completo"
            icon={User}
            value={formData.nome}
            onChange={(value) => handleInputChange('nome', value)}
            placeholder="Inserisci il tuo nome completo"
            required
          />

          <FormField
            id="email"
            label="Email"
            icon={Mail}
            type="email"
            value={formData.email}
            onChange={(value) => handleInputChange('email', value)}
            placeholder="la-tua-email@esempio.com"
            required
          />

          <FormField
            id="servizio"
            label="Servizio di Interesse"
            icon={Briefcase}
            value={formData.servizio}
            onChange={(value) => handleInputChange('servizio', value)}
            placeholder="Es. Consulenza Marketing, Web Design, SEO..."
            required
          />

          <FormField
            id="bio"
            label="Raccontaci di Te"
            icon={FileText}
            type="textarea"
            value={formData.bio}
            onChange={(value) => handleInputChange('bio', value)}
            placeholder="Descrivi brevemente la tua attività e i tuoi obiettivi..."
          />

          <SubmitButton isSubmitting={isSubmitting} isAnalyzing={isAnalyzing} />
        </form>

        <FormFooter isAnalyzing={isAnalyzing} />
      </CardContent>
    </Card>
  );
};

export default GhostFunnelForm;
