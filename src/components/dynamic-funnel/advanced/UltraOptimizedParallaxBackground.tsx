
import React, { memo, useMemo } from 'react';
import { UltraStabilizedParallax } from '../performance/UltraStabilizedParallax';
import { useUltraStableScroll } from '@/hooks/useUltraStableScroll';

interface UltraOptimizedParallaxBackgroundProps {
  productName: string;
  industry: string;
  theme: any;
}

export const UltraOptimizedParallaxBackground = memo<UltraOptimizedParallaxBackgroundProps>(({
  productName, 
  industry, 
  theme
}) => {
  const { ultraSmoothScrollY } = useUltraStableScroll({
    throttleMs: 6,
    smoothing: 0.08
  });

  // Background statico - nessun ricalcolo
  const backgroundStyle = useMemo(() => {
    const productLower = productName.toLowerCase();
    
    if (productLower.includes('mirtill') || productLower.includes('berry')) {
      return 'linear-gradient(45deg, #4c1d95, #1e1b4b)';
    } else if (productLower.includes('farina') || productLower.includes('bread')) {
      return 'linear-gradient(45deg, #92400e, #d97706)';
    } else if (productLower.includes('yoga') || productLower.includes('fitness')) {
      return 'linear-gradient(45deg, #047857, #059669)';
    } else if (productLower.includes('coffee') || productLower.includes('caffè')) {
      return 'linear-gradient(45deg, #451a03, #7c2d12)';
    } else if (productLower.includes('tech') || productLower.includes('app')) {
      return 'linear-gradient(45deg, #1e1b4b, #3730a3)';
    } else {
      return 'linear-gradient(45deg, #581c87, #7c3aed)';
    }
  }, [productName]);

  // Elementi minimalisti per massime performance
  const minimalElements = useMemo(() => {
    const productLower = productName.toLowerCase();
    const elements = productLower.includes('mirtill') || productLower.includes('berry') ? 
      ['🫐', '💜'] :
      productLower.includes('farina') || productLower.includes('bread') ? 
      ['🌾', '🍞'] :
      productLower.includes('yoga') || productLower.includes('fitness') ? 
      ['🧘‍♀️', '💪'] :
      productLower.includes('coffee') || productLower.includes('caffè') ? 
      ['☕', '🫘'] :
      productLower.includes('tech') || productLower.includes('app') ? 
      ['💻', '⚡'] :
      ['✨', '⭐'];

    return Array.from({ length: 6 }, (_, i) => ({
      id: i,
      element: elements[i % elements.length],
      x: (i * 18) + 10,
      y: (i * 15) + 15,
      size: 16 + (i * 2),
      opacity: 0.15 + (i * 0.05)
    }));
  }, [productName]);

  return (
    <div 
      className="fixed inset-0 overflow-hidden -z-10"
      style={{
        background: backgroundStyle,
        contain: 'layout style paint',
        transform: 'translateZ(0)',
      }}
    >
      {/* Texture di sfondo ultra-leggera */}
      <UltraStabilizedParallax ultraSmoothScrollY={ultraSmoothScrollY} speed={0.005}>
        <div 
          className="absolute inset-0 opacity-3"
          style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255,255,255,0.05) 1px, transparent 1px)`,
            backgroundSize: '80px 80px',
            contain: 'layout style paint',
          }}
        />
      </UltraStabilizedParallax>

      {/* Elementi parallax ultra-ottimizzati */}
      <UltraStabilizedParallax ultraSmoothScrollY={ultraSmoothScrollY} speed={0.015}>
        <div className="absolute inset-0">
          {minimalElements.map((element) => (
            <div
              key={element.id}
              className="absolute select-none pointer-events-none"
              style={{
                left: `${element.x}%`,
                top: `${element.y}%`,
                fontSize: `${element.size}px`,
                opacity: element.opacity,
                contain: 'layout style paint',
                transform: 'translateZ(0)',
              }}
            >
              {element.element}
            </div>
          ))}
        </div>
      </UltraStabilizedParallax>

      {/* Overlay sottilissimo */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/3 to-transparent pointer-events-none" />
    </div>
  );
});

UltraOptimizedParallaxBackground.displayName = 'UltraOptimizedParallaxBackground';
