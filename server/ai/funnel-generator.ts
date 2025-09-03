import { openAIService, type AIOrchestrationRequest, type FunnelStructure } from './openai-service';
import { perplexityService, type MarketResearchRequest, type MarketResearchData } from './perplexity-service';
import { claudeService, type StorytellingRequest, type StorytellingContent } from './claude-service';

export interface FunnelGenerationRequest {
  businessContext: {
    businessName: string;
    industry: string;
    targetAudience: string;
    mainProduct: string;
    uniqueValueProposition: string;
    budget?: number;
    businessLocation?: string;
    competitors?: string[];
    brandPersonality?: string;
  };
  generationOptions: {
    includePricingAnalysis: boolean;
    includeCompetitorAnalysis: boolean;
    generateMultipleVariants: boolean;
    variantCount?: number;
    focusOnEmotionalTriggers: boolean;
    customRequirements?: string[];
  };
}

export interface CompleteFunnel {
  id: string;
  funnel: FunnelStructure;
  marketResearch: MarketResearchData;
  storytelling: StorytellingContent;
  metadata: {
    generatedAt: string;
    generationDuration: number;
    aiModelsUsed: string[];
    uniquenessScore: number;
    estimatedSetupTime: string;
    recommendedBudget: string;
  };
  variants?: CompleteFunnel[];
}

export interface GenerationProgress {
  stage: 'market_research' | 'storytelling' | 'orchestration' | 'variants' | 'complete';
  progress: number; // 0-100
  message: string;
  currentData?: any;
}

class FunnelGenerator {
  private progressCallbacks: Array<(progress: GenerationProgress) => void> = [];

  /**
   * Genera un funnel marketing completo utilizzando tutti i servizi AI
   */
  async generateCompleteFunnel(
    request: FunnelGenerationRequest,
    progressCallback?: (progress: GenerationProgress) => void
  ): Promise<CompleteFunnel> {
    const startTime = Date.now();
    
    if (progressCallback) {
      this.progressCallbacks.push(progressCallback);
    }

    try {
      // Fase 1: Ricerca di mercato con Perplexity
      this.updateProgress('market_research', 10, 'Conducting real-time market research...');
      
      const marketResearch = await this.conductMarketResearch(request);
      this.updateProgress('market_research', 30, 'Market research completed');

      // Fase 2: Storytelling con Claude
      this.updateProgress('storytelling', 40, 'Creating emotional storytelling...');
      
      const storytelling = await this.createStorytelling(request, marketResearch);
      this.updateProgress('storytelling', 60, 'Storytelling content generated');

      // Fase 3: Orchestrazione finale con OpenAI
      this.updateProgress('orchestration', 70, 'Orchestrating funnel structure...');
      
      const funnelStructure = await this.orchestrateFunnel(request, marketResearch, storytelling);
      this.updateProgress('orchestration', 85, 'Funnel structure completed');

      // Fase 4: Generazione varianti (se richiesta)
      let variants: CompleteFunnel[] | undefined;
      if (request.generationOptions.generateMultipleVariants) {
        this.updateProgress('variants', 90, 'Generating funnel variants...');
        variants = await this.generateFunnelVariants(request, funnelStructure, marketResearch, storytelling);
      }

      const generationDuration = Date.now() - startTime;
      
      const completeFunnel: CompleteFunnel = {
        id: `complete_funnel_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        funnel: funnelStructure,
        marketResearch,
        storytelling,
        metadata: {
          generatedAt: new Date().toISOString(),
          generationDuration,
          aiModelsUsed: ['GPT-5', 'Claude-4', 'Perplexity-Large'],
          uniquenessScore: this.calculateUniquenessScore(funnelStructure, marketResearch),
          estimatedSetupTime: this.estimateSetupTime(funnelStructure),
          recommendedBudget: this.calculateRecommendedBudget(request.businessContext.budget, funnelStructure)
        },
        variants
      };

      this.updateProgress('complete', 100, 'Funnel generation completed successfully!');
      
      return completeFunnel;
    } catch (error) {
      console.error('Error in complete funnel generation:', error);
      throw new Error(`Funnel generation failed: ${error.message}`);
    }
  }

  /**
   * Conduce ricerca di mercato completa
   */
  private async conductMarketResearch(request: FunnelGenerationRequest): Promise<MarketResearchData> {
    const marketRequest: MarketResearchRequest = {
      industry: request.businessContext.industry,
      targetAudience: request.businessContext.targetAudience,
      mainProduct: request.businessContext.mainProduct,
      businessLocation: request.businessContext.businessLocation || 'Italia',
      competitors: request.businessContext.competitors
    };

    const baseResearch = await perplexityService.conductMarketResearch(marketRequest);

    // Ricerca aggiuntiva se richiesta
    if (request.generationOptions.includeCompetitorAnalysis && request.businessContext.competitors) {
      try {
        const competitorData = await perplexityService.analyzeCompetitors(
          request.businessContext.industry,
          request.businessContext.competitors,
          request.businessContext.businessLocation
        );
        baseResearch.competitorAnalysis = competitorData;
      } catch (error) {
        console.warn('Competitor analysis failed:', error);
      }
    }

    if (request.generationOptions.includePricingAnalysis) {
      try {
        const pricingData = await perplexityService.researchPricingBenchmarks(
          request.businessContext.mainProduct,
          request.businessContext.industry,
          request.businessContext.targetAudience
        );
        baseResearch.pricingBenchmarks = pricingData;
      } catch (error) {
        console.warn('Pricing analysis failed:', error);
      }
    }

    return baseResearch;
  }

  /**
   * Crea contenuto storytelling
   */
  private async createStorytelling(
    request: FunnelGenerationRequest, 
    marketData: MarketResearchData
  ): Promise<StorytellingContent> {
    const storytellingRequest: StorytellingRequest = {
      businessContext: request.businessContext,
      marketData,
      emotionalTriggers: request.generationOptions.focusOnEmotionalTriggers 
        ? this.extractEmotionalTriggers(marketData) 
        : undefined
    };

    return await claudeService.createEmotionalStorytelling(storytellingRequest);
  }

  /**
   * Orchestrazione finale del funnel
   */
  private async orchestrateFunnel(
    request: FunnelGenerationRequest,
    marketResearch: MarketResearchData,
    storytelling: StorytellingContent
  ): Promise<FunnelStructure> {
    const orchestrationRequest: AIOrchestrationRequest = {
      businessContext: request.businessContext,
      marketResearch,
      storytellingData: storytelling
    };

    return await openAIService.orchestrateFunnelGeneration(orchestrationRequest);
  }

  /**
   * Genera varianti del funnel per A/B testing
   */
  private async generateFunnelVariants(
    request: FunnelGenerationRequest,
    baseFunnel: FunnelStructure,
    marketResearch: MarketResearchData,
    storytelling: StorytellingContent
  ): Promise<CompleteFunnel[]> {
    const variantCount = request.generationOptions.variantCount || 2;
    const variants: CompleteFunnel[] = [];

    try {
      const funnelVariants = await openAIService.generateFunnelVariants(baseFunnel, variantCount);
      
      for (let i = 0; i < funnelVariants.length; i++) {
        const variant = funnelVariants[i];
        
        // Genera storytelling variante
        const variantStorytelling = await claudeService.generateCopyVariants(
          storytelling.mainNarrative,
          request.businessContext.targetAudience,
          1,
          ['emotional_trigger']
        );

        variants.push({
          id: `variant_${i + 1}_${Date.now()}`,
          funnel: variant,
          marketResearch, // Stesso market research
          storytelling: {
            ...storytelling,
            mainNarrative: variantStorytelling[0]?.variant || storytelling.mainNarrative
          },
          metadata: {
            generatedAt: new Date().toISOString(),
            generationDuration: 0,
            aiModelsUsed: ['GPT-5', 'Claude-4'],
            uniquenessScore: this.calculateUniquenessScore(variant, marketResearch),
            estimatedSetupTime: this.estimateSetupTime(variant),
            recommendedBudget: this.calculateRecommendedBudget(request.businessContext.budget, variant)
          }
        });
      }
    } catch (error) {
      console.warn('Variant generation failed:', error);
    }

    return variants;
  }

  /**
   * Estrae trigger emotivi dai dati di mercato
   */
  private extractEmotionalTriggers(marketData: MarketResearchData): string[] {
    const triggers: string[] = [];
    
    // Estrai da customer insights
    marketData.customerInsights?.forEach(insight => {
      if (insight.includes('frustrato') || insight.includes('problema')) {
        triggers.push('frustration');
      }
      if (insight.includes('desiderio') || insight.includes('sogno')) {
        triggers.push('aspiration');
      }
      if (insight.includes('paura') || insight.includes('preoccupazione')) {
        triggers.push('fear');
      }
    });

    // Estrai da opportunity gaps
    marketData.opportunityGaps?.forEach(gap => {
      if (gap.includes('mancanza') || gap.includes('gap')) {
        triggers.push('scarcity');
      }
      if (gap.includes('urgente') || gap.includes('immediato')) {
        triggers.push('urgency');
      }
    });

    return Array.from(new Set(triggers));
  }

  /**
   * Calcola punteggio unicità del funnel
   */
  private calculateUniquenessScore(funnel: FunnelStructure, marketData: MarketResearchData): number {
    let score = 50; // Base score
    
    // Bonus per elementi unici
    if (funnel.uniqueElements?.length > 0) {
      score += funnel.uniqueElements.length * 10;
    }
    
    // Bonus per numero di step innovativi
    if (funnel.steps?.length > 5) {
      score += 15;
    }
    
    // Bonus per utilizzo dati di mercato
    if (marketData.opportunityGaps?.length > 0) {
      score += 20;
    }
    
    return Math.min(100, Math.max(0, score));
  }

  /**
   * Stima tempo di setup del funnel
   */
  private estimateSetupTime(funnel: FunnelStructure): string {
    const stepCount = funnel.steps?.length || 0;
    const baseHours = stepCount * 2; // 2 ore per step
    
    if (baseHours <= 8) return '1 giorno lavorativo';
    if (baseHours <= 16) return '2-3 giorni lavorativi';
    if (baseHours <= 32) return '1 settimana';
    return '2+ settimane';
  }

  /**
   * Calcola budget raccomandato
   */
  private calculateRecommendedBudget(requestedBudget: number | undefined, funnel: FunnelStructure): string {
    const stepCount = funnel.steps?.length || 0;
    const baseBudget = stepCount * 500; // 500€ per step
    
    if (requestedBudget && requestedBudget < baseBudget) {
      return `€${baseBudget} (budget minimo consigliato, richiesto: €${requestedBudget})`;
    }
    
    return `€${baseBudget} - €${baseBudget * 2}`;
  }

  /**
   * Aggiorna progress per tutti i callback registrati
   */
  private updateProgress(stage: GenerationProgress['stage'], progress: number, message: string) {
    const progressData: GenerationProgress = { stage, progress, message };
    this.progressCallbacks.forEach(callback => {
      try {
        callback(progressData);
      } catch (error) {
        console.warn('Progress callback error:', error);
      }
    });
  }

  /**
   * Ottimizza un funnel esistente
   */
  async optimizeExistingFunnel(
    funnelId: string,
    performanceData: any,
    optimizationGoals: string[]
  ): Promise<CompleteFunnel> {
    // Implementazione ottimizzazione funnel esistente
    throw new Error('Optimization not implemented yet');
  }
}

export const funnelGenerator = new FunnelGenerator();