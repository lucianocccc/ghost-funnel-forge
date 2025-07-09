import React, { useEffect, useRef } from 'react';
import { CinematicScene } from './core/types';

interface ParallaxSceneManagerProps {
  scenes: CinematicScene[];
  currentScene: number;
  scrollProgress: number;
}

export const ParallaxSceneManager: React.FC<ParallaxSceneManagerProps> = ({
  scenes,
  currentScene,
  scrollProgress
}) => {
  const layersRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!layersRef.current) return;

    const currentSceneData = scenes[currentScene];
    if (!currentSceneData) return;

    const scrollY = window.scrollY;
    const windowHeight = window.innerHeight;
    const sceneOffset = currentScene * windowHeight;
    const relativeScroll = scrollY - sceneOffset;

    // Update parallax layers
    const layers = layersRef.current.children;
    currentSceneData.parallaxLayers.forEach((layer, index) => {
      const layerElement = layers[index] as HTMLElement;
      if (layerElement) {
        const translateY = relativeScroll * layer.speed;
        const scale = 1 + (relativeScroll / windowHeight) * (layer.scale - 1);
        const opacity = Math.max(0, Math.min(1, layer.opacity - (relativeScroll / windowHeight) * 0.5));

        layerElement.style.transform = `translateY(${translateY}px) scale(${scale})`;
        layerElement.style.opacity = opacity.toString();
      }
    });
  }, [scenes, currentScene, scrollProgress]);

  const currentSceneData = scenes[currentScene];
  if (!currentSceneData) return null;

  return (
    <div className="absolute inset-0 z-10 pointer-events-none">
      <div ref={layersRef} className="relative w-full h-full">
        {currentSceneData.parallaxLayers.map((layer, index) => (
          <div
            key={index}
            className="absolute inset-0 flex items-center justify-center"
            style={{
              willChange: 'transform, opacity',
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
          </div>
        ))}
      </div>

      {/* Floating elements based on scene type */}
      {currentSceneData.type === 'hero' && (
        <div className="absolute inset-0">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-white rounded-full opacity-30"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                transform: `translateY(${scrollProgress * 200 * (0.5 + Math.random())}px)`,
                animation: `float ${3 + Math.random() * 2}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
      )}

      {currentSceneData.type === 'benefit' && (
        <div className="absolute inset-0">
          {Array.from({ length: 15 }).map((_, i) => (
            <div
              key={i}
              className="absolute text-green-300 opacity-20 text-2xl"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                transform: `translateY(${scrollProgress * 150 * (0.3 + Math.random())}px) rotate(${Math.random() * 360}deg)`,
                animation: `spin ${5 + Math.random() * 3}s linear infinite`,
              }}
            >
              ✓
            </div>
          ))}
        </div>
      )}

      {currentSceneData.type === 'proof' && (
        <div className="absolute inset-0">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="absolute text-purple-300 opacity-25 text-3xl"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                transform: `translateY(${scrollProgress * 100 * (0.2 + Math.random())}px) scale(${0.5 + Math.random() * 0.5})`,
                animation: `pulse ${2 + Math.random() * 2}s ease-in-out infinite`,
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
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
          }
          
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          
          @keyframes pulse {
            0%, 100% { opacity: 0.25; transform: scale(1); }
            50% { opacity: 0.5; transform: scale(1.1); }
          }
        `}
      </style>
    </div>
  );
};