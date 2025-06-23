
import React from 'react';
import { InteractiveFunnelStep, FormFieldConfig } from '@/types/interactiveFunnel';
import { parseFieldsConfig } from '../utils/fieldsConfigParser';
import FunnelFormFields from './FunnelFormFields';
import { Sparkles, Target, CheckCircle } from 'lucide-react';

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
  const customerSettings = step.settings as any;

  console.log('Rendered fields config:', fieldsConfig);
  console.log('Has fields:', hasFields);

  return (
    <div className="space-y-6">
      {/* Customer-facing content */}
      {customerSettings?.customer_title && (
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center mb-2">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-full">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            {customerSettings.customer_title}
          </h2>
          {customerSettings?.customer_description && (
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              {customerSettings.customer_description}
            </p>
          )}
          {customerSettings?.customer_motivation && (
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
              <div className="flex items-center justify-center gap-2 text-blue-700">
                <Target className="w-5 h-5" />
                <span className="font-medium">{customerSettings.customer_motivation}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Form fields or default content */}
      {hasFields ? (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <FunnelFormFields
            fieldsConfig={fieldsConfig}
            formData={formData}
            onFieldChange={onFieldChange}
          />
        </div>
      ) : (
        <div className="space-y-6">
          {!customerSettings?.customer_title && (
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">
                {step.title}
              </h2>
              <p className="text-gray-600">
                {step.description || "Clicca 'Avanti' per continuare al prossimo passo."}
              </p>
            </div>
          )}
          
          {/* Educational content for non-form steps */}
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            <div className="text-center space-y-6">
              <div className="bg-gradient-to-r from-green-500 to-blue-600 p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Perfetto! Procediamo
                </h3>
                <p className="text-gray-600">
                  Stiamo per passare al prossimo step del processo personalizzato.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FunnelStepContent;
