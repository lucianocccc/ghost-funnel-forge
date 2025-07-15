
import React, { memo } from 'react';
import { useSimpleScroll } from '@/hooks/useSimpleScroll';

interface SimpleCinematicControllerProps {
  children: React.ReactNode;
  totalScenes: number;
  onScrollMetrics: (metrics: any) => void;
  onSceneChange: (sceneIndex: number, progress: number) => void;
}

export const SimpleCinematicController = memo<SimpleCinematicControllerProps>(({
  children,
  totalScenes,
  onScrollMetrics,
  onSceneChange
}) => {
  const scrollState = useSimpleScroll();

  React.useEffect(() => {
    onScrollMetrics({
      velocity: 0,
      position: scrollState.scrollY,
      normalizedPosition: scrollState.progress,
      isScrolling: scrollState.isScrolling,
      direction: scrollState.direction,
      smoothVelocity: 0
    });

    // Calculate current scene
    const sceneProgress = scrollState.progress * totalScenes;
    const currentScene = Math.floor(sceneProgress);
    const sceneLocalProgress = sceneProgress - currentScene;
    
    onSceneChange(Math.min(currentScene, totalScenes - 1), sceneLocalProgress);
  }, [scrollState, totalScenes, onScrollMetrics, onSceneChange]);

  return (
    <div className="relative">
      {children}
      
      {/* Simple progress indicator */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 pointer-events-none">
        <div className="flex space-x-2">
          {Array.from({ length: totalScenes }).map((_, index) => {
            const currentScene = Math.floor(scrollState.progress * totalScenes);
            return (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentScene 
                    ? 'bg-white scale-125' 
                    : 'bg-white/30'
                }`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
});

SimpleCinematicController.displayName = 'SimpleCinematicController';
