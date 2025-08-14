import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ScrollTriggerAnimationProps {
  children: React.ReactNode;
  className?: string;
  animation?: 'fadeIn' | 'slideUp' | 'slideLeft' | 'slideRight' | 'scale' | 'rotate' | 'stagger';
  delay?: number;
  duration?: number;
  threshold?: number; // Intersection threshold (0-1)
  once?: boolean; // Animate only once
  parallax?: boolean; // Enable parallax effect
  parallaxSpeed?: number; // Parallax speed (-1 to 1)
}

export const ScrollTriggerAnimation: React.FC<ScrollTriggerAnimationProps> = ({
  children,
  className = '',
  animation = 'fadeIn',
  delay = 0,
  duration = 0.6,
  threshold = 0.1,
  once = true,
  parallax = false,
  parallaxSpeed = 0.5
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { 
    amount: threshold, 
    once,
    margin: '-100px 0px'
  });

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start']
  });

  // Parallax transform
  const y = useTransform(
    scrollYProgress,
    [0, 1],
    parallax ? [100 * parallaxSpeed, -100 * parallaxSpeed] : [0, 0]
  );

  const getAnimationVariants = () => {
    const variants = {
      fadeIn: {
        hidden: { opacity: 0 },
        visible: { opacity: 1 }
      },
      slideUp: {
        hidden: { opacity: 0, y: 60 },
        visible: { opacity: 1, y: 0 }
      },
      slideLeft: {
        hidden: { opacity: 0, x: 60 },
        visible: { opacity: 1, x: 0 }
      },
      slideRight: {
        hidden: { opacity: 0, x: -60 },
        visible: { opacity: 1, x: 0 }
      },
      scale: {
        hidden: { opacity: 0, scale: 0.8 },
        visible: { opacity: 1, scale: 1 }
      },
      rotate: {
        hidden: { opacity: 0, rotate: -10, scale: 0.9 },
        visible: { opacity: 1, rotate: 0, scale: 1 }
      },
      stagger: {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
      }
    };

    return variants[animation] || variants.fadeIn;
  };

  const variants = getAnimationVariants();

  return (
    <motion.div
      ref={ref}
      className={cn('transform-gpu', className)}
      style={parallax ? { y } : undefined}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={variants}
      transition={{
        duration,
        delay,
        ease: 'easeOut',
        type: 'spring',
        stiffness: 100,
        damping: 12
      }}
    >
      {children}
    </motion.div>
  );
};

// Stagger container for animating multiple children
interface StaggerContainerProps {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
  once?: boolean;
}

export const StaggerContainer: React.FC<StaggerContainerProps> = ({
  children,
  className = '',
  staggerDelay = 0.1,
  once = true
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { amount: 0.1, once });

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0
    }
  };

  return (
    <motion.div
      ref={ref}
      className={cn('transform-gpu', className)}
      variants={containerVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
    >
      {React.Children.map(children, (child, index) => (
        <motion.div
          key={index}
          variants={itemVariants}
          className="stagger-animation"
          style={{ '--stagger-delay': index } as React.CSSProperties}
          transition={{
            duration: 0.6,
            ease: 'easeOut'
          }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
};