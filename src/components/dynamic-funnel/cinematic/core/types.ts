// Core types for the cinematic funnel system

export interface CinematicScene {
  id: string;
  type: 'hero' | 'benefit' | 'proof' | 'demo' | 'conversion';
  title: string;
  subtitle: string;
  content: string;
  imagePrompt: string;
  imageUrl?: string;
  fallbackImage?: string;
  loadingPriority?: 'high' | 'low';
  cta?: {
    text: string;
    action: string;
  };
  scrollTrigger: {
    start: number;
    end: number;
  };
  parallaxLayers: Array<{
    element: string;
    speed: number;
    scale: number;
    opacity: number;
  }>;
  animationConfig: {
    textAnimation: 'fade' | 'slide' | 'typewriter';
    backgroundParallax: number; // Speed multiplier (0-1)
    scaleOnScroll: boolean;
  };
}

export interface ProductContext {
  name: string;
  description?: string;
  industry?: string;
  targetAudience?: string;
  visualStyle?: 'minimal' | 'dynamic' | 'elegant' | 'technical';
}

export interface ScrollMetrics {
  velocity: number;
  position: number;
  normalizedPosition: number;
  isScrolling: boolean;
  direction: 'up' | 'down' | 'none';
}

export interface ImageLoadingState {
  [sceneId: string]: {
    status: 'loading' | 'loaded' | 'error';
    url?: string;
    fallbackUrl?: string;
  };
}

export interface AnimationState {
  isActive: boolean;
  progress: number;
  direction: 'in' | 'out';
}