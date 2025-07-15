import React, { useEffect, useRef, useCallback } from 'react';
import { useOptimizedScroll } from '@/hooks/useOptimizedScroll';

interface ScrollTrackerProps {
  onScrollChange: (scrollPosition: number) => void;
}

export const ScrollTracker: React.FC<ScrollTrackerProps> = ({ onScrollChange }) => {
  const onScrollChangeRef = useRef(onScrollChange);
  const hasInitialized = useRef(false);

  // Keep callback reference stable
  useEffect(() => {
    onScrollChangeRef.current = onScrollChange;
  }, [onScrollChange]);

  const handleOptimizedScroll = useCallback((position: number) => {
    onScrollChangeRef.current(position);
  }, []);

  const { scrollPosition, isScrolling } = useOptimizedScroll({
    throttleMs: 16, // 60fps
    debounceMs: 150,
    onScroll: handleOptimizedScroll
  });

  useEffect(() => {
    // Initialize scroll position on mount
    if (!hasInitialized.current) {
      handleOptimizedScroll(window.scrollY);
      hasInitialized.current = true;
    }
  }, [handleOptimizedScroll]);

  useEffect(() => {
    // Apply smooth scrolling behavior only once
    if (!hasInitialized.current) {
      document.documentElement.style.scrollBehavior = 'smooth';
      return () => {
        document.documentElement.style.scrollBehavior = 'auto';
      };
    }
  }, []);

  return null; // This is a logic-only component
};
