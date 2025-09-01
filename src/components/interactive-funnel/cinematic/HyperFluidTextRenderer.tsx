import React, { memo, useMemo, useRef, useEffect, useCallback } from 'react';

interface HyperFluidTextRendererProps {
  text: string;
  visibility: number;
  morphProgress: number;
  anticipationLevel: number;
  motionBlur: number;
  className?: string;
  type?: 'title' | 'description' | 'label';
  subPixelAccuracy?: boolean;
}

interface LetterMetrics {
  char: string;
  opacity: number;
  scale: number;
  translateY: number;
  translateX: number;
  rotateZ: number;
  blur: number;
}

export const HyperFluidTextRenderer = memo<HyperFluidTextRendererProps>(({
  text,
  visibility,
  morphProgress,
  anticipationLevel,
  motionBlur,
  className = '',
  type = 'description',
  subPixelAccuracy = true
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();
  const letterRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const previousText = useRef(text);
  const morphingLetters = useRef<Map<string, LetterMetrics>>(new Map());
  
  // Split text into individual characters for maximum control
  const characters = useMemo(() => text.split(''), [text]);
  
  // Detect text changes for morphing
  const hasTextChanged = previousText.current !== text;
  
  // Calculate letter-by-letter animations
  const calculateLetterMetrics = useCallback((charIndex: number, totalChars: number): LetterMetrics => {
    const baseDelay = charIndex * 0.008; // Microsecond precision
    const anticipationAdjustment = anticipationLevel * 0.003;
    const normalizedDelay = (baseDelay + anticipationAdjustment) / totalChars;
    
    // Wave-like entrance effect
    const wavePhase = (charIndex / totalChars) * Math.PI * 2;
    const waveAmplitude = 0.1;
    
    // Calculate visibility with wave offset
    const adjustedVisibility = Math.max(0, Math.min(1, 
      visibility - normalizedDelay + Math.sin(wavePhase) * waveAmplitude
    ));
    
    // Quantum easing for ultra-smooth transitions
    const easedVisibility = adjustedVisibility < 0.5 
      ? 4 * adjustedVisibility * adjustedVisibility * adjustedVisibility
      : 1 - Math.pow(-2 * adjustedVisibility + 2, 3) / 2;
    
    // Morphing calculations
    const morphFactor = morphProgress * (1 - charIndex / totalChars);
    
    return {
      char: characters[charIndex],
      opacity: easedVisibility * (1 - morphFactor),
      scale: 0.8 + (easedVisibility * 0.2) - (morphFactor * 0.1),
      translateY: (1 - easedVisibility) * 15 + (morphFactor * 10),
      translateX: morphFactor * (Math.random() - 0.5) * 5,
      rotateZ: morphFactor * (Math.random() - 0.5) * 3,
      blur: (1 - easedVisibility) * 1.5 + (morphFactor * 2) + motionBlur
    };
  }, [characters, visibility, morphProgress, anticipationLevel, motionBlur]);
  
  // Real-time animation loop for butter-smooth rendering
  const animateLetters = useCallback(() => {
    if (!containerRef.current) return;
    
    letterRefs.current.forEach((letterRef, index) => {
      if (!letterRef) return;
      
      const metrics = calculateLetterMetrics(index, characters.length);
      
      // Apply transforms with hardware acceleration
      const transform = `
        translate3d(${metrics.translateX}px, ${metrics.translateY}px, 0)
        scale3d(${metrics.scale}, ${metrics.scale}, 1)
        rotateZ(${metrics.rotateZ}deg)
      `.replace(/\s+/g, ' ').trim();
      
      // Sub-pixel accuracy positioning
      if (subPixelAccuracy) {
        letterRef.style.transform = transform;
        letterRef.style.opacity = metrics.opacity.toFixed(4);
        letterRef.style.filter = `blur(${metrics.blur.toFixed(2)}px)`;
      } else {
        letterRef.style.transform = transform;
        letterRef.style.opacity = Math.round(metrics.opacity * 100) / 100 + '';
        letterRef.style.filter = `blur(${Math.round(metrics.blur)}px)`;
      }
      
      // Hardware acceleration hints
      letterRef.style.willChange = visibility > 0.1 ? 'transform, opacity, filter' : 'auto';
    });
    
    // Continue animation if needed
    if (visibility > 0 || morphProgress > 0) {
      animationRef.current = requestAnimationFrame(animateLetters);
    }
  }, [calculateLetterMetrics, characters.length, visibility, morphProgress, subPixelAccuracy]);
  
  // Start/stop animation based on visibility
  useEffect(() => {
    if (visibility > 0 || morphProgress > 0) {
      if (!animationRef.current) {
        animateLetters();
      }
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = undefined;
      }
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [visibility, morphProgress, animateLetters]);
  
  // Update previous text reference
  useEffect(() => {
    previousText.current = text;
  }, [text]);
  
  // Typography classes
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
  
  return (
    <div 
      ref={containerRef} 
      className={`relative ${className}`}
      style={{
        perspective: '1000px',
        transformStyle: 'preserve-3d'
      }}
    >
      <div className={`${getTypeClasses()} text-white/90 font-display`}>
        {characters.map((char, index) => (
          <span
            key={`${char}-${index}-${text.length}`}
            ref={(el) => {
              letterRefs.current[index] = el;
            }}
            className="inline-block"
            style={{
              transformOrigin: 'center bottom',
              backfaceVisibility: 'hidden',
              contain: 'layout style paint',
              fontKerning: 'auto',
              textRendering: 'optimizeLegibility'
            }}
          >
            {char === ' ' ? '\u00A0' : char}
          </span>
        ))}
      </div>
      
      {/* Quantum glow effect */}
      {visibility > 0.9 && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at center, 
              hsla(var(--primary) / ${visibility * 0.08}) 0%, 
              transparent 70%)`,
            filter: 'blur(25px)',
            zIndex: -1,
            transform: `scale(${1 + anticipationLevel * 0.01})`,
            transition: 'none' // Pure JS control
          }}
        />
      )}
    </div>
  );
});

HyperFluidTextRenderer.displayName = 'HyperFluidTextRenderer';