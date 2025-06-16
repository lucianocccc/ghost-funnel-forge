
import React from 'react';
import { User, Mail, Briefcase, FileText } from 'lucide-react';
import FormField from './FormField';
import { FormData } from '@/hooks/useGhostFunnelFormState';

interface GhostFunnelFormFieldsProps {
  formData: FormData;
  onInputChange: (field: keyof FormData, value: string) => void;
}

const GhostFunnelFormFields: React.FC<GhostFunnelFormFieldsProps> = ({
  formData,
  onInputChange
}) => {
  return (
    <div className="space-y-6">
      <FormField
        id="nome"
        label="Nome Completo"
        icon={User}
        value={formData.nome}
        onChange={(value) => onInputChange('nome', value)}
        placeholder="Inserisci il tuo nome completo"
        required
      />

      <FormField
        id="email"
        label="Email"
        icon={Mail}
        type="email"
        value={formData.email}
        onChange={(value) => onInputChange('email', value)}
        placeholder="la-tua-email@esempio.com"
        required
      />

      <FormField
        id="servizio"
        label="Servizio di Interesse"
        icon={Briefcase}
        value={formData.servizio}
        onChange={(value) => onInputChange('servizio', value)}
        placeholder="Es. Consulenza Marketing, Web Design, SEO..."
        required
      />

      <FormField
        id="bio"
        label="Raccontaci di Te"
        icon={FileText}
        type="textarea"
        value={formData.bio}
        onChange={(value) => onInputChange('bio', value)}
        placeholder="Descrivi brevemente la tua attività e i tuoi obiettivi..."
      />
    </div>
  );
};

export default GhostFunnelFormFields;
