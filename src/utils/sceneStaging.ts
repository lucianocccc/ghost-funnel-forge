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
  morphProgress: number;
  anticipationLevel: number;
  motionBlur: number;
  elasticity: number;
}

export interface StagingConfig {
  contentPhase: number; // Percentage where content is stable
  transitionPhase: number; // Percentage for transition
  textFadeOut: number; // When current text starts fading
  textFadeIn: number; // When next text starts appearing
  anticipationPhase: number; // When next scene starts preparing
  morphingEnabled: boolean; // Enable text morphing transitions
  adaptiveTimings: boolean; // Adapt timing based on content length
}

export const defaultStagingConfig: StagingConfig = {
  contentPhase: 0.65,
  transitionPhase: 0.35,
  textFadeOut: 0.65,
  textFadeIn: 0.80,
  anticipationPhase: 0.60,
  morphingEnabled: true,
  adaptiveTimings: true
};

/**
 * Ultra-precise cubic bezier easing for natural motion
 */
const ultraSmoothEasing = (t: number): number => {
  // Custom cubic-bezier(0.25, 0.46, 0.45, 0.94) for natural acceleration
  const c1 = 0.25;
  const c2 = 0.46;
  const c3 = 0.45;
  const c4 = 0.94;
  
  return 3 * (1 - t) * (1 - t) * t * c1 + 
         3 * (1 - t) * t * t * c3 + 
         t * t * t;
};

/**
 * Calculate adaptive timing based on content characteristics
 */
const getAdaptiveTimings = (contentLength: number, sceneType: string): Partial<StagingConfig> => {
  const baseConfig = { ...defaultStagingConfig };
  
  // Longer content needs more stable time
  if (contentLength > 200) {
    baseConfig.contentPhase = 0.75;
    baseConfig.textFadeOut = 0.75;
  }
  
  // Form scenes need different timing
  if (sceneType.includes('form') || sceneType.includes('input')) {
    baseConfig.contentPhase = 0.8;
    baseConfig.anticipationPhase = 0.7;
  }
  
  return baseConfig;
};

/**
 * Calculate ultra-precise scene staging metrics with enhanced fluidity
 */
export const calculateSceneStaging = (
  sceneIndex: number,
  totalScenes: number,
  globalScrollProgress: number,
  config: StagingConfig = defaultStagingConfig,
  contentLength: number = 0,
  sceneType: string = '',
  velocity: number = 0
): SceneStageMetrics => {
  // Apply adaptive timings if enabled
  const finalConfig = config.adaptiveTimings ? 
    { ...config, ...getAdaptiveTimings(contentLength, sceneType) } : config;
  
  // Calculate scene boundaries with enhanced precision
  const sceneSize = 1 / totalScenes;
  const sceneStart = sceneIndex * sceneSize;
  const sceneEnd = (sceneIndex + 1) * sceneSize;
  
  // Local progress with ultra-smooth easing
  const rawProgress = Math.max(0, Math.min(1, 
    (globalScrollProgress - sceneStart) / sceneSize
  ));
  const localProgress = ultraSmoothEasing(rawProgress);

  // Enhanced stage calculation with anticipation
  let stage: SceneStage;
  let progress: number;
  
  const anticipationStart = sceneStart - sceneSize * 0.4;
  const enteringStart = sceneStart - sceneSize * 0.2;
  
  if (globalScrollProgress < anticipationStart) {
    stage = 'hidden';
    progress = 0;
  } else if (globalScrollProgress < enteringStart) {
    stage = 'hidden'; // Still hidden but anticipating
    progress = (globalScrollProgress - anticipationStart) / (sceneSize * 0.2);
  } else if (globalScrollProgress < sceneStart) {
    stage = 'entering';
    progress = (globalScrollProgress - enteringStart) / (sceneSize * 0.2);
  } else if (localProgress <= finalConfig.contentPhase) {
    stage = 'active';
    progress = localProgress / finalConfig.contentPhase;
  } else if (localProgress < 1) {
    stage = 'exiting';
    progress = (localProgress - finalConfig.contentPhase) / finalConfig.transitionPhase;
  } else {
    stage = 'gone';
    progress = 1;
  }

  // Enhanced text visibility with staggered timing
  let textVisibility: number;
  let morphProgress = 0;
  
  if (stage === 'active') {
    textVisibility = 1;
  } else if (stage === 'entering') {
    const eased = ultraSmoothEasing(progress);
    textVisibility = Math.min(1, eased * 1.8); // Smooth fade in
  } else if (stage === 'exiting') {
    // Progressive fade out with morphing preparation
    const fadeOutStart = Math.max(0, (localProgress - finalConfig.textFadeOut) / (1 - finalConfig.textFadeOut));
    const easedFadeOut = ultraSmoothEasing(fadeOutStart);
    textVisibility = Math.max(0, 1 - easedFadeOut * 1.5);
    
    // Morphing progress for text transformation
    if (finalConfig.morphingEnabled) {
      morphProgress = Math.min(1, fadeOutStart * 2);
    }
  } else {
    textVisibility = 0;
  }

  // Enhanced background opacity with breathing effect
  let backgroundOpacity: number;
  if (stage === 'hidden' || stage === 'gone') {
    backgroundOpacity = 0;
  } else if (stage === 'entering') {
    const eased = ultraSmoothEasing(progress);
    backgroundOpacity = eased * 0.92;
  } else if (stage === 'active') {
    // Subtle breathing effect based on scroll position
    const breathe = 0.02 * Math.sin(globalScrollProgress * Math.PI * 4);
    backgroundOpacity = 0.92 + breathe;
  } else if (stage === 'exiting') {
    const eased = ultraSmoothEasing(1 - progress);
    backgroundOpacity = Math.max(0.08, 0.92 * eased);
  } else {
    backgroundOpacity = 0;
  }

  // Advanced transform calculations with momentum
  const velocityFactor = Math.min(1, Math.abs(velocity) / 3);
  const momentumMultiplier = 1 + velocityFactor * 0.3;
  
  let transformY = 0;
  if (stage === 'entering') {
    const eased = ultraSmoothEasing(progress);
    transformY = (1 - eased) * 60 * momentumMultiplier;
  } else if (stage === 'exiting') {
    const eased = ultraSmoothEasing(progress);
    transformY = eased * -40 * momentumMultiplier;
  }
  
  // Enhanced scale with micro-animations
  let scale = 1;
  if (stage === 'entering') {
    const eased = ultraSmoothEasing(progress);
    scale = 0.94 + (eased * 0.06);
  } else if (stage === 'exiting') {
    const eased = ultraSmoothEasing(progress);
    scale = 1 - (eased * 0.03);
  } else if (stage === 'active') {
    // Micro-scale breathing
    const microScale = 0.005 * Math.sin(globalScrollProgress * Math.PI * 6);
    scale = 1 + microScale;
  }

  // Motion blur calculation for fast scrolling
  const motionBlur = Math.min(8, Math.abs(velocity) * 2);
  
  // Anticipation level for next scene preparation
  const anticipationLevel = stage === 'active' && localProgress > finalConfig.anticipationPhase ? 
    (localProgress - finalConfig.anticipationPhase) / (1 - finalConfig.anticipationPhase) : 0;
  
  // Elasticity for natural movement
  const elasticity = Math.sin(progress * Math.PI) * 0.1;

  // Dynamic z-index with active scene priority
  const zIndex = totalScenes - sceneIndex + (stage === 'active' ? 20 : stage === 'entering' ? 10 : 0);

  return {
    stage,
    progress: ultraSmoothEasing(progress),
    textVisibility,
    backgroundOpacity,
    transformY,
    scale,
    zIndex,
    morphProgress,
    anticipationLevel,
    motionBlur,
    elasticity
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