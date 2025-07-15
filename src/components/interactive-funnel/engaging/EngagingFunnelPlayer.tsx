
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowRight, ArrowLeft, CheckCircle, Star, Users, Calendar } from 'lucide-react';
import { ShareableFunnel, InteractiveFunnelStep, FormFieldConfig } from '@/types/interactiveFunnel';
import { submitFunnelStep } from '@/services/interactiveFunnelService';
import { useToast } from '@/hooks/use-toast';

interface EngagingFunnelPlayerProps {
  funnel: ShareableFunnel;
  onComplete: () => void;
}

const EngagingFunnelPlayer: React.FC<EngagingFunnelPlayerProps> = ({ 
  funnel, 
  onComplete 
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const steps = funnel.interactive_funnel_steps || [];
  const currentStep = steps[currentStepIndex];
  const isLastStep = currentStepIndex === steps.length - 1;

  console.log('🎯 EngagingFunnelPlayer:', {
    funnelId: funnel.id,
    currentStepIndex,
    currentStep: currentStep?.id,
    totalSteps: steps.length,
    stepType: currentStep?.step_type
  });

  const handleFieldChange = (fieldName: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const handleStepSubmit = async () => {
    if (!currentStep) return;

    setIsSubmitting(true);
    try {
      // Submit current step data
      await submitFunnelStep(funnel.id, currentStep.id, {
        step_data: formData,
        session_id: `session_${Date.now()}`,
        user_agent: navigator.userAgent
      });

      if (isLastStep) {
        // Complete the funnel
        onComplete();
      } else {
        // Move to next step
        setCurrentStepIndex(prev => prev + 1);
        setFormData({}); // Reset form data for next step
      }
    } catch (error) {
      console.error('Error submitting step:', error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore. Riprova per favore.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrevious = () => {
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
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>{field.label}</Label>
            <Input
              id={field.id}
              type={field.type}
              value={value}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              placeholder={field.placeholder}
              required={field.required}
              className="w-full"
            />
          </div>
        );

      case 'textarea':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>{field.label}</Label>
            <Textarea
              id={field.id}
              value={value}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              placeholder={field.placeholder}
              required={field.required}
              className="w-full min-h-[100px]"
            />
          </div>
        );

      case 'select':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>{field.label}</Label>
            <Select
              value={value}
              onValueChange={(newValue) => handleFieldChange(field.id, newValue)}
              required={field.required}
            >
              <SelectTrigger>
                <SelectValue placeholder={field.placeholder} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      case 'radio':
        return (
          <div key={field.id} className="space-y-2">
            <Label>{field.label}</Label>
            <RadioGroup
              value={value}
              onValueChange={(newValue) => handleFieldChange(field.id, newValue)}
              required={field.required}
            >
              {field.options?.map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={`${field.id}-${option}`} />
                  <Label htmlFor={`${field.id}-${option}`}>{option}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        );

      case 'checkbox':
        return (
          <div key={field.id} className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id={field.id}
                checked={value === true}
                onCheckedChange={(checked) => handleFieldChange(field.id, checked)}
                required={field.required}
              />
              <Label htmlFor={field.id}>{field.label}</Label>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const renderStepContent = () => {
    if (!currentStep) return null;

    const fieldsConfig = currentStep.fields_config as FormFieldConfig[] || [];
    const stepSettings = currentStep.settings || {};

    // Get step type icon
    const getStepIcon = (stepType: string) => {
      switch (stepType) {
        case 'quiz':
        case 'assessment':
          return <Star className="w-6 h-6" />;
        case 'social_proof':
          return <Users className="w-6 h-6" />;
        case 'calendar_booking':
          return <Calendar className="w-6 h-6" />;
        default:
          return <CheckCircle className="w-6 h-6" />;
      }
    };

    return (
      <div className="space-y-6">
        {/* Step Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              {getStepIcon(currentStep.step_type)}
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            {currentStep.title}
          </h2>
          {currentStep.description && (
            <p className="text-gray-600 max-w-2xl mx-auto">
              {currentStep.description}
            </p>
          )}
        </div>

        {/* Step Content */}
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-6 space-y-6">
            {fieldsConfig.length > 0 ? (
              <div className="space-y-4">
                {fieldsConfig.map(renderFormField)}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600">
                  Contenuto dello step in fase di configurazione.
                </p>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStepIndex === 0}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Indietro
              </Button>

              <Button
                onClick={handleStepSubmit}
                disabled={isSubmitting}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Invio...
                  </>
                ) : (
                  <>
                    {isLastStep ? 'Completa' : 'Continua'}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  if (!currentStep) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="text-center py-8">
            <p className="text-gray-600">
              Nessuno step configurato per questo funnel.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Progress Bar */}
      <div className="bg-white border-b border-gray-200 py-4">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>Progresso</span>
            <span>{currentStepIndex + 1} di {steps.length}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="py-12 px-4">
        {renderStepContent()}
      </div>
    </div>
  );
};

export default EngagingFunnelPlayer;
