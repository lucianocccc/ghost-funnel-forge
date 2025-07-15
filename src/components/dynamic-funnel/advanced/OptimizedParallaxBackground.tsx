
import React, { useEffect, useRef, useState, useMemo } from 'react';

interface ParallaxElement {
  id: string;
  type: 'particle' | 'object' | 'texture';
  element: string;
  x: number;
  y: number;
  speed: number;
  size: number;
  rotation: number;
  opacity: number;
}

interface OptimizedParallaxBackgroundProps {
  productName: string;
  industry: string;
  theme: any;
  scrollPosition: number;
}

export const OptimizedParallaxBackground: React.FC<OptimizedParallaxBackgroundProps> = ({
  productName, industry, theme, scrollPosition
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const elementsRef = useRef<ParallaxElement[]>([]);
  const [elements, setElements] = useState<ParallaxElement[]>([]);
  const lastScrollRef = useRef(0);

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

  // Memoize element types to prevent recalculation
  const elementTypes = useMemo(() => {
    if (productName.toLowerCase().includes('mirtill') || productName.toLowerCase().includes('berry')) {
      return ['🫐', '💜', '⚫'];
    } else if (productName.toLowerCase().includes('farina') || productName.toLowerCase().includes('bread')) {
      return ['🌾', '🍞', '⚪'];
    } else if (productName.toLowerCase().includes('latte') || productName.toLowerCase().includes('milk')) {
      return ['🥛', '⚪', '💧'];
    } else if (productName.toLowerCase().includes('yoga') || productName.toLowerCase().includes('fitness')) {
      return ['🧘‍♀️', '🧘‍♂️', '💪', '🏃‍♀️'];
    } else if (productName.toLowerCase().includes('coffee') || productName.toLowerCase().includes('caffè')) {
      return ['☕', '🫘', '💨'];
    } else if (productName.toLowerCase().includes('tech') || productName.toLowerCase().includes('app')) {
      return ['💻', '📱', '⚡', '🔮'];
    } else {
      return ['✨', '⭐', '💫', '🌟'];
    }
  }, [productName]);

  useEffect(() => {
    // Generate elements only once
    if (elementsRef.current.length === 0) {
      const newElements: ParallaxElement[] = [];
      const elementCount = 60; // Reduced from 80 for better performance

      for (let i = 0; i < elementCount; i++) {
        newElements.push({
          id: `element-${i}`,
          type: Math.random() > 0.7 ? 'object' : 'particle',
          element: elementTypes[Math.floor(Math.random() * elementTypes.length)],
          x: Math.random() * 100,
          y: Math.random() * 200 - 50,
          speed: 0.1 + Math.random() * 0.3, // Reduced speed for smoother animation
          size: 16 + Math.random() * 24, // Reduced size range
          rotation: Math.random() * 360,
          opacity: 0.4 + Math.random() * 0.4
        });
      }

      elementsRef.current = newElements;
      setElements(newElements);
    }
  }, [elementTypes]);

  const getElementStyle = (element: ParallaxElement) => {
    // Only update if scroll difference is significant
    const scrollDiff = Math.abs(scrollPosition - lastScrollRef.current);
    if (scrollDiff < 5) {
      return {}; // Return empty object to prevent unnecessary updates
    }

    const scrollOffset = scrollPosition * element.speed;
    const y = element.y + scrollOffset;
    const adjustedY = y > window.innerHeight + 100 ? y - window.innerHeight - 200 : y;
    
    return {
      transform: `translate3d(${element.x}%, ${adjustedY}px, 0) rotate(${element.rotation + scrollPosition * 0.05}deg)`,
      fontSize: `${element.size}px`,
      opacity: element.opacity,
      willChange: 'transform', // Optimize for animations
    };
  };

  useEffect(() => {
    lastScrollRef.current = scrollPosition;
  }, [scrollPosition]);

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 overflow-hidden -z-10"
      style={{
        background: backgroundStyle,
        backfaceVisibility: 'hidden', // Prevent flickering
        perspective: 1000,
      }}
    >
      {/* Animated background texture with reduced opacity */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255,255,255,0.2) 2px, transparent 2px)`,
          backgroundSize: '80px 80px',
          transform: `translate3d(0, ${scrollPosition * 0.05}px, 0)`,
          willChange: 'transform',
        }}
      />

      {/* Optimized parallax elements */}
      {elements.map((element) => (
        <div
          key={element.id}
          className="absolute select-none pointer-events-none"
          style={{
            left: `${element.x}%`,
            top: `${element.y}px`,
            ...getElementStyle(element),
            zIndex: element.type === 'object' ? 2 : 1,
            filter: element.type === 'object' ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' : 'none'
          }}
        >
          {element.element}
        </div>
      ))}

      {/* Subtle overlay for better text readability */}
      <div 
        className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-transparent"
        style={{ pointerEvents: 'none' }}
      />
    </div>
  );
};
