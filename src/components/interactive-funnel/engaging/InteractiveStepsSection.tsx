
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, CheckCircle } from 'lucide-react';
import { ShareableFunnel } from '@/types/interactiveFunnel';
import { useFunnelSteps } from '../hooks/useFunnelSteps';
import { useFunnelFormData } from '../hooks/useFunnelFormData';
import StepRenderer from '../components/StepRenderer';

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

  if (!currentStep) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Perfetto! Hai completato tutti i passaggi
          </h2>
          <button
            onClick={onContinue}
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xl font-semibold rounded-full hover:from-purple-700 hover:to-pink-700 transition-all duration-300"
          >
            Continua
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 py-20 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Personalizza la Tua Esperienza
          </h2>
          <p className="text-xl text-gray-600">
            Alcuni passaggi per creare la soluzione perfetta per te
          </p>
        </motion.div>

        {/* Progress Bar */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-white/70 backdrop-blur-sm border border-white/50 rounded-2xl p-6 mb-8"
        >
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-semibold text-gray-700">
              Passo {currentStepIndex + 1} di {totalSteps}
            </span>
            <span className="text-lg text-purple-600 font-semibold">
              {Math.round(progressPercentage)}% completato
            </span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-3">
            <motion.div
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full"
              style={{ width: `${progressPercentage}%` }}
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          
          {/* Step Indicators */}
          <div className="flex justify-between mt-4">
            {sortedSteps.map((_, index) => (
              <div
                key={index}
                className={`w-4 h-4 rounded-full ${
                  index < currentStepIndex
                    ? 'bg-green-500'
                    : index === currentStepIndex
                    ? 'bg-purple-500'
                    : 'bg-gray-300'
                }`}
              >
                {index < currentStepIndex && (
                  <CheckCircle className="w-4 h-4 text-white" />
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Current Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStepIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.5 }}
            className="bg-white/70 backdrop-blur-sm border border-white/50 rounded-3xl p-8 mb-8 min-h-[400px]"
          >
            <StepRenderer
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

        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex justify-between items-center bg-white/70 backdrop-blur-sm border border-white/50 rounded-2xl p-6"
        >
          <button
            onClick={handlePrevious}
            disabled={currentStepIndex === 0}
            className={`flex items-center px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
              currentStepIndex === 0
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <ChevronLeft className="w-5 h-5 mr-2" />
            Precedente
          </button>

          <div className="text-center">
            <span className="text-gray-600 font-medium">
              {currentStep.title}
            </span>
          </div>

          <button
            onClick={handleNext}
            className="flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105"
          >
            {isLastStep ? 'Completa' : 'Avanti'}
            <ChevronRight className="w-5 h-5 ml-2" />
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default InteractiveStepsSection;
