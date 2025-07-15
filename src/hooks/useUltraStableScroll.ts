
import { useCallback, useEffect, useRef, useState } from 'react';

interface UltraStableScrollOptions {
  throttleMs?: number;
  smoothing?: number;
  onScrollChange?: (metrics: UltraScrollMetrics) => void;
}

interface UltraScrollMetrics {
  scrollY: number;
  scrollProgress: number;
  velocity: number;
  direction: 'up' | 'down' | 'none';
  isScrolling: boolean;
  smoothScrollY: number;
  ultraSmoothScrollY: number;
}

export const useUltraStableScroll = ({
  throttleMs = 6, // 166fps
  smoothing = 0.08,
  onScrollChange
}: UltraStableScrollOptions = {}) => {
  const [metrics, setMetrics] = useState<UltraScrollMetrics>({
    scrollY: 0,
    scrollProgress: 0,
    velocity: 0,
    direction: 'none',
    isScrolling: false,
    smoothScrollY: 0,
    ultraSmoothScrollY: 0
  });

  const rafRef = useRef<number>();
  const lastScrollTime = useRef(0);
  const lastScrollY = useRef(0);
  const smoothScrollY = useRef(0);
  const ultraSmoothScrollY = useRef(0);
  const velocityBuffer = useRef<number[]>([]);
  const isUpdatingRef = useRef(false);

  const updateMetrics = useCallback(() => {
    if (isUpdatingRef.current) return;
    isUpdatingRef.current = true;

    const currentScrollY = window.scrollY;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const progress = maxScroll > 0 ? Math.min(Math.max(currentScrollY / maxScroll, 0), 1) : 0;
    
    const now = performance.now();
    const deltaTime = now - lastScrollTime.current;
    const deltaY = currentScrollY - lastScrollY.current;
    
    // Calcola velocità ultra-smooth
    const instantVelocity = deltaTime > 0 ? deltaY / deltaTime : 0;
    velocityBuffer.current.push(instantVelocity);
    if (velocityBuffer.current.length > 3) {
      velocityBuffer.current.shift();
    }
    
    const avgVelocity = velocityBuffer.current.reduce((sum, v) => sum + v, 0) / velocityBuffer.current.length;
    
    // Doppio smoothing per eliminare ogni micro-stutter
    smoothScrollY.current += (currentScrollY - smoothScrollY.current) * smoothing;
    ultraSmoothScrollY.current += (smoothScrollY.current - ultraSmoothScrollY.current) * (smoothing * 0.8);
    
    const direction = deltaY > 0.5 ? 'down' : deltaY < -0.5 ? 'up' : 'none';
    
    const newMetrics: UltraScrollMetrics = {
      scrollY: currentScrollY,
      scrollProgress: progress,
      velocity: avgVelocity,
      direction,
      isScrolling: Math.abs(avgVelocity) > 0.05,
      smoothScrollY: smoothScrollY.current,
      ultraSmoothScrollY: ultraSmoothScrollY.current
    };

    setMetrics(newMetrics);
    onScrollChange?.(newMetrics);
    
    lastScrollY.current = currentScrollY;
    lastScrollTime.current = now;
    isUpdatingRef.current = false;
  }, [smoothing, onScrollChange]);

  const handleScroll = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
    
    rafRef.current = requestAnimationFrame(updateMetrics);
  }, [updateMetrics]);

  useEffect(() => {
    const options = { passive: true, capture: false };
    
    // Inizializza
    updateMetrics();
    
    window.addEventListener('scroll', handleScroll, options);
    
    return () => {
      window.removeEventListener('scroll', handleScroll, options);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [handleScroll, updateMetrics]);

  return metrics;
};
