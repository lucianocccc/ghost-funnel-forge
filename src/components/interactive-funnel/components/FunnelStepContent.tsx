
import React from 'react';
import { InteractiveFunnelStep, FormFieldConfig } from '@/types/interactiveFunnel';
import { parseFieldsConfig } from '../utils/fieldsConfigParser';
import FunnelFormFields from './FunnelFormFields';

interface FunnelStepContentProps {
  step: InteractiveFunnelStep;
  formData: Record<string, any>;
  onFieldChange: (fieldId: string, value: any) => void;
}

const FunnelStepContent: React.FC<FunnelStepContentProps> = ({
  step,
  formData,
  onFieldChange
}) => {
  const fieldsConfig = parseFieldsConfig(step.fields_config);
  const hasFields = fieldsConfig.length > 0;

  console.log('Rendered fields config:', fieldsConfig);
  console.log('Has fields:', hasFields);

  if (hasFields) {
    return (
      <FunnelFormFields
        fieldsConfig={fieldsConfig}
        formData={formData}
        onFieldChange={onFieldChange}
      />
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-gray-600">
        {step.description || "Clicca 'Avanti' per continuare al prossimo passo."}
      </p>
      
      {/* Default example fields when no configuration exists */}
      <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-500">
          Questo passo non ha campi configurati. Ecco alcuni campi di esempio:
        </p>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome *
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-golden"
              placeholder="Inserisci il tuo nome"
              value={formData.nome || ''}
              onChange={(e) => onFieldChange('nome', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-golden"
              placeholder="Inserisci la tua email"
              value={formData.email || ''}
              onChange={(e) => onFieldChange('email', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Messaggio
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-golden min-h-[100px]"
              placeholder="Inserisci il tuo messaggio"
              value={formData.messaggio || ''}
              onChange={(e) => onFieldChange('messaggio', e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FunnelStepContent;
