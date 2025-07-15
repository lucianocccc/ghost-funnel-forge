
import React, { memo, useMemo, useRef, useEffect } from 'react';

interface StabilizedParallaxProps {
  children: React.ReactNode;
  speed: number;
  smoothScrollY: number;
  className?: string;
  style?: React.CSSProperties;
}

export const StabilizedParallax = memo<StabilizedParallaxProps>(({
  children,
  speed,
  smoothScrollY,
  className = '',
  style = {}
}) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const lastTransform = useRef<string>('');

  // Memoizza il transform per evitare ricalcoli
  const transform = useMemo(() => {
    const translateY = smoothScrollY * speed;
    return `translate3d(0, ${translateY}px, 0)`;
  }, [smoothScrollY, speed]);

  // Applica il transform solo se cambiato
  useEffect(() => {
    if (!elementRef.current || transform === lastTransform.current) return;
    
    elementRef.current.style.transform = transform;
    lastTransform.current = transform;
  }, [transform]);

  const combinedStyle = useMemo(() => ({
    ...style,
    willChange: 'transform',
    backfaceVisibility: 'hidden' as const,
    perspective: '1000px',
    transformStyle: 'preserve-3d' as const
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

StabilizedParallax.displayName = 'StabilizedParallax';
