
import React, { memo } from 'react';
import { useSimpleScroll } from '@/hooks/useSimpleScroll';

interface SimpleScrollTrackerProps {
  onScrollChange: (scrollPosition: number) => void;
}

export const SimpleScrollTracker = memo<SimpleScrollTrackerProps>(({ onScrollChange }) => {
  const { scrollY } = useSimpleScroll();
  
  // Call the callback with the current scroll position
  React.useEffect(() => {
    onScrollChange(scrollY);
  }, [scrollY, onScrollChange]);

  return null;
});

SimpleScrollTracker.displayName = 'SimpleScrollTracker';
