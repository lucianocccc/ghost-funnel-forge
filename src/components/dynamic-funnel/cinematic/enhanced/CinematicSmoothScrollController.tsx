
import React from 'react';
import { SimpleCinematicController } from '../SimpleCinematicController';

interface CinematicSmoothScrollControllerProps {
  children: React.ReactNode;
  totalScenes: number;
  onScrollMetrics: (metrics: any) => void;
  onSceneChange: (sceneIndex: number, progress: number) => void;
}

export const CinematicSmoothScrollController: React.FC<CinematicSmoothScrollControllerProps> = (props) => {
  return <SimpleCinematicController {...props} />;
};
