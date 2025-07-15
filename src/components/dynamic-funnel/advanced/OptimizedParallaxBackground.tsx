
import React, { memo, useMemo } from 'react';
import { OptimizedParallaxLayer } from './OptimizedParallaxLayer';

interface OptimizedParallaxBackgroundProps {
  productName: string;
  industry: string;
  theme: any;
  scrollPosition: number;
}

export const OptimizedParallaxBackground = memo<OptimizedParallaxBackgroundProps>(({
  productName, 
  industry, 
  theme, 
  scrollPosition
}) => {
  // Memoize background style to prevent recalculation
  const backgroundStyle = useMemo(() => {
    if (productName.toLowerCase().includes('mirtill') || productName.toLowerCase().includes('berry')) {
      return 'linear-gradient(45deg, #4c1d95, #1e1b4b, #312e81)';
    } else if (productName.toLowerCase().includes('farina') || productName.toLowerCase().includes('bread')) {
      return 'linear-gradient(45deg, #92400e, #d97706, #f59e0b)';
    } else if (productName.toLowerCase().includes('latte') || productName.toLowerCase().includes('milk')) {
      return 'linear-gradient(45deg, #f8fafc, #e2e8f0, #cbd5e1)';
    } else if (productName.toLowerCase().includes('yoga') || productName.toLowerCase().includes('fitness')) {
      return 'linear-gradient(45deg, #047857, #059669, #10b981)';
    } else if (productName.toLowerCase().includes('coffee') || productName.toLowerCase().includes('caffè')) {
      return 'linear-gradient(45deg, #451a03, #7c2d12, #a16207)';
    } else if (productName.toLowerCase().includes('tech') || productName.toLowerCase().includes('app')) {
      return 'linear-gradient(45deg, #1e1b4b, #3730a3, #4f46e5)';
    } else {
      return 'linear-gradient(45deg, #581c87, #7c3aed, #a855f7)';
    }
  }, [productName]);

  // Memoize elements to prevent recreation
  const staticElements = useMemo(() => {
    const elementTypes = productName.toLowerCase().includes('mirtill') || productName.toLowerCase().includes('berry') ? 
      ['🫐', '💜', '⚫'] :
      productName.toLowerCase().includes('farina') || productName.toLowerCase().includes('bread') ? 
      ['🌾', '🍞', '⚪'] :
      productName.toLowerCase().includes('latte') || productName.toLowerCase().includes('milk') ? 
      ['🥛', '⚪', '💧'] :
      productName.toLowerCase().includes('yoga') || productName.toLowerCase().includes('fitness') ? 
      ['🧘‍♀️', '🧘‍♂️', '💪', '🏃‍♀️'] :
      productName.toLowerCase().includes('coffee') || productName.toLowerCase().includes('caffè') ? 
      ['☕', '🫘', '💨'] :
      productName.toLowerCase().includes('tech') || productName.toLowerCase().includes('app') ? 
      ['💻', '📱', '⚡', '🔮'] :
      ['✨', '⭐', '💫', '🌟'];

    return Array.from({ length: 20 }, (_, i) => ({
      id: i,
      element: elementTypes[Math.floor(Math.random() * elementTypes.length)],
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 16 + Math.random() * 16,
      opacity: 0.3 + Math.random() * 0.4,
      speed: 0.1 + Math.random() * 0.2
    }));
  }, [productName]);

  return (
    <div 
      className="fixed inset-0 overflow-hidden -z-10"
      style={{
        background: backgroundStyle,
        backfaceVisibility: 'hidden',
        transform: 'translateZ(0)',
      }}
    >
      {/* Static background texture */}
      <OptimizedParallaxLayer scrollY={scrollPosition} speed={0.02}>
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255,255,255,0.2) 2px, transparent 2px)`,
            backgroundSize: '80px 80px',
          }}
        />
      </OptimizedParallaxLayer>

      {/* Parallax elements */}
      <OptimizedParallaxLayer scrollY={scrollPosition} speed={0.05}>
        <div className="absolute inset-0">
          {staticElements.map((element) => (
            <div
              key={element.id}
              className="absolute select-none pointer-events-none"
              style={{
                left: `${element.x}%`,
                top: `${element.y}%`,
                fontSize: `${element.size}px`,
                opacity: element.opacity,
                transform: `translateZ(0)`,
                willChange: 'transform',
              }}
            >
              {element.element}
            </div>
          ))}
        </div>
      </OptimizedParallaxLayer>

      {/* Subtle overlay */}
      <div 
        className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-transparent pointer-events-none"
      />
    </div>
  );
});

OptimizedParallaxBackground.displayName = 'OptimizedParallaxBackground';
