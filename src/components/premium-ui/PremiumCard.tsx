import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const premiumCardVariants = cva(
  "relative overflow-hidden transition-all duration-500",
  {
    variants: {
      variant: {
        apple: "bg-white/80 backdrop-blur-sm border border-gray-200 shadow-sm hover:shadow-lg rounded-2xl",
        nike: "bg-white border border-gray-100 shadow-md hover:shadow-2xl rounded-lg transform hover:-translate-y-1",
        amazon: "bg-white border border-orange-100 shadow-sm hover:shadow-md rounded-lg hover:border-orange-200",
        glass: "bg-white/10 backdrop-blur-md border border-white/20 shadow-xl rounded-3xl",
        premium: "bg-gradient-to-br from-white to-gray-50 border border-gray-200 shadow-xl hover:shadow-2xl rounded-2xl",
      },
      size: {
        sm: "p-4",
        md: "p-6",
        lg: "p-8",
        xl: "p-10",
      },
      animation: {
        none: "",
        float: "hover:translate-y-[-4px]",
        scale: "hover:scale-[1.02]",
        tilt: "hover:rotate-1",
        glow: "hover:ring-4 hover:ring-primary/20",
      }
    },
    defaultVariants: {
      variant: "apple",
      size: "md",
      animation: "float",
    },
  }
);

export interface PremiumCardProps
  extends VariantProps<typeof premiumCardVariants> {
  children: React.ReactNode;
  interactive?: boolean;
  gradient?: boolean;
  className?: string;
  onClick?: () => void;
}

export const PremiumCard = React.forwardRef<HTMLDivElement, PremiumCardProps>(
  ({ className, variant, size, animation, children, interactive = true, gradient = false, onClick }, ref) => {
    if (interactive) {
      return (
        <motion.div
          ref={ref}
          className={cn(
            premiumCardVariants({ variant, size, animation }),
            gradient && "bg-gradient-to-br from-primary/5 to-secondary/5",
            className
          )}
          whileHover={{ y: -4 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          onClick={onClick}
        >
          {gradient && (
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 opacity-0 hover:opacity-100 transition-opacity duration-500" />
          )}
          <div className="relative z-10">
            {children}
          </div>
        </motion.div>
      );
    }
    
    return (
      <div
        ref={ref}
        className={cn(
          premiumCardVariants({ variant, size, animation }),
          gradient && "bg-gradient-to-br from-primary/5 to-secondary/5",
          className
        )}
        onClick={onClick}
      >
        {gradient && (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 opacity-0 hover:opacity-100 transition-opacity duration-500" />
        )}
        <div className="relative z-10">
          {children}
        </div>
      </div>
    );
  }
);

PremiumCard.displayName = "PremiumCard";