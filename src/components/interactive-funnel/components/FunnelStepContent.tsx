
import React from 'react';
import { CardContent } from '@/components/ui/card';
import { InteractiveFunnelStep } from '@/types/interactiveFunnel';
import { parseFieldsConfig } from '../utils/fieldsConfigParser';
import FormFieldRenderer from './FormFieldRenderer';
import { Lightbulb, Target, ArrowRight } from 'lucide-react';

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
  const customerSettings = step.settings as any;
  
  // Use customer content if available, otherwise fall back to admin content
  const displayDescription = customerSettings?.customer_description || step.description;
  const motivationText = customerSettings?.customer_motivation;

  return (
    <CardContent className="space-y-6">
      {/* Step Description */}
      {displayDescription && (
        <div className="text-center bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
          <p className="text-lg text-gray-700 leading-relaxed">
            {displayDescription}
          </p>
        </div>
      )}

      {/* Motivation Text */}
      {motivationText && (
        <div className="flex items-start gap-3 bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg">
          <Lightbulb className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <p className="text-amber-800 font-medium">
            {motivationText}
          </p>
        </div>
      )}

      {/* Step Type Indicator */}
      <div className="flex items-center justify-center">
        <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-sm text-gray-600">
          <Target className="w-4 h-4" />
          <span className="capitalize">
            {step.step_type === 'lead_capture' && 'Raccolta Contatti'}
            {step.step_type === 'qualification' && 'Qualificazione'}
            {step.step_type === 'education' && 'Informazioni'}
            {step.step_type === 'conversion' && 'Conversione'}
            {step.step_type === 'follow_up' && 'Follow-up'}
          </span>
        </div>
      </div>

      {/* Form Fields */}
      {fieldsConfig.length > 0 && (
        <div className="space-y-4">
          {fieldsConfig.map((field) => (
            <FormFieldRenderer
              key={field.id}
              field={field}
              value={formData[field.id] || ''}
              onChange={(value) => onFieldChange(field.id, value)}
            />
          ))}
        </div>
      )}

      {/* Educational Content for Education Steps */}
      {step.step_type === 'education' && (
        <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
          <div className="flex items-center gap-2 mb-4">
            <ArrowRight className="w-5 h-5 text-blue-600" />
            <h4 className="font-semibold text-blue-900">Perché è importante</h4>
          </div>
          <p className="text-blue-800">
            Questo step ci aiuta a comprendere meglio le tue esigenze per offrirti 
            la soluzione più adatta al tuo business.
          </p>
        </div>
      )}

      {/* Conversion Incentive for Conversion Steps */}
      {step.step_type === 'conversion' && (
        <div className="bg-green-50 rounded-lg p-6 border border-green-200">
          <div className="text-center">
            <div className="text-2xl mb-2">🎯</div>
            <h4 className="font-semibold text-green-900 mb-2">Quasi finito!</h4>
            <p className="text-green-800">
              Completa questo ultimo step per ricevere la tua proposta personalizzata.
            </p>
          </div>
        </div>
      )}
    </CardContent>
  );
};

export default FunnelStepContent;
