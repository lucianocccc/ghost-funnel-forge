import React, { useEffect, useRef, useState, useCallback } from 'react';

interface ScrollMetrics {
  velocity: number;
  acceleration: number;
  position: number;
  normalizedPosition: number;
  isScrolling: boolean;
  direction: 'up' | 'down' | 'none';
}

interface CinematicScrollControllerProps {
  children: React.ReactNode;
  totalScenes: number;
  onScrollMetrics: (metrics: ScrollMetrics) => void;
  onSceneChange: (sceneIndex: number, progress: number) => void;
  dampingFactor?: number;
  snapToScenes?: boolean;
}

export const CinematicScrollController: React.FC<CinematicScrollControllerProps> = ({
  children,
  totalScenes,
  onScrollMetrics,
  onSceneChange,
  dampingFactor = 0.1,
  snapToScenes = true
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const lastScrollTime = useRef<number>(0);
  const lastScrollPosition = useRef<number>(0);
  const velocityHistory = useRef<number[]>([]);
  const [scrollMetrics, setScrollMetrics] = useState<ScrollMetrics>({
    velocity: 0,
    acceleration: 0,
    position: 0,
    normalizedPosition: 0,
    isScrolling: false,
    direction: 'none'
  });

  const calculateVelocity = useCallback((currentPosition: number, currentTime: number) => {
    const deltaPosition = currentPosition - lastScrollPosition.current;
    const deltaTime = currentTime - lastScrollTime.current;
    
    if (deltaTime === 0) return 0;
    
    const velocity = deltaPosition / deltaTime;
    
    // Smooth velocity with rolling average
    velocityHistory.current.push(velocity);
    if (velocityHistory.current.length > 5) {
      velocityHistory.current.shift();
    }
    
    const smoothedVelocity = velocityHistory.current.reduce((a, b) => a + b, 0) / velocityHistory.current.length;
    
    lastScrollPosition.current = currentPosition;
    lastScrollTime.current = currentTime;
    
    return smoothedVelocity;
  }, []);

  const calculateAcceleration = useCallback((currentVelocity: number, previousVelocity: number, deltaTime: number) => {
    if (deltaTime === 0) return 0;
    return (currentVelocity - previousVelocity) / deltaTime;
  }, []);

  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;

    const currentTime = performance.now();
    const scrollTop = window.scrollY;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const normalizedPosition = maxScroll > 0 ? Math.min(Math.max(scrollTop / maxScroll, 0), 1) : 0;
    
    const currentVelocity = calculateVelocity(scrollTop, currentTime);
    const acceleration = calculateAcceleration(currentVelocity, scrollMetrics.velocity, currentTime - lastScrollTime.current);
    
    const direction = currentVelocity > 0.1 ? 'down' : currentVelocity < -0.1 ? 'up' : 'none';
    const isScrolling = Math.abs(currentVelocity) > 0.01;

    const newMetrics: ScrollMetrics = {
      velocity: currentVelocity,
      acceleration,
      position: scrollTop,
      normalizedPosition,
      isScrolling,
      direction
    };

    setScrollMetrics(newMetrics);
    onScrollMetrics(newMetrics);

    // Calculate current scene and progress
    const sceneProgress = normalizedPosition * totalScenes;
    const currentScene = Math.floor(sceneProgress);
    const sceneLocalProgress = sceneProgress - currentScene;

    onSceneChange(Math.min(currentScene, totalScenes - 1), sceneLocalProgress);
  }, [scrollMetrics.velocity, totalScenes, onScrollMetrics, onSceneChange, calculateVelocity, calculateAcceleration]);

  const smoothScrollTo = useCallback((targetPosition: number, duration: number = 1000) => {
    const startPosition = window.scrollY;
    const distance = targetPosition - startPosition;
    const startTime = performance.now();

    const animateScroll = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth movement
      const easeInOutCubic = (t: number) => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
      const easedProgress = easeInOutCubic(progress);
      
      const currentPosition = startPosition + distance * easedProgress;
      window.scrollTo(0, currentPosition);
      
      if (progress < 1) {
        requestAnimationFrame(animateScroll);
      }
    };

    requestAnimationFrame(animateScroll);
  }, []);

  const snapToScene = useCallback((sceneIndex: number) => {
    const targetPosition = (sceneIndex / totalScenes) * (document.documentElement.scrollHeight - window.innerHeight);
    smoothScrollTo(targetPosition, 800);
  }, [totalScenes, smoothScrollTo]);

  // Cinematic scroll behaviors
  useEffect(() => {
    if (!snapToScenes) return;

    const handleScrollEnd = () => {
      if (Math.abs(scrollMetrics.velocity) < 0.05) {
        const currentSceneFloat = scrollMetrics.normalizedPosition * totalScenes;
        const nearestScene = Math.round(currentSceneFloat);
        
        // Only snap if we're close to a scene boundary
        if (Math.abs(currentSceneFloat - nearestScene) < 0.3) {
          snapToScene(nearestScene);
        }
      }
    };

    const timeoutId = setTimeout(handleScrollEnd, 500);
    return () => clearTimeout(timeoutId);
  }, [scrollMetrics.velocity, scrollMetrics.normalizedPosition, totalScenes, snapToScenes, snapToScene]);

  // Enhanced scroll listener with throttling
  useEffect(() => {
    let ticking = false;

    const throttledScrollHandler = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', throttledScrollHandler, { passive: true });
    
    // Handle mouse wheel for more precise control
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      
      const scrollAmount = e.deltaY * 0.5; // Reduced scroll sensitivity for smoother movement
      const currentPosition = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const newPosition = Math.max(0, Math.min(currentPosition + scrollAmount, maxScroll));
      
      window.scrollTo(0, newPosition);
    };

    window.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      window.removeEventListener('scroll', throttledScrollHandler);
      window.removeEventListener('wheel', handleWheel);
    };
  }, [handleScroll]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
        case 'PageDown':
        case ' ':
          e.preventDefault();
          const currentScene = Math.floor(scrollMetrics.normalizedPosition * totalScenes);
          snapToScene(Math.min(currentScene + 1, totalScenes - 1));
          break;
          
        case 'ArrowUp':
        case 'PageUp':
          e.preventDefault();
          const prevScene = Math.floor(scrollMetrics.normalizedPosition * totalScenes);
          snapToScene(Math.max(prevScene - 1, 0));
          break;
          
        case 'Home':
          e.preventDefault();
          snapToScene(0);
          break;
          
        case 'End':
          e.preventDefault();
          snapToScene(totalScenes - 1);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [scrollMetrics.normalizedPosition, totalScenes, snapToScene]);

  return (
    <div ref={containerRef} className="relative">
      {children}
      
      {/* Scroll velocity indicator */}
      <div className="fixed top-4 left-4 z-50 pointer-events-none">
        <div className="bg-black/50 text-white px-3 py-2 rounded-lg backdrop-blur-sm text-sm font-mono">
          <div>Velocity: {scrollMetrics.velocity.toFixed(2)}</div>
          <div>Scene: {Math.floor(scrollMetrics.normalizedPosition * totalScenes) + 1}/{totalScenes}</div>
          <div>Direction: {scrollMetrics.direction}</div>
          {scrollMetrics.isScrolling && (
            <div className="text-green-400">● Scrolling</div>
          )}
        </div>
      </div>

      {/* Scene navigation dots */}
      <div className="fixed right-8 top-1/2 transform -translate-y-1/2 z-50 space-y-4">
        {Array.from({ length: totalScenes }).map((_, index) => {
          const isActive = Math.floor(scrollMetrics.normalizedPosition * totalScenes) === index;
          return (
            <button
              key={index}
              onClick={() => snapToScene(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                isActive 
                  ? 'bg-white scale-125 shadow-lg' 
                  : 'bg-white/30 hover:bg-white/50'
              }`}
              aria-label={`Go to scene ${index + 1}`}
            />
          );
        })}
      </div>
    </div>
  );
};