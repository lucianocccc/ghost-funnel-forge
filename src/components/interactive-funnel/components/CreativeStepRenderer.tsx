
import React, { useState } from 'react';
import { InteractiveFunnelStep } from '@/types/interactiveFunnel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { CalendarDays, Calculator, Users, CheckCircle, TrendingUp, Star } from 'lucide-react';

interface CreativeStepRendererProps {
  step: InteractiveFunnelStep;
  onDataChange: (data: any) => void;
  existingData?: any;
}

const CreativeStepRenderer: React.FC<CreativeStepRendererProps> = ({ 
  step, 
  onDataChange, 
  existingData 
}) => {
  const [localData, setLocalData] = useState(existingData || {});

  const handleFieldChange = (fieldName: string, value: any) => {
    const newData = { ...localData, [fieldName]: value };
    setLocalData(newData);
    onDataChange(newData);
  };

  const getStepIcon = () => {
    switch (step.step_type) {
      case 'quiz': return <CheckCircle className="w-6 h-6 text-purple-600" />;
      case 'assessment': return <TrendingUp className="w-6 h-6 text-blue-600" />;
      case 'calculator': return <Calculator className="w-6 h-6 text-green-600" />;
      case 'demo_request': return <Users className="w-6 h-6 text-orange-600" />;
      case 'calendar_booking': return <CalendarDays className="w-6 h-6 text-indigo-600" />;
      case 'social_proof': return <Star className="w-6 h-6 text-yellow-600" />;
      default: return <CheckCircle className="w-6 h-6 text-gray-600" />;
    }
  };

  const getStepTheme = () => {
    switch (step.step_type) {
      case 'quiz': return 'from-purple-50 to-pink-50 border-purple-200';
      case 'assessment': return 'from-blue-50 to-cyan-50 border-blue-200';
      case 'calculator': return 'from-green-50 to-emerald-50 border-green-200';
      case 'demo_request': return 'from-orange-50 to-red-50 border-orange-200';
      case 'calendar_booking': return 'from-indigo-50 to-purple-50 border-indigo-200';
      case 'social_proof': return 'from-yellow-50 to-orange-50 border-yellow-200';
      default: return 'from-gray-50 to-slate-50 border-gray-200';
    }
  };

  const renderField = (field: any, index: number) => {
    const fieldValue = localData[field.name];

    switch (field.type) {
      case 'radio':
        return (
          <div key={index} className="space-y-3">
            <Label className="text-base font-semibold text-gray-800">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <RadioGroup
              value={fieldValue || ''}
              onValueChange={(value) => handleFieldChange(field.name, value)}
              className="grid grid-cols-1 gap-3"
            >
              {field.options?.map((option: string, optIndex: number) => (
                <div key={optIndex} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                  <RadioGroupItem value={option} id={`${field.name}-${optIndex}`} />
                  <Label htmlFor={`${field.name}-${optIndex}`} className="cursor-pointer flex-1">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        );

      case 'checkbox':
        return (
          <div key={index} className="space-y-3">
            <Label className="text-base font-semibold text-gray-800">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <div className="grid grid-cols-1 gap-3">
              {field.options?.map((option: string, optIndex: number) => {
                const isChecked = Array.isArray(fieldValue) && fieldValue.includes(option);
                return (
                  <div key={optIndex} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                    <Checkbox
                      id={`${field.name}-${optIndex}`}
                      checked={isChecked}
                      onCheckedChange={(checked) => {
                        const currentValues = Array.isArray(fieldValue) ? fieldValue : [];
                        if (checked) {
                          handleFieldChange(field.name, [...currentValues, option]);
                        } else {
                          handleFieldChange(field.name, currentValues.filter((v: string) => v !== option));
                        }
                      }}
                    />
                    <Label htmlFor={`${field.name}-${optIndex}`} className="cursor-pointer flex-1">
                      {option}
                    </Label>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 'select':
        return (
          <div key={index} className="space-y-2">
            <Label className="text-base font-semibold text-gray-800">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Select value={fieldValue || ''} onValueChange={(value) => handleFieldChange(field.name, value)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={field.placeholder || 'Seleziona un\'opzione'} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option: string, optIndex: number) => (
                  <SelectItem key={optIndex} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      case 'scale':
        return (
          <div key={index} className="space-y-4">
            <Label className="text-base font-semibold text-gray-800">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <div className="px-4">
              <Slider
                value={[fieldValue || field.min || 1]}
                onValueChange={(value) => handleFieldChange(field.name, value[0])}
                max={field.max || 10}
                min={field.min || 1}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-gray-500 mt-2">
                <span>{field.min || 1}</span>
                <span className="font-semibold text-lg text-gray-800">{fieldValue || field.min || 1}</span>
                <span>{field.max || 10}</span>
              </div>
            </div>
          </div>
        );

      case 'textarea':
        return (
          <div key={index} className="space-y-2">
            <Label className="text-base font-semibold text-gray-800">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Textarea
              placeholder={field.placeholder || ''}
              value={fieldValue || ''}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              className="min-h-[100px] resize-none"
            />
          </div>
        );

      case 'number':
        return (
          <div key={index} className="space-y-2">
            <Label className="text-base font-semibold text-gray-800">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              type="number"
              placeholder={field.placeholder || ''}
              value={fieldValue || ''}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              min={field.min}
              max={field.max}
            />
          </div>
        );

      default:
        return (
          <div key={index} className="space-y-2">
            <Label className="text-base font-semibold text-gray-800">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              type={field.type || 'text'}
              placeholder={field.placeholder || ''}
              value={fieldValue || ''}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
            />
          </div>
        );
    }
  };

  const getStepTypeDescription = () => {
    switch (step.step_type) {
      case 'quiz': return 'Scopri la soluzione perfetta per te';
      case 'assessment': return 'Valutiamo insieme la tua situazione';
      case 'calculator': return 'Calcola il tuo potenziale';
      case 'demo_request': return 'Vedi il prodotto in azione';
      case 'calendar_booking': return 'Prenota la tua consulenza';
      case 'social_proof': return 'Scopri cosa dicono i nostri clienti';
      default: return 'Completa questo passaggio';
    }
  };

  return (
    <div className="space-y-6 min-h-[500px]">
      {/* Header with icon and step type */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className={`p-4 rounded-full bg-gradient-to-br ${getStepTheme()}`}>
            {getStepIcon()}
          </div>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-3">
          {step.title}
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-2">
          {step.description}
        </p>
        <p className="text-sm text-gray-500 font-medium">
          {getStepTypeDescription()}
        </p>
      </div>

      {/* Step Content */}
      <Card className={`border-2 bg-gradient-to-br ${getStepTheme()} shadow-lg`}>
        <CardHeader className="bg-white/80 backdrop-blur-sm border-b-2 border-gray-100">
          <CardTitle className="text-xl text-gray-900 flex items-center gap-2">
            {getStepIcon()}
            {step.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 p-8 bg-white/60 backdrop-blur-sm">
          {step.fields_config && Array.isArray(step.fields_config) && step.fields_config.length > 0 ? (
            step.fields_config.map((field: any, index: number) => renderField(field, index))
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎯</div>
              <p className="text-gray-500 text-lg">
                Questo step è in fase di configurazione
              </p>
            </div>
          )}

          {/* Step-specific additional content */}
          {step.step_type === 'calculator' && (
            <div className="mt-6 p-4 bg-white/80 rounded-lg border">
              <h4 className="font-semibold text-gray-800 mb-2">💡 Risultato Automatico</h4>
              <p className="text-gray-600">I tuoi risultati verranno calcolati automaticamente in base alle tue risposte.</p>
            </div>
          )}

          {step.step_type === 'demo_request' && (
            <div className="mt-6 p-4 bg-white/80 rounded-lg border">
              <h4 className="font-semibold text-gray-800 mb-2">🚀 Demo Personalizzata</h4>
              <p className="text-gray-600">Prepareremo una demo specifica per le tue esigenze e il tuo settore.</p>
            </div>
          )}

          {step.step_type === 'social_proof' && (
            <div className="mt-6 p-4 bg-white/80 rounded-lg border">
              <h4 className="font-semibold text-gray-800 mb-2">⭐ Testimonial</h4>
              <p className="text-gray-600">"Questa soluzione ha trasformato il nostro business!" - Cliente soddisfatto</p>
            </div>
          )}

          {/* Settings description */}
          {step.settings?.description && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-blue-800 font-medium">
                {step.settings.description}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CreativeStepRenderer;
