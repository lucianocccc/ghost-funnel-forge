
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ShareableFunnel } from '@/types/interactiveFunnel';
import { useFunnelSubmission } from '../hooks/useFunnelSubmission';
import { useFunnelFormData } from '../hooks/useFunnelFormData';
import { parseFieldsConfig } from '../utils/fieldsConfigParser';
import { 
  ArrowRight, 
  Sparkles, 
  Star, 
  Users, 
  Shield, 
  Clock,
  CheckCircle2,
  Gift,
  Zap,
  TrendingUp,
  Heart,
  Target,
  Award
} from 'lucide-react';

interface ConsumerFriendlyFunnelPlayerProps {
  funnel: ShareableFunnel;
  onComplete: () => void;
}

const ConsumerFriendlyFunnelPlayer: React.FC<ConsumerFriendlyFunnelPlayerProps> = ({ 
  funnel, 
  onComplete 
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [sessionId] = useState(() => crypto.randomUUID());
  const [showSuccess, setShowSuccess] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const { formData, handleFieldChange, resetFormData } = useFunnelFormData();
  const { submitting, submitStep } = useFunnelSubmission(funnel, sessionId, onComplete);

  const steps = funnel.interactive_funnel_steps || [];
  const currentStep = steps[currentStepIndex];
  const isLastStep = currentStepIndex === steps.length - 1;
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 300);
    return () => clearTimeout(timer);
  }, [currentStepIndex]);

  // Use analyzed magnetic elements from AI if available
  const getDisplayTitle = () => {
    const magneticElements = funnel.settings?.magneticElements;
    if (magneticElements?.primaryHook) {
      return magneticElements.primaryHook;
    }
    
    return getFallbackMagneticTitle(funnel.name, funnel.description || '');
  };

  const getDisplayDescription = () => {
    const magneticElements = funnel.settings?.magneticElements;
    if (magneticElements?.valueProposition) {
      return magneticElements.valueProposition;
    }
    
    return getFallbackMagneticDescription(funnel.description || '');
  };

  const getFallbackMagneticTitle = (originalName: string, originalDescription: string) => {
    const magneticTitles = [
      "🎯 Trasforma il Tuo Business in Soli 5 Minuti!",
      "💎 Scopri il Segreto del Successo che Tutti Vogliono",
      "🚀 Rivoluziona la Tua Attività con il Metodo Innovativo"
    ];
    
    if (originalName.toLowerCase().includes('lavanderia')) {
      return "🧽 Rivoluziona la Tua Lavanderia: Il Metodo che Sta Trasformando il Settore!";
    }
    if (originalName.toLowerCase().includes('ristorante')) {
      return "🍽️ Il Segreto per Far Esplodere il Tuo Ristorante: Scopri Come!";
    }
    if (originalName.toLowerCase().includes('negozio')) {
      return "🛍️ Trasforma il Tuo Negozio in una Macchina da Soldi!";
    }
    
    return magneticTitles[0];
  };

  const getFallbackMagneticDescription = (originalDescription: string) => {
    const magneticDescriptions = [
      "Unisciti a migliaia di imprenditori che hanno già trasformato il loro business. Bastano solo 2 minuti per iniziare il tuo percorso verso il successo!",
      "Scopri i segreti che i top performer non vogliono condividere. Il tuo successo inizia proprio qui, proprio ora!"
    ];
    
    if (originalDescription?.toLowerCase().includes('lavanderia')) {
      return "Scopri come i proprietari di lavanderie più smart stanno aumentando i loro profitti del 300% con il nostro metodo rivoluzionario. La tua lavanderia merita di brillare!";
    }
    
    return magneticDescriptions[0];
  };

  if (!currentStep) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🎯</div>
          <h2 className="text-2xl font-bold text-gray-800">Caricamento...</h2>
        </div>
      </div>
    );
  }

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="text-center max-w-2xl mx-auto p-8">
          <div className="animate-bounce text-6xl mb-6">🎉</div>
          <h1 className="text-4xl font-bold text-green-800 mb-4">
            Fantastico! Sei dentro!
          </h1>
          <p className="text-xl text-green-700 mb-8">
            I tuoi dati sono stati analizzati con la nostra IA. Il nostro team ti contatterà presto con una proposta personalizzata!
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <div className="bg-white/70 backdrop-blur rounded-xl p-4">
              <Target className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="font-semibold">Analisi IA Completata</p>
              <p className="text-sm text-gray-600">Profilo ottimizzato</p>
            </div>
            <div className="bg-white/70 backdrop-blur rounded-xl p-4">
              <Clock className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="font-semibold">Risposta Prioritaria</p>
              <p className="text-sm text-gray-600">Entro 24 ore</p>
            </div>
            <div className="bg-white/70 backdrop-blur rounded-xl p-4">
              <Award className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="font-semibold">Proposta Su Misura</p>
              <p className="text-sm text-gray-600">Basata sui tuoi dati</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const fieldsConfig = parseFieldsConfig(currentStep.fields_config);

  const handleNext = async () => {
    try {
      await submitStep(
        currentStep,
        formData,
        isLastStep,
        resetFormData,
        () => {
          if (isLastStep) {
            setShowSuccess(true);
          } else {
            setCurrentStepIndex(prev => prev + 1);
          }
        }
      );
    } catch (error) {
      console.error('Error submitting step:', error);
    }
  };

  const getStepTitle = (step: any, index: number) => {
    // Use intelligent step titles based on step type
    if (step.step_type === 'info') {
      return "Scopri la Soluzione Perfetta! 🚀";
    } else if (index === 1) {
      return "Cosa ti interessa di più? 💫";
    } else if (index === 2) {
      return "Raccontaci del tuo business 🎯";
    } else if (index === 3) {
      return "Le tue sfide attuali 💡";
    } else if (isLastStep) {
      return "Ottieni la tua proposta personalizzata! 🏆";
    }
    return step.title;
  };

  const getStepDescription = (step: any, index: number) => {
    if (step.step_type === 'info') {
      return "Scopri come possiamo trasformare il tuo business";
    } else if (index === 1) {
      return "Aiutaci a personalizzare la tua esperienza";
    } else if (index === 2) {
      return "Queste informazioni ci aiutano a creare la soluzione perfetta";
    } else if (index === 3) {
      return "Comprendiamo le tue necessità per offrirti il meglio";
    } else if (isLastStep) {
      return "Ultimi dettagli per la tua proposta su misura";
    }
    return step.description;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-200/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-200/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-200/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header with trust indicators */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-6 mb-6">
            <Badge className="bg-green-100 text-green-800 px-4 py-2">
              <Users className="w-4 h-4 mr-2" />
              2.847+ persone si sono già iscritte oggi
            </Badge>
            <Badge className="bg-blue-100 text-blue-800 px-4 py-2">
              <Star className="w-4 h-4 mr-2" />
              4.9/5 stelle di soddisfazione
            </Badge>
          </div>

          <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            {getDisplayTitle()}
          </h1>
          
          <p className="text-lg md:text-xl text-gray-700 max-w-3xl mx-auto mb-8">
            {getDisplayDescription()}
          </p>

          {/* Progress bar */}
          <div className="max-w-md mx-auto mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Progresso</span>
              <span className="text-sm font-medium text-blue-600">{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between mt-2">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                    index <= currentStepIndex
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {index < currentStepIndex ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    index + 1
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="max-w-2xl mx-auto">
          <Card className={`border-0 shadow-2xl bg-white/80 backdrop-blur-sm transition-all duration-300 ${
            isAnimating ? 'transform scale-105' : ''
          }`}>
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <div className="text-4xl mb-4">
                  {currentStep.step_type === 'info' && '🚀'}
                  {currentStepIndex === 1 && '💫'}
                  {currentStepIndex === 2 && '🎯'}
                  {currentStepIndex === 3 && '💡'}
                  {currentStepIndex >= 4 && '🏆'}
                </div>
                
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">
                  {getStepTitle(currentStep, currentStepIndex)}
                </h2>
                
                <p className="text-gray-600 text-lg">
                  {getStepDescription(currentStep, currentStepIndex)}
                </p>
              </div>

              {/* Step content */}
              {currentStep.step_type === 'info' && currentStep.settings?.content && (
                <div 
                  className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl"
                  dangerouslySetInnerHTML={{ __html: currentStep.settings.content }}
                />
              )}

              {/* Form fields */}
              <div className="space-y-6">
                {fieldsConfig.map((field) => (
                  <div key={field.id} className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    
                    {field.type === 'textarea' ? (
                      <Textarea
                        placeholder={field.placeholder}
                        value={formData[field.id] || ''}
                        onChange={(e) => handleFieldChange(field.id, e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:ring-0 transition-all duration-200"
                        rows={4}
                      />
                    ) : field.type === 'select' ? (
                      <select
                        value={formData[field.id] || ''}
                        onChange={(e) => handleFieldChange(field.id, e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:ring-0 transition-all duration-200"
                      >
                        <option value="">{field.placeholder || 'Seleziona un\'opzione'}</option>
                        {field.options?.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    ) : field.type === 'radio' ? (
                      <div className="space-y-3">
                        {field.options?.map((option) => (
                          <label key={option} className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer">
                            <input
                              type="radio"
                              name={field.id}
                              value={option}
                              checked={formData[field.id] === option}
                              onChange={(e) => handleFieldChange(field.id, e.target.value)}
                              className="mr-3"
                            />
                            <span>{option}</span>
                          </label>
                        ))}
                      </div>
                    ) : field.type === 'checkbox' ? (
                      <label className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <input
                          type="checkbox"
                          checked={formData[field.id] || false}
                          onChange={(e) => handleFieldChange(field.id, e.target.checked)}
                          className="mt-1"
                        />
                        <span className="text-sm">{field.label}</span>
                      </label>
                    ) : (
                      <Input
                        type={field.type}
                        placeholder={field.placeholder}
                        value={formData[field.id] || ''}
                        onChange={(e) => handleFieldChange(field.id, e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:ring-0 transition-all duration-200"
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* Trust elements */}
              <div className="mt-8 p-4 bg-green-50 rounded-xl border border-green-200">
                <div className="flex items-center justify-center gap-2 text-green-700">
                  <Shield className="w-5 h-5" />
                  <span className="font-semibold">Le tue informazioni sono protette e sicure</span>
                </div>
              </div>

              {/* Action button */}
              <div className="mt-8">
                <Button
                  onClick={handleNext}
                  disabled={submitting}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all duration-300 transform hover:scale-105 shadow-xl"
                >
                  {submitting ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Elaborazione...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      {isLastStep ? (
                        <>
                          <Gift className="w-5 h-5" />
                          Ottieni la Tua Proposta Personalizzata!
                        </>
                      ) : currentStep.step_type === 'info' ? (
                        <>
                          Iniziamo!
                          <ArrowRight className="w-5 h-5" />
                        </>
                      ) : (
                        <>
                          Continua
                          <ArrowRight className="w-5 h-5" />
                        </>
                      )}
                    </div>
                  )}
                </Button>
              </div>

              {/* Bottom trust indicators */}
              <div className="mt-6 grid grid-cols-3 gap-4 text-center">
                <div className="flex flex-col items-center">
                  <Clock className="w-6 h-6 text-blue-500 mb-1" />
                  <span className="text-xs text-gray-600">Solo 2 minuti</span>
                </div>
                <div className="flex flex-col items-center">
                  <Heart className="w-6 h-6 text-red-500 mb-1" />
                  <span className="text-xs text-gray-600">Analisi IA gratuita</span>
                </div>
                <div className="flex flex-col items-center">
                  <Zap className="w-6 h-6 text-yellow-500 mb-1" />
                  <span className="text-xs text-gray-600">Proposta immediata</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bottom testimonials/social proof */}
          <div className="mt-8 text-center">
            <div className="flex items-center justify-center gap-1 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <p className="text-gray-600">
              "Incredibile! La loro analisi IA ha identificato esattamente quello di cui avevo bisogno"
            </p>
            <p className="text-sm text-gray-500 mt-1">- Marco, cliente soddisfatto</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsumerFriendlyFunnelPlayer;
