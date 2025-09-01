
import { useCallback, useEffect, useRef, useState } from 'react';

interface UltraStableScrollOptions {
  throttleMs?: number;
  smoothing?: number;
  adaptiveSmoothing?: boolean;
  performanceMode?: 'high' | 'medium' | 'low';
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
  predictiveScrollY: number;
  momentum: number;
  scrollType: 'wheel' | 'touch' | 'trackpad';
  frameRate: number;
}

export const useUltraStableScroll = ({
  throttleMs = 4, // 250fps for ultra-smooth
  smoothing = 0.06,
  adaptiveSmoothing = true,
  performanceMode = 'high',
  onScrollChange
}: UltraStableScrollOptions = {}) => {
  const [metrics, setMetrics] = useState<UltraScrollMetrics>({
    scrollY: 0,
    scrollProgress: 0,
    velocity: 0,
    direction: 'none',
    isScrolling: false,
    smoothScrollY: 0,
    ultraSmoothScrollY: 0,
    predictiveScrollY: 0,
    momentum: 0,
    scrollType: 'wheel',
    frameRate: 60
  });

  const rafRef = useRef<number>();
  const lastScrollTime = useRef(0);
  const lastScrollY = useRef(0);
  const smoothScrollY = useRef(0);
  const ultraSmoothScrollY = useRef(0);
  const predictiveScrollY = useRef(0);
  const velocityBuffer = useRef<number[]>([]);
  const momentumBuffer = useRef<number[]>([]);
  const frameTimeBuffer = useRef<number[]>([]);
  const isUpdatingRef = useRef(false);
  const scrollTypeRef = useRef<'wheel' | 'touch' | 'trackpad'>('wheel');
  const adaptiveSmoothingRef = useRef(smoothing);

  const updateMetrics = useCallback(() => {
    if (isUpdatingRef.current) return;
    isUpdatingRef.current = true;

    const currentScrollY = window.scrollY;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const progress = maxScroll > 0 ? Math.min(Math.max(currentScrollY / maxScroll, 0), 1) : 0;
    
    const now = performance.now();
    const deltaTime = now - lastScrollTime.current;
    const deltaY = currentScrollY - lastScrollY.current;
    
    // Frame rate calculation
    frameTimeBuffer.current.push(deltaTime);
    if (frameTimeBuffer.current.length > 10) {
      frameTimeBuffer.current.shift();
    }
    const avgFrameTime = frameTimeBuffer.current.reduce((sum, t) => sum + t, 0) / frameTimeBuffer.current.length;
    const frameRate = avgFrameTime > 0 ? Math.min(120, 1000 / avgFrameTime) : 60;
    
    // Enhanced velocity calculation with adaptive buffer size
    const instantVelocity = deltaTime > 0 ? deltaY / deltaTime : 0;
    const bufferSize = performanceMode === 'high' ? 8 : performanceMode === 'medium' ? 5 : 3;
    
    velocityBuffer.current.push(instantVelocity);
    if (velocityBuffer.current.length > bufferSize) {
      velocityBuffer.current.shift();
    }
    
    // Weighted average with more recent values having higher weight
    const weights = velocityBuffer.current.map((_, i) => Math.pow(1.2, i));
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    const avgVelocity = velocityBuffer.current.reduce((sum, v, i) => sum + v * weights[i], 0) / totalWeight;
    
    // Momentum calculation
    const momentum = Math.abs(avgVelocity) * 0.8 + (momentumBuffer.current[momentumBuffer.current.length - 1] || 0) * 0.2;
    momentumBuffer.current.push(momentum);
    if (momentumBuffer.current.length > 5) {
      momentumBuffer.current.shift();
    }
    
    // Adaptive smoothing based on velocity and performance
    if (adaptiveSmoothing) {
      const velocityFactor = Math.min(1, Math.abs(avgVelocity) / 2);
      const performanceFactor = performanceMode === 'high' ? 1 : performanceMode === 'medium' ? 0.8 : 0.6;
      adaptiveSmoothingRef.current = smoothing * (1 - velocityFactor * 0.3) * performanceFactor;
    }
    
    // Ultra-precise smoothing with predictive element
    const currentSmoothing = adaptiveSmoothingRef.current;
    smoothScrollY.current += (currentScrollY - smoothScrollY.current) * currentSmoothing;
    ultraSmoothScrollY.current += (smoothScrollY.current - ultraSmoothScrollY.current) * (currentSmoothing * 0.7);
    
    // Predictive scrolling for ultra-smooth anticipation
    const predictiveOffset = avgVelocity * deltaTime * 0.5;
    predictiveScrollY.current = ultraSmoothScrollY.current + predictiveOffset;
    
    // Enhanced direction with micro-movements detection
    const direction = Math.abs(deltaY) < 0.3 ? 'none' : deltaY > 0 ? 'down' : 'up';
    
    const newMetrics: UltraScrollMetrics = {
      scrollY: currentScrollY,
      scrollProgress: progress,
      velocity: avgVelocity,
      direction,
      isScrolling: Math.abs(avgVelocity) > 0.02,
      smoothScrollY: smoothScrollY.current,
      ultraSmoothScrollY: ultraSmoothScrollY.current,
      predictiveScrollY: predictiveScrollY.current,
      momentum,
      scrollType: scrollTypeRef.current,
      frameRate: Math.round(frameRate)
    };

    setMetrics(newMetrics);
    onScrollChange?.(newMetrics);
    
    lastScrollY.current = currentScrollY;
    lastScrollTime.current = now;
    isUpdatingRef.current = false;
  }, [smoothing, adaptiveSmoothing, performanceMode, onScrollChange]);

  const detectScrollType = useCallback((event: Event) => {
    if (event instanceof WheelEvent) {
      // Detect trackpad vs mouse wheel based on delta precision
      const isPreciseWheel = Math.abs(event.deltaY) % 1 !== 0;
      scrollTypeRef.current = isPreciseWheel ? 'trackpad' : 'wheel';
    } else if (event instanceof TouchEvent) {
      scrollTypeRef.current = 'touch';
    }
  }, []);

  const handleScroll = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
    
    rafRef.current = requestAnimationFrame(updateMetrics);
  }, [updateMetrics]);

  useEffect(() => {
    const options = { passive: true, capture: false };
    
    // Initialize
    updateMetrics();
    
    window.addEventListener('scroll', handleScroll, options);
    window.addEventListener('wheel', detectScrollType, options);
    window.addEventListener('touchstart', detectScrollType, options);
    
    return () => {
      window.removeEventListener('scroll', handleScroll, options);
      window.removeEventListener('wheel', detectScrollType, options);
      window.removeEventListener('touchstart', detectScrollType, options);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [handleScroll, updateMetrics, detectScrollType]);

  return metrics;
};
