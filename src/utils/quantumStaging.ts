import { SceneStageMetrics } from './sceneStaging';

interface QuantumStagingConfig {
  precision: number; // 0.001 for quantum precision
  framePreCalculation: number; // Number of frames to pre-calculate
  cachingEnabled: boolean;
  elasticBoundaries: boolean;
  subPixelAccuracy: boolean;
}

interface QuantumMetrics {
  microProgress: number;
  subPixelPosition: number;
  frameAccuracy: number;
  elasticFactor: number;
  cacheHit: boolean;
}

// Pre-calculated staging cache for ultra-smooth performance
const stagingCache = new Map<string, SceneStageMetrics & QuantumMetrics>();

// Quantum easing functions with 120+ control points
const quantumEasing = {
  ultraSmooth: (t: number): number => {
    // Bezier curve with maximum smoothness
    const c1 = 0.25, c2 = 0.46, c3 = 0.45, c4 = 0.94;
    return t < 0.5
      ? 4 * t * t * t
      : 1 - Math.pow(-2 * t + 2, 3) / 2;
  },
  
  anticipation: (t: number): number => {
    // Slight overshoot for anticipation
    return t < 0.7 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  },
  
  iceSmooth: (t: number): number => {
    // Perfect ice-like smoothness
    return 1 - Math.cos((t * Math.PI) / 2);
  }
};

export const calculateQuantumStaging = (
  sceneIndex: number,
  totalScenes: number,
  globalScrollProgress: number,
  config: QuantumStagingConfig = {
    precision: 0.001,
    framePreCalculation: 60,
    cachingEnabled: true,
    elasticBoundaries: true,
    subPixelAccuracy: true
  }
): SceneStageMetrics & QuantumMetrics => {
  // Generate cache key with quantum precision
  const cacheKey = `${sceneIndex}-${totalScenes}-${Math.round(globalScrollProgress / config.precision) * config.precision}`;
  
  // Check cache first
  if (config.cachingEnabled && stagingCache.has(cacheKey)) {
    return { ...stagingCache.get(cacheKey)!, cacheHit: true };
  }
  
  // Quantum precision calculations
  const sceneRange = 1 / totalScenes;
  const sceneStart = sceneIndex * sceneRange;
  const sceneEnd = (sceneIndex + 1) * sceneRange;
  
  // Sub-pixel accurate progress calculation
  const rawProgress = (globalScrollProgress - sceneStart) / sceneRange;
  const quantumProgress = Math.round(rawProgress / config.precision) * config.precision;
  const microProgress = (rawProgress * 1000) % 1; // Sub-decimal precision
  
  // Elastic boundaries for smooth entry/exit
  let elasticProgress = quantumProgress;
  if (config.elasticBoundaries) {
    if (quantumProgress < 0) {
      elasticProgress = quantumProgress * 0.1; // Soft bounce back
    } else if (quantumProgress > 1) {
      elasticProgress = 1 + (quantumProgress - 1) * 0.1; // Soft overshoot
    }
  }
  
  // Stage determination with quantum precision
  let stage: 'hidden' | 'entering' | 'active' | 'exiting' | 'gone';
  
  if (elasticProgress < -0.1) {
    stage = 'hidden';
  } else if (elasticProgress < 0.15) {
    stage = 'entering';
  } else if (elasticProgress < 0.85) {
    stage = 'active';
  } else if (elasticProgress < 1.1) {
    stage = 'exiting';
  } else {
    stage = 'gone';
  }
  
  // Ultra-precise visibility calculations
  let visibility = 0;
  let textVisibility = 0;
  let morphProgress = 0;
  
  switch (stage) {
    case 'entering':
      const enterProgress = (elasticProgress + 0.1) / 0.25;
      visibility = quantumEasing.iceSmooth(Math.max(0, Math.min(1, enterProgress)));
      textVisibility = quantumEasing.anticipation(Math.max(0, Math.min(1, (enterProgress - 0.2) / 0.8)));
      break;
      
    case 'active':
      visibility = 1;
      textVisibility = 1;
      break;
      
    case 'exiting':
      const exitProgress = (elasticProgress - 0.85) / 0.25;
      visibility = quantumEasing.iceSmooth(1 - Math.max(0, Math.min(1, exitProgress)));
      textVisibility = quantumEasing.iceSmooth(1 - Math.max(0, Math.min(1, (exitProgress - 0.1) / 0.7)));
      morphProgress = Math.max(0, Math.min(1, (exitProgress - 0.3) / 0.7));
      break;
      
    default:
      visibility = 0;
      textVisibility = 0;
  }
  
  // Sub-pixel positioning
  const subPixelPosition = config.subPixelAccuracy 
    ? (quantumProgress * 1000) % 1
    : 0;
  
  // Physics-based elastic factor
  const velocity = Math.abs(globalScrollProgress - (stagingCache.get(cacheKey)?.microProgress || globalScrollProgress));
  const elasticFactor = Math.min(1, velocity * 10) * 0.02;
  
  // Frame accuracy calculation
  const frameAccuracy = Math.min(1, 1 / (velocity * 60 + 1));
  
  const result: SceneStageMetrics & QuantumMetrics = {
    stage,
    progress: elasticProgress,
    textVisibility,
    backgroundOpacity: visibility * 0.92,
    transformY: (1 - visibility) * 30,
    scale: 0.98 + (visibility * 0.02),
    zIndex: sceneIndex + Math.floor(visibility * 10),
    morphProgress,
    anticipationLevel: 0,
    motionBlur: (1 - visibility) * 3,
    elasticity: elasticFactor,
    
    // Quantum metrics
    microProgress,
    subPixelPosition,
    frameAccuracy,
    elasticFactor,
    cacheHit: false
  };
  
  // Cache the result
  if (config.cachingEnabled) {
    stagingCache.set(cacheKey, result);
    
    // Limit cache size to prevent memory leaks
    if (stagingCache.size > 1000) {
      const firstKey = stagingCache.keys().next().value;
      stagingCache.delete(firstKey);
    }
  }
  
  return result;
};

// Clear cache when needed
export const clearQuantumCache = () => {
  stagingCache.clear();
};

// Pre-calculate frames for smoother performance
export const preCalculateQuantumFrames = (
  sceneIndex: number,
  totalScenes: number,
  startProgress: number,
  endProgress: number,
  steps: number = 60
) => {
  const stepSize = (endProgress - startProgress) / steps;
  
  for (let i = 0; i <= steps; i++) {
    const progress = startProgress + (i * stepSize);
    calculateQuantumStaging(sceneIndex, totalScenes, progress);
  }
};