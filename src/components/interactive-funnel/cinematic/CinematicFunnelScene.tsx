import React, { useMemo, useState } from 'react';
import { InteractiveFunnelStep } from '@/types/interactiveFunnel';
import { UltraStabilizedParallax } from '@/components/dynamic-funnel/performance/UltraStabilizedParallax';
import { ScrollTriggeredFormSection } from './ScrollTriggeredFormSection';
import { AIContentManager } from './AIContentManager';
import { motion } from 'framer-motion';
import { extractAIContent, hasAIGeneratedContent } from '@/utils/aiContentExtractor';
import { formatMessageContent } from '@/utils/messageFormatter';
import { SceneStageMetrics } from '@/utils/sceneStaging';

interface CinematicFunnelSceneProps {
  step: InteractiveFunnelStep;
  sceneIndex: number;
  totalScenes: number;
  stagingMetrics: SceneStageMetrics;
  ultraSmoothScrollY: number;
  isActive: boolean;
  onFormDataChange: (data: any) => void;
  existingData?: any;
  isLastScene: boolean;
  onFinalSubmit: () => void;
  performanceMode: 'high' | 'medium' | 'low';
  productContext?: {
    productName: string;
    industry?: string;
    audience?: string;
    benefits?: string[];
    brandVoice?: 'apple' | 'nike' | 'amazon' | 'luxury' | 'friendly' | 'professional' | 'startup';
  };
  onStepUpdate?: (updatedStep: InteractiveFunnelStep) => void;
}

export const CinematicFunnelScene: React.FC<CinematicFunnelSceneProps> = ({
  step,
  sceneIndex,
  totalScenes,
  stagingMetrics,
  ultraSmoothScrollY,
  isActive,
  onFormDataChange,
  existingData,
  isLastScene,
  onFinalSubmit,
  performanceMode,
  productContext,
  onStepUpdate
}) => {
  const [currentStep, setCurrentStep] = useState(step);
  // Extract AI-generated content if available
  const aiContent = useMemo(() => {
    if (hasAIGeneratedContent(currentStep)) {
      return extractAIContent(currentStep);
    }
    return undefined;
  }, [currentStep]);

  // Handle step content updates
  const handleContentUpdate = (updatedStep: InteractiveFunnelStep) => {
    setCurrentStep(updatedStep);
    onStepUpdate?.(updatedStep);
  };

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
    return schemes[currentStep.step_type as keyof typeof schemes] || schemes.default;
  }, [currentStep.step_type]);

  // Typography based on scene importance
  const getTypography = () => {
    if (sceneIndex === 0) return 'font-bold tracking-tight';
    if (isLastScene) return 'font-semibold tracking-wide';
    return 'font-medium tracking-normal';
  };

  return (
    <div className={`relative w-full h-full bg-gradient-to-br ${colorScheme.background} overflow-hidden`}>
      {/* Optimized parallax backgrounds - reduced on low performance */}
      {performanceMode !== 'low' && (
        <>
          <UltraStabilizedParallax
            speed={-0.3}
            ultraSmoothScrollY={ultraSmoothScrollY}
            className="opacity-20"
          >
            <div className="absolute inset-0">
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
              <div 
                className="w-full h-full opacity-5"
                style={{
                  backgroundImage: `radial-gradient(circle at 25% 25%, currentColor 2px, transparent 2px)`,
                  backgroundSize: '50px 50px'
                }}
              />
            </div>
          </UltraStabilizedParallax>
        </>
      )}

      {/* Main content with ultra-precise text lifecycle */}
      <div className="relative z-10 h-full flex items-center justify-center p-6">
        <div 
          className="w-full max-w-4xl transition-all duration-300 ease-out"
          style={{
            opacity: stagingMetrics.textVisibility,
            transform: `translate3d(0, ${(1 - stagingMetrics.textVisibility) * 20}px, 0) scale(${0.98 + stagingMetrics.textVisibility * 0.02})`,
            filter: stagingMetrics.textVisibility < 1 ? `blur(${(1 - stagingMetrics.textVisibility) * 2}px)` : 'none'
          }}
        >
          {/* AI-Powered Content Manager */}
          <div className="text-center mb-12">
            <div className="mb-4">
              <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                {sceneIndex === 0 ? 'Benvenuto' : isLastScene ? 'Ultimo Passo' : `Passo ${sceneIndex + 1}`}
              </span>
            </div>
            
            <AIContentManager
              step={currentStep}
              isActive={isActive}
              onContentUpdate={handleContentUpdate}
              productContext={productContext}
            />
          </div>

          {/* Interactive Form Section */}
          <div>
            <ScrollTriggeredFormSection
              step={currentStep}
              scrollProgress={stagingMetrics.progress}
              isActive={isActive}
              onDataChange={onFormDataChange}
              existingData={existingData}
              colorScheme={colorScheme}
              isLastScene={isLastScene}
              onFinalSubmit={onFinalSubmit}
            />
          </div>

          {/* Scene Progress Indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
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
          </div>
        </div>
      </div>
    </div>
  );
};