import React, { useEffect, useRef, useState } from 'react';

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

interface DynamicParallaxBackgroundProps {
  productName: string;
  industry: string;
  theme: any;
  scrollPosition: number;
}

export const DynamicParallaxBackground: React.FC<DynamicParallaxBackgroundProps> = ({
  productName, industry, theme, scrollPosition
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [elements, setElements] = useState<ParallaxElement[]>([]);

  useEffect(() => {
    generateParallaxElements();
  }, [productName, industry]);

  const generateParallaxElements = () => {
    const newElements: ParallaxElement[] = [];
    const elementCount = 80;

    // Determine element type based on product
    let elementTypes: string[] = [];
    let backgroundStyle = '';

    if (productName.toLowerCase().includes('mirtill') || productName.toLowerCase().includes('berry')) {
      elementTypes = ['🫐', '💜', '⚫'];
      backgroundStyle = 'linear-gradient(45deg, #4c1d95, #1e1b4b, #312e81)';
    } else if (productName.toLowerCase().includes('farina') || productName.toLowerCase().includes('bread') || productName.toLowerCase().includes('pane')) {
      elementTypes = ['🌾', '🍞', '⚪'];
      backgroundStyle = 'linear-gradient(45deg, #92400e, #d97706, #f59e0b)';
    } else if (productName.toLowerCase().includes('latte') || productName.toLowerCase().includes('milk')) {
      elementTypes = ['🥛', '⚪', '💧'];
      backgroundStyle = 'linear-gradient(45deg, #f8fafc, #e2e8f0, #cbd5e1)';
    } else if (productName.toLowerCase().includes('yoga') || productName.toLowerCase().includes('fitness') || productName.toLowerCase().includes('sport')) {
      elementTypes = ['🧘‍♀️', '🧘‍♂️', '💪', '🏃‍♀️'];
      backgroundStyle = 'linear-gradient(45deg, #047857, #059669, #10b981)';
    } else if (productName.toLowerCase().includes('coffee') || productName.toLowerCase().includes('caffè')) {
      elementTypes = ['☕', '🫘', '💨'];
      backgroundStyle = 'linear-gradient(45deg, #451a03, #7c2d12, #a16207)';
    } else if (productName.toLowerCase().includes('tech') || productName.toLowerCase().includes('app')) {
      elementTypes = ['💻', '📱', '⚡', '🔮'];
      backgroundStyle = 'linear-gradient(45deg, #1e1b4b, #3730a3, #4f46e5)';
    } else {
      elementTypes = ['✨', '⭐', '💫', '🌟'];
      backgroundStyle = 'linear-gradient(45deg, #581c87, #7c3aed, #a855f7)';
    }

    for (let i = 0; i < elementCount; i++) {
      newElements.push({
        id: `element-${i}`,
        type: Math.random() > 0.7 ? 'object' : 'particle',
        element: elementTypes[Math.floor(Math.random() * elementTypes.length)],
        x: Math.random() * 100,
        y: Math.random() * 200 - 50,
        speed: 0.2 + Math.random() * 0.8,
        size: 20 + Math.random() * 40,
        rotation: Math.random() * 360,
        opacity: 0.3 + Math.random() * 0.7
      });
    }

    setElements(newElements);

    // Apply background to container
    if (containerRef.current) {
      containerRef.current.style.background = backgroundStyle;
    }
  };

  const getElementStyle = (element: ParallaxElement) => {
    const scrollOffset = scrollPosition * element.speed;
    const y = element.y + scrollOffset;
    
    // Reset position when element goes off screen
    const adjustedY = y > window.innerHeight + 100 ? y - window.innerHeight - 200 : y;
    
    return {
      position: 'absolute' as const,
      left: `${element.x}%`,
      top: `${adjustedY}px`,
      fontSize: `${element.size}px`,
      opacity: element.opacity,
      transform: `rotate(${element.rotation + scrollPosition * 0.1}deg)`,
      transition: 'none',
      pointerEvents: 'none' as const,
      zIndex: element.type === 'object' ? 2 : 1,
      filter: element.type === 'object' ? 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' : 'none'
    };
  };

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 overflow-hidden -z-10"
      style={{
        background: 'linear-gradient(45deg, #581c87, #7c3aed, #a855f7)'
      }}
    >
      {/* Animated background texture */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255,255,255,0.3) 2px, transparent 2px),
                           radial-gradient(circle at 75% 75%, rgba(255,255,255,0.2) 1px, transparent 1px)`,
          backgroundSize: '100px 100px, 50px 50px',
          transform: `translateY(${scrollPosition * 0.1}px)`,
          animation: 'float 20s ease-in-out infinite'
        }}
      />

      {/* Parallax elements */}
      {elements.map((element) => (
        <div
          key={element.id}
          style={getElementStyle(element)}
          className="select-none"
        >
          {element.element}
        </div>
      ))}

      {/* Overlay gradient for text readability */}
      <div 
        className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-transparent"
        style={{
          background: `linear-gradient(to bottom, 
            rgba(0,0,0,0.1) 0%, 
            rgba(0,0,0,0.2) 50%, 
            rgba(0,0,0,0.1) 100%)`
        }}
      />

      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(${scrollPosition * 0.1}px) translateX(0px);
          }
          50% {
            transform: translateY(${scrollPosition * 0.1}px) translateX(10px);
          }
        }
      `}</style>
    </div>
  );
};