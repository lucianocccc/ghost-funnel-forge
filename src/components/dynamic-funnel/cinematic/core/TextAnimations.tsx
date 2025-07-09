import React, { useEffect, useState } from 'react';
import { CinematicScene } from './types';
import { Button } from '@/components/ui/button';
import { ArrowDown, Sparkles, Star, Shield, Play } from 'lucide-react';

interface TextAnimationsProps {
  scene: CinematicScene;
  scrollProgress: number;
  isActive: boolean;
  sceneIndex: number;
  totalScenes: number;
}

export const TextAnimations: React.FC<TextAnimationsProps> = ({
  scene,
  scrollProgress,
  isActive,
  sceneIndex,
  totalScenes
}) => {
  const [typewriterText, setTypewriterText] = useState('');
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (scene.animationConfig.textAnimation === 'typewriter' && isActive) {
      let currentText = '';
      const fullText = scene.title;
      let index = 0;
      
      const timer = setInterval(() => {
        if (index < fullText.length) {
          currentText += fullText[index];
          setTypewriterText(currentText);
          index++;
        } else {
          clearInterval(timer);
          setTimeout(() => setShowContent(true), 300);
        }
      }, 50);
      
      return () => clearInterval(timer);
    } else if (isActive) {
      setShowContent(true);
    }
  }, [scene.title, scene.animationConfig.textAnimation, isActive]);

  const getSceneIcon = () => {
    const icons = {
      hero: Sparkles,
      benefit: Star,
      proof: Shield,
      demo: Play,
      conversion: ArrowDown
    };
    const Icon = icons[scene.type] || Sparkles;
    return <Icon className="w-8 h-8" />;
  };

  const getTextPosition = () => {
    const positions = {
      hero: 'justify-center items-center text-center',
      benefit: 'justify-start items-center text-left pl-8 md:pl-16',
      proof: 'justify-end items-center text-right pr-8 md:pr-16',
      demo: 'justify-center items-start text-center pt-16',
      conversion: 'justify-center items-center text-center'
    };
    return positions[scene.type] || positions.hero;
  };

  const getAnimationClasses = () => {
    if (!isActive) return 'opacity-0 translate-y-8';
    
    switch (scene.animationConfig.textAnimation) {
      case 'slide':
        return 'opacity-100 translate-y-0 transition-all duration-1000 ease-out';
      case 'fade':
        return 'opacity-100 transition-opacity duration-1000 ease-out';
      case 'typewriter':
        return 'opacity-100';
      default:
        return 'opacity-100 translate-y-0 transition-all duration-700 ease-out';
    }
  };

  return (
    <div className="absolute inset-0 z-20 pointer-events-none">
      <div className={`flex ${getTextPosition()} w-full h-full p-4 md:p-8`}>
        <div className={`max-w-4xl mx-auto space-y-6 pointer-events-auto ${getAnimationClasses()}`}>
          
          {/* Scene icon */}
          <div className="flex justify-center mb-6">
            <div className="text-white/80 animate-pulse">
              {getSceneIcon()}
            </div>
          </div>

          {/* Title */}
          <h1 className={`font-bold text-white ${
            scene.type === 'hero' ? 'text-4xl md:text-6xl' : 'text-3xl md:text-5xl'
          }`}>
            {scene.animationConfig.textAnimation === 'typewriter' ? (
              <span className="bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
                {typewriterText}
                <span className="animate-pulse">|</span>
              </span>
            ) : (
              <span className="bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
                {scene.title}
              </span>
            )}
          </h1>

          {/* Subtitle */}
          {(showContent || scene.animationConfig.textAnimation !== 'typewriter') && (
            <p className={`text-white/90 font-medium ${
              scene.type === 'hero' ? 'text-xl md:text-2xl' : 'text-lg md:text-xl'
            } ${
              scene.animationConfig.textAnimation === 'slide' 
                ? 'animate-slide-in-up delay-300' 
                : scene.animationConfig.textAnimation === 'fade'
                ? 'animate-fade-in delay-300'
                : ''
            }`}>
              {scene.subtitle}
            </p>
          )}

          {/* Content */}
          {(showContent || scene.animationConfig.textAnimation !== 'typewriter') && (
            <div className={`text-white/80 text-base md:text-lg max-w-2xl leading-relaxed ${
              scene.animationConfig.textAnimation === 'slide' 
                ? 'animate-slide-in-up delay-600' 
                : scene.animationConfig.textAnimation === 'fade'
                ? 'animate-fade-in delay-600'
                : ''
            }`}>
              {scene.content.split('\n').map((line, index) => (
                <p key={index} className="mb-4">
                  {line}
                </p>
              ))}
            </div>
          )}

          {/* CTA Button */}
          {scene.cta && (showContent || scene.animationConfig.textAnimation !== 'typewriter') && (
            <div className={`pt-6 ${
              scene.animationConfig.textAnimation === 'slide' 
                ? 'animate-slide-in-up delay-900' 
                : scene.animationConfig.textAnimation === 'fade'
                ? 'animate-fade-in delay-900'
                : ''
            }`}>
              <Button
                size="lg"
                className="bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-sm transition-all duration-300 hover:scale-105"
                onClick={() => {
                  if (sceneIndex < totalScenes - 1) {
                    window.scrollTo({
                      top: window.scrollY + window.innerHeight,
                      behavior: 'smooth'
                    });
                  }
                }}
              >
                {scene.cta.text}
                <ArrowDown className="ml-2 w-5 h-5" />
              </Button>
            </div>
          )}

          {/* Progress indicator */}
          <div className="absolute bottom-8 right-8 text-white/50 text-sm">
            {sceneIndex + 1} / {totalScenes}
          </div>
        </div>
      </div>

      {/* Minimal floating elements */}
      {scene.type === 'hero' && (
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white/20 rounded-full animate-pulse"
              style={{
                left: `${20 + Math.random() * 60}%`,
                top: `${20 + Math.random() * 60}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};