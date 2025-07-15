
import React, { useEffect, useRef, memo } from 'react';
import { CinematicScene } from './core/types';
import { StabilizedParallax } from '../performance/StabilizedParallax';
import { useStableScroll } from '@/hooks/useStableScroll';

interface ParallaxSceneManagerProps {
  scenes: CinematicScene[];
  currentScene: number;
  scrollProgress: number;
}

export const ParallaxSceneManager = memo<ParallaxSceneManagerProps>(({
  scenes,
  currentScene,
  scrollProgress
}) => {
  const layersRef = useRef<HTMLDivElement>(null);
  const { smoothScrollY } = useStableScroll({
    throttleMs: 8,
    smoothing: 0.12
  });

  const currentSceneData = scenes[currentScene];
  if (!currentSceneData) return null;

  return (
    <div className="absolute inset-0 z-10 pointer-events-none">
      <div ref={layersRef} className="relative w-full h-full">
        {currentSceneData.parallaxLayers.map((layer, index) => (
          <StabilizedParallax
            key={index}
            smoothScrollY={smoothScrollY}
            speed={layer.speed}
            className="flex items-center justify-center"
            style={{
              opacity: Math.max(0, Math.min(1, layer.opacity - (scrollProgress * 0.3))),
              transform: `scale(${1 + (scrollProgress * (layer.scale - 1))})`,
              transformOrigin: 'center center',
            }}
          >
            <div 
              className={`text-6xl md:text-8xl ${
                layer.element === '✨' ? 'animate-pulse' : ''
              }`}
              style={{
                textShadow: '0 0 20px rgba(255,255,255,0.5)',
                filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.3))',
              }}
            >
              {layer.element}
            </div>
          </StabilizedParallax>
        ))}
      </div>

      {/* Elementi fluttuanti ottimizzati per tipo di scena */}
      {currentSceneData.type === 'hero' && (
        <div className="absolute inset-0">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full opacity-20"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `float ${2 + Math.random() * 1.5}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 2}s`,
                willChange: 'auto',
                transform: 'translateZ(0)',
              }}
            />
          ))}
        </div>
      )}

      {currentSceneData.type === 'benefit' && (
        <div className="absolute inset-0">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="absolute text-green-300 opacity-15 text-xl"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `spin ${4 + Math.random() * 2}s linear infinite`,
                willChange: 'auto',
                transform: 'translateZ(0)',
              }}
            >
              ✓
            </div>
          ))}
        </div>
      )}

      {currentSceneData.type === 'proof' && (
        <div className="absolute inset-0">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="absolute text-purple-300 opacity-20 text-2xl"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `pulse ${1.5 + Math.random()}s ease-in-out infinite`,
                willChange: 'auto',
                transform: 'translateZ(0)',
              }}
            >
              ⭐
            </div>
          ))}
        </div>
      )}

      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translateY(0px) translateZ(0); }
            50% { transform: translateY(-15px) translateZ(0); }
          }
          
          @keyframes spin {
            from { transform: rotate(0deg) translateZ(0); }
            to { transform: rotate(360deg) translateZ(0); }
          }
          
          @keyframes pulse {
            0%, 100% { opacity: 0.2; transform: scale(1) translateZ(0); }
            50% { opacity: 0.4; transform: scale(1.05) translateZ(0); }
          }
        `}
      </style>
    </div>
  );
});

ParallaxSceneManager.displayName = 'ParallaxSceneManager';
