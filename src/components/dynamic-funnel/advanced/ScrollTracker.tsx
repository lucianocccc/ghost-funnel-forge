
import React from 'react';
import { useStableScroll } from '@/hooks/useStableScroll';

interface ScrollTrackerProps {
  onScrollChange: (scrollPosition: number) => void;
}

export const ScrollTracker: React.FC<ScrollTrackerProps> = ({ onScrollChange }) => {
  const { scrollY } = useStableScroll({
    throttleMs: 8,
    debounceMs: 100,
    smoothing: 0.1,
    onScrollChange: (metrics) => {
      onScrollChange(metrics.smoothScrollY);
    }
  });

  return null;
};
