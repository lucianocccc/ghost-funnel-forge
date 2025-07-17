
// Cinematic Transition Manager - Handles smooth scene transitions

import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface CinematicTransitionManagerProps {
  children: ReactNode;
  transition: {
    in: 'fade' | 'slide' | 'zoom' | 'morph';
    out: 'fade' | 'slide' | 'zoom' | 'morph';
    duration: number;
  };
  isActive: boolean;
}

export const CinematicTransitionManager: React.FC<CinematicTransitionManagerProps> = ({
  children,
  transition,
  isActive
}) => {
  const getTransitionVariants = () => {
    const variants: Record<string, any> = {
      fade: {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 }
      },
      slide: {
        initial: { x: '100%', opacity: 0 },
        animate: { x: 0, opacity: 1 },
        exit: { x: '-100%', opacity: 0 }
      },
      zoom: {
        initial: { scale: 0.8, opacity: 0 },
        animate: { scale: 1, opacity: 1 },
        exit: { scale: 1.2, opacity: 0 }
      },
      morph: {
        initial: { 
          scale: 0.9, 
          opacity: 0, 
          rotateY: -15,
          transformPerspective: 1000 
        },
        animate: { 
          scale: 1, 
          opacity: 1, 
          rotateY: 0,
          transformPerspective: 1000 
        },
        exit: { 
          scale: 1.1, 
          opacity: 0, 
          rotateY: 15,
          transformPerspective: 1000 
        }
      }
    };

    return variants[transition.in] || variants.fade;
  };

  const transitionConfig = {
    duration: transition.duration / 1000, // Convert to seconds
    ease: "easeInOut" as const, // Use predefined easing instead of cubic bezier array
    type: "tween" as const
  };

  return (
    <motion.div
      key={`transition-${transition.in}-${transition.out}`}
      variants={getTransitionVariants()}
      initial="initial"
      animate={isActive ? "animate" : "initial"}
      exit="exit"
      transition={transitionConfig}
      className="w-full h-full"
      style={{
        transformStyle: 'preserve-3d',
        backfaceVisibility: 'hidden'
      }}
    >
      {children}
    </motion.div>
  );
};
