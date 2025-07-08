import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Mail, Phone, User, Building, ArrowRight, Gift } from 'lucide-react';

interface CinematicScene {
  id: string;
  type: 'hero' | 'benefit' | 'proof' | 'demo' | 'conversion';
  imagePrompt: string;
  imageUrl?: string;
  title: string;
  subtitle: string;
  content: string;
  cta?: {
    text: string;
    action: string;
  };
  scrollTrigger: {
    start: number;
    end: number;
  };
  parallaxLayers: Array<{
    element: string;
    speed: number;
    scale: number;
    opacity: number;
  }>;
}

interface ConversionOptimizedFlowProps {
  scenes: CinematicScene[];
  currentScene: number;
  scrollProgress: number;
  formData: Record<string, any>;
  onFormChange: (data: Record<string, any>) => void;
  onSubmit: (data: any) => void;
}

export const ConversionOptimizedFlow: React.FC<ConversionOptimizedFlowProps> = ({
  scenes,
  currentScene,
  scrollProgress,
  formData,
  onFormChange,
  onSubmit
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const isConversionScene = scenes[currentScene]?.type === 'conversion';
  const isLastScene = currentScene === scenes.length - 1;

  const formSteps = [
    {
      title: 'Informazioni Personali',
      fields: [
        { name: 'firstName', label: 'Nome', type: 'text', icon: User, required: true },
        { name: 'lastName', label: 'Cognome', type: 'text', icon: User, required: true },
        { name: 'email', label: 'Email', type: 'email', icon: Mail, required: true },
        { name: 'phone', label: 'Telefono', type: 'tel', icon: Phone, required: false },
      ]
    },
    {
      title: 'Dettagli Business',
      fields: [
        { name: 'company', label: 'Azienda', type: 'text', icon: Building, required: true },
        { name: 'role', label: 'Ruolo', type: 'text', icon: User, required: true },
        { name: 'industry', label: 'Settore', type: 'text', icon: Building, required: false },
      ]
    },
    {
      title: 'Interessi e Obiettivi',
      fields: [
        { name: 'interests', label: 'Cosa ti interessa di più?', type: 'textarea', required: true },
        { name: 'goals', label: 'Quali sono i tuoi obiettivi?', type: 'textarea', required: true },
      ]
    }
  ];

  const handleInputChange = (field: string, value: string) => {
    const newFormData = { ...formData, [field]: value };
    onFormChange(newFormData);
    
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateStep = (stepIndex: number) => {
    const step = formSteps[stepIndex];
    const errors: Record<string, string> = {};
    
    step.fields.forEach(field => {
      if (field.required && !formData[field.name]) {
        errors[field.name] = `${field.label} è richiesto`;
      }
      if (field.type === 'email' && formData[field.name] && !isValidEmail(formData[field.name])) {
        errors[field.name] = 'Email non valida';
      }
    });

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      if (currentStep < formSteps.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        handleSubmit();
      }
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isConversionScene && !isLastScene) {
    return (
      <div className="fixed bottom-8 right-8 z-30">
        <Card className="bg-black/20 backdrop-blur-sm border-white/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <div className="text-white">
                <div className="text-sm font-medium">Interessato?</div>
                <div className="text-xs text-white/70">Scopri di più alla fine</div>
              </div>
              <Button
                size="sm"
                className="bg-white/10 hover:bg-white/20 text-white border-white/20"
                onClick={() => {
                  window.scrollTo({
                    top: document.body.scrollHeight,
                    behavior: 'smooth'
                  });
                }}
              >
                <Gift className="w-4 h-4 mr-2" />
                Ottieni Accesso
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isConversionScene) return null;

  const currentStepData = formSteps[currentStep];
  const progress = ((currentStep + 1) / formSteps.length) * 100;

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-black/40 backdrop-blur-xl border-white/20">
        <CardContent className="p-8">
          {/* Progress indicator */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">{currentStepData.title}</h3>
              <Badge variant="outline" className="text-white border-white/20">
                {currentStep + 1} di {formSteps.length}
              </Badge>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-400 to-purple-400 h-2 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Form fields */}
          <div className="space-y-6">
            {currentStepData.fields.map((field) => {
              const Icon = field.icon;
              return (
                <div key={field.name} className="space-y-2">
                  <label className="text-white font-medium flex items-center space-x-2">
                    {Icon && <Icon className="w-4 h-4" />}
                    <span>{field.label}</span>
                    {field.required && <span className="text-red-400">*</span>}
                  </label>
                  {field.type === 'textarea' ? (
                    <Textarea
                      value={formData[field.name] || ''}
                      onChange={(e) => handleInputChange(field.name, e.target.value)}
                      className="bg-white/10 border-white/20 text-white placeholder-white/50 focus:border-white/40"
                      placeholder={`Inserisci ${field.label.toLowerCase()}`}
                      rows={4}
                    />
                  ) : (
                    <Input
                      type={field.type}
                      value={formData[field.name] || ''}
                      onChange={(e) => handleInputChange(field.name, e.target.value)}
                      className="bg-white/10 border-white/20 text-white placeholder-white/50 focus:border-white/40"
                      placeholder={`Inserisci ${field.label.toLowerCase()}`}
                    />
                  )}
                  {formErrors[field.name] && (
                    <p className="text-red-400 text-sm">{formErrors[field.name]}</p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Action buttons */}
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
              className="border-white/20 text-white hover:bg-white/10"
            >
              Indietro
            </Button>

            <Button
              onClick={handleNextStep}
              disabled={isSubmitting}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              ) : (
                <>
                  {currentStep === formSteps.length - 1 ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Completa
                    </>
                  ) : (
                    <>
                      Avanti
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </>
              )}
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="mt-8 pt-6 border-t border-white/20">
            <div className="flex items-center justify-center space-x-6 text-white/70 text-sm">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>100% Sicuro</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>Nessun Spam</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>Accesso Immediato</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};