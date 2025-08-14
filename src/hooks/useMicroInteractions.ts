import { useCallback, useRef, useState } from 'react';
import { useMotionValue, useSpring } from 'framer-motion';

interface MicroInteractionConfig {
  hover?: {
    scale?: number;
    y?: number;
    duration?: number;
  };
  click?: {
    scale?: number;
    duration?: number;
  };
  magnetic?: {
    strength?: number;
    distance?: number;
  };
}

export const useMicroInteractions = (config: MicroInteractionConfig = {}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  // Motion values for magnetic effect
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  // Spring animations
  const springX = useSpring(x, { stiffness: 400, damping: 30 });
  const springY = useSpring(y, { stiffness: 400, damping: 30 });

  // Mouse handlers
  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    if (config.magnetic) {
      x.set(0);
      y.set(0);
    }
  }, [config.magnetic, x, y]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!config.magnetic || !elementRef.current) return;

    const rect = elementRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const deltaX = e.clientX - centerX;
    const deltaY = e.clientY - centerY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    const maxDistance = config.magnetic.distance || 100;
    const strength = config.magnetic.strength || 0.3;

    if (distance < maxDistance) {
      const force = Math.max(0, 1 - distance / maxDistance);
      x.set(deltaX * force * strength);
      y.set(deltaY * force * strength);
    }
  }, [config.magnetic, x, y]);

  const handleMouseDown = useCallback(() => {
    setIsPressed(true);
  }, []);

  const handleMouseUp = useCallback(() => {
    setIsPressed(false);
  }, []);

  // Animation variants
  const animationProps = {
    whileHover: config.hover ? {
      scale: config.hover.scale || 1.02,
      y: config.hover.y || -2,
      transition: { duration: config.hover.duration || 0.2 }
    } : undefined,
    whileTap: config.click ? {
      scale: config.click.scale || 0.98,
      transition: { duration: config.click.duration || 0.1 }
    } : undefined,
    style: config.magnetic ? {
      x: springX,
      y: springY
    } : undefined
  };

  const eventHandlers = {
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
    onMouseMove: config.magnetic ? handleMouseMove : undefined,
    onMouseDown: handleMouseDown,
    onMouseUp: handleMouseUp,
    ref: elementRef
  };

  return {
    isHovered,
    isPressed,
    animationProps,
    eventHandlers,
    motionValues: { x: springX, y: springY }
  };
};

// Utility hook for stagger animations
export const useStaggerAnimation = (delay: number = 0.1) => {
  const [isVisible, setIsVisible] = useState(false);

  const triggerAnimation = useCallback(() => {
    setIsVisible(true);
  }, []);

  const resetAnimation = useCallback(() => {
    setIsVisible(false);
  }, []);

  const staggerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * delay,
        duration: 0.6,
        ease: 'easeOut'
      }
    })
  };

  return {
    isVisible,
    triggerAnimation,
    resetAnimation,
    staggerVariants
  };
};

// Hook for scroll-triggered effects
export const useScrollTrigger = (threshold: number = 0.1) => {
  const [isInView, setIsInView] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  const observerCallback = useCallback((entries: IntersectionObserverEntry[]) => {
    entries.forEach((entry) => {
      setIsInView(entry.isIntersecting);
    });
  }, []);

  const setupObserver = useCallback(() => {
    if (!elementRef.current) return;

    const observer = new IntersectionObserver(observerCallback, {
      threshold,
      rootMargin: '-50px 0px'
    });

    observer.observe(elementRef.current);

    return () => {
      observer.disconnect();
    };
  }, [observerCallback, threshold]);

  return {
    isInView,
    elementRef,
    setupObserver
  };
};