
import React, { useRef, useEffect, memo } from 'react';
import { useVirtualScroll } from '@/hooks/useVirtualScroll';

interface VirtualScrollContainerProps {
  children: React.ReactNode;
  itemHeight: number;
  totalItems: number;
  onScroll?: (scrollTop: number) => void;
  className?: string;
}

export const VirtualScrollContainer = memo<VirtualScrollContainerProps>(({
  children,
  itemHeight,
  totalItems,
  onScroll,
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  
  const {
    startIndex,
    endIndex,
    totalHeight,
    offsetY,
    handleScroll
  } = useVirtualScroll({
    itemHeight,
    containerHeight: typeof window !== 'undefined' ? window.innerHeight : 800,
    overscan: 2,
    onScroll
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    container.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-auto ${className}`}
      style={{
        height: '100vh',
        willChange: 'scroll-position'
      }}
    >
      <div
        className="relative"
        style={{
          height: totalHeight,
          transform: 'translateZ(0)', // Force hardware acceleration
        }}
      >
        <div
          ref={contentRef}
          className="absolute top-0 left-0 w-full"
          style={{
            transform: `translateY(${offsetY}px)`,
            willChange: 'transform'
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
});

VirtualScrollContainer.displayName = 'VirtualScrollContainer';
