import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ShareableFunnel } from '@/types/interactiveFunnel';
import { useUltraStableScroll } from '@/hooks/useUltraStableScroll';
import { useFunnelSubmission } from '../hooks/useFunnelSubmission';
import { CinematicFunnelScene } from './CinematicFunnelScene';
import { CinematicProgressIndicator } from './CinematicProgressIndicator';
import { ScrollTriggeredFormSection } from './ScrollTriggeredFormSection';
import { CinematicTransitionManager } from '@/components/cinematic/CinematicTransitionManager';
import { motion, AnimatePresence } from 'framer-motion';
import { useFunnelSteps } from '../hooks/useFunnelSteps';

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

  // Ultra-smooth scroll tracking
  const scrollMetrics = useUltraStableScroll({
    throttleMs: 6,
    smoothing: 0.08,
    onScrollChange: useCallback((metrics) => {
      if (!hasSteps) return;
      
      // Calculate current scene based on scroll progress
      const sceneProgress = metrics.scrollProgress * totalSteps;
      const newSceneIndex = Math.floor(sceneProgress);
      const sceneLocalProgress = sceneProgress - newSceneIndex;
      
      setCurrentSceneIndex(Math.min(newSceneIndex, totalSteps - 1));
      
      // Auto-save form data when leaving a scene
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

  // Calculate scroll-triggered positions for each scene
  const getSceneScrollTrigger = useCallback((index: number) => {
    const sceneHeight = 100; // Each scene takes 100vh
    return {
      start: index * sceneHeight,
      end: (index + 1) * sceneHeight,
      progress: Math.max(0, Math.min(1, (scrollMetrics.scrollProgress * totalSteps) - index))
    };
  }, [scrollMetrics.scrollProgress, totalSteps]);

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

      {/* Scene container with total height for smooth scrolling */}
      <div style={{ height: `${totalSteps * 100}vh` }} className="relative">
        {sortedSteps.map((step, index) => {
          const sceneData = getSceneScrollTrigger(index);
          const isActive = Math.abs(currentSceneIndex - index) <= 1;
          
          return (
            <div
              key={step.id}
              className="fixed inset-0 w-full h-screen"
              style={{
                zIndex: totalSteps - index,
              }}
            >
              <CinematicTransitionManager
                transition={{
                  in: 'fade',
                  out: 'fade',
                  duration: 0.8
                }}
                isActive={isActive}
              >
                <CinematicFunnelScene
                  step={step}
                  sceneIndex={index}
                  totalScenes={totalSteps}
                  scrollProgress={sceneData.progress}
                  ultraSmoothScrollY={scrollMetrics.ultraSmoothScrollY}
                  isActive={currentSceneIndex === index}
                  onFormDataChange={(data) => handleFormDataChange(step.id, data)}
                  existingData={formData[step.id]}
                  isLastScene={index === totalSteps - 1}
                  onFinalSubmit={handleFinalSubmission}
                />
              </CinematicTransitionManager>
            </div>
          );
        })}
      </div>

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