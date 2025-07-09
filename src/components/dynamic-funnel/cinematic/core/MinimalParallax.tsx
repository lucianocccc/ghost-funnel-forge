import React, { useEffect, useRef } from 'react';
import { CinematicScene } from './types';

interface MinimalParallaxProps {
  scene: CinematicScene;
  scrollProgress: number;
  isActive: boolean;
}

export const MinimalParallax: React.FC<MinimalParallaxProps> = ({
  scene,
  scrollProgress,
  isActive
}) => {
  const layerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!layerRef.current || !isActive) return;

    const layer = layerRef.current;
    const parallaxSpeed = scene.animationConfig.backgroundParallax;
    const translateY = scrollProgress * 50 * parallaxSpeed;
    
    layer.style.transform = `translateY(${translateY}px)`;
  }, [scrollProgress, scene.animationConfig.backgroundParallax, isActive]);

  if (!isActive) return null;

  const getSceneElements = () => {
    switch (scene.type) {
      case 'hero':
        return (
          <div className="absolute inset-0 pointer-events-none">
            {/* Subtle geometric shapes */}
            <div className="absolute top-20 left-20 w-32 h-32 border border-white/10 rounded-full animate-pulse" />
            <div className="absolute bottom-20 right-20 w-24 h-24 border border-white/10 rounded-lg animate-pulse" 
                 style={{ animationDelay: '1s' }} />
            <div className="absolute top-1/2 left-1/4 w-16 h-16 border border-white/10 rounded-full animate-pulse" 
                 style={{ animationDelay: '2s' }} />
          </div>
        );
      
      case 'benefit':
        return (
          <div className="absolute inset-0 pointer-events-none">
            {/* Floating checkmarks */}
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="absolute text-green-300/20 text-2xl animate-float"
                style={{
                  left: `${20 + i * 15}%`,
                  top: `${30 + (i % 2) * 20}%`,
                  animationDelay: `${i * 0.5}s`
                }}
              >
                ✓
              </div>
            ))}
          </div>
        );
      
      case 'proof':
        return (
          <div className="absolute inset-0 pointer-events-none">
            {/* Floating stars */}
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="absolute text-yellow-300/20 text-3xl animate-pulse"
                style={{
                  left: `${25 + i * 20}%`,
                  top: `${25 + (i % 2) * 30}%`,
                  animationDelay: `${i * 0.7}s`
                }}
              >
                ⭐
              </div>
            ))}
          </div>
        );
      
      case 'demo':
        return (
          <div className="absolute inset-0 pointer-events-none">
            {/* Subtle lines for movement */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-white to-transparent animate-pulse" />
              <div className="absolute top-3/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-white to-transparent animate-pulse" 
                   style={{ animationDelay: '1s' }} />
            </div>
          </div>
        );
      
      case 'conversion':
        return (
          <div className="absolute inset-0 pointer-events-none">
            {/* Subtle glow effect */}
            <div className="absolute inset-0 bg-gradient-radial from-blue-500/5 via-transparent to-transparent animate-pulse" />
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div ref={layerRef} className="absolute inset-0 z-10 pointer-events-none">
      {getSceneElements()}
      
      {/* Add CSS for animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .bg-gradient-radial {
          background: radial-gradient(circle at center, var(--tw-gradient-stops));
        }
      `}</style>
    </div>
  );
};