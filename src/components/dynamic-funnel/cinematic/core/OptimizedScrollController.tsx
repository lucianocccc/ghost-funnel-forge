import React, { useEffect, useRef, useCallback, useState } from 'react';
import { ScrollMetrics } from './types';

interface OptimizedScrollControllerProps {
  children: React.ReactNode;
  totalScenes: number;
  onScrollMetrics: (metrics: ScrollMetrics) => void;
  onSceneChange: (sceneIndex: number, progress: number) => void;
}

export const OptimizedScrollController: React.FC<OptimizedScrollControllerProps> = ({
  children,
  totalScenes,
  onScrollMetrics,
  onSceneChange
}) => {
  const [scrollState, setScrollState] = useState({
    velocity: 0,
    position: 0,
    isScrolling: false,
    direction: 'none' as 'up' | 'down' | 'none'
  });
  
  const lastScrollRef = useRef(0);
  const scrollTimeoutRef = useRef<NodeJS.Timeout>();
  const velocityRef = useRef(0);
  const lastTimeRef = useRef(0);

  const updateScrollMetrics = useCallback(() => {
    const currentTime = Date.now();
    const currentScroll = window.scrollY;
    const deltaTime = currentTime - lastTimeRef.current;
    const deltaScroll = currentScroll - lastScrollRef.current;
    
    if (deltaTime > 0) {
      const velocity = deltaScroll / deltaTime;
      velocityRef.current = velocity;
      
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const normalizedPosition = maxScroll > 0 ? Math.max(0, Math.min(1, currentScroll / maxScroll)) : 0;
      
      const direction = velocity > 0 ? 'down' : velocity < 0 ? 'up' : 'none';
      
      const metrics: ScrollMetrics = {
        velocity: velocity,
        position: currentScroll,
        normalizedPosition,
        isScrolling: Math.abs(velocity) > 0.1,
        direction
      };
      
      onScrollMetrics(metrics);
      
      // Calculate current scene
      const sceneProgress = normalizedPosition * totalScenes;
      const currentScene = Math.floor(sceneProgress);
      const sceneLocalProgress = sceneProgress - currentScene;
      
      onSceneChange(Math.min(currentScene, totalScenes - 1), sceneLocalProgress);
      
      setScrollState({
        velocity,
        position: currentScroll,
        isScrolling: Math.abs(velocity) > 0.1,
        direction
      });
    }
    
    lastScrollRef.current = currentScroll;
    lastTimeRef.current = currentTime;
  }, [totalScenes, onScrollMetrics, onSceneChange]);

  const throttledScrollHandler = useCallback(() => {
    updateScrollMetrics();
    
    // Clear existing timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    
    // Set scrolling to false after delay
    scrollTimeoutRef.current = setTimeout(() => {
      setScrollState(prev => ({ ...prev, isScrolling: false }));
    }, 150);
  }, [updateScrollMetrics]);

  useEffect(() => {
    // Throttle scroll events for performance
    let ticking = false;
    
    const scrollHandler = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          throttledScrollHandler();
          ticking = false;
        });
        ticking = true;
      }
    };
    
    window.addEventListener('scroll', scrollHandler, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', scrollHandler);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [throttledScrollHandler]);

  // Smooth keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const scrollAmount = window.innerHeight * 0.9;
      
      switch (e.key) {
        case 'ArrowDown':
        case 'PageDown':
        case ' ':
          e.preventDefault();
          window.scrollBy({
            top: scrollAmount,
            behavior: 'smooth'
          });
          break;
          
        case 'ArrowUp':
        case 'PageUp':
          e.preventDefault();
          window.scrollBy({
            top: -scrollAmount,
            behavior: 'smooth'
          });
          break;
          
        case 'Home':
          e.preventDefault();
          window.scrollTo({
            top: 0,
            behavior: 'smooth'
          });
          break;
          
        case 'End':
          e.preventDefault();
          window.scrollTo({
            top: document.body.scrollHeight,
            behavior: 'smooth'
          });
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="relative">
      {children}
      
      {/* Minimal progress indicator */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 pointer-events-none">
        <div className="flex space-x-2">
          {Array.from({ length: totalScenes }).map((_, index) => {
            const currentScene = Math.floor(scrollState.position / window.innerHeight);
            return (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentScene 
                    ? 'bg-white scale-125 shadow-lg' 
                    : index < currentScene 
                    ? 'bg-white/70' 
                    : 'bg-white/30'
                }`}
              />
            );
          })}
        </div>
      </div>
      
      {/* Scroll velocity indicator (debug) */}
      {scrollState.isScrolling && process.env.NODE_ENV === 'development' && (
        <div className="fixed top-4 right-4 z-50 bg-black/50 text-white p-2 rounded text-sm">
          Velocity: {scrollState.velocity.toFixed(2)}
        </div>
      )}
    </div>
  );
};