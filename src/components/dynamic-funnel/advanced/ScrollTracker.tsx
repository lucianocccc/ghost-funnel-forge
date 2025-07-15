
import React from 'react';
import { SimpleScrollTracker } from './SimpleScrollTracker';

interface ScrollTrackerProps {
  onScrollChange: (scrollPosition: number) => void;
}

export const ScrollTracker: React.FC<ScrollTrackerProps> = ({ onScrollChange }) => {
  return <SimpleScrollTracker onScrollChange={onScrollChange} />;
};
