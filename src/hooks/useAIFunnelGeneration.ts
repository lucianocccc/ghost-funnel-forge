import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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

  // Import real Supabase client
  import { supabase } from '@/integrations/supabase/client';

  const { toast } = useToast();

  // Mock businessContext and generationOptions for handleGenerateFunnel
  // In a real component, these would come from state or props
  const businessContext = {
    businessName: "Example Corp",
    industry: "Technology",
    targetAudience: "Developers",
    mainProduct: "SaaS Platform",
    uniqueValueProposition: "Streamline your workflow",
  };
  const generationOptions = {
    includePricingAnalysis: true,
    includeCompetitorAnalysis: false,
    generateMultipleVariants: false,
    focusOnEmotionalTriggers: true,
  };


  const handleGenerateFunnel = async () => {
    setIsGenerating(true);
    setProgress({ stage: 'market_research', progress: 10, message: 'Iniziando ricerca di mercato...' });

    try {
      // Prepare generation request
      const generationRequest = {
        businessContext: {
          ...businessContext,
          competitors: businessContext.competitors || []
        },
        generationOptions
      };

      console.log('🚀 Starting funnel generation with request:', generationRequest);

      // Use Supabase Edge Function instead of API route
      const { data, error } = await supabase.functions.invoke('generate-funnel-ai', {
        body: generationRequest
      });

      if (error) {
        throw new Error(error.message || 'Failed to start funnel generation');
      }

      console.log('✅ Funnel generation response:', data);

      if (data?.success) {
        setResult(data.funnel || data);
        setProgress({ stage: 'complete', progress: 100, message: 'Funnel generato con successo!' });

        toast({
          title: "🎉 Funnel Generato!",
          description: "Il tuo funnel marketing unico è pronto! Ogni elemento è stato personalizzato per il tuo business.",
          duration: 5000
        });

        // Reset after success
        setTimeout(() => {
          setIsGenerating(false);
          setProgress(null);
        }, 2000);
      } else {
        throw new Error(data?.error || 'Errore nella generazione del funnel');
      }

    } catch (error) {
      console.error('❌ Generation error:', error);
      setError(error.message || "Si è verificato un errore durante la generazione del funnel. Riprova.");
      toast({
        title: "Errore Generazione",
        description: error.message || "Si è verificato un errore durante la generazione del funnel. Riprova.",
        variant: "destructive"
      });
      setIsGenerating(false);
      setProgress(null);
    }
  };

  return {
    generateFunnel: handleGenerateFunnel,
    isGenerating,
    progress,
    result,
    error,
    reset: () => {
      setIsGenerating(false);
      setProgress(null);
      setResult(null);
      setError(null);
      setJobId(null);
    }
  };
}