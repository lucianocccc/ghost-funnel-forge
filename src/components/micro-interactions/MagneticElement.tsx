import React, { useRef, useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { cn } from '@/lib/utils';

interface MagneticElementProps {
  children: React.ReactNode;
  className?: string;
  strength?: number; // Magnetic force multiplier (0.1 - 1)
  maxDistance?: number; // Maximum distance for magnetic effect
  smoothing?: number; // Animation smoothing (0.1 - 1)
}

export const MagneticElement: React.FC<MagneticElementProps> = ({
  children,
  className = '',
  strength = 0.3,
  maxDistance = 100,
  smoothing = 0.5
}) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Motion values for smooth magnetic movement
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Spring animations for smooth magnetic pull
  const springX = useSpring(x, {
    stiffness: 400 * smoothing,
    damping: 30
  });
  const springY = useSpring(y, {
    stiffness: 400 * smoothing,
    damping: 30
  });

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      // Calculate distance from center
      const deltaX = e.clientX - centerX;
      const deltaY = e.clientY - centerY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      // Apply magnetic effect if within range
      if (distance < maxDistance) {
        const force = Math.max(0, 1 - distance / maxDistance);
        const magneticX = deltaX * force * strength;
        const magneticY = deltaY * force * strength;

        x.set(magneticX);
        y.set(magneticY);
        setIsHovered(true);
      } else {
        x.set(0);
        y.set(0);
        setIsHovered(false);
      }
    };

    const handleMouseLeave = () => {
      x.set(0);
      y.set(0);
      setIsHovered(false);
    };

    // Add global mouse listener for magnetic effect
    document.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [x, y, maxDistance, strength]);

  return (
    <motion.div
      ref={elementRef}
      className={cn('inline-block transform-gpu', className)}
      style={{
        x: springX,
        y: springY
      }}
      animate={{
        scale: isHovered ? 1.05 : 1,
        filter: isHovered ? 'brightness(1.1)' : 'brightness(1)'
      }}
      transition={{
        scale: { type: 'spring', stiffness: 400, damping: 25 },
        filter: { duration: 0.2 }
      }}
    >
      {children}
    </motion.div>
  );
};