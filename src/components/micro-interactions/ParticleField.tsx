import React, { useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
  direction: number;
  opacity: number;
  color: string;
}

interface ParticleFieldProps {
  className?: string;
  particleCount?: number;
  colors?: string[];
  minSize?: number;
  maxSize?: number;
  minSpeed?: number;
  maxSpeed?: number;
  interactive?: boolean;
  connectionDistance?: number;
  showConnections?: boolean;
}

export const ParticleField: React.FC<ParticleFieldProps> = ({
  className = '',
  particleCount = 50,
  colors = ['hsl(var(--primary))', 'hsl(var(--golden))', 'hsl(var(--accent))'],
  minSize = 2,
  maxSize = 6,
  minSpeed = 0.5,
  maxSpeed = 2,
  interactive = true,
  connectionDistance = 100,
  showConnections = true
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();
  const mouseRef = useRef({ x: 0, y: 0 });

  // Generate particles
  const particles = useMemo(() => {
    return Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * (maxSize - minSize) + minSize,
      speed: Math.random() * (maxSpeed - minSpeed) + minSpeed,
      direction: Math.random() * Math.PI * 2,
      opacity: Math.random() * 0.5 + 0.3,
      color: colors[Math.floor(Math.random() * colors.length)]
    }));
  }, [particleCount, colors, minSize, maxSize, minSpeed, maxSpeed]);

  // Mouse tracking for interactive effects
  useEffect(() => {
    if (!interactive) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      mouseRef.current = {
        x: ((e.clientX - rect.left) / rect.width) * 100,
        y: ((e.clientY - rect.top) / rect.height) * 100
      };
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, [interactive]);

  // Particle animation variants
  const getParticleAnimation = (particle: Particle, index: number) => ({
    x: [
      `${particle.x}%`,
      `${(particle.x + Math.cos(particle.direction) * 20) % 100}%`,
      `${particle.x}%`
    ],
    y: [
      `${particle.y}%`,
      `${(particle.y + Math.sin(particle.direction) * 20) % 100}%`,
      `${particle.y}%`
    ],
    scale: interactive ? [1, 1.5, 1] : [0.8, 1.2, 0.8],
    opacity: [particle.opacity, particle.opacity * 1.5, particle.opacity]
  });

  return (
    <div
      ref={containerRef}
      className={cn(
        'absolute inset-0 overflow-hidden pointer-events-none',
        'gpu-accelerated',
        className
      )}
    >
      {/* Particles */}
      {particles.map((particle, index) => (
        <motion.div
          key={particle.id}
          className="absolute w-1 h-1 rounded-full"
          style={{
            backgroundColor: particle.color,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            filter: 'blur(0.5px)',
            boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`
          }}
          initial={{
            x: `${particle.x}%`,
            y: `${particle.y}%`,
            opacity: 0
          }}
          animate={getParticleAnimation(particle, index)}
          transition={{
            duration: 10 + Math.random() * 10,
            repeat: Infinity,
            ease: 'linear',
            delay: index * 0.1,
            opacity: { duration: 2, repeat: Infinity, repeatType: 'reverse' }
          }}
        />
      ))}

      {/* Connection lines (SVG overlay) */}
      {showConnections && (
        <svg
          className="absolute inset-0 w-full h-full"
          style={{ zIndex: -1 }}
        >
          {particles.map((particle1, i) =>
            particles.slice(i + 1).map((particle2, j) => {
              const distance = Math.sqrt(
                Math.pow(particle1.x - particle2.x, 2) +
                Math.pow(particle1.y - particle2.y, 2)
              );

              if (distance < connectionDistance / 5) { // Scale for percentage units
                return (
                  <motion.line
                    key={`${i}-${j}`}
                    x1={`${particle1.x}%`}
                    y1={`${particle1.y}%`}
                    x2={`${particle2.x}%`}
                    y2={`${particle2.y}%`}
                    stroke={particle1.color}
                    strokeWidth="1"
                    strokeOpacity={0.1}
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatType: 'reverse',
                      ease: 'easeInOut'
                    }}
                  />
                );
              }
              return null;
            })
          )}
        </svg>
      )}

      {/* Interactive glow effect */}
      {interactive && (
        <motion.div
          className="absolute w-20 h-20 rounded-full pointer-events-none"
          style={{
            background: `radial-gradient(circle, ${colors[0]}20, transparent)`,
            filter: 'blur(10px)'
          }}
          animate={{
            x: `${mouseRef.current.x}%`,
            y: `${mouseRef.current.y}%`,
            scale: [1, 1.2, 1]
          }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 30,
            scale: { duration: 2, repeat: Infinity }
          }}
        />
      )}
    </div>
  );
};