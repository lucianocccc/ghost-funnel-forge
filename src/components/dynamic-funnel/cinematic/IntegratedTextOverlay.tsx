import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowDown, Sparkles, Star, Shield } from 'lucide-react';

interface CinematicScene {
  id: string;
  type: 'hero' | 'benefit' | 'proof' | 'demo' | 'conversion';
  imagePrompt: string;
  imageUrl?: string;
  title: string;
  subtitle: string;
  content: string;
  cta?: {
    text: string;
    action: string;
  };
  scrollTrigger: {
    start: number;
    end: number;
  };
  parallaxLayers: Array<{
    element: string;
    speed: number;
    scale: number;
    opacity: number;
  }>;
}

interface IntegratedTextOverlayProps {
  scenes: CinematicScene[];
  currentScene: number;
  scrollProgress: number;
}

export const IntegratedTextOverlay: React.FC<IntegratedTextOverlayProps> = ({
  scenes,
  currentScene,
  scrollProgress
}) => {
  const currentSceneData = scenes[currentScene];
  if (!currentSceneData) return null;

  const getSceneIcon = (type: string) => {
    switch (type) {
      case 'hero':
        return <Sparkles className="w-8 h-8" />;
      case 'benefit':
        return <Star className="w-8 h-8" />;
      case 'proof':
        return <Shield className="w-8 h-8" />;
      default:
        return <Sparkles className="w-8 h-8" />;
    }
  };

  const getTextPosition = (type: string) => {
    switch (type) {
      case 'hero':
        return 'justify-center items-center text-center';
      case 'benefit':
        return 'justify-center items-start text-left pt-32';
      case 'proof':
        return 'justify-center items-end text-center pb-32';
      case 'demo':
        return 'justify-start items-center text-left pl-16';
      case 'conversion':
        return 'justify-center items-center text-center';
      default:
        return 'justify-center items-center text-center';
    }
  };

  const sceneProgress = (scrollProgress * scenes.length) - currentScene;
  const opacity = Math.max(0, Math.min(1, 1 - Math.abs(sceneProgress) * 2));
  const translateY = sceneProgress * 50;

  return (
    <div className="absolute inset-0 z-20 pointer-events-none">
      <div className={`flex ${getTextPosition(currentSceneData.type)} w-full h-full p-8 md:p-16`}>
        <div
          className="max-w-4xl mx-auto space-y-6 pointer-events-auto"
          style={{
            opacity,
            transform: `translateY(${translateY}px)`,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          {/* Scene icon */}
          <div className="flex justify-center mb-4">
            <div className="text-white/80 animate-pulse">
              {getSceneIcon(currentSceneData.type)}
            </div>
          </div>

          {/* Title */}
          <h1 className={`font-bold text-white ${
            currentSceneData.type === 'hero' 
              ? 'text-5xl md:text-7xl' 
              : 'text-3xl md:text-5xl'
          }`}>
            <span className="bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
              {currentSceneData.title}
            </span>
          </h1>

          {/* Subtitle */}
          <p className={`text-white/90 font-medium ${
            currentSceneData.type === 'hero' 
              ? 'text-xl md:text-2xl' 
              : 'text-lg md:text-xl'
          }`}>
            {currentSceneData.subtitle}
          </p>

          {/* Content */}
          <div className="text-white/80 text-base md:text-lg max-w-2xl">
            {currentSceneData.content.split('\n').map((line, index) => (
              <p key={index} className="mb-4 leading-relaxed">
                {line}
              </p>
            ))}
          </div>

          {/* CTA Button */}
          {currentSceneData.cta && (
            <div className="pt-6">
              <Button
                size="lg"
                className="bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-sm transition-all duration-300 hover:scale-105"
                onClick={() => {
                  window.scrollTo({
                    top: window.scrollY + window.innerHeight,
                    behavior: 'smooth'
                  });
                }}
              >
                {currentSceneData.cta.text}
                <ArrowDown className="ml-2 w-5 h-5" />
              </Button>
            </div>
          )}

          {/* Scene counter */}
          <div className="absolute bottom-8 right-8 text-white/50 text-sm">
            {currentScene + 1} / {scenes.length}
          </div>
        </div>
      </div>

      {/* Typing effect for hero */}
      {currentSceneData.type === 'hero' && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-white/30 text-xl animate-pulse">
            <span className="inline-block w-2 h-6 bg-white/50 animate-pulse ml-1"></span>
          </div>
        </div>
      )}

      {/* Floating quotes for proof section */}
      {currentSceneData.type === 'proof' && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 text-white/20 text-6xl font-serif">"</div>
          <div className="absolute bottom-1/4 right-1/4 text-white/20 text-6xl font-serif transform rotate-180">"</div>
        </div>
      )}

      {/* Progress dots */}
      <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2">
        <div className="flex space-x-2">
          {scenes.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-500 ${
                index === currentScene 
                  ? 'bg-white scale-125' 
                  : index < currentScene 
                  ? 'bg-white/70' 
                  : 'bg-white/30'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};