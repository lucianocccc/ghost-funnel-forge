
import React, { memo, useMemo } from 'react';
import { CinematicScene } from './core/types';
import { UltraStabilizedParallax } from '../performance/UltraStabilizedParallax';
import { useUltraStableScroll } from '@/hooks/useUltraStableScroll';

interface UltraParallaxSceneManagerProps {
  scenes: CinematicScene[];
  currentScene: number;
  scrollProgress: number;
}

export const UltraParallaxSceneManager = memo<UltraParallaxSceneManagerProps>(({
  scenes,
  currentScene,
  scrollProgress
}) => {
  const { ultraSmoothScrollY } = useUltraStableScroll({
    throttleMs: 6,
    smoothing: 0.08
  });

  const currentSceneData = scenes[currentScene];
  if (!currentSceneData) return null;

  const sceneElements = useMemo(() => {
    return currentSceneData.parallaxLayers.slice(0, 2).map((layer, index) => (
      <UltraStabilizedParallax
        key={index}
        ultraSmoothScrollY={ultraSmoothScrollY}
        speed={layer.speed}
        className="flex items-center justify-center"
        style={{
          opacity: Math.max(0.1, Math.min(0.8, layer.opacity - (scrollProgress * 0.2))),
          transform: `scale(${1 + (scrollProgress * (layer.scale - 1) * 0.5)})`,
          transformOrigin: 'center center',
          contain: 'layout style paint',
        }}
      >
        <div 
          className="text-5xl md:text-7xl select-none"
          style={{
            textShadow: '0 0 15px rgba(255,255,255,0.3)',
            filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.2))',
            contain: 'layout style paint',
          }}
        >
          {layer.element}
        </div>
      </UltraStabilizedParallax>
    ));
  }, [currentSceneData.parallaxLayers, ultraSmoothScrollY, scrollProgress]);

  return (
    <div className="absolute inset-0 z-10 pointer-events-none" style={{ contain: 'layout style paint' }}>
      <div className="relative w-full h-full">
        {sceneElements}
      </div>
    </div>
  );
});

UltraParallaxSceneManager.displayName = 'UltraParallaxSceneManager';
