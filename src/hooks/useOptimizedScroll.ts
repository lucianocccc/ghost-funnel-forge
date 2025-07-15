
import { useCallback, useEffect, useRef, useState } from 'react';

interface UseOptimizedScrollOptions {
  throttleMs?: number;
  debounceMs?: number;
  onScroll?: (position: number) => void;
}

export const useOptimizedScroll = ({
  throttleMs = 16, // ~60fps
  debounceMs = 100,
  onScroll
}: UseOptimizedScrollOptions = {}) => {
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const throttleTimeoutRef = useRef<NodeJS.Timeout>();
  const debounceTimeoutRef = useRef<NodeJS.Timeout>();
  const lastScrollTime = useRef(0);
  const rafRef = useRef<number>();

  const handleScroll = useCallback(() => {
    const now = Date.now();
    
    // Throttle scroll events
    if (now - lastScrollTime.current < throttleMs) {
      return;
    }
    
    lastScrollTime.current = now;
    
    // Cancel previous RAF if pending
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
    
    // Use RAF for smooth updates
    rafRef.current = requestAnimationFrame(() => {
      const position = window.scrollY;
      setScrollPosition(position);
      setIsScrolling(true);
      
      onScroll?.(position);
      
      // Clear existing debounce timeout
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      
      // Set scrolling to false after debounce delay
      debounceTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
      }, debounceMs);
    });
  }, [throttleMs, debounceMs, onScroll]);

  useEffect(() => {
    // Use passive listeners for better performance
    const options = { passive: true };
    window.addEventListener('scroll', handleScroll, options);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      
      // Cleanup timeouts and RAF
      if (throttleTimeoutRef.current) {
        clearTimeout(throttleTimeoutRef.current);
      }
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [handleScroll]);

  return {
    scrollPosition,
    isScrolling
  };
};
