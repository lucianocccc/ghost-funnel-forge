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
  const particlesRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isActive || !particlesRef.current) return;

    const particles = particlesRef.current;
    const overlay = overlayRef.current;

    // Smooth parallax animation
    const transform = `translateY(${scrollProgress * 50}px) scale(${1 + scrollProgress * 0.05})`;
    particles.style.transform = transform;

    if (overlay) {
      overlay.style.opacity = `${0.3 + scrollProgress * 0.2}`;
    }
  }, [scrollProgress, isActive]);

  const getParticleColor = () => {
    const colors = {
      hero: 'bg-blue-500/20',
      benefit: 'bg-green-500/20',
      proof: 'bg-purple-500/20',
      demo: 'bg-orange-500/20',
      conversion: 'bg-indigo-500/20'
    };
    return colors[scene.type] || 'bg-white/20';
  };

  const getGradientOverlay = () => {
    const gradients = {
      hero: 'from-blue-900/40 via-transparent to-blue-900/60',
      benefit: 'from-green-900/40 via-transparent to-green-900/60',
      proof: 'from-purple-900/40 via-transparent to-purple-900/60',
      demo: 'from-orange-900/40 via-transparent to-orange-900/60',
      conversion: 'from-indigo-900/40 via-transparent to-indigo-900/60'
    };
    return gradients[scene.type] || 'from-slate-900/40 via-transparent to-slate-900/60';
  };

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Subtle particles */}
      <div 
        ref={particlesRef}
        className="absolute inset-0 will-change-transform"
      >
        {/* Floating particles */}
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className={`
              absolute w-1 h-1 ${getParticleColor()} rounded-full
              opacity-60 animate-pulse
            `}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          />
        ))}

        {/* Larger floating elements */}
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={`large-${i}`}
            className={`
              absolute w-2 h-2 ${getParticleColor()} rounded-full blur-sm
              opacity-40
            `}
            style={{
              left: `${10 + Math.random() * 80}%`,
              top: `${10 + Math.random() * 80}%`,
              transform: `translateY(${Math.sin(i) * 20}px)`,
              animation: `float ${4 + Math.random() * 2}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      {/* Dynamic gradient overlay */}
      <div 
        ref={overlayRef}
        className={`
          absolute inset-0 bg-gradient-to-b ${getGradientOverlay()}
          transition-opacity duration-700 ease-out
        `}
      />

      {/* Scene-specific decorative elements */}
      {scene.type === 'hero' && (
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" 
               style={{ animationDelay: '1s' }} />
        </div>
      )}

      {scene.type === 'benefit' && (
        <div className="absolute inset-0">
          <div className="absolute top-1/3 right-1/3 w-32 h-32 bg-green-500/20 rounded-full blur-2xl animate-bounce" 
               style={{ animationDuration: '3s' }} />
        </div>
      )}

      {scene.type === 'proof' && (
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-96 h-96 border border-purple-500/20 rounded-full animate-spin" 
                 style={{ animationDuration: '20s' }} />
            <div className="absolute inset-8 border border-purple-500/10 rounded-full animate-spin" 
                 style={{ animationDuration: '15s', animationDirection: 'reverse' }} />
          </div>
        </div>
      )}

      {scene.type === 'demo' && (
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-px h-16 bg-orange-500/30"
                style={{
                  left: `${(i + 1) * 12.5}%`,
                  top: `${Math.random() * 100}%`,
                  transform: `rotate(${Math.random() * 360}deg)`,
                  animation: `fadeInOut ${2 + Math.random()}s ease-in-out infinite`,
                  animationDelay: `${Math.random() * 2}s`
                }}
              />
            ))}
          </div>
        </div>
      )}

      {scene.type === 'conversion' && (
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-radial from-indigo-500/10 via-transparent to-transparent" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 border-2 border-indigo-500/20 rounded-full animate-ping" 
               style={{ animationDuration: '3s' }} />
        </div>
      )}

    </div>
  );
};