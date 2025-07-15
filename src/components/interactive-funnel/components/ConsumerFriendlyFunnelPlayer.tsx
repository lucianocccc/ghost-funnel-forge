
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
  Heart
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

  // Usa il titolo e la descrizione analizzati dall'AI se disponibili
  const getDisplayTitle = () => {
    // Se abbiamo elementi magnetici dall'analisi AI, usali
    const magneticElements = funnel.settings?.magneticElements;
    if (magneticElements?.primaryHook) {
      return funnel.name; // Il nome del funnel è già il titolo magnetico analizzato
    }
    
    // Fallback ai titoli generici solo se non abbiamo l'analisi
    return getFallbackMagneticTitle(funnel.name, funnel.description || '');
  };

  const getDisplayDescription = () => {
    // Se abbiamo la descrizione analizzata dall'AI, usala
    const magneticElements = funnel.settings?.magneticElements;
    if (magneticElements) {
      return funnel.description; // La descrizione è già quella analizzata
    }
    
    // Fallback alle descrizioni generiche solo se non abbiamo l'analisi
    return getFallbackMagneticDescription(funnel.description || '');
  };

  // Fallback per titoli generici (solo se l'analisi AI non è disponibile)
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
            Il nostro team ti contatterà entro 24 ore per iniziare il tuo percorso personalizzato.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <div className="bg-white/70 backdrop-blur rounded-xl p-4">
              <Clock className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="font-semibold">Risposta rapida</p>
              <p className="text-sm text-gray-600">Entro 24 ore</p>
            </div>
            <div className="bg-white/70 backdrop-blur rounded-xl p-4">
              <Shield className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="font-semibold">100% Gratuito</p>
              <p className="text-sm text-gray-600">Nessun costo nascosto</p>
            </div>
            <div className="bg-white/70 backdrop-blur rounded-xl p-4">
              <Star className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="font-semibold">Risultati garantiti</p>
              <p className="text-sm text-gray-600">O rimborso completo</p>
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
    const customTitles = [
      "Iniziamo questa avventura! 🚀",
      "Raccontaci di te 💫",
      "Quasi fatto! 🎯",
      "Ultimo passo! 🏆"
    ];
    return customTitles[index] || step.title;
  };

  const getStepDescription = (step: any, index: number) => {
    const customDescriptions = [
      "Ci vorranno solo 2 minuti per personalizzare la tua esperienza",
      "Queste informazioni ci aiuteranno a creare la soluzione perfetta per te",
      "Stiamo quasi per sbloccare il tuo potenziale",
      "Un ultimo click e avrai accesso a tutto!"
    ];
    return customDescriptions[index] || step.description;
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
                  {currentStepIndex === 0 && '🚀'}
                  {currentStepIndex === 1 && '💫'}
                  {currentStepIndex === 2 && '🎯'}
                  {currentStepIndex >= 3 && '🏆'}
                </div>
                
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">
                  {getStepTitle(currentStep, currentStepIndex)}
                </h2>
                
                <p className="text-gray-600 text-lg">
                  {getStepDescription(currentStep, currentStepIndex)}
                </p>
              </div>

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
                        <option value="">{field.placeholder}</option>
                        {field.options?.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
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
                          Ottieni Accesso Immediato!
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
                  <span className="text-xs text-gray-600">Senza impegno</span>
                </div>
                <div className="flex flex-col items-center">
                  <Zap className="w-6 h-6 text-yellow-500 mb-1" />
                  <span className="text-xs text-gray-600">Risultati immediati</span>
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
              "Incredibile! In sole 2 settimane ho già visto risultati straordinari"
            </p>
            <p className="text-sm text-gray-500 mt-1">- Marco, cliente soddisfatto</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsumerFriendlyFunnelPlayer;
