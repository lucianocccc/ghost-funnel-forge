import React, { useState, useEffect, useRef } from 'react';
import { CinematicScene, ImageLoadingState } from './types';

interface ImageSystemProps {
  scene: CinematicScene;
  scrollProgress: number;
  isActive: boolean;
  onImageLoaded?: (sceneId: string) => void;
}

export const ImageSystem: React.FC<ImageSystemProps> = ({
  scene,
  scrollProgress,
  isActive,
  onImageLoaded
}) => {
  const [imageState, setImageState] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [imageUrl, setImageUrl] = useState<string | undefined>(scene.imageUrl);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (scene.imageUrl) {
      const img = new Image();
      img.onload = () => {
        setImageState('loaded');
        setImageUrl(scene.imageUrl);
        onImageLoaded?.(scene.id);
      };
      img.onerror = () => {
        setImageState('error');
        // Fallback to Unsplash with scene-specific search
        const fallbackUrl = generateUnsplashUrl(scene);
        setImageUrl(fallbackUrl);
      };
      img.src = scene.imageUrl;
    }
  }, [scene.imageUrl, scene.id, onImageLoaded]);

  const generateUnsplashUrl = (scene: CinematicScene): string => {
    const searchTerms = {
      hero: 'success,achievement,innovation,technology',
      benefit: 'growth,progress,quality,excellence',
      proof: 'team,collaboration,results,trust',
      demo: 'action,performance,demonstration,work',
      conversion: 'future,opportunity,decision,start'
    };
    
    const terms = searchTerms[scene.type] || 'business,professional';
    return `https://images.unsplash.com/photo-1600000000000-0000000000000?w=1920&h=1080&fit=crop&crop=center&q=80&auto=format&cs=tinysrgb&s=${terms}`;
  };

  const getParallaxTransform = () => {
    const parallaxSpeed = scene.animationConfig.backgroundParallax;
    const translateY = scrollProgress * 100 * parallaxSpeed;
    const scale = scene.animationConfig.scaleOnScroll 
      ? 1 + (scrollProgress * 0.1) 
      : 1;
    
    return `translateY(${translateY}px) scale(${scale})`;
  };

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Main image */}
      {imageUrl && (
        <img
          ref={imageRef}
          src={imageUrl}
          alt={scene.title}
          className={`
            w-full h-full object-cover transition-all duration-700
            ${isActive ? 'opacity-100' : 'opacity-0'}
          `}
          style={{
            transform: getParallaxTransform(),
            transformOrigin: 'center center',
            willChange: 'transform'
          }}
        />
      )}
      
      {/* Gradient overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60" />
      
      {/* Scene type specific overlay */}
      <div className={`
        absolute inset-0 transition-opacity duration-700
        ${scene.type === 'hero' ? 'bg-blue-600/10' :
          scene.type === 'benefit' ? 'bg-green-600/10' :
          scene.type === 'proof' ? 'bg-purple-600/10' :
          scene.type === 'demo' ? 'bg-orange-600/10' :
          'bg-indigo-600/10'}
      `} />
      
      {/* Loading state */}
      {imageState === 'loading' && (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-white/70 text-sm">Caricamento immagine...</p>
          </div>
        </div>
      )}
      
      {/* Error state */}
      {imageState === 'error' && (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
          <div className="text-center space-y-2">
            <div className="text-white/50 text-4xl">🖼️</div>
            <p className="text-white/70 text-sm">Immagine non disponibile</p>
          </div>
        </div>
      )}
    </div>
  );
};