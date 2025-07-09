import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { CinematicScene } from './core/types';
import { Check, ArrowRight, Star, Users, Shield, Zap } from 'lucide-react';

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
  const [step, setStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Show form when user has seen most of the funnel
    const progressThreshold = 0.8;
    const shouldShow = currentScene >= scenes.length - 1 || scrollProgress > progressThreshold;
    setIsVisible(shouldShow);
  }, [currentScene, scenes.length, scrollProgress]);

  const handleInputChange = (field: string, value: string) => {
    const newData = { ...formData, [field]: value };
    onFormChange(newData);
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateStep = (stepIndex: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (stepIndex) {
      case 0:
        if (!formData.name?.trim()) {
          newErrors.name = 'Il nome è richiesto';
        }
        if (!formData.email?.trim()) {
          newErrors.email = 'L\'email è richiesta';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
          newErrors.email = 'Email non valida';
        }
        break;
      case 1:
        if (!formData.phone?.trim()) {
          newErrors.phone = 'Il telefono è richiesto';
        }
        if (!formData.company?.trim()) {
          newErrors.company = 'Il nome dell\'azienda è richiesto';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(step)) {
      if (step < 2) {
        setStep(step + 1);
      } else {
        handleSubmit();
      }
    }
  };

  const handleSubmit = () => {
    const finalData = {
      ...formData,
      timestamp: new Date().toISOString(),
      source: 'cinematic_funnel',
      scenesViewed: currentScene + 1,
      completionLevel: 'full'
    };

    onSubmit(finalData);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black flex items-center justify-center overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 w-full max-w-2xl mx-auto p-6">
        {/* Trust indicators header */}
        <div className="text-center mb-8 space-y-4">
          <div className="flex items-center justify-center space-x-6 text-white/60 text-sm">
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4" />
              <span>100% Sicuro</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>10.000+ Clienti</span>
            </div>
            <div className="flex items-center space-x-2">
              <Star className="w-4 h-4" />
              <span>4.9/5 Rating</span>
            </div>
          </div>
        </div>

        {/* Main form card */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl p-8">
          {/* Progress indicator */}
          <div className="flex items-center justify-center mb-8">
            {[0, 1, 2].map((i) => (
              <React.Fragment key={i}>
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold
                  transition-all duration-300
                  ${i <= step 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-white/20 text-white/60'
                  }
                `}>
                  {i < step ? <Check className="w-4 h-4" /> : i + 1}
                </div>
                {i < 2 && (
                  <div className={`
                    w-16 h-1 mx-2 rounded-full transition-all duration-300
                    ${i < step ? 'bg-blue-500' : 'bg-white/20'}
                  `} />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Step content */}
          <div className="space-y-6">
            {step === 0 && (
              <div className="space-y-6 animate-fade-in">
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-bold text-white">Iniziamo!</h2>
                  <p className="text-white/80">Le tue informazioni di base</p>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Input
                      placeholder="Il tuo nome completo"
                      value={formData.name || ''}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-blue-400"
                    />
                    {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
                  </div>
                  
                  <div>
                    <Input
                      type="email"
                      placeholder="La tua email"
                      value={formData.email || ''}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-blue-400"
                    />
                    {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
                  </div>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-6 animate-fade-in">
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-bold text-white">Dettagli di contatto</h2>
                  <p className="text-white/80">Come possiamo raggiungerti</p>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Input
                      placeholder="Il tuo numero di telefono"
                      value={formData.phone || ''}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-blue-400"
                    />
                    {errors.phone && <p className="text-red-400 text-sm mt-1">{errors.phone}</p>}
                  </div>
                  
                  <div>
                    <Input
                      placeholder="Nome della tua azienda"
                      value={formData.company || ''}
                      onChange={(e) => handleInputChange('company', e.target.value)}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-blue-400"
                    />
                    {errors.company && <p className="text-red-400 text-sm mt-1">{errors.company}</p>}
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6 animate-fade-in">
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-bold text-white">Quasi fatto!</h2>
                  <p className="text-white/80">Raccontaci le tue esigenze</p>
                </div>
                
                <div className="space-y-4">
                  <Textarea
                    placeholder="Descrivi brevemente le tue esigenze o obiettivi..."
                    value={formData.message || ''}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-blue-400 min-h-[120px]"
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <select
                      value={formData.budget || ''}
                      onChange={(e) => handleInputChange('budget', e.target.value)}
                      className="bg-white/10 border border-white/20 text-white rounded-md px-3 py-2 focus:border-blue-400 focus:outline-none"
                    >
                      <option value="">Budget di riferimento</option>
                      <option value="under-5k">Sotto €5.000</option>
                      <option value="5k-15k">€5.000 - €15.000</option>
                      <option value="15k-50k">€15.000 - €50.000</option>
                      <option value="over-50k">Oltre €50.000</option>
                    </select>
                    
                    <select
                      value={formData.timeline || ''}
                      onChange={(e) => handleInputChange('timeline', e.target.value)}
                      className="bg-white/10 border border-white/20 text-white rounded-md px-3 py-2 focus:border-blue-400 focus:outline-none"
                    >
                      <option value="">Tempistiche</option>
                      <option value="immediate">Immediato</option>
                      <option value="1-month">Entro 1 mese</option>
                      <option value="3-months">Entro 3 mesi</option>
                      <option value="6-months">Entro 6 mesi</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex items-center justify-between pt-6">
              {step > 0 && (
                <Button
                  variant="outline"
                  onClick={() => setStep(step - 1)}
                  className="text-white border-white/20 hover:bg-white/10"
                >
                  Indietro
                </Button>
              )}
              
              <Button
                onClick={nextStep}
                className={`
                  bg-blue-600 hover:bg-blue-700 text-white font-semibold
                  px-8 py-3 rounded-lg transition-all duration-300
                  hover:scale-105 hover:shadow-xl
                  flex items-center space-x-2
                  ${step === 0 ? 'ml-auto' : ''}
                `}
              >
                <span>{step === 2 ? 'Invia Richiesta' : 'Continua'}</span>
                {step === 2 ? <Zap className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Trust signals footer */}
        <div className="text-center mt-8 space-y-4">
          <div className="text-white/60 text-sm">
            ✅ Risposta entro 24 ore &nbsp;&nbsp;|&nbsp;&nbsp; 🔒 Dati protetti &nbsp;&nbsp;|&nbsp;&nbsp; 📞 Consulenza gratuita
          </div>
          <div className="text-white/40 text-xs">
            I tuoi dati sono protetti e utilizzati solo per contattarti
          </div>
        </div>
      </div>
    </div>
  );
};