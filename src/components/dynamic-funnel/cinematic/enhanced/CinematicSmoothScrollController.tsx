import React, { useEffect, useRef, useCallback, useState } from 'react';

interface SmoothScrollMetrics {
  velocity: number;
  acceleration: number;
  position: number;
  normalizedPosition: number;
  isScrolling: boolean;
  direction: 'up' | 'down' | 'none';
  smoothVelocity: number;
}

interface CinematicSmoothScrollControllerProps {
  children: React.ReactNode;
  totalScenes: number;
  onScrollMetrics: (metrics: SmoothScrollMetrics) => void;
  onSceneChange: (sceneIndex: number, progress: number) => void;
}

export const CinematicSmoothScrollController: React.FC<CinematicSmoothScrollControllerProps> = ({
  children,
  totalScenes,
  onScrollMetrics,
  onSceneChange
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const smoothScrollRef = useRef<number>(0);
  const targetScrollRef = useRef<number>(0);
  const velocityRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number>();
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const userScrollTimeoutRef = useRef<NodeJS.Timeout>();

  // Smooth scroll parameters
  const SMOOTH_FACTOR = 0.08;
  const VELOCITY_DAMPING = 0.95;
  const MIN_VELOCITY = 0.001;

  const updateScrollMetrics = useCallback((currentTime: number) => {
    const deltaTime = currentTime - lastTimeRef.current;
    if (deltaTime === 0) return;

    const deltaPosition = smoothScrollRef.current - (lastTimeRef.current > 0 ? smoothScrollRef.current : 0);
    const rawVelocity = deltaPosition / (deltaTime / 1000);
    
    // Smooth velocity calculation
    velocityRef.current = velocityRef.current * VELOCITY_DAMPING + rawVelocity * (1 - VELOCITY_DAMPING);
    
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const normalizedPosition = maxScroll > 0 ? Math.min(Math.max(smoothScrollRef.current / maxScroll, 0), 1) : 0;
    
    const direction = velocityRef.current > 0.5 ? 'down' : velocityRef.current < -0.5 ? 'up' : 'none';
    const isScrolling = Math.abs(velocityRef.current) > MIN_VELOCITY;

    const metrics: SmoothScrollMetrics = {
      velocity: rawVelocity,
      acceleration: 0,
      position: smoothScrollRef.current,
      normalizedPosition,
      isScrolling,
      direction,
      smoothVelocity: velocityRef.current
    };

    onScrollMetrics(metrics);

    // Calculate current scene
    const sceneProgress = normalizedPosition * totalScenes;
    const currentScene = Math.floor(sceneProgress);
    const sceneLocalProgress = sceneProgress - currentScene;

    onSceneChange(Math.min(currentScene, totalScenes - 1), sceneLocalProgress);
    
    lastTimeRef.current = currentTime;
  }, [totalScenes, onScrollMetrics, onSceneChange]);

  const smoothScrollTick = useCallback((currentTime: number) => {
    // Interpolate towards target scroll position
    const diff = targetScrollRef.current - smoothScrollRef.current;
    
    if (Math.abs(diff) > 0.1) {
      smoothScrollRef.current += diff * SMOOTH_FACTOR;
      
      // Update actual scroll position
      window.scrollTo(0, smoothScrollRef.current);
      
      updateScrollMetrics(currentTime);
    }
    
    animationFrameRef.current = requestAnimationFrame(smoothScrollTick);
  }, [updateScrollMetrics]);

  const handleNativeScroll = useCallback(() => {
    targetScrollRef.current = window.scrollY;
    setIsUserScrolling(true);
    
    // Clear previous timeout
    if (userScrollTimeoutRef.current) {
      clearTimeout(userScrollTimeoutRef.current);
    }
    
    // Set user scrolling to false after a delay
    userScrollTimeoutRef.current = setTimeout(() => {
      setIsUserScrolling(false);
    }, 150);
  }, []);

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    
    // Smooth wheel scrolling with reduced sensitivity
    const scrollDelta = e.deltaY * 0.8;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    
    targetScrollRef.current = Math.max(0, Math.min(targetScrollRef.current + scrollDelta, maxScroll));
  }, []);

  // Initialize smooth scrolling
  useEffect(() => {
    smoothScrollRef.current = window.scrollY;
    targetScrollRef.current = window.scrollY;
    lastTimeRef.current = performance.now();
    
    animationFrameRef.current = requestAnimationFrame(smoothScrollTick);
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [smoothScrollTick]);

  // Event listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const scrollAmount = window.innerHeight * 0.8;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      
      switch (e.key) {
        case 'ArrowDown':
        case 'PageDown':
        case ' ':
          e.preventDefault();
          targetScrollRef.current = Math.min(targetScrollRef.current + scrollAmount, maxScroll);
          break;
          
        case 'ArrowUp':
        case 'PageUp':
          e.preventDefault();
          targetScrollRef.current = Math.max(targetScrollRef.current - scrollAmount, 0);
          break;
          
        case 'Home':
          e.preventDefault();
          targetScrollRef.current = 0;
          break;
          
        case 'End':
          e.preventDefault();
          targetScrollRef.current = maxScroll;
          break;
      }
    };

    window.addEventListener('scroll', handleNativeScroll, { passive: true });
    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('scroll', handleNativeScroll);
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('keydown', handleKeyDown);
      
      if (userScrollTimeoutRef.current) {
        clearTimeout(userScrollTimeoutRef.current);
      }
    };
  }, [handleNativeScroll, handleWheel]);

  return (
    <div ref={containerRef} className="relative">
      {children}
      
      {/* Minimal scene indicator */}
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-40 pointer-events-none">
        <div className="flex space-x-1">
          {Array.from({ length: totalScenes }).map((_, index) => {
            const currentScene = Math.floor((smoothScrollRef.current / (document.documentElement.scrollHeight - window.innerHeight)) * totalScenes);
            return (
              <div
                key={index}
                className={`w-1 h-1 rounded-full transition-all duration-500 ${
                  index === currentScene 
                    ? 'bg-white scale-150' 
                    : 'bg-white/20'
                }`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};