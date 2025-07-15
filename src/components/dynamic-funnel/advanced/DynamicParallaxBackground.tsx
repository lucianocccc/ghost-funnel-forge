
import React from 'react';
import { OptimizedParallaxBackground } from './OptimizedParallaxBackground';

interface DynamicParallaxBackgroundProps {
  productName: string;
  industry: string;
  theme: any;
  scrollPosition: number;
}

export const DynamicParallaxBackground: React.FC<DynamicParallaxBackgroundProps> = (props) => {
  return <OptimizedParallaxBackground {...props} />;
};
