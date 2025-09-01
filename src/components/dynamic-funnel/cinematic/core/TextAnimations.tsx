import React, { useEffect, useState, useRef } from 'react';
import { CinematicScene } from './types';
import { ExtractedAIContent } from '@/utils/aiContentExtractor';

interface TextAnimationsProps {
  scene: CinematicScene;
  scrollProgress: number;
  isActive: boolean;
  sceneIndex: number;
  totalScenes: number;
  aiContent?: ExtractedAIContent;
}

export const TextAnimations: React.FC<TextAnimationsProps> = ({
  scene,
  scrollProgress,
  isActive,
  sceneIndex,
  totalScenes,
  aiContent
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [typedTitle, setTypedTitle] = useState('');
  const [typedSubtitle, setTypedSubtitle] = useState('');
  const [showContent, setShowContent] = useState(false);
  const typewriterTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (isActive) {
      setIsVisible(true);
      
      if (scene.animationConfig.textAnimation === 'typewriter') {
        typewriterAnimation();
      } else {
        setTypedTitle(scene.title);
        setTypedSubtitle(scene.subtitle);
        setTimeout(() => setShowContent(true), 300);
      }
    } else {
      setIsVisible(false);
      setShowContent(false);
      setTypedTitle('');
      setTypedSubtitle('');
    }

    return () => {
      if (typewriterTimeoutRef.current) {
        clearTimeout(typewriterTimeoutRef.current);
      }
    };
  }, [isActive, scene]);

  const typewriterAnimation = () => {
    setTypedTitle('');
    setTypedSubtitle('');
    setShowContent(false);

    const currentTitle = aiContent?.title || scene.title;
    const currentSubtitle = aiContent?.subtitle || scene.subtitle;

    // Type title
    let titleIndex = 0;
    const typeTitle = () => {
      if (titleIndex < currentTitle.length) {
        setTypedTitle(currentTitle.substring(0, titleIndex + 1));
        titleIndex++;
        typewriterTimeoutRef.current = setTimeout(typeTitle, 50);
      } else {
        // Start typing subtitle
        setTimeout(() => {
          let subtitleIndex = 0;
          const typeSubtitle = () => {
            if (subtitleIndex < currentSubtitle.length) {
              setTypedSubtitle(currentSubtitle.substring(0, subtitleIndex + 1));
              subtitleIndex++;
              typewriterTimeoutRef.current = setTimeout(typeSubtitle, 30);
            } else {
              // Show content
              setTimeout(() => setShowContent(true), 200);
            }
          };
          typeSubtitle();
        }, 200);
      }
    };
    typeTitle();
  };

  const getAnimationClasses = () => {
    const base = "transition-all duration-700 ease-out";
    
    if (!isVisible) {
      return `${base} opacity-0 transform translate-y-8`;
    }

    switch (scene.animationConfig.textAnimation) {
      case 'slide':
        return `${base} opacity-100 transform translate-y-0`;
      case 'fade':
        return `${base} opacity-100`;
      case 'typewriter':
        return `${base} opacity-100`;
      default:
        return `${base} opacity-100 transform translate-y-0`;
    }
  };

  const getTextPosition = () => {
    switch (scene.type) {
      case 'hero':
        return 'justify-center items-center text-center';
      case 'conversion':
        return 'justify-center items-center text-center';
      default:
        return 'justify-center items-center text-center';
    }
  };

  const getTextSizes = () => {
    switch (scene.type) {
      case 'hero':
        return {
          title: 'text-4xl md:text-6xl lg:text-7xl font-bold',
          subtitle: 'text-lg md:text-xl lg:text-2xl',
          content: 'text-base md:text-lg'
        };
      case 'conversion':
        return {
          title: 'text-3xl md:text-5xl lg:text-6xl font-bold',
          subtitle: 'text-lg md:text-xl',
          content: 'text-base md:text-lg'
        };
      default:
        return {
          title: 'text-2xl md:text-4xl lg:text-5xl font-bold',
          subtitle: 'text-base md:text-lg lg:text-xl',
          content: 'text-sm md:text-base lg:text-lg'
        };
    }
  };

  const textSizes = getTextSizes();

  // Use AI content if available, fallback to scene content
  const displayTitle = aiContent?.title || scene.title;
  const displaySubtitle = aiContent?.subtitle || scene.subtitle;
  const displayContent = aiContent?.content || scene.content;
  const displayCTA = aiContent?.cta || scene.cta;

  return (
    <div className={`absolute inset-0 flex flex-col ${getTextPosition()} p-6 md:p-12 z-20`}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Title */}
        <h1 className={`
          ${textSizes.title} 
          ${getAnimationClasses()}
          text-white font-bold tracking-tight
          ${scene.animationConfig.textAnimation === 'typewriter' ? 'border-r-2 border-white animate-pulse' : ''}
        `}>
          {scene.animationConfig.textAnimation === 'typewriter' ? typedTitle : displayTitle}
        </h1>

        {/* Subtitle */}
        <p className={`
          ${textSizes.subtitle}
          ${getAnimationClasses()}
          text-white/90 font-medium
          ${scene.animationConfig.textAnimation === 'typewriter' && typedTitle === displayTitle ? 'border-r-2 border-white/70 animate-pulse' : ''}
        `}
          style={{ transitionDelay: '200ms' }}
        >
          {scene.animationConfig.textAnimation === 'typewriter' ? typedSubtitle : displaySubtitle}
        </p>

        {/* Content */}
        <div className={`
          ${textSizes.content}
          ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
          transition-all duration-500 ease-out
          text-white/80 leading-relaxed max-w-2xl mx-auto
        `}
          style={{ transitionDelay: '400ms' }}
        >
          {displayContent}
        </div>

        {/* CTA Button */}
        {displayCTA && scene.type === 'hero' && (
          <div className={`
            ${showContent ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'}
            transition-all duration-500 ease-out pt-4
          `}
            style={{ transitionDelay: '600ms' }}
          >
            <button 
              className="
                px-8 py-4 bg-white/10 hover:bg-white/20 
                border border-white/20 hover:border-white/40
                text-white font-semibold rounded-lg
                transition-all duration-300 ease-out
                hover:scale-105 hover:shadow-2xl
                backdrop-blur-sm
              "
              onClick={() => {
                if (displayCTA?.action === 'scroll') {
                  window.scrollBy({ top: window.innerHeight, behavior: 'smooth' });
                }
              }}
            >
              {displayCTA.text}
            </button>
          </div>
        )}

        {/* Scene indicator for hero */}
        {scene.type === 'hero' && (
          <div className={`
            ${showContent ? 'opacity-70' : 'opacity-0'}
            transition-all duration-700 ease-out
            pt-8 flex items-center justify-center space-x-2
          `}
            style={{ transitionDelay: '800ms' }}
          >
            <div className="text-white/60 text-sm">Scorri per continuare</div>
            <div className="w-6 h-10 border-2 border-white/40 rounded-full flex justify-center">
              <div className="w-1 h-3 bg-white/60 rounded-full animate-bounce mt-2"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};