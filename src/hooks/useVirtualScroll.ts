
import { useCallback, useEffect, useRef, useState } from 'react';

interface VirtualScrollOptions {
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
  onScroll?: (scrollTop: number) => void;
}

interface VirtualScrollState {
  scrollTop: number;
  startIndex: number;
  endIndex: number;
  visibleItems: number;
  totalHeight: number;
  offsetY: number;
}

export const useVirtualScroll = ({
  itemHeight,
  containerHeight,
  overscan = 3,
  onScroll
}: VirtualScrollOptions) => {
  const [state, setState] = useState<VirtualScrollState>({
    scrollTop: 0,
    startIndex: 0,
    endIndex: 0,
    visibleItems: 0,
    totalHeight: 0,
    offsetY: 0
  });

  const rafRef = useRef<number>();
  const lastScrollTop = useRef(0);

  const updateVirtualState = useCallback((scrollTop: number, totalItems: number) => {
    if (scrollTop === lastScrollTop.current) return;
    
    lastScrollTop.current = scrollTop;
    
    const visibleItems = Math.ceil(containerHeight / itemHeight);
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(totalItems - 1, startIndex + visibleItems + overscan * 2);
    const totalHeight = totalItems * itemHeight;
    const offsetY = startIndex * itemHeight;

    setState(prev => ({
      ...prev,
      scrollTop,
      startIndex,
      endIndex,
      visibleItems,
      totalHeight,
      offsetY
    }));

    onScroll?.(scrollTop);
  }, [itemHeight, containerHeight, overscan, onScroll]);

  const handleScroll = useCallback((event: Event) => {
    const target = event.target as HTMLElement;
    const scrollTop = target.scrollTop;
    
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
    
    rafRef.current = requestAnimationFrame(() => {
      updateVirtualState(scrollTop, Math.ceil(target.scrollHeight / itemHeight));
    });
  }, [updateVirtualState, itemHeight]);

  useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  return {
    ...state,
    handleScroll,
    updateVirtualState
  };
};
