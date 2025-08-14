import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface MicroButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'default' | 'magnetic' | 'ripple' | 'glow' | 'shake' | 'bounce';
  className?: string;
  disabled?: boolean;
}

export const MicroButton: React.FC<MicroButtonProps> = ({
  children,
  onClick,
  variant = 'default',
  className = '',
  disabled = false
}) => {
  const [isClicked, setIsClicked] = useState(false);
  const [ripplePosition, setRipplePosition] = useState({ x: 0, y: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;

    // Ripple effect position
    const rect = buttonRef.current?.getBoundingClientRect();
    if (rect) {
      setRipplePosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }

    setIsClicked(true);
    setTimeout(() => setIsClicked(false), 300);
    onClick?.();
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'magnetic':
        return 'magnetic micro-hover transition-micro';
      case 'ripple':
        return 'ripple micro-click relative overflow-hidden';
      case 'glow':
        return 'animate-pulse-glow micro-hover';
      case 'shake':
        return cn('micro-hover', isClicked && 'animate-micro-shake');
      case 'bounce':
        return cn('micro-hover', isClicked && 'animate-micro-bounce');
      default:
        return 'micro-hover micro-click';
    }
  };

  return (
    <motion.button
      ref={buttonRef}
      className={cn(
        'relative px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium',
        'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'gpu-accelerated',
        getVariantClasses(),
        className
      )}
      onClick={handleClick}
      disabled={disabled}
      whileHover={{ scale: variant === 'magnetic' ? 1.05 : 1.02 }}
      whileTap={{ scale: 0.98 }}
      animate={{
        boxShadow: variant === 'glow' 
          ? ['0 0 0px hsl(var(--primary))', '0 0 20px hsl(var(--primary) / 0.5)', '0 0 0px hsl(var(--primary))']
          : undefined
      }}
      transition={{
        type: 'spring',
        stiffness: 400,
        damping: 17,
        boxShadow: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
      }}
    >
      {children}

      {/* Ripple effect */}
      <AnimatePresence>
        {variant === 'ripple' && isClicked && (
          <motion.div
            className="absolute rounded-full bg-white/30"
            style={{
              left: ripplePosition.x,
              top: ripplePosition.y,
              transform: 'translate(-50%, -50%)'
            }}
            initial={{ width: 0, height: 0, opacity: 1 }}
            animate={{ width: 300, height: 300, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        )}
      </AnimatePresence>
    </motion.button>
  );
};