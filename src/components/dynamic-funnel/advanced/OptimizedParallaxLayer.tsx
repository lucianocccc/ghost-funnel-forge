
import React, { memo, useMemo } from 'react';

interface OptimizedParallaxLayerProps {
  scrollY: number;
  speed: number;
  children: React.ReactNode;
  className?: string;
}

export const OptimizedParallaxLayer = memo<OptimizedParallaxLayerProps>(({ 
  scrollY, 
  speed, 
  children, 
  className = '' 
}) => {
  const transform = useMemo(() => {
    const translateY = scrollY * speed;
    return `translate3d(0, ${translateY}px, 0)`;
  }, [scrollY, speed]);

  return (
    <div 
      className={`absolute inset-0 ${className}`}
      style={{
        transform,
        willChange: 'transform',
        backfaceVisibility: 'hidden',
      }}
    >
      {children}
    </div>
  );
});

OptimizedParallaxLayer.displayName = 'OptimizedParallaxLayer';
