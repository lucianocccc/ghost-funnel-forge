import React, { useState, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { cn } from '@/lib/utils';

interface MicroCardProps {
  children: React.ReactNode;
  className?: string;
  interactive?: boolean;
  tiltEffect?: boolean;
  glowEffect?: boolean;
  floatEffect?: boolean;
  onClick?: () => void;
}

export const MicroCard: React.FC<MicroCardProps> = ({
  children,
  className = '',
  interactive = true,
  tiltEffect = false,
  glowEffect = false,
  floatEffect = false,
  onClick
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Mouse position tracking for tilt effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Spring animations for smooth movement
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [5, -5]), {
    stiffness: 300,
    damping: 30
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-5, 5]), {
    stiffness: 300,
    damping: 30
  });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!tiltEffect || !cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const rotateXValue = (e.clientY - centerY) / (rect.height / 2);
    const rotateYValue = (e.clientX - centerX) / (rect.width / 2);

    mouseX.set(rotateYValue);
    mouseY.set(rotateXValue);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (tiltEffect) {
      mouseX.set(0);
      mouseY.set(0);
    }
  };

  return (
    <motion.div
      ref={cardRef}
      className={cn(
        'bg-card border border-border rounded-lg p-6 shadow-sm',
        'transform-gpu backface-visibility-hidden',
        interactive && 'cursor-pointer',
        floatEffect && 'animate-float',
        glowEffect && 'animate-pulse-glow',
        className
      )}
      style={tiltEffect ? {
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d'
      } : undefined}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      whileHover={interactive ? {
        y: -5,
        scale: 1.02,
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
      } : undefined}
      whileTap={interactive ? { scale: 0.98 } : undefined}
      transition={{
        type: 'spring',
        stiffness: 400,
        damping: 25
      }}
    >
      <motion.div
        style={{ transformStyle: 'preserve-3d' }}
        animate={tiltEffect && isHovered ? {
          z: 20
        } : {}}
      >
        {children}
      </motion.div>

      {/* Glow overlay */}
      {glowEffect && (
        <motion.div
          className="absolute inset-0 rounded-lg pointer-events-none"
          style={{
            background: 'radial-gradient(circle at center, hsl(var(--primary) / 0.1), transparent 70%)',
          }}
          animate={{
            opacity: isHovered ? 0.8 : 0.3,
            scale: isHovered ? 1.1 : 1
          }}
          transition={{ duration: 0.3 }}
        />
      )}
    </motion.div>
  );
};