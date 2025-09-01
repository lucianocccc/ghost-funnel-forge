// Ultra-precise scene staging system for fluid transitions

export type SceneStage = 'hidden' | 'entering' | 'active' | 'exiting' | 'gone';

export interface SceneStageMetrics {
  stage: SceneStage;
  progress: number;
  textVisibility: number;
  backgroundOpacity: number;
  transformY: number;
  scale: number;
  zIndex: number;
}

export interface StagingConfig {
  contentPhase: number; // Percentage where content is stable (default: 70%)
  transitionPhase: number; // Percentage for transition (default: 30%)
  textFadeOut: number; // When current text starts fading (default: 70%)
  textFadeIn: number; // When next text starts appearing (default: 85%)
}

export const defaultStagingConfig: StagingConfig = {
  contentPhase: 0.7,
  transitionPhase: 0.3,
  textFadeOut: 0.7,
  textFadeIn: 0.85
};

/**
 * Calculate precise scene staging metrics based on scroll progress
 */
export const calculateSceneStaging = (
  sceneIndex: number,
  totalScenes: number,
  globalScrollProgress: number,
  config: StagingConfig = defaultStagingConfig
): SceneStageMetrics => {
  // Calculate scene boundaries (each scene takes 1/totalScenes of total scroll)
  const sceneSize = 1 / totalScenes;
  const sceneStart = sceneIndex * sceneSize;
  const sceneEnd = (sceneIndex + 1) * sceneSize;
  
  // Local progress within this scene (0-1)
  const localProgress = Math.max(0, Math.min(1, 
    (globalScrollProgress - sceneStart) / sceneSize
  ));

  // Determine stage based on position relative to viewport
  let stage: SceneStage;
  let progress: number;
  
  if (globalScrollProgress < sceneStart - sceneSize * 0.5) {
    stage = 'hidden';
    progress = 0;
  } else if (globalScrollProgress < sceneStart) {
    stage = 'entering';
    progress = (globalScrollProgress - (sceneStart - sceneSize * 0.5)) / (sceneSize * 0.5);
  } else if (localProgress <= config.contentPhase) {
    stage = 'active';
    progress = localProgress / config.contentPhase;
  } else if (localProgress < 1) {
    stage = 'exiting';
    progress = (localProgress - config.contentPhase) / config.transitionPhase;
  } else {
    stage = 'gone';
    progress = 1;
  }

  // Calculate text visibility with precise timing
  let textVisibility: number;
  if (stage === 'active') {
    textVisibility = 1;
  } else if (stage === 'entering') {
    textVisibility = Math.min(1, progress * 2); // Fade in quickly
  } else if (stage === 'exiting') {
    // Start fading out at specific point
    const fadeOutStart = Math.max(0, (localProgress - config.textFadeOut) / (1 - config.textFadeOut));
    textVisibility = Math.max(0, 1 - fadeOutStart * 2);
  } else {
    textVisibility = 0;
  }

  // Background opacity for smooth transitions
  let backgroundOpacity: number;
  if (stage === 'hidden' || stage === 'gone') {
    backgroundOpacity = 0;
  } else if (stage === 'entering') {
    backgroundOpacity = progress * 0.9;
  } else if (stage === 'active') {
    backgroundOpacity = 0.9;
  } else if (stage === 'exiting') {
    backgroundOpacity = Math.max(0.1, 0.9 * (1 - progress));
  } else {
    backgroundOpacity = 0;
  }

  // Transform calculations for ultra-smooth movement
  const transformY = stage === 'entering' ? (1 - progress) * 50 : 
                   stage === 'exiting' ? progress * -50 : 0;
  
  const scale = stage === 'entering' ? 0.95 + (progress * 0.05) :
               stage === 'exiting' ? 1 - (progress * 0.05) : 1;

  // Z-index for proper layering
  const zIndex = totalScenes - sceneIndex + (stage === 'active' ? 10 : 0);

  return {
    stage,
    progress,
    textVisibility,
    backgroundOpacity,
    transformY,
    scale,
    zIndex
  };
};

/**
 * Calculate next scene text preview timing
 */
export const calculateNextSceneTextVisibility = (
  nextSceneIndex: number,
  totalScenes: number,
  globalScrollProgress: number,
  config: StagingConfig = defaultStagingConfig
): number => {
  if (nextSceneIndex >= totalScenes) return 0;
  
  const sceneSize = 1 / totalScenes;
  const currentSceneStart = (nextSceneIndex - 1) * sceneSize;
  const fadeInPoint = currentSceneStart + (sceneSize * config.textFadeIn);
  
  if (globalScrollProgress >= fadeInPoint) {
    const fadeProgress = (globalScrollProgress - fadeInPoint) / (sceneSize * (1 - config.textFadeIn));
    return Math.min(1, fadeProgress * 3); // Fade in quickly
  }
  
  return 0;
};

/**
 * Optimize animation performance based on scroll velocity
 */
export const getPerformanceMode = (velocity: number): 'high' | 'medium' | 'low' => {
  const absVelocity = Math.abs(velocity);
  
  if (absVelocity > 2) return 'low'; // Fast scrolling - reduce animations
  if (absVelocity > 0.5) return 'medium'; // Medium scrolling
  return 'high'; // Slow/still - full animations
};