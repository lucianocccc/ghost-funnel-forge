import React, { useEffect, useRef, useState } from 'react';
import { CinematicScene } from './core/types';

interface ScrollBasedImageRendererProps {
  scenes: CinematicScene[];
  currentScene: number;
  scrollProgress: number;
  getImageLoadingState?: (sceneId: string) => 'loading' | 'loaded' | 'error';
}

export const ScrollBasedImageRenderer: React.FC<ScrollBasedImageRendererProps> = ({
  scenes,
  currentScene,
  scrollProgress,
  getImageLoadingState
}) => {
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});
  const imageRefs = useRef<Record<string, HTMLImageElement>>({});

  useEffect(() => {
    // Preload current and next scene images
    const currentSceneData = scenes[currentScene];
    const nextSceneData = scenes[currentScene + 1];

    [currentSceneData, nextSceneData].forEach((scene) => {
      if (scene?.imageUrl && !loadedImages[scene.id]) {
        const img = new Image();
        img.onload = () => {
          setLoadedImages(prev => ({
            ...prev,
            [scene.id]: true
          }));
        };
        img.src = scene.imageUrl;
        imageRefs.current[scene.id] = img;
      }
    });
  }, [scenes, currentScene, loadedImages]);

  const getTransformStyle = (sceneIndex: number) => {
    const progress = scrollProgress * scenes.length;
    const sceneProgress = progress - sceneIndex;
    
    let scale = 1;
    let opacity = 1;
    let translateY = 0;
    let filter = 'none';

    if (sceneProgress > 0 && sceneProgress < 1) {
      // Current scene transitions
      scale = 1 + sceneProgress * 0.1;
      opacity = 1 - sceneProgress * 0.3;
      translateY = sceneProgress * -50;
    } else if (sceneProgress >= 1) {
      // Past scenes
      scale = 1.1;
      opacity = 0;
      translateY = -100;
      filter = 'blur(5px)';
    } else if (sceneProgress < 0 && sceneProgress > -1) {
      // Upcoming scenes
      scale = 0.9 - sceneProgress * 0.1;
      opacity = 0.3;
      translateY = Math.abs(sceneProgress) * 50;
      filter = 'blur(2px)';
    }

    return {
      transform: `scale(${scale}) translateY(${translateY}px)`,
      opacity,
      filter,
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
    };
  };

  return (
    <div className="absolute inset-0 z-0">
      {scenes.map((scene, index) => {
        const isVisible = index === 0; // Only show the current scene passed to this component
        
        return (
          <div
            key={scene.id}
            className={`absolute inset-0 transition-all duration-700 ${
              isVisible ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {/* Background image */}
            {scene.imageUrl && (
              <img
                src={scene.imageUrl}
                alt={scene.title}
                className="w-full h-full object-cover"
                style={{
                  objectPosition: 'center',
                }}
              />
            )}

            {/* Gradient overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />

            {/* Dynamic color overlay based on scene type */}
            <div 
              className={`absolute inset-0 ${
                scene.type === 'hero' ? 'bg-blue-900/10' :
                scene.type === 'benefit' ? 'bg-green-900/10' :
                scene.type === 'proof' ? 'bg-purple-900/10' :
                scene.type === 'demo' ? 'bg-orange-900/10' :
                'bg-red-900/10'
              }`}
            />

            {/* Loading state */}
            {(!loadedImages[scene.id] || getImageLoadingState?.(scene.id) === 'loading') && (
              <div className="absolute inset-0 bg-black flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
        );
      })}

      {/* Scroll indicators - only show on first scene */}
      {scenes.length > 0 && (
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 text-white text-sm opacity-70">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-6 border-2 border-white rounded-full">
              <div className="w-1 h-2 bg-white rounded-full mx-auto mt-1 animate-bounce" />
            </div>
            <span>Scorri per continuare</span>
          </div>
        </div>
      )}
    </div>
  );
};