
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, ArrowLeft, Send } from 'lucide-react';
import { ShareableFunnel, FormFieldConfig } from '@/types/interactiveFunnel';
import { submitFunnelStep } from '@/services/interactiveFunnelService';
import { useToast } from '@/hooks/use-toast';

interface InteractiveFunnelPlayerProps {
  funnel: ShareableFunnel;
  onComplete: () => void;
}

const InteractiveFunnelPlayer: React.FC<InteractiveFunnelPlayerProps> = ({ funnel, onComplete }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [submitting, setSubmitting] = useState(false);
  const [sessionId] = useState(() => crypto.randomUUID());
  const { toast } = useToast();

  const sortedSteps = funnel.interactive_funnel_steps?.sort((a, b) => a.step_order - b.step_order) || [];
  const currentStep = sortedSteps[currentStepIndex];
  const isLastStep = currentStepIndex === sortedSteps.length - 1;
  const progressPercentage = ((currentStepIndex + 1) / sortedSteps.length) * 100;

  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const validateCurrentStep = () => {
    if (!currentStep?.fields_config) {
      return true;
    }

    // Cast fields_config from Json to FormFieldConfig array
    const fieldsConfig = currentStep.fields_config as FormFieldConfig[];
    if (!Array.isArray(fieldsConfig)) {
      return true;
    }

    const requiredFields = fieldsConfig.filter((field: FormFieldConfig) => field.required);
    
    for (const field of requiredFields) {
      const value = formData[field.id];
      if (!value || (typeof value === 'string' && !value.trim())) {
        toast({
          title: "Campo obbligatorio",
          description: `Il campo "${field.label}" è obbligatorio`,
          variant: "destructive",
        });
        return false;
      }
    }
    
    return true;
  };

  const handleNext = async () => {
    if (!validateCurrentStep()) {
      return;
    }

    setSubmitting(true);
    
    try {
      // Invia i dati del passo corrente
      await submitFunnelStep(
        funnel.id,
        currentStep.id,
        formData,
        undefined,
        {
          session_id: sessionId,
          completion_time: Date.now(),
          source: 'public_link'
        }
      );

      if (isLastStep) {
        onComplete();
      } else {
        setCurrentStepIndex(prev => prev + 1);
        setFormData({});
      }
    } catch (error) {
      console.error('Error submitting step:', error);
      toast({
        title: "Errore",
        description: "Errore nell'invio dei dati. Riprova.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const renderFormField = (field: FormFieldConfig) => {
    const value = formData[field.id] || '';

    switch (field.type) {
      case 'text':
      case 'email':
      case 'tel':
        return (
          <Input
            type={field.type}
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
          />
        );

      case 'textarea':
        return (
          <Textarea
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            className="min-h-[100px]"
          />
        );

      case 'select':
        return (
          <Select value={value} onValueChange={(val) => handleFieldChange(field.id, val)}>
            <SelectTrigger>
              <SelectValue placeholder={field.placeholder || "Seleziona un'opzione"} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option, index) => (
                <SelectItem key={index} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'radio':
        return (
          <RadioGroup value={value} onValueChange={(val) => handleFieldChange(field.id, val)}>
            {field.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`${field.id}-${index}`} />
                <Label htmlFor={`${field.id}-${index}`}>{option}</Label>
              </div>
            ))}
          </RadioGroup>
        );

      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={value === true}
              onCheckedChange={(checked) => handleFieldChange(field.id, checked)}
              id={field.id}
            />
            <Label htmlFor={field.id}>{field.label}</Label>
          </div>
        );

      default:
        return (
          <Input
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
          />
        );
    }
  };

  if (sortedSteps.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-gray-500">Questo funnel non ha passi configurati.</p>
        </CardContent>
      </Card>
    );
  }

  // Cast fields_config from Json to FormFieldConfig array for rendering
  const fieldsConfig = currentStep.fields_config as FormFieldConfig[];
  const hasFields = fieldsConfig && Array.isArray(fieldsConfig);

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Passo {currentStepIndex + 1} di {sortedSteps.length}</span>
          <span>{Math.round(progressPercentage)}% completato</span>
        </div>
        <Progress value={progressPercentage} className="h-2" />
      </div>

      {/* Current Step */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-golden rounded-full flex items-center justify-center text-black font-bold">
              {currentStepIndex + 1}
            </div>
            <div>
              <CardTitle className="text-xl">{currentStep.title}</CardTitle>
              {currentStep.description && (
                <p className="text-gray-600 mt-1">{currentStep.description}</p>
              )}
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Badge variant="outline">{currentStep.step_type}</Badge>
            {currentStep.is_required && (
              <Badge>Obbligatorio</Badge>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Form Fields */}
          {hasFields && (
            <div className="space-y-4">
              {fieldsConfig.map((field: FormFieldConfig) => (
                <div key={field.id} className="space-y-2">
                  <Label htmlFor={field.id} className="text-sm font-medium">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </Label>
                  {renderFormField(field)}
                </div>
              ))}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStepIndex === 0}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Indietro
            </Button>

            <Button
              onClick={handleNext}
              disabled={submitting}
              className="bg-golden hover:bg-yellow-600 text-black"
            >
              {submitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                  Invio...
                </div>
              ) : isLastStep ? (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Invia
                </>
              ) : (
                <>
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Avanti
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InteractiveFunnelPlayer;
