import React, { memo, useMemo, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';

interface UltraPerformanceRendererProps {
  children: React.ReactNode;
  isVisible: boolean;
  performanceMode: 'high' | 'medium' | 'low';
  stagingMetrics: any;
  sceneIndex: number;
  className?: string;
}

export const UltraPerformanceRenderer = memo<UltraPerformanceRendererProps>(({
  children,
  isVisible,
  performanceMode,
  stagingMetrics,
  sceneIndex,
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const lastRenderTime = useRef(0);
  const renderCount = useRef(0);

  // Hyper-performance rendering decisions
  const shouldRender = useMemo(() => {
    const now = performance.now();
    const timeSinceLastRender = now - lastRenderTime.current;
    
    // Ultra-high frequency rendering for ice-smooth effect
    const minRenderInterval = {
      high: 1,    // ~1000fps
      medium: 4,  // ~250fps  
      low: 8      // ~120fps
    }[performanceMode];
    
    if (timeSinceLastRender < minRenderInterval && renderCount.current > 0) {
      return false;
    }
    
    lastRenderTime.current = now;
    renderCount.current++;
    return true;
  }, [performanceMode, stagingMetrics.progress]);

  // Optimized transform calculations
  const transforms = useMemo(() => {
    if (!shouldRender) return {};
    
    const { transformY, scale, motionBlur, elasticity } = stagingMetrics;
    
    // Reduce precision for lower performance modes
    const precision = performanceMode === 'high' ? 100 : performanceMode === 'medium' ? 10 : 1;
    const roundedY = Math.round(transformY * precision) / precision;
    const roundedScale = Math.round(scale * precision) / precision;
    
    return {
      transform: `translate3d(0, ${roundedY}px, 0) scale(${roundedScale})`,
      filter: performanceMode === 'high' && motionBlur > 0.5 ? 
        `blur(${Math.min(motionBlur, 4)}px)` : 'none'
    };
  }, [stagingMetrics, performanceMode, shouldRender]);

  // Layer culling - don't render invisible elements
  const shouldRenderElement = useMemo(() => {
    const { stage, progress } = stagingMetrics;
    
    // Cull completely hidden elements
    if (stage === 'hidden' && progress < 0.01) return false;
    if (stage === 'gone' && progress > 0.99) return false;
    
    // For low performance, be more aggressive with culling
    if (performanceMode === 'low') {
      if (stage === 'entering' && progress < 0.1) return false;
      if (stage === 'exiting' && progress > 0.9) return false;
    }
    
    return true;
  }, [stagingMetrics, performanceMode]);

  // Optimized will-change management
  const willChangeStyle = useMemo(() => {
    const { isScrolling, velocity } = stagingMetrics;
    
    if (!isScrolling || Math.abs(velocity) < 0.1) {
      return { willChange: 'auto' };
    }
    
    // Only use will-change during active animations
    const properties = ['transform'];
    if (performanceMode === 'high') {
      properties.push('opacity', 'filter');
    }
    
    return { willChange: properties.join(', ') };
  }, [stagingMetrics, performanceMode]);

  // Hyper-optimized composite layer
  const layerStyle = useMemo(() => ({
    backfaceVisibility: 'hidden' as const,
    perspective: '1000px',
    transformStyle: 'preserve-3d' as const,
    contain: 'layout style paint size' as const, // Maximum containment
    isolation: 'isolate' as const, // Force new stacking context
    transform: 'translateZ(0)', // Force hardware layer
    ...willChangeStyle
  }), [willChangeStyle]);

  // Memory management - cleanup on unmount
  const handleCleanup = useCallback(() => {
    if (containerRef.current) {
      containerRef.current.style.willChange = 'auto';
    }
  }, []);

  // Don't render if element should be culled
  if (!shouldRenderElement) {
    return null;
  }

  // Render optimization based on performance mode
  const renderContent = () => {
    if (performanceMode === 'low') {
      // Simplified rendering for low performance
      return (
        <div
          ref={containerRef}
          className={className}
          style={{
            ...layerStyle,
            opacity: stagingMetrics.textVisibility,
            transform: `translateY(${stagingMetrics.transformY}px)`
          }}
        >
          {children}
        </div>
      );
    }

    // Pure JS control - eliminate CSS transitions for maximum smoothness
    return (
      <div
        ref={containerRef}
        className={className}
        style={{
          ...layerStyle,
          opacity: stagingMetrics.backgroundOpacity,
          ...transforms
        }}
      >
        {children}
      </div>
    );
  };

  return renderContent();
});

UltraPerformanceRenderer.displayName = 'UltraPerformanceRenderer';