import React, { useMemo } from 'react';
import { InteractiveFunnelStep } from '@/types/interactiveFunnel';
import { UltraStabilizedParallax } from '@/components/dynamic-funnel/performance/UltraStabilizedParallax';
import { ScrollTriggeredFormSection } from './ScrollTriggeredFormSection';
import { motion } from 'framer-motion';

interface CinematicFunnelSceneProps {
  step: InteractiveFunnelStep;
  sceneIndex: number;
  totalScenes: number;
  scrollProgress: number;
  ultraSmoothScrollY: number;
  isActive: boolean;
  onFormDataChange: (data: any) => void;
  existingData?: any;
  isLastScene: boolean;
  onFinalSubmit: () => void;
}

export const CinematicFunnelScene: React.FC<CinematicFunnelSceneProps> = ({
  step,
  sceneIndex,
  totalScenes,
  scrollProgress,
  ultraSmoothScrollY,
  isActive,
  onFormDataChange,
  existingData,
  isLastScene,
  onFinalSubmit
}) => {
  // Dynamic color scheme based on step type and position
  const colorScheme = useMemo(() => {
    const schemes = {
      form: {
        background: 'from-primary/90 to-secondary/90',
        surface: 'bg-card/90 backdrop-blur-md',
        text: 'text-foreground',
        accent: 'bg-golden',
        border: 'border-border/20'
      },
      content: {
        background: 'from-muted/80 to-background/80',
        surface: 'bg-card/80 backdrop-blur-sm',
        text: 'text-foreground',
        accent: 'bg-primary',
        border: 'border-primary/20'
      },
      question: {
        background: 'from-secondary/90 to-accent/90',
        surface: 'bg-card/90 backdrop-blur-md',
        text: 'text-foreground',
        accent: 'bg-golden',
        border: 'border-golden/20'
      },
      lead_capture: {
        background: 'from-golden/20 to-primary/30',
        surface: 'bg-card/95 backdrop-blur-lg',
        text: 'text-foreground',
        accent: 'bg-golden',
        border: 'border-golden/30'
      },
      default: {
        background: 'from-primary/80 to-secondary/80',
        surface: 'bg-card/90 backdrop-blur-md',
        text: 'text-foreground',
        accent: 'bg-primary',
        border: 'border-border/20'
      }
    };
    return schemes[step.step_type as keyof typeof schemes] || schemes.default;
  }, [step.step_type]);

  // Typography based on scene importance
  const getTypography = () => {
    if (sceneIndex === 0) return 'font-bold tracking-tight';
    if (isLastScene) return 'font-semibold tracking-wide';
    return 'font-medium tracking-normal';
  };

  return (
    <div className={`relative w-full h-full bg-gradient-to-br ${colorScheme.background} overflow-hidden`}>
      {/* Parallax background layers */}
      <UltraStabilizedParallax
        speed={-0.3}
        ultraSmoothScrollY={ultraSmoothScrollY}
        className="opacity-20"
      >
        <div className="absolute inset-0">
          {/* Geometric background patterns */}
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/3 right-1/4 w-48 h-48 bg-secondary/10 rounded-full blur-2xl" />
          <div className="absolute top-1/2 right-1/3 w-32 h-32 bg-golden/20 rounded-full blur-xl" />
        </div>
      </UltraStabilizedParallax>

      <UltraStabilizedParallax
        speed={-0.1}
        ultraSmoothScrollY={ultraSmoothScrollY}
        className="opacity-30"
      >
        <div className="absolute inset-0">
          {/* Subtle pattern overlay */}
          <div 
            className="w-full h-full opacity-5"
            style={{
              backgroundImage: `radial-gradient(circle at 25% 25%, currentColor 2px, transparent 2px)`,
              backgroundSize: '50px 50px'
            }}
          />
        </div>
      </UltraStabilizedParallax>

      {/* Main content */}
      <div className="relative z-10 h-full flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ 
            opacity: isActive ? 1 : 0.3,
            y: isActive ? 0 : 30,
            scale: isActive ? 1 : 0.95
          }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-full max-w-4xl"
        >
          {/* Scene Header */}
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="mb-4"
            >
              <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                {sceneIndex === 0 ? 'Benvenuto' : isLastScene ? 'Ultimo Passo' : `Passo ${sceneIndex + 1}`}
              </span>
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className={`text-4xl md:text-6xl ${getTypography()} ${colorScheme.text} mb-6`}
            >
              {step.title}
            </motion.h1>
            
            {step.description && (
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                className={`text-xl md:text-2xl ${colorScheme.text} opacity-80 max-w-2xl mx-auto leading-relaxed`}
              >
                {step.description}
              </motion.p>
            )}
          </div>

          {/* Interactive Form Section */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            <ScrollTriggeredFormSection
              step={step}
              scrollProgress={scrollProgress}
              isActive={isActive}
              onDataChange={onFormDataChange}
              existingData={existingData}
              colorScheme={colorScheme}
              isLastScene={isLastScene}
              onFinalSubmit={onFinalSubmit}
            />
          </motion.div>

          {/* Scene Progress Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.4 }}
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          >
            <div className="flex space-x-3">
              {Array.from({ length: totalScenes }).map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-8 rounded-full transition-all duration-500 ${
                    index === sceneIndex 
                      ? `${colorScheme.accent} scale-110` 
                      : index < sceneIndex
                      ? `${colorScheme.accent} opacity-60`
                      : 'bg-border opacity-30'
                  }`}
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};