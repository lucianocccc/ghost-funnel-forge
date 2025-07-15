
import React, { memo, useCallback, useMemo } from 'react';
import { useUltraStableScroll } from '@/hooks/useUltraStableScroll';

interface UltraOptimizedScrollControllerProps {
  children: React.ReactNode;
  totalScenes: number;
  onScrollMetrics: (metrics: any) => void;
  onSceneChange: (sceneIndex: number, progress: number) => void;
}

export const UltraOptimizedScrollController = memo<UltraOptimizedScrollControllerProps>(({
  children,
  totalScenes,
  onScrollMetrics,
  onSceneChange
}) => {
  const scrollMetrics = useUltraStableScroll({
    throttleMs: 6,
    smoothing: 0.08,
    onScrollChange: useCallback((metrics) => {
      onScrollMetrics({
        velocity: metrics.velocity,
        position: metrics.scrollY,
        normalizedPosition: metrics.scrollProgress,
        isScrolling: metrics.isScrolling,
        direction: metrics.direction,
        smoothVelocity: metrics.velocity,
        smoothScrollY: metrics.smoothScrollY,
        ultraSmoothScrollY: metrics.ultraSmoothScrollY
      });

      const sceneProgress = metrics.scrollProgress * totalScenes;
      const currentScene = Math.floor(sceneProgress);
      const sceneLocalProgress = sceneProgress - currentScene;
      
      onSceneChange(Math.min(currentScene, totalScenes - 1), sceneLocalProgress);
    }, [totalScenes, onScrollMetrics, onSceneChange])
  });

  const progressIndicators = useMemo(() => {
    const currentScene = Math.floor(scrollMetrics.scrollProgress * totalScenes);
    
    return Array.from({ length: totalScenes }).map((_, index) => (
      <div
        key={index}
        className={`w-2 h-2 rounded-full transition-all duration-200 ${
          index === currentScene 
            ? 'bg-white scale-110 shadow-md' 
            : 'bg-white/25'
        }`}
        style={{
          contain: 'layout style paint',
          transform: 'translateZ(0)'
        }}
      />
    ));
  }, [scrollMetrics.scrollProgress, totalScenes]);

  return (
    <div className="relative" style={{ contain: 'layout style paint' }}>
      {children}
      
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 pointer-events-none">
        <div 
          className="flex space-x-2 px-2 py-1 bg-black/15 backdrop-blur-sm rounded-full"
          style={{
            contain: 'layout style paint',
            transform: 'translateZ(0)'
          }}
        >
          {progressIndicators}
        </div>
      </div>
    </div>
  );
});

UltraOptimizedScrollController.displayName = 'UltraOptimizedScrollController';
