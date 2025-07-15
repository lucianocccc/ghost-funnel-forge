
import React, { memo, useCallback, useMemo } from 'react';
import { useStableScroll } from '@/hooks/useStableScroll';

interface OptimizedScrollControllerProps {
  children: React.ReactNode;
  totalScenes: number;
  onScrollMetrics: (metrics: any) => void;
  onSceneChange: (sceneIndex: number, progress: number) => void;
}

export const OptimizedScrollController = memo<OptimizedScrollControllerProps>(({
  children,
  totalScenes,
  onScrollMetrics,
  onSceneChange
}) => {
  const scrollMetrics = useStableScroll({
    throttleMs: 8, // 120fps
    debounceMs: 100,
    smoothing: 0.15,
    onScrollChange: useCallback((metrics) => {
      onScrollMetrics({
        velocity: metrics.velocity,
        position: metrics.scrollY,
        normalizedPosition: metrics.scrollProgress,
        isScrolling: metrics.isScrolling,
        direction: metrics.direction,
        smoothVelocity: metrics.velocity,
        smoothScrollY: metrics.smoothScrollY
      });

      // Calcola scena corrente con smooth scrolling
      const sceneProgress = metrics.scrollProgress * totalScenes;
      const currentScene = Math.floor(sceneProgress);
      const sceneLocalProgress = sceneProgress - currentScene;
      
      onSceneChange(Math.min(currentScene, totalScenes - 1), sceneLocalProgress);
    }, [totalScenes, onScrollMetrics, onSceneChange])
  });

  // Memoizza gli indicatori di progresso
  const progressIndicators = useMemo(() => {
    const currentScene = Math.floor(scrollMetrics.scrollProgress * totalScenes);
    
    return Array.from({ length: totalScenes }).map((_, index) => (
      <div
        key={index}
        className={`w-2 h-2 rounded-full transition-all duration-300 ${
          index === currentScene 
            ? 'bg-white scale-125 shadow-lg' 
            : 'bg-white/30'
        }`}
        style={{
          willChange: 'transform, background-color',
          transform: `translateZ(0)` // Hardware acceleration
        }}
      />
    ));
  }, [scrollMetrics.scrollProgress, totalScenes]);

  return (
    <div className="relative">
      {children}
      
      {/* Indicatori di progresso ottimizzati */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 pointer-events-none">
        <div 
          className="flex space-x-2 px-3 py-2 bg-black/20 backdrop-blur-sm rounded-full"
          style={{
            willChange: 'transform',
            transform: 'translateZ(0)'
          }}
        >
          {progressIndicators}
        </div>
      </div>
      
      {/* Debug info in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed top-4 right-4 bg-black/80 text-white p-2 rounded text-xs font-mono z-50">
          <div>Scroll: {Math.round(scrollMetrics.scrollY)}</div>
          <div>Progress: {Math.round(scrollMetrics.scrollProgress * 100)}%</div>
          <div>Velocity: {Math.round(scrollMetrics.velocity * 100) / 100}</div>
          <div>Direction: {scrollMetrics.direction}</div>
          <div>Scrolling: {scrollMetrics.isScrolling ? 'YES' : 'NO'}</div>
        </div>
      )}
    </div>
  );
});

OptimizedScrollController.displayName = 'OptimizedScrollController';
