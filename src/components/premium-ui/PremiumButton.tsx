import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const premiumButtonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 overflow-hidden",
  {
    variants: {
      variant: {
        apple: "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5",
        nike: "bg-black text-white hover:bg-gray-900 shadow-lg hover:shadow-2xl transform hover:scale-105",
        amazon: "bg-gradient-to-r from-orange-400 to-orange-500 text-white hover:from-orange-500 hover:to-orange-600 shadow-md hover:shadow-lg",
        ghost: "border-2 border-primary bg-transparent text-primary hover:bg-primary hover:text-primary-foreground",
        premium: "bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 shadow-xl",
      },
      size: {
        sm: "h-9 px-3 rounded-md text-xs",
        md: "h-11 px-6 rounded-lg text-sm",
        lg: "h-14 px-8 rounded-xl text-base",
        xl: "h-16 px-12 rounded-2xl text-lg font-semibold",
      },
      animation: {
        none: "",
        pulse: "animate-pulse",
        bounce: "hover:animate-bounce",
        glow: "relative before:absolute before:inset-0 before:rounded-inherit before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700",
      }
    },
    defaultVariants: {
      variant: "apple",
      size: "md",
      animation: "none",
    },
  }
);

export interface PremiumButtonProps
  extends Omit<HTMLMotionProps<"button">, 'children'>,
    VariantProps<typeof premiumButtonVariants> {
  children: React.ReactNode;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export const PremiumButton = React.forwardRef<HTMLButtonElement, PremiumButtonProps>(
  ({ className, variant, size, animation, children, loading, icon, iconPosition = 'left', disabled, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        className={cn(premiumButtonVariants({ variant, size, animation, className }))}
        disabled={disabled || loading}
        whileHover={{ scale: variant === 'nike' ? 1.05 : 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
        {...props}
      >
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        <span className={cn("flex items-center gap-2", loading && "opacity-0")}>
          {icon && iconPosition === 'left' && icon}
          {children}
          {icon && iconPosition === 'right' && icon}
        </span>
      </motion.button>
    );
  }
);

PremiumButton.displayName = "PremiumButton";