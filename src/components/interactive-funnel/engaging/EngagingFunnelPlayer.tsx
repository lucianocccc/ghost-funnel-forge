
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft, CheckCircle, Star, Users, Calendar } from 'lucide-react';
import { ShareableFunnel, InteractiveFunnelStep } from '@/types/interactiveFunnel';
import { submitFunnelStep } from '@/services/interactiveFunnelService';
import { useToast } from '@/hooks/use-toast';
import { parseFieldsConfig } from '@/components/interactive-funnel/utils/fieldsConfigParser';
import FormFieldRenderer from '@/components/interactive-funnel/components/FormFieldRenderer';
import { MicroButton, MicroCard, MagneticElement, ScrollTriggerAnimation, ParticleField } from '@/components/micro-interactions';
import { useMicroInteractions } from '@/hooks/useMicroInteractions';

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

  const renderStepContent = () => {
    if (!currentStep) return null;

    // Use the parseFieldsConfig utility to safely convert the fields configuration
    const fieldsConfig = parseFieldsConfig(currentStep.fields_config);
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
        {/* Step Header with Micro-interactions */}
        <ScrollTriggerAnimation
          animation="slideUp"
          delay={0.2}
          className="text-center space-y-4"
        >
          <MagneticElement strength={0.3}>
            <motion.div 
              className="flex justify-center"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="p-3 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 text-primary border border-primary/30 backdrop-blur-sm">
                {getStepIcon(currentStep.step_type)}
              </div>
            </motion.div>
          </MagneticElement>
          
          <motion.h2 
            className="text-2xl font-bold text-foreground"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            {currentStep.title}
          </motion.h2>
          
          {currentStep.description && (
            <motion.p 
              className="text-muted-foreground max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              {currentStep.description}
            </motion.p>
          )}
        </ScrollTriggerAnimation>

        {/* Step Content with Enhanced Micro-interactions */}
        <MicroCard 
          className="max-w-2xl mx-auto"
        >
          <CardContent className="p-8 space-y-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStepIndex}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.4 }}
              >
                {fieldsConfig.length > 0 ? (
                  <div className="space-y-6">
                    {fieldsConfig.map((field, index) => (
                      <motion.div
                        key={field.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.5 }}
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
                  <div className="text-center py-8">
                    <motion.p 
                      className="text-muted-foreground"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      Contenuto dello step in fase di configurazione.
                    </motion.p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Enhanced Navigation Buttons */}
            <motion.div 
              className="flex justify-between pt-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <MicroButton
                variant="default"
                onClick={handlePrevious}
                disabled={currentStepIndex === 0}
                className="flex items-center gap-2 border border-border bg-background text-foreground hover:bg-accent"
              >
                <ArrowLeft className="w-4 h-4" />
                Indietro
              </MicroButton>

              <MicroButton
                variant="magnetic"
                onClick={handleStepSubmit}
                disabled={isSubmitting}
                className="flex items-center gap-2 bg-gradient-to-r from-primary to-accent text-primary-foreground"
              >
                {isSubmitting ? (
                  <>
                    <motion.div 
                      className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    Invio...
                  </>
                ) : (
                  <>
                    {isLastStep ? 'Completa' : 'Continua'}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </MicroButton>
            </motion.div>
          </CardContent>
        </MicroCard>
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
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-background relative overflow-hidden">
      {/* Background Particles */}
      <ParticleField 
        particleCount={50}
        colors={['hsl(var(--primary))', 'hsl(var(--accent))']}
        className="absolute inset-0 opacity-30"
      />
      
      {/* Enhanced Progress Bar */}
      <motion.div 
        className="relative z-10 bg-card/80 backdrop-blur-sm border-b border-border py-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
            <span>Progresso</span>
            <span>{currentStepIndex + 1} di {steps.length}</span>
          </div>
          <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
            <motion.div 
              className="bg-gradient-to-r from-primary to-accent h-3 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
        </div>
      </motion.div>

      {/* Step Content */}
      <div className="relative z-10 py-12 px-4">
        {renderStepContent()}
      </div>
    </div>
  );
};

export default EngagingFunnelPlayer;
