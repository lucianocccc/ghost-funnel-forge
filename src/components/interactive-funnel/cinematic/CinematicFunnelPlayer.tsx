import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { ShareableFunnel } from '@/types/interactiveFunnel';
import { useUltraStableScroll } from '@/hooks/useUltraStableScroll';
import { useFunnelSubmission } from '../hooks/useFunnelSubmission';
import { CinematicFunnelScene } from './CinematicFunnelScene';
import { CinematicProgressIndicator } from './CinematicProgressIndicator';
import { ScrollTriggeredFormSection } from './ScrollTriggeredFormSection';
import { CinematicTransitionManager } from '@/components/cinematic/CinematicTransitionManager';
import { motion, AnimatePresence } from 'framer-motion';
import { useFunnelSteps } from '../hooks/useFunnelSteps';
import { extractStorytellingFlow } from '@/utils/aiContentExtractor';
import { CinematicStorytellingHint } from './CinematicStorytellingHint';
import { calculateSceneStaging, getPerformanceMode } from '@/utils/sceneStaging';

interface CinematicFunnelPlayerProps {
  funnel: ShareableFunnel;
  onComplete: () => void;
}

export const CinematicFunnelPlayer: React.FC<CinematicFunnelPlayerProps> = ({ 
  funnel, 
  onComplete 
}) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [activeFormSection, setActiveFormSection] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { sortedSteps, totalSteps, hasSteps } = useFunnelSteps(funnel, 0);
  const { submitStep } = useFunnelSubmission(funnel, 'cinematic-session', onComplete);

  // Extract storytelling flow from AI-generated content
  const storytellingFlow = useMemo(() => {
    if (hasSteps) {
      return extractStorytellingFlow(sortedSteps);
    }
    return {
      narrative: 'Un\'esperienza personalizzata ti aspetta',
      progression: 'benefit-driven' as const,
      keyMessages: []
    };
  }, [sortedSteps, hasSteps]);

  // Ultra-smooth scroll tracking with precision staging
  const scrollMetrics = useUltraStableScroll({
    throttleMs: 4, // Increased frequency for ultra-smooth staging
    smoothing: 0.06, // Tighter smoothing for precision
    onScrollChange: useCallback((metrics) => {
      if (!hasSteps) return;
      
      // Calculate primary active scene with precision
      const sceneProgress = metrics.scrollProgress * totalSteps;
      const newSceneIndex = Math.floor(sceneProgress);
      
      // Only update scene index when crossing threshold precisely
      const sceneThreshold = 0.5; // Mid-point threshold for scene changes
      const localProgress = sceneProgress - newSceneIndex;
      
      if (localProgress > sceneThreshold && newSceneIndex < totalSteps - 1) {
        setCurrentSceneIndex(Math.min(newSceneIndex + 1, totalSteps - 1));
      } else {
        setCurrentSceneIndex(Math.min(newSceneIndex, totalSteps - 1));
      }
      
      // Auto-save with debouncing to prevent excessive calls
      if (newSceneIndex !== currentSceneIndex && formData[sortedSteps[currentSceneIndex]?.id]) {
        handleAutoSave(sortedSteps[currentSceneIndex]?.id, formData[sortedSteps[currentSceneIndex]?.id]);
      }
    }, [totalSteps, hasSteps, currentSceneIndex, formData, sortedSteps])
  });

  // Auto-save form data
  const handleAutoSave = useCallback(async (stepId: string, data: any) => {
    if (!data || Object.keys(data).length === 0) return;
    
    try {
      const step = sortedSteps.find(s => s.id === stepId);
      if (step) {
        await submitStep(step, data, false, () => {}, () => {});
        console.log('✅ Auto-saved data for step:', stepId);
      }
    } catch (error) {
      console.log('❌ Auto-save failed for step:', stepId, error);
    }
  }, [submitStep]);

  // Handle form data changes
  const handleFormDataChange = useCallback((stepId: string, data: any) => {
    setFormData(prev => ({ ...prev, [stepId]: data }));
  }, []);

  // Handle final completion
  const handleFinalSubmission = useCallback(async () => {
    try {
      // Submit any remaining unsaved data
      for (const step of sortedSteps) {
        if (formData[step.id] && Object.keys(formData[step.id]).length > 0) {
          const isLastStepSubmission = step === sortedSteps[sortedSteps.length - 1];
          await submitStep(step, formData[step.id], isLastStepSubmission, () => {}, () => {});
        }
      }
      onComplete();
    } catch (error) {
      console.error('Failed to complete funnel:', error);
    }
  }, [sortedSteps, formData, submitStep, onComplete]);

  // Calculate ultra-precise scene staging for each scene
  const getSceneStaging = useCallback((index: number) => {
    return calculateSceneStaging(
      index,
      totalSteps,
      scrollMetrics.scrollProgress,
      {
        contentPhase: 0.75, // 75% stable content
        transitionPhase: 0.25, // 25% transition
        textFadeOut: 0.75, // Start fading at 75%
        textFadeIn: 0.85 // Next text appears at 85%
      }
    );
  }, [scrollMetrics.scrollProgress, totalSteps]);

  // Performance optimization based on scroll velocity
  const performanceMode = useMemo(() => {
    return getPerformanceMode(scrollMetrics.velocity);
  }, [scrollMetrics.velocity]);

  if (!hasSteps) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <h2 className="text-2xl font-semibold mb-4">Funnel Non Configurato</h2>
          <p>Questo funnel non ha ancora scene configurate.</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      {/* Ultra-smooth progress indicator */}
      <CinematicProgressIndicator 
        progress={scrollMetrics.scrollProgress}
        ultraSmoothScrollY={scrollMetrics.ultraSmoothScrollY}
        currentScene={currentSceneIndex}
        totalScenes={totalSteps}
      />

      {/* Ultra-smooth scene container with precision staging */}
      <div style={{ height: `${totalSteps * 100}vh` }} className="relative">
        {sortedSteps.map((step, index) => {
          const stagingMetrics = getSceneStaging(index);
          
          // Only render scenes that are visible or about to be visible
          if (stagingMetrics.stage === 'hidden') {
            return null;
          }
          
          return (
            <div
              key={step.id}
              className="fixed inset-0 w-full h-screen transition-all duration-300 ease-out"
              style={{
                zIndex: stagingMetrics.zIndex,
                opacity: stagingMetrics.backgroundOpacity,
                transform: `translate3d(0, ${stagingMetrics.transformY}px, 0) scale(${stagingMetrics.scale})`,
                willChange: performanceMode === 'high' ? 'transform, opacity' : 'auto',
                backfaceVisibility: 'hidden',
                perspective: '1000px'
              }}
            >
              <CinematicFunnelScene
                step={step}
                sceneIndex={index}
                totalScenes={totalSteps}
                stagingMetrics={stagingMetrics}
                ultraSmoothScrollY={scrollMetrics.ultraSmoothScrollY}
                isActive={stagingMetrics.stage === 'active'}
                onFormDataChange={(data) => handleFormDataChange(step.id, data)}
                existingData={formData[step.id]}
                isLastScene={index === totalSteps - 1}
                onFinalSubmit={handleFinalSubmission}
                performanceMode={performanceMode}
              />
            </div>
          );
        })}
      </div>

      {/* AI Storytelling hint */}
      <CinematicStorytellingHint
        progression={storytellingFlow.progression}
        currentStep={currentSceneIndex + 1}
        totalSteps={totalSteps}
        narrative={storytellingFlow.narrative}
      />

      {/* Scroll hint for first scene */}
      <AnimatePresence>
        {currentSceneIndex === 0 && scrollMetrics.scrollY < 100 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 pointer-events-none"
          >
            <div className="flex flex-col items-center text-primary-foreground/80">
              <div className="text-sm font-medium mb-2">Scorri per continuare</div>
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="w-6 h-10 border-2 border-primary-foreground/40 rounded-full flex justify-center"
              >
                <div className="w-1 h-3 bg-primary-foreground/60 rounded-full mt-2" />
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};