import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShareableFunnel } from '@/types/interactiveFunnel';
import EngagingHeroSection from './EngagingHeroSection';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft, CheckCircle, Star, Users, Calendar, X } from 'lucide-react';
import { useFunnelSubmission } from '@/components/interactive-funnel/hooks/useFunnelSubmission';
import { useFunnelFormData } from '@/components/interactive-funnel/hooks/useFunnelFormData';
import { parseFieldsConfig } from '@/components/interactive-funnel/utils/fieldsConfigParser';
import FormFieldRenderer from '@/components/interactive-funnel/components/FormFieldRenderer';
import { MicroButton, ParticleField, MagneticElement } from '@/components/micro-interactions';

interface ImmersiveEngagingFunnelPlayerProps {
  funnel: ShareableFunnel;
  onComplete: () => void;
}

const ImmersiveEngagingFunnelPlayer: React.FC<ImmersiveEngagingFunnelPlayerProps> = ({ 
  funnel, 
  onComplete 
}) => {
  const [showHero, setShowHero] = useState(true);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const sessionId = useState(() => crypto.randomUUID())[0];
  
  const { formData, handleFieldChange, resetFormData } = useFunnelFormData();
  const { submitting, submitStep } = useFunnelSubmission(funnel, sessionId, onComplete);

  const steps = funnel.interactive_funnel_steps || [];
  const currentStep = steps[currentStepIndex];
  const isLastStep = currentStepIndex === steps.length - 1;

  console.log('🎮 ImmersiveEngagingFunnelPlayer - Current state:', {
    showHero,
    currentStepIndex,
    totalSteps: steps.length,
    currentStep: currentStep?.id,
    formData
  });

  const handleContinueFromHero = () => {
    setShowHero(false);
  };

  const handleStepSubmit = async () => {
    console.log('🚀 Step submit clicked:', {
      currentStepIndex,
      currentStep: currentStep?.id,
      formData,
      isLastStep,
      stepTitle: currentStep?.title,
      fieldsConfig: currentStep?.fields_config
    });
    
    if (!currentStep) {
      console.error('❌ No current step found!');
      return;
    }

    const onSuccess = () => {
      if (isLastStep) {
        // onComplete will be called by useFunnelSubmission
        return;
      } else {
        setCurrentStepIndex(prev => prev + 1);
      }
    };

    await submitStep(
      currentStep,
      formData,
      isLastStep,
      resetFormData,
      onSuccess
    );
  };

  const handlePrevious = () => {
    console.log('⬅️ Previous button clicked:', {
      currentStepIndex,
      canGoBack: currentStepIndex > 0
    });
    
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    } else {
      setShowHero(true);
    }
  };

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

  const renderStepContent = () => {
    if (!currentStep) return null;

    const fieldsConfig = parseFieldsConfig(currentStep.fields_config);

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.4 }}
        className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden"
      >
        {/* Enhanced Background Effects */}
        <ParticleField 
          particleCount={80}
          colors={['rgba(147, 51, 234, 0.6)', 'rgba(236, 72, 153, 0.6)', 'rgba(59, 130, 246, 0.6)']}
          className="absolute inset-0"
        />
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-40 right-10 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        {/* Progress Bar */}
        <div className="relative z-10 bg-black/20 backdrop-blur-sm border-b border-white/10">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between text-sm text-white/80 mb-2">
              <span>Progresso</span>
              <span>{currentStepIndex + 1} di {steps.length}</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-purple-400 to-pink-400 h-2 rounded-full transition-all duration-500"
                style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Step Content */}
        <div className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-4 py-12">
          <div className="w-full max-w-2xl space-y-8">
            {/* Step Header */}
            <div className="text-center space-y-6">
              <MagneticElement strength={0.4}>
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="relative mx-auto w-fit">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur-lg opacity-75"></div>
                    <div className="relative bg-white/10 backdrop-blur-sm border border-white/20 rounded-full p-4">
                      {getStepIcon(currentStep.step_type)}
                    </div>
                  </div>
                </motion.div>
              </MagneticElement>
              
              <motion.h2
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-3xl md:text-4xl font-bold text-white leading-tight"
              >
                {currentStep.settings?.content?.headline || currentStep.title}
              </motion.h2>
              
              {(currentStep.settings?.content?.subheadline || currentStep.description) && (
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="text-lg text-white/80 leading-relaxed"
                >
                  {currentStep.settings?.content?.subheadline || currentStep.description}
                </motion.p>
              )}
            </div>

            {/* Step Form */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8">
                {fieldsConfig.length > 0 ? (
                  <div className="space-y-6">
                    {fieldsConfig.map((field, index) => (
                      <motion.div
                        key={field.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.5 }}
                        whileHover={{ scale: 1.02 }}
                      >
                        <FormFieldRenderer
                          field={field}
                          value={formData[field.id] || ''}
                          onChange={(value) => handleFieldChange(field.id, value)}
                        />
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <motion.div 
                    className="text-center py-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <p className="text-white/60">
                      Contenuto dello step in fase di configurazione.
                    </p>
                  </motion.div>
                )}

                {/* Enhanced Navigation Buttons */}
                <motion.div 
                  className="flex justify-between pt-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <MicroButton
                    variant="default"
                    onClick={handlePrevious}
                    className="flex items-center gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Indietro
                  </MicroButton>

                  <MicroButton
                    variant="magnetic"
                    onClick={handleStepSubmit}
                    disabled={submitting}
                    className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0"
                  >
                    {submitting ? (
                      <>
                        <motion.div 
                          className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                        Invio...
                      </>
                    ) : (
                      <>
                        {currentStep.settings?.content?.cta || (isLastStep ? 'Completa' : 'Continua')}
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </MicroButton>
                </motion.div>
              </div>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex items-center justify-center gap-8 text-sm text-white/60"
            >
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>100% Sicuro</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>Dati Protetti</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>Nessun Spam</span>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen">
      <AnimatePresence mode="wait">
        {showHero ? (
          <motion.div
            key="hero"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5 }}
          >
            <EngagingHeroSection 
              funnel={funnel} 
              onContinue={handleContinueFromHero}
            />
          </motion.div>
        ) : steps.length > 0 ? (
          <motion.div
            key="steps"
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            {renderStepContent()}
          </motion.div>
        ) : (
          <motion.div
            key="no-steps"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center"
          >
            <div className="text-center text-white">
              <p className="text-lg">Nessuno step configurato per questo funnel.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ImmersiveEngagingFunnelPlayer;