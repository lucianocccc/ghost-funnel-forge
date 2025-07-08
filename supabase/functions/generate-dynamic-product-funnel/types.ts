// Type definitions for the dynamic product funnel generation

export interface ProductFunnelRequest {
  productName: string;
  productDescription?: string;
  targetAudience?: string;
  industry?: string;
  funnelType?: 'standard' | 'cinematic';
  generateImages?: boolean;
}

export interface CinematicScene {
  id: string;
  type: 'hero' | 'benefit' | 'proof' | 'demo' | 'conversion';
  imagePrompt: string;
  imageUrl?: string;
  title: string;
  subtitle: string;
  content: string;
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
}

export interface ProgressUpdate {
  step: string;
  progress: number;
  details?: string;
}

export interface CinematicFunnelParams {
  productName: string;
  productDescription?: string;
  targetAudience?: string;
  industry?: string;
  generateImages: boolean;
  openAIApiKey: string;
}

export interface ErrorDetails {
  requestId?: string;
  message: string;
  stack?: string;
  timestamp: string;
  executionTime: number;
  productName: string;
  openAIApiKey?: string;
}