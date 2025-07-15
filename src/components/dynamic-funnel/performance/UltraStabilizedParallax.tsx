
import React, { memo, useMemo, useRef, useEffect } from 'react';

interface UltraStabilizedParallaxProps {
  children: React.ReactNode;
  speed: number;
  ultraSmoothScrollY: number;
  className?: string;
  style?: React.CSSProperties;
}

export const UltraStabilizedParallax = memo<UltraStabilizedParallaxProps>(({
  children,
  speed,
  ultraSmoothScrollY,
  className = '',
  style = {}
}) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const lastTransform = useRef<string>('');
  const transformRef = useRef<string>('');

  // Calcola transform con precisione sub-pixel
  const transform = useMemo(() => {
    const translateY = Math.round(ultraSmoothScrollY * speed * 100) / 100;
    return `translate3d(0, ${translateY}px, 0)`;
  }, [ultraSmoothScrollY, speed]);

  // Applica transform solo se necessario
  useEffect(() => {
    if (!elementRef.current || transform === lastTransform.current) return;
    
    // Usa will-change solo durante l'animazione
    elementRef.current.style.willChange = 'transform';
    elementRef.current.style.transform = transform;
    
    transformRef.current = transform;
    lastTransform.current = transform;
    
    // Rimuovi will-change dopo un breve delay
    const timeout = setTimeout(() => {
      if (elementRef.current) {
        elementRef.current.style.willChange = 'auto';
      }
    }, 100);
    
    return () => clearTimeout(timeout);
  }, [transform]);

  const combinedStyle = useMemo(() => ({
    ...style,
    backfaceVisibility: 'hidden' as const,
    perspective: '1000px',
    transformStyle: 'preserve-3d' as const,
    contain: 'layout style paint' as const
  }), [style]);

  return (
    <div
      ref={elementRef}
      className={`absolute inset-0 ${className}`}
      style={combinedStyle}
    >
      {children}
    </div>
  );
});

UltraStabilizedParallax.displayName = 'UltraStabilizedParallax';
