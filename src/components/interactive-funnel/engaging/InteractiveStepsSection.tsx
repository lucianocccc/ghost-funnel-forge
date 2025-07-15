
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, CheckCircle, Sparkles } from 'lucide-react';
import { ShareableFunnel } from '@/types/interactiveFunnel';
import { useFunnelSteps } from '../hooks/useFunnelSteps';
import { useFunnelFormData } from '../hooks/useFunnelFormData';
import CreativeStepRenderer from '../components/CreativeStepRenderer';

interface InteractiveStepsSectionProps {
  funnel: ShareableFunnel;
  onComplete: () => void;
  onContinue: () => void;
}

const InteractiveStepsSection: React.FC<InteractiveStepsSectionProps> = ({ 
  funnel, 
  onComplete,
  onContinue 
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const { formData, handleFieldChange } = useFunnelFormData();
  const { sortedSteps, currentStep, isLastStep, totalSteps } = useFunnelSteps(funnel, currentStepIndex);

  // Helper function to safely get settings properties
  const getSettingsProperty = (settings: any, key: string): string | undefined => {
    if (settings && typeof settings === 'object' && settings !== null && !Array.isArray(settings)) {
      const settingsObj = settings as Record<string, any>;
      return typeof settingsObj[key] === 'string' ? settingsObj[key] : undefined;
    }
    return undefined;
  };

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const progressPercentage = ((currentStepIndex + 1) / totalSteps) * 100;

  const getStepTypeColor = (stepType: string) => {
    switch (stepType) {
      case 'quiz': return 'bg-purple-500';
      case 'assessment': return 'bg-blue-500';
      case 'calculator': return 'bg-green-500';
      case 'demo_request': return 'bg-orange-500';
      case 'calendar_booking': return 'bg-indigo-500';
      case 'social_proof': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  if (!currentStep) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md mx-auto"
        >
          <div className="text-6xl mb-6">🎉</div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Fantastico!
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Hai completato tutti i passaggi del funnel personalizzato.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onContinue}
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xl font-semibold rounded-full hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg"
          >
            Continua
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Enhanced Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-8"
        >
          <div className="flex justify-center mb-4">
            <Sparkles className="w-8 h-8 text-purple-600" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
            {funnel.settings?.personalizedSections?.hero?.title || funnel.name}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {funnel.settings?.personalizedSections?.hero?.subtitle || funnel.description}
          </p>
        </motion.div>

        {/* Enhanced Progress Bar */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-white/80 backdrop-blur-sm border border-white/50 rounded-3xl p-6 mb-8 shadow-lg"
        >
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-semibold text-gray-700">
              Passo {currentStepIndex + 1} di {totalSteps}
            </span>
            <span className="text-lg text-purple-600 font-semibold">
              {Math.round(progressPercentage)}% completato
            </span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
            <motion.div
              className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 h-4 rounded-full"
              style={{ width: `${progressPercentage}%` }}
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          
          {/* Enhanced Step Indicators */}
          <div className="flex justify-between items-center">
            {sortedSteps.map((step, index) => (
              <div key={index} className="flex flex-col items-center">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                    index < currentStepIndex
                      ? 'bg-green-500 text-white'
                      : index === currentStepIndex
                      ? `${getStepTypeColor(step.step_type)} text-white scale-110`
                      : 'bg-gray-300 text-gray-600'
                  }`}
                >
                  {index < currentStepIndex ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                <span className={`text-xs mt-1 font-medium ${
                  index === currentStepIndex ? 'text-gray-900' : 'text-gray-500'
                }`}>
                  {step.step_type}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Current Step Content with Enhanced Animation */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStepIndex}
            initial={{ opacity: 0, x: 50, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -50, scale: 0.95 }}
            transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
            className="mb-8"
          >
            <CreativeStepRenderer
              step={currentStep}
              onDataChange={(data) => {
                Object.keys(data).forEach(key => {
                  handleFieldChange(key, data[key]);
                });
              }}
              existingData={formData}
            />
          </motion.div>
        </AnimatePresence>

        {/* Enhanced Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex justify-between items-center bg-white/80 backdrop-blur-sm border border-white/50 rounded-3xl p-6 shadow-lg"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePrevious}
            disabled={currentStepIndex === 0}
            className={`flex items-center px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
              currentStepIndex === 0
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 shadow-md'
            }`}
          >
            <ChevronLeft className="w-5 h-5 mr-2" />
            Precedente
          </motion.button>

          <div className="text-center">
            <span className="text-gray-600 font-medium">
              {currentStep.title}
            </span>
            <div className="text-sm text-gray-500 mt-1">
              Step {currentStep.step_type}
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleNext}
            className={`flex items-center px-6 py-3 rounded-full font-semibold transition-all duration-300 transform shadow-lg ${
              isLastStep 
                ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700'
                : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700'
            }`}
          >
            {isLastStep ? 'Completa' : (getSettingsProperty(currentStep.settings, 'submitButtonText') || 'Avanti')}
            <ChevronRight className="w-5 h-5 ml-2" />
          </motion.button>
        </motion.div>

        {/* Step Type Badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="fixed bottom-6 left-6 z-10"
        >
          <div className={`px-4 py-2 rounded-full text-white font-medium text-sm ${getStepTypeColor(currentStep.step_type)} shadow-lg backdrop-blur-sm`}>
            {currentStep.step_type.charAt(0).toUpperCase() + currentStep.step_type.slice(1).replace('_', ' ')}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default InteractiveStepsSection;
