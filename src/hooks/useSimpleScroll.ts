
import { useEffect, useRef, useState, useCallback } from 'react';

interface ScrollState {
  scrollY: number;
  progress: number;
  isScrolling: boolean;
  direction: 'up' | 'down' | 'none';
}

export const useSimpleScroll = () => {
  const [scrollState, setScrollState] = useState<ScrollState>({
    scrollY: 0,
    progress: 0,
    isScrolling: false,
    direction: 'none'
  });
  
  const rafId = useRef<number>();
  const lastScrollY = useRef(0);
  const scrollTimeout = useRef<NodeJS.Timeout>();
  const isUpdating = useRef(false);

  const updateScroll = useCallback(() => {
    if (isUpdating.current) return;
    
    isUpdating.current = true;
    
    const currentScrollY = window.scrollY;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const progress = maxScroll > 0 ? Math.min(Math.max(currentScrollY / maxScroll, 0), 1) : 0;
    
    const direction = currentScrollY > lastScrollY.current ? 'down' : 
                     currentScrollY < lastScrollY.current ? 'up' : 'none';
    
    setScrollState({
      scrollY: currentScrollY,
      progress,
      isScrolling: true,
      direction
    });
    
    lastScrollY.current = currentScrollY;
    isUpdating.current = false;
    
    // Clear existing timeout
    if (scrollTimeout.current) {
      clearTimeout(scrollTimeout.current);
    }
    
    // Set scrolling to false after delay
    scrollTimeout.current = setTimeout(() => {
      setScrollState(prev => ({ ...prev, isScrolling: false }));
    }, 100);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
      
      rafId.current = requestAnimationFrame(updateScroll);
    };

    // Initialize
    updateScroll();
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
    };
  }, [updateScroll]);

  return scrollState;
};
