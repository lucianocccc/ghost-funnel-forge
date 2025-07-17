
// Cinematic Particle System - Advanced floating particles

import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface ParticleConfig {
  type: 'floating' | 'glow' | 'geometric';
  density: number;
  color: string;
}

interface CinematicParticleSystemProps {
  config: ParticleConfig;
  performanceMode: 'high' | 'medium' | 'low';
}

export const CinematicParticleSystem: React.FC<CinematicParticleSystemProps> = ({
  config,
  performanceMode
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Adjust particle count based on performance mode
  const particleCount = Math.floor(
    config.density * 
    (performanceMode === 'high' ? 1 : performanceMode === 'medium' ? 0.6 : 0.3)
  );

  const particles = Array.from({ length: particleCount }, (_, i) => ({
    id: i,
    initialX: Math.random() * 100,
    initialY: Math.random() * 100,
    size: Math.random() * 4 + 2,
    duration: Math.random() * 20 + 10,
    delay: Math.random() * 5,
  }));

  const getParticleElement = (type: string) => {
    switch (type) {
      case 'floating':
        return '✨';
      case 'glow':
        return '💫';
      case 'geometric':
        return '◆';
      default:
        return '•';
    }
  };

  return (
    <div 
      ref={containerRef}
      className="absolute inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 1 }}
    >
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute select-none"
          initial={{
            x: `${particle.initialX}vw`,
            y: `${particle.initialY}vh`,
            opacity: 0,
            scale: 0
          }}
          animate={{
            x: `${particle.initialX + (Math.random() - 0.5) * 20}vw`,
            y: `${particle.initialY - 20}vh`,
            opacity: [0, 0.6, 0],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            fontSize: `${particle.size}px`,
            color: config.color,
            filter: config.type === 'glow' ? 'blur(0.5px)' : 'none',
            textShadow: config.type === 'glow' ? `0 0 ${particle.size * 2}px ${config.color}` : 'none',
          }}
        >
          {getParticleElement(config.type)}
        </motion.div>
      ))}
    </div>
  );
};
