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

  const { toast } = useToast();

  const handleGenerateFunnel = async (businessContextParam?: BusinessContext, generationOptionsParam?: GenerationOptions) => {
    setIsGenerating(true);
    setProgress({ stage: 'market_research', progress: 10, message: 'Iniziando ricerca di mercato...' });

    try {
      // Use passed parameters if available, otherwise use mock data for compatibility
      const finalBusinessContext = businessContextParam || {
        businessName: "Example Corp",
        industry: "Technology", 
        targetAudience: "Developers",
        mainProduct: "SaaS Platform",
        uniqueValueProposition: "Streamline your workflow",
      };
      const finalGenerationOptions = generationOptionsParam || {
        includePricingAnalysis: true,
        includeCompetitorAnalysis: false,
        generateMultipleVariants: false,
        focusOnEmotionalTriggers: true,
      };

      console.log('🚀 Starting funnel generation with request:', {
        businessContext: finalBusinessContext,
        generationOptions: finalGenerationOptions
      });

      // Create detailed prompt for AI generation
      const aiPrompt = `
        Genera un funnel marketing interattivo per:
        
        BUSINESS: ${finalBusinessContext.businessName}
        SETTORE: ${finalBusinessContext.industry}
        PRODOTTO: ${finalBusinessContext.mainProduct}
        TARGET: ${finalBusinessContext.targetAudience}
        VALUE PROPOSITION: ${finalBusinessContext.uniqueValueProposition}
        BRAND PERSONALITY: ${finalBusinessContext.brandPersonality || 'Professionale'}
        
        Crea un funnel con 4-6 step progressivi che include:
        1. Landing page coinvolgente con hero section
        2. Cattura lead con form intelligente
        3. Presentazione valore e benefici
        4. Testimonianze e social proof
        5. Call-to-action finale con urgenza
        
        Ogni step deve avere contenuti unici, copy persuasivo e design moderno.
        
        ${finalGenerationOptions.includePricingAnalysis ? 'Include analisi prezzi competitivi.' : ''}
        ${finalGenerationOptions.includeCompetitorAnalysis ? 'Differenziati dalla concorrenza.' : ''}
        ${finalGenerationOptions.focusOnEmotionalTriggers ? 'Usa trigger emotivi potenti.' : ''}
      `;

      // Use the interactive funnel AI generator
      const { data, error } = await supabase.functions.invoke('generate-interactive-funnel-ai', {
        body: {
          prompt: aiPrompt,
          userId: crypto.randomUUID(), // Will be replaced by actual user ID
          saveToLibrary: true,
          customerProfile: {
            businessInfo: {
              name: finalBusinessContext.businessName,
              industry: finalBusinessContext.industry,
              targetAudience: finalBusinessContext.targetAudience,
              keyBenefits: [finalBusinessContext.uniqueValueProposition]
            },
            psychographics: {
              painPoints: [],
              motivations: [finalBusinessContext.uniqueValueProposition],
              preferredTone: finalBusinessContext.brandPersonality || 'professional',
              communicationStyle: 'persuasive'
            },
            behavioralData: {
              engagementLevel: 8,
              conversionIntent: 9,
              informationGatheringStyle: 'detailed'
            },
            conversionStrategy: {
              primaryGoal: 'Aumentare conversioni',
              secondaryGoals: ['Generare lead qualificati'],
              keyMessages: [finalBusinessContext.uniqueValueProposition]
            }
          }
        }
      });

      if (error) {
        console.error('❌ Supabase function error:', error);
        throw new Error(error.message || 'Failed to start funnel generation');
      }

      console.log('✅ Funnel generation response:', data);

      // Handle different response formats
      if (data?.success && data?.funnel) {
        // New format with explicit success flag
        setResult(data.funnel);
        setProgress({ stage: 'complete', progress: 100, message: 'Funnel generato con successo!' });
        
        toast({
          title: "🎉 Funnel Generato!",
          description: `Funnel "${data.funnel.name}" creato con successo dalle AI GPT-5, Claude-4 e Perplexity!`,
          duration: 5000
        });
      } else if (data?.id && data?.name) {
        // Direct funnel data format
        setResult(data);
        setProgress({ stage: 'complete', progress: 100, message: 'Funnel generato con successo!' });
        
        toast({
          title: "🎉 Funnel Generato!",
          description: `Funnel "${data.name}" creato con successo dalle tre AI!`,
          duration: 5000
        });
      } else {
        throw new Error(data?.error || 'Formato risposta non valido');
      }

      // Reset generating state after success
      setTimeout(() => {
        setIsGenerating(false);
        setProgress(null);
      }, 3000);

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