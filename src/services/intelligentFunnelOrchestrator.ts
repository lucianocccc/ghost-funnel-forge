
// Intelligent Funnel Orchestrator - Orchestratore principale del nuovo sistema
import { ProductIntelligenceService, ProductContext, ProductIntelligenceAnalysis } from './productIntelligenceService';
import { WebResearchService, WebResearchAnalysis } from './webResearchService';
import { AdvancedPersonalizationService, PersonalizationContext, PersonalizedExperience } from './advancedPersonalizationService';
import { supabase } from '@/integrations/supabase/client';

interface IntelligentFunnelRequest {
  userPrompt: string;
  productName: string;
  productDescription: string;
  category?: string;
  industry?: string;
  targetAudience?: string;
  additionalContext?: any;
  analysisDepth?: 'basic' | 'intermediate' | 'advanced' | 'comprehensive';
  includeWebResearch?: boolean;
  includeMarketAnalysis?: boolean;
  includeCompetitorAnalysis?: boolean;
  personalizationLevel?: 'basic' | 'standard' | 'advanced' | 'maximum';
  saveToDatabase?: boolean;
  userId?: string;
}

interface IntelligentFunnelResponse {
  success: boolean;
  experience: PersonalizedExperience;
  analysis: {
    productIntelligence: ProductIntelligenceAnalysis;
    webResearch: WebResearchAnalysis[];
    personalizationInsights: any;
  };
  metadata: {
    processingTime: number;
    confidenceScore: number;
    uniquenessScore: number;
    qualityScore: number;
  };
  databaseRecord?: any;
}

export class IntelligentFunnelOrchestrator {
  private static instance: IntelligentFunnelOrchestrator;
  private productIntelligence: ProductIntelligenceService;
  private webResearch: WebResearchService;
  private personalization: AdvancedPersonalizationService;

  private constructor() {
    this.productIntelligence = ProductIntelligenceService.getInstance();
    this.webResearch = WebResearchService.getInstance();
    this.personalization = AdvancedPersonalizationService.getInstance();
  }

  static getInstance(): IntelligentFunnelOrchestrator {
    if (!IntelligentFunnelOrchestrator.instance) {
      IntelligentFunnelOrchestrator.instance = new IntelligentFunnelOrchestrator();
    }
    return IntelligentFunnelOrchestrator.instance;
  }

  async generateIntelligentFunnel(request: IntelligentFunnelRequest): Promise<IntelligentFunnelResponse> {
    const startTime = Date.now();
    
    console.log('🧠 Starting intelligent funnel generation...', {
      productName: request.productName,
      analysisDepth: request.analysisDepth || 'comprehensive',
      includeWebResearch: request.includeWebResearch !== false,
      personalizationLevel: request.personalizationLevel || 'maximum'
    });

    try {
      // Fase 1: Analisi del prodotto
      console.log('📊 Phase 1: Product Intelligence Analysis');
      const productContext: ProductContext = await this.buildProductContext(request);
      const productIntelligence = await this.productIntelligence.analyzeProduct(productContext);

      // Fase 2: Ricerca web (se richiesta)
      console.log('🌐 Phase 2: Web Research');
      const webResearch: WebResearchAnalysis[] = [];
      
      if (request.includeWebResearch !== false) {
        const tasks = [];
        
        // Ricerca generale sul prodotto
        tasks.push(this.webResearch.searchProductInfo(request.productName, request.category));
        
        // Ricerca competitor se richiesta
        if (request.includeCompetitorAnalysis !== false && request.industry) {
          tasks.push(this.webResearch.searchCompetitors(request.productName, request.industry));
        }
        
        // Ricerca trend di mercato se richiesta
        if (request.includeMarketAnalysis !== false && request.industry) {
          tasks.push(this.webResearch.searchMarketTrends(request.industry));
        }
        
        // Ricerca customer insights
        tasks.push(this.webResearch.searchCustomerInsights(request.productName, request.targetAudience));
        
        const results = await Promise.allSettled(tasks);
        results.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            webResearch.push(result.value);
          } else {
            console.warn(`Web research task ${index} failed:`, result.reason);
          }
        });
      }

      // Fase 3: Personalizzazione avanzata
      console.log('✨ Phase 3: Advanced Personalization');
      const personalizationContext: PersonalizationContext = {
        productContext,
        productIntelligence,
        webResearch,
        userIntent: request.userPrompt,
        userProfile: await this.extractUserProfile(request),
        marketContext: await this.getMarketContext(request)
      };

      const experience = await this.personalization.createPersonalizedExperience(personalizationContext);

      // Fase 4: Ottimizzazione per la conversione
      console.log('🎯 Phase 4: Conversion Optimization');
      const optimizedExperience = await this.personalization.optimizeForConversion(experience);

      // Fase 5: Salvataggio nel database (se richiesto)
      let databaseRecord = null;
      if (request.saveToDatabase && request.userId) {
        console.log('💾 Phase 5: Database Storage');
        databaseRecord = await this.saveToDatabase(optimizedExperience, request, productIntelligence);
      }

      const processingTime = Date.now() - startTime;
      const confidenceScore = this.calculateConfidenceScore(productIntelligence, webResearch, optimizedExperience);
      const qualityScore = this.calculateQualityScore(optimizedExperience, productIntelligence);

      console.log('🎉 Intelligent funnel generation completed!', {
        processingTime: `${processingTime}ms`,
        confidenceScore,
        qualityScore,
        uniquenessScore: optimizedExperience.uniquenessScore,
        steps: optimizedExperience.steps.length
      });

      return {
        success: true,
        experience: optimizedExperience,
        analysis: {
          productIntelligence,
          webResearch,
          personalizationInsights: personalizationContext
        },
        metadata: {
          processingTime,
          confidenceScore,
          uniquenessScore: optimizedExperience.uniquenessScore,
          qualityScore
        },
        databaseRecord
      };

    } catch (error) {
      console.error('💥 Intelligent funnel generation failed:', error);
      throw error;
    }
  }

  private async buildProductContext(request: IntelligentFunnelRequest): Promise<ProductContext> {
    return {
      name: request.productName,
      description: request.productDescription,
      category: request.category,
      industry: request.industry,
      targetAudience: request.targetAudience,
      // Estrai altre informazioni dal prompt usando AI
      ...(await this.extractAdditionalContext(request))
    };
  }

  private async extractAdditionalContext(request: IntelligentFunnelRequest): Promise<Partial<ProductContext>> {
    try {
      const { data } = await supabase.functions.invoke('extract-product-context', {
        body: {
          prompt: request.userPrompt,
          productName: request.productName,
          productDescription: request.productDescription
        }
      });
      
      return data?.context || {};
    } catch (error) {
      console.warn('Failed to extract additional context:', error);
      return {};
    }
  }

  private async extractUserProfile(request: IntelligentFunnelRequest): Promise<any> {
    try {
      const { data } = await supabase.functions.invoke('extract-user-profile', {
        body: {
          prompt: request.userPrompt,
          additionalContext: request.additionalContext
        }
      });
      
      return data?.profile || {};
    } catch (error) {
      console.warn('Failed to extract user profile:', error);
      return {};
    }
  }

  private async getMarketContext(request: IntelligentFunnelRequest): Promise<any> {
    const now = new Date();
    const season = this.getCurrentSeason(now);
    
    return {
      season,
      currentMonth: now.getMonth() + 1,
      currentYear: now.getFullYear(),
      region: 'IT',
      language: 'it'
    };
  }

  private getCurrentSeason(date: Date): string {
    const month = date.getMonth() + 1;
    if (month >= 3 && month <= 5) return 'spring';
    if (month >= 6 && month <= 8) return 'summer';
    if (month >= 9 && month <= 11) return 'autumn';
    return 'winter';
  }

  private async saveToDatabase(experience: PersonalizedExperience, request: IntelligentFunnelRequest, intelligence: ProductIntelligenceAnalysis): Promise<any> {
    try {
      // Genera token di condivisione
      const shareToken = Array.from(crypto.getRandomValues(new Uint8Array(32)))
        .map(b => b.toString(16).padStart(2, '0')).join('');

      // Salva il funnel principale
      const { data: funnel, error: funnelError } = await supabase
        .from('interactive_funnels')
        .insert({
          name: experience.name,
          description: experience.description,
          created_by: request.userId,
          share_token: shareToken,
          is_public: true,
          status: 'active',
          settings: {
            ...experience.settings,
            theme: experience.theme,
            narrative: experience.narrative,
            conversionOptimization: experience.conversionOptimization,
            productIntelligence: intelligence,
            generatedBy: 'intelligent_orchestrator',
            generatedAt: new Date().toISOString()
          }
        })
        .select()
        .single();

      if (funnelError) {
        throw new Error(`Errore nel salvataggio del funnel: ${funnelError.message}`);
      }

      // Salva gli step personalizzati
      const steps = experience.steps.map((step, index) => ({
        funnel_id: funnel.id,
        step_order: step.stepOrder,
        step_type: step.stepType,
        title: step.title,
        description: step.description,
        fields_config: step.fieldsConfig,
        settings: {
          ...step.settings,
          personalizedContent: step.personalizedContent,
          visualElements: step.visualElements,
          behavioralTriggers: step.behavioralTriggers,
          adaptiveRules: step.adaptiveRules
        }
      }));

      const { error: stepsError } = await supabase
        .from('interactive_funnel_steps')
        .insert(steps);

      if (stepsError) {
        throw new Error(`Errore nel salvataggio degli step: ${stepsError.message}`);
      }

      return {
        id: funnel.id,
        shareToken,
        steps: steps.length
      };

    } catch (error) {
      console.error('❌ Database save failed:', error);
      throw error;
    }
  }

  private calculateConfidenceScore(intelligence: ProductIntelligenceAnalysis, webResearch: WebResearchAnalysis[], experience: PersonalizedExperience): number {
    let score = 0;
    
    // Punteggio dall'intelligenza del prodotto
    score += intelligence.confidenceScore * 0.4;
    
    // Punteggio dalla ricerca web
    if (webResearch.length > 0) {
      const avgWebConfidence = webResearch.reduce((sum, research) => sum + research.confidence, 0) / webResearch.length;
      score += avgWebConfidence * 0.3;
    }
    
    // Punteggio dalla personalizzazione
    score += experience.personalizationScore * 0.3;
    
    return Math.min(100, Math.max(0, score));
  }

  private calculateQualityScore(experience: PersonalizedExperience, intelligence: ProductIntelligenceAnalysis): number {
    let score = 0;
    
    // Valuta la qualità del contenuto
    score += experience.steps.length >= 3 ? 20 : 10;
    score += experience.personalizationScore > 80 ? 20 : 10;
    score += experience.uniquenessScore > 80 ? 20 : 10;
    score += intelligence.analysisDepth === 'comprehensive' ? 20 : 10;
    score += experience.conversionOptimization.optimizationStrategies.length > 0 ? 20 : 10;
    
    return Math.min(100, Math.max(0, score));
  }

  // Metodi di utilità
  clearAllCaches(): void {
    this.productIntelligence.clearCache();
    this.webResearch.clearCache();
    this.personalization.clearCache();
  }

  getSystemStats(): any {
    return {
      productIntelligence: this.productIntelligence.getCacheStats(),
      webResearch: this.webResearch.getCacheStats(),
      personalization: this.personalization.getCacheStats()
    };
  }
}

export { IntelligentFunnelRequest, IntelligentFunnelResponse };
