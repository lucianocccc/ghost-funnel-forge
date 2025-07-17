
// Cinematic Parallax Background System

import React, { useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { CinematicScene } from '@/services/intelligentCinematicService';

interface CinematicParallaxBackgroundProps {
  scene: CinematicScene;
  performanceMode: 'high' | 'medium' | 'low';
}

export const CinematicParallaxBackground: React.FC<CinematicParallaxBackgroundProps> = ({
  scene,
  performanceMode
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();

  // Reduce parallax layers based on performance mode
  const activeLayers = scene.cinematicElements.parallaxLayers.slice(
    0, 
    performanceMode === 'high' ? scene.cinematicElements.parallaxLayers.length :
    performanceMode === 'medium' ? 2 : 1
  );

  return (
    <div 
      ref={containerRef}
      className="absolute inset-0 overflow-hidden"
      style={{ perspective: '1000px' }}
    >
      {activeLayers.map((layer, index) => {
        const y = useTransform(
          scrollY, 
          [0, 1000], 
          [0, -1000 * layer.speed]
        );
        
        const rotate = useTransform(
          scrollY,
          [0, 1000],
          [0, performanceMode === 'high' ? 5 * layer.speed : 0]
        );

        return (
          <motion.div
            key={index}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            style={{
              y: performanceMode !== 'low' ? y : undefined,
              rotate: performanceMode === 'high' ? rotate : undefined,
              opacity: layer.opacity,
              scale: layer.scale,
              zIndex: activeLayers.length - index,
            }}
          >
            <motion.div
              className="text-6xl md:text-8xl lg:text-9xl select-none"
              animate={{
                scale: [1, 1.05, 1],
                opacity: [layer.opacity, layer.opacity * 1.2, layer.opacity],
              }}
              transition={{
                duration: 4 + (index * 0.5),
                repeat: Infinity,
                ease: "easeInOut",
              }}
              style={{
                filter: `blur(${index * 0.5}px)`,
                textShadow: '0 0 20px rgba(255,255,255,0.1)',
              }}
            >
              {layer.element}
            </motion.div>
          </motion.div>
        );
      })}

      {/* Gradient Overlay */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 50% 50%, transparent 0%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.3) 100%)`
        }}
      />
    </div>
  );
};
