import React, { useEffect, useState } from 'react';

interface ScrollTrackerProps {
  onScrollChange: (scrollPosition: number) => void;
}

export const ScrollTracker: React.FC<ScrollTrackerProps> = ({ onScrollChange }) => {
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const position = window.scrollY;
      setScrollPosition(position);
      onScrollChange(position);
    };

    // Add smooth scrolling behavior
    document.documentElement.style.scrollBehavior = 'smooth';
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [onScrollChange]);

  return null; // This is a logic-only component
};