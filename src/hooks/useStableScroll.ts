
import { useCallback, useEffect, useRef, useState } from 'react';

interface StableScrollOptions {
  throttleMs?: number;
  debounceMs?: number;
  smoothing?: number;
  onScrollChange?: (metrics: ScrollMetrics) => void;
}

interface ScrollMetrics {
  scrollY: number;
  scrollProgress: number;
  velocity: number;
  direction: 'up' | 'down' | 'none';
  isScrolling: boolean;
  smoothScrollY: number;
}

export const useStableScroll = ({
  throttleMs = 8, // 120fps
  debounceMs = 150,
  smoothing = 0.1,
  onScrollChange
}: StableScrollOptions = {}) => {
  const [metrics, setMetrics] = useState<ScrollMetrics>({
    scrollY: 0,
    scrollProgress: 0,
    velocity: 0,
    direction: 'none',
    isScrolling: false,
    smoothScrollY: 0
  });

  const rafRef = useRef<number>();
  const lastScrollTime = useRef(0);
  const lastScrollY = useRef(0);
  const smoothScrollY = useRef(0);
  const velocityBuffer = useRef<number[]>([]);
  const debounceTimer = useRef<NodeJS.Timeout>();

  const calculateMetrics = useCallback(() => {
    const currentScrollY = window.scrollY;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const progress = maxScroll > 0 ? Math.min(Math.max(currentScrollY / maxScroll, 0), 1) : 0;
    
    // Calcola velocità smoothed
    const deltaY = currentScrollY - lastScrollY.current;
    const now = performance.now();
    const deltaTime = now - lastScrollTime.current;
    const instantVelocity = deltaTime > 0 ? deltaY / deltaTime : 0;
    
    // Buffer per velocità media
    velocityBuffer.current.push(instantVelocity);
    if (velocityBuffer.current.length > 5) {
      velocityBuffer.current.shift();
    }
    
    const avgVelocity = velocityBuffer.current.reduce((sum, v) => sum + v, 0) / velocityBuffer.current.length;
    
    // Smooth scrollY con interpolazione
    smoothScrollY.current += (currentScrollY - smoothScrollY.current) * smoothing;
    
    // Direzione
    const direction = deltaY > 0 ? 'down' : deltaY < 0 ? 'up' : 'none';
    
    const newMetrics: ScrollMetrics = {
      scrollY: currentScrollY,
      scrollProgress: progress,
      velocity: avgVelocity,
      direction,
      isScrolling: true,
      smoothScrollY: smoothScrollY.current
    };

    setMetrics(newMetrics);
    onScrollChange?.(newMetrics);
    
    lastScrollY.current = currentScrollY;
    lastScrollTime.current = now;
    
    // Debounce per isScrolling
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    
    debounceTimer.current = setTimeout(() => {
      setMetrics(prev => ({ ...prev, isScrolling: false }));
    }, debounceMs);
  }, [smoothing, debounceMs, onScrollChange]);

  const handleScroll = useCallback(() => {
    const now = performance.now();
    if (now - lastScrollTime.current < throttleMs) return;
    
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
    
    rafRef.current = requestAnimationFrame(calculateMetrics);
  }, [throttleMs, calculateMetrics]);

  useEffect(() => {
    // Inizializza
    calculateMetrics();
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [handleScroll, calculateMetrics]);

  return metrics;
};
