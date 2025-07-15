
import React from 'react';
import { InteractiveFunnelStep } from '@/types/interactiveFunnel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface StepRendererProps {
  step: InteractiveFunnelStep;
  onDataChange: (data: any) => void;
  existingData?: any;
}

const StepRenderer: React.FC<StepRendererProps> = ({ step, onDataChange, existingData }) => {
  console.log('StepRenderer rendering step:', {
    id: step.id,
    title: step.title,
    step_type: step.step_type,
    fields_config: step.fields_config,
    existingData
  });

  const handleInputChange = (fieldName: string, value: string) => {
    const newData = { ...existingData, [fieldName]: value };
    onDataChange(newData);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {step.title}
        </h2>
        {step.description && (
          <p className="text-gray-600 max-w-2xl mx-auto">
            {step.description}
          </p>
        )}
      </div>

      {step.step_type === 'form' && (
        <Card>
          <CardHeader>
            <CardTitle>Compila i tuoi dati</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {step.fields_config && Array.isArray(step.fields_config) && step.fields_config.length > 0 ? (
              step.fields_config.map((field: any, index: number) => (
                <div key={index} className="space-y-2">
                  <Label htmlFor={field.name}>
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </Label>
                  {field.type === 'textarea' ? (
                    <Textarea
                      id={field.name}
                      placeholder={field.placeholder || ''}
                      value={existingData?.[field.name] || ''}
                      onChange={(e) => handleInputChange(field.name, e.target.value)}
                      className="w-full"
                    />
                  ) : (
                    <Input
                      id={field.name}
                      type={field.type || 'text'}
                      placeholder={field.placeholder || ''}
                      value={existingData?.[field.name] || ''}
                      onChange={(e) => handleInputChange(field.name, e.target.value)}
                      className="w-full"
                    />
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">
                  Nessun campo configurato per questo step
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {step.step_type === 'content' && (
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-gray-600">
                Contenuto informativo per questo step
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {step.step_type === 'question' && (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <Label htmlFor="question-response">La tua risposta</Label>
              <Textarea
                id="question-response"
                placeholder="Scrivi la tua risposta qui..."
                value={existingData?.response || ''}
                onChange={(e) => handleInputChange('response', e.target.value)}
                className="w-full"
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StepRenderer;
