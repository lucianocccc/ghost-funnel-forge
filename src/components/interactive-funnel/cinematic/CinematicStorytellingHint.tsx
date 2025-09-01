import React from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Sparkles } from 'lucide-react';

interface CinematicStorytellingHintProps {
  progression: 'problem-solution' | 'hero-journey' | 'benefit-driven' | 'urgency-based';
  currentStep: number;
  totalSteps: number;
  narrative: string;
}

export const CinematicStorytellingHint: React.FC<CinematicStorytellingHintProps> = ({
  progression,
  currentStep,
  totalSteps,
  narrative
}) => {
  const getProgressionIcon = () => {
    switch (progression) {
      case 'problem-solution':
        return '🔍';
      case 'hero-journey':
        return '🚀';
      case 'benefit-driven':
        return '⭐';
      case 'urgency-based':
        return '⚡';
      default:
        return '✨';
    }
  };

  const getProgressionColor = () => {
    switch (progression) {
      case 'problem-solution':
        return 'from-blue-500/20 to-indigo-500/20 border-blue-500/30';
      case 'hero-journey':
        return 'from-purple-500/20 to-pink-500/20 border-purple-500/30';
      case 'benefit-driven':
        return 'from-green-500/20 to-emerald-500/20 border-green-500/30';
      case 'urgency-based':
        return 'from-orange-500/20 to-red-500/20 border-orange-500/30';
      default:
        return 'from-golden/20 to-primary/20 border-golden/30';
    }
  };

  if (currentStep === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2, duration: 0.8 }}
        className="fixed bottom-8 right-8 z-50"
      >
        <div className={`
          bg-gradient-to-r ${getProgressionColor()}
          backdrop-blur-lg border rounded-2xl p-4 max-w-sm
          shadow-2xl
        `}>
          <div className="flex items-center space-x-3 mb-2">
            <div className="text-2xl">{getProgressionIcon()}</div>
            <div>
              <div className="text-white font-semibold text-sm">
                Esperienza AI Personalizzata
              </div>
              <div className="text-white/70 text-xs">
                {narrative}
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between text-white/60 text-xs">
            <span>Scorri per iniziare il viaggio</span>
            <motion.div
              animate={{ y: [0, 4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <ChevronDown size={14} />
            </motion.div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="fixed top-8 right-8 z-50"
    >
      <div className={`
        bg-gradient-to-r ${getProgressionColor()}
        backdrop-blur-lg border rounded-xl p-3
        shadow-lg
      `}>
        <div className="flex items-center space-x-2">
          <Sparkles size={16} className="text-white" />
          <div className="text-white text-sm font-medium">
            {currentStep} / {totalSteps}
          </div>
        </div>
      </div>
    </motion.div>
  );
};