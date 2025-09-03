import { useState, useCallback, useEffect } from 'react';

// Types per i dati del funnel
export interface BusinessContext {
  businessName: string;
  industry: string;
  targetAudience: string;
  mainProduct: string;
  uniqueValueProposition: string;
  budget?: number;
  businessLocation?: string;
  competitors?: string[];
  brandPersonality?: string;
}

export interface GenerationOptions {
  includePricingAnalysis: boolean;
  includeCompetitorAnalysis: boolean;
  generateMultipleVariants: boolean;
  variantCount?: number;
  focusOnEmotionalTriggers: boolean;
  customRequirements?: string[];
}

export interface FunnelGenerationRequest {
  businessContext: BusinessContext;
  generationOptions: GenerationOptions;
}

export interface GenerationProgress {
  stage: 'market_research' | 'storytelling' | 'orchestration' | 'variants' | 'complete';
  progress: number; // 0-100
  message: string;
  currentData?: any;
}

export interface FunnelStep {
  id: string;
  type: 'landing' | 'lead_capture' | 'sales' | 'checkout' | 'upsell' | 'thank_you';
  name: string;
  description: string;
  content: {
    headline: string;
    subheadline: string;
    bodyText: string;
    callToAction: string;
    emotionalTriggers: string[];
    trustElements: string[];
    urgencyFactors: string[];
  };
  designElements: {
    colorScheme: string;
    layout: string;
    visualElements: string[];
  };
  nextStepId?: string;
}

export interface CompleteFunnel {
  id: string;
  name: string;
  description: string;
  steps: FunnelStep[];
  marketResearch: {
    marketSize: string;
    competitorAnalysis: string[];
    trends: string[];
    opportunities: string[];
  };
  storytelling: {
    heroStory: string;
    painPoints: string[];
    emotionalHooks: string[];
    resolution: string;
  };
  metadata: {
    generatedAt: string;
    generationDuration: number;
    aiModelsUsed: string[];
    uniquenessScore: number;
    estimatedSetupTime: string;
    recommendedBudget: string;
  };
}

// Hook principale per la generazione AI - USA API REALI
export function useAIFunnelGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState<GenerationProgress | null>(null);
  const [result, setResult] = useState<CompleteFunnel | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);

  const generateFunnel = useCallback(async (request: FunnelGenerationRequest): Promise<CompleteFunnel> => {
    setIsGenerating(true);
    setError(null);
    setResult(null);
    setProgress(null);

    try {
      console.log('🚀 Starting REAL AI funnel generation...');
      
      // Avvia generazione usando API backend reali
      const response = await fetch('/api/ai-funnels/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken') || 'dev-token'}`
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const { jobId: generationJobId, message } = await response.json();
      setJobId(generationJobId);
      
      console.log('✅ Generation job started:', { jobId: generationJobId, message });

      // Polling per il progress usando API reali
      return new Promise((resolve, reject) => {
        const pollInterval = setInterval(async () => {
          try {
            const statusResponse = await fetch(`/api/ai-funnels/generation-status/${generationJobId}`, {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken') || 'dev-token'}`
              }
            });

            if (!statusResponse.ok) {
              throw new Error(`Status check failed: ${statusResponse.status}`);
            }

            const statusData = await statusResponse.json();
            
            // Aggiorna progress UI
            setProgress({
              stage: statusData.currentStage,
              progress: statusData.progress,
              message: statusData.message
            });

            console.log('📊 Generation progress:', statusData);

            if (statusData.status === 'completed') {
              clearInterval(pollInterval);
              const completeFunnel = statusData.result;
              setResult(completeFunnel);
              setIsGenerating(false);
              console.log('🎉 Generation completed successfully!');
              resolve(completeFunnel);
            } else if (statusData.status === 'failed') {
              clearInterval(pollInterval);
              const errorMsg = statusData.errorMessage || 'Generation failed';
              setError(errorMsg);
              setIsGenerating(false);
              console.error('❌ Generation failed:', errorMsg);
              reject(new Error(errorMsg));
            }
          } catch (pollError) {
            clearInterval(pollInterval);
            setError(pollError.message);
            setIsGenerating(false);
            console.error('❌ Polling error:', pollError);
            reject(pollError);
          }
        }, 2000); // Controlla ogni 2 secondi

        // Timeout dopo 5 minuti
        setTimeout(() => {
          clearInterval(pollInterval);
          if (isGenerating) {
            setError('Generation timeout - please try again');
            setIsGenerating(false);
            reject(new Error('Generation timeout'));
          }
        }, 300000); // 5 minuti
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error('❌ Generation error:', err);
      setError(errorMessage);
      setIsGenerating(false);
      throw new Error(errorMessage);
    }
  }, [isGenerating]);

  return {
    generateFunnel,
    isGenerating,
    progress,
    result,
    error,
    reset: () => {
      setIsGenerating(false);
      setProgress(null);
      setResult(null);
      setError(null);
    }
  };
}