
import React from 'react';
import { OptimizedScrollController } from '../../performance/OptimizedScrollController';

interface CinematicSmoothScrollControllerProps {
  children: React.ReactNode;
  totalScenes: number;
  onScrollMetrics: (metrics: any) => void;
  onSceneChange: (sceneIndex: number, progress: number) => void;
}

export const CinematicSmoothScrollController: React.FC<CinematicSmoothScrollControllerProps> = (props) => {
  return <OptimizedScrollController {...props} />;
};
