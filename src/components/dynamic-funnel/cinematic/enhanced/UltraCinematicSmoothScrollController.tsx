
import React from 'react';
import { UltraOptimizedScrollController } from '../../performance/UltraOptimizedScrollController';

interface UltraCinematicSmoothScrollControllerProps {
  children: React.ReactNode;
  totalScenes: number;
  onScrollMetrics: (metrics: any) => void;
  onSceneChange: (sceneIndex: number, progress: number) => void;
}

export const UltraCinematicSmoothScrollController: React.FC<UltraCinematicSmoothScrollControllerProps> = (props) => {
  return <UltraOptimizedScrollController {...props} />;
};
