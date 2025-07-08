import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Sparkles } from 'lucide-react';

interface AdvancedConversionFormProps {
  data: any;
  theme: any;
  onSubmit: (data: any) => void;
  submitting: boolean;
}

export const AdvancedConversionForm: React.FC<AdvancedConversionFormProps> = ({
  data, theme, onSubmit, submitting
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>({});

  const steps = data?.steps || [{ title: 'Informazioni', fields: data?.fields || [] }];
  const totalSteps = steps.length;

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNextStep = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onSubmit(formData);
    }
  };

  const currentStepData = steps[currentStep];

  return (
    <div className="space-y-8 py-12 max-w-2xl mx-auto">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold">
          {data?.title || 'Ottieni maggiori informazioni'}
        </h2>
        <p className="text-lg text-muted-foreground">
          {data?.description || 'Lasciaci i tuoi dati per un\'offerta personalizzata'}
        </p>
        <Badge className="bg-green-100 text-green-800 border-green-300">
          🎁 {data?.incentive || 'Offerta speciale per te!'}
        </Badge>
      </div>
      
      {data?.progressBar && totalSteps > 1 && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Passo {currentStep + 1} di {totalSteps}</span>
            <span>{Math.round(((currentStep + 1) / totalSteps) * 100)}%</span>
          </div>
          <Progress value={((currentStep + 1) / totalSteps) * 100} />
        </div>
      )}
      
      <Card className="p-8">
        <CardContent className="p-0 space-y-6">
          <h3 className="text-xl font-semibold">{currentStepData?.title}</h3>
          
          {currentStepData?.fields?.map((field: any, index: number) => (
            <div key={index} className="space-y-2">
              <label className="text-sm font-medium">
                {field.label} {field.required && <span className="text-red-500">*</span>}
              </label>
              
              {field.type === 'select' ? (
                <Select onValueChange={(value) => handleInputChange(field.name, value)}>
                  <SelectTrigger>
                    <SelectValue placeholder={field.placeholder} />
                  </SelectTrigger>
                  <SelectContent>
                    {field.options?.map((option: string, optIndex: number) => (
                      <SelectItem key={optIndex} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : field.type === 'textarea' ? (
                <Textarea
                  placeholder={field.placeholder}
                  value={formData[field.name] || ''}
                  onChange={(e) => handleInputChange(field.name, e.target.value)}
                  rows={3}
                />
              ) : (
                <Input
                  type={field.type}
                  placeholder={field.placeholder}
                  value={formData[field.name] || ''}
                  onChange={(e) => handleInputChange(field.name, e.target.value)}
                />
              )}
            </div>
          ))}
          
          {data?.socialProofInline && (
            <div className="text-center text-sm text-muted-foreground">
              👥 {data.socialProofInline}
            </div>
          )}
          
          <Button
            size="lg"
            onClick={handleNextStep}
            disabled={submitting}
            className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
          >
            {submitting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Elaborazione...
              </div>
            ) : (
              <>
                {currentStep < totalSteps - 1 ? 'Continua' : (data?.submitText || 'Invia Richiesta')}
                <Sparkles className="ml-2 w-5 h-5" />
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};