import React, { memo, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface UltraFluidTextRendererProps {
  text: string;
  visibility: number;
  morphProgress: number;
  anticipationLevel: number;
  motionBlur: number;
  className?: string;
  type?: 'title' | 'description' | 'label';
}

export const UltraFluidTextRenderer = memo<UltraFluidTextRendererProps>(({
  text,
  visibility,
  morphProgress,
  anticipationLevel,
  motionBlur,
  className = '',
  type = 'description'
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousText = useRef(text);
  
  // Split text into words for staggered animations
  const words = useMemo(() => text.split(' '), [text]);
  
  // Detect if text has changed for morphing
  const hasTextChanged = previousText.current !== text;
  
  useEffect(() => {
    previousText.current = text;
  }, [text]);

  // Calculate stagger delay for words
  const getWordDelay = (index: number) => {
    const baseDelay = index * 0.03;
    const anticipationAdjustment = anticipationLevel * 0.02;
    return baseDelay + anticipationAdjustment;
  };

  // Motion blur filter
  const motionBlurFilter = motionBlur > 0.5 ? `blur(${Math.min(motionBlur, 4)}px)` : 'none';

  // Base typography classes by type
  const getTypeClasses = () => {
    switch (type) {
      case 'title':
        return 'text-4xl md:text-6xl font-bold tracking-tight';
      case 'label':
        return 'text-sm uppercase tracking-wider font-medium';
      default:
        return 'text-lg md:text-xl leading-relaxed';
    }
  };

  const containerVariants = {
    hidden: { 
      opacity: 0,
      scale: 0.98,
      filter: motionBlurFilter
    },
    visible: { 
      opacity: visibility,
      scale: 1,
      filter: motionBlurFilter,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94] as const,
        staggerChildren: 0.03,
        delayChildren: anticipationLevel * 0.1
      }
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      filter: `blur(${motionBlur + 2}px)`,
      transition: {
        duration: 0.4,
        ease: [0.55, 0.085, 0.68, 0.53] as const
      }
    }
  };

  const wordVariants = {
    hidden: { 
      opacity: 0,
      y: 20,
      scale: 0.9,
      filter: 'blur(2px)'
    },
    visible: (index: number) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      filter: 'blur(0px)',
      transition: {
        duration: 0.5,
        delay: getWordDelay(index),
        ease: [0.25, 0.46, 0.45, 0.94] as const
      }
    }),
    morphing: {
      opacity: 1 - morphProgress,
      scale: 1 - morphProgress * 0.1,
      filter: `blur(${morphProgress * 3}px)`,
      transition: {
        duration: 0.3,
        ease: [0.55, 0.085, 0.68, 0.53] as const
      }
    }
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <AnimatePresence mode="wait">
        <motion.div
          key={text}
          variants={containerVariants}
          initial="hidden"
          animate={visibility > 0.1 ? "visible" : "hidden"}
          exit="exit"
          className={`${getTypeClasses()} text-white/90`}
          style={{
            willChange: 'transform, opacity, filter',
            backfaceVisibility: 'hidden',
            perspective: '1000px'
          }}
        >
          {words.map((word, index) => (
            <motion.span
              key={`${word}-${index}`}
              custom={index}
              variants={wordVariants}
              initial="hidden"
              animate={
                morphProgress > 0.1 ? "morphing" : 
                visibility > 0.1 ? "visible" : "hidden"
              }
              className="inline-block mr-2"
              style={{
                transformOrigin: 'center bottom',
                contain: 'layout style paint'
              }}
            >
              {word}
            </motion.span>
          ))}
        </motion.div>
      </AnimatePresence>
      
      {/* Subtle glow effect for active text */}
      {visibility > 0.8 && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: visibility * 0.1,
            scale: 1 + anticipationLevel * 0.02
          }}
          transition={{ duration: 1, ease: "easeOut" }}
          style={{
            background: `radial-gradient(ellipse at center, 
              hsla(var(--primary) / 0.15) 0%, 
              transparent 70%)`,
            filter: 'blur(20px)',
            zIndex: -1
          }}
        />
      )}
    </div>
  );
});

UltraFluidTextRenderer.displayName = 'UltraFluidTextRenderer';