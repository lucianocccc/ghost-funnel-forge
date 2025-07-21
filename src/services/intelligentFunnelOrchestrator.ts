import type { PersonalizedExperience } from './advancedPersonalizationService';

import { ProductIntelligenceService } from './productIntelligenceService';
import { WebResearchService } from './webResearchService';
import { AdvancedPersonalizationService } from './advancedPersonalizationService';
import type { ProductContext, ProductIntelligenceAnalysis } from './productIntelligenceService';
import type { WebResearchAnalysis } from './webResearchService';
import type { PersonalizationContext, PersonalizedExperience } from './advancedPersonalizationService';
import { supabase } from '@/integrations/supabase/client';

interface IntelligentFunnelRequest {
  userPrompt: string;
  productName: string;
  productDescription: string;
  category?: string;
  industry?: string;
  targetAudience?: string;
  analysisDepth: 'basic' | 'comprehensive' | 'expert';
  personalizationLevel: 'basic' | 'advanced' | 'maximum';
  includeWebResearch?: boolean;
  includeMarketAnalysis?: boolean;
  includeCompetitorAnalysis?: boolean;
}

interface IntelligentFunnelResponse {
  success: boolean;
  experience: PersonalizedExperience;
  databaseRecord?: {
    id: string;
    shareToken: string;
  };
  metadata: {
    processingTime: number;
    confidenceScore: number;
    uniquenessIndex: number;
    personalizationScore: number;
    analysisQuality: number;
  };
  error?: string;
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

  public static getInstance(): IntelligentFunnelOrchestrator {
    if (!IntelligentFunnelOrchestrator.instance) {
      IntelligentFunnelOrchestrator.instance = new IntelligentFunnelOrchestrator();
    }
    return IntelligentFunnelOrchestrator.instance;
  }

  async generateIntelligentFunnel(request: IntelligentFunnelRequest): Promise<IntelligentFunnelResponse> {
    const startTime = Date.now();
    
    try {
      console.log('🚀 Starting intelligent funnel generation process...');
      console.log('Request details:', {
        productName: request.productName,
        analysisDepth: request.analysisDepth,
        personalizationLevel: request.personalizationLevel
      });

      // Phase 1: Product Intelligence Analysis
      console.log('📊 Phase 1: Product Intelligence Analysis');
      const productContext: ProductContext = {
        productName: request.productName,
        productDescription: request.productDescription,
        category: request.category,
        industry: request.industry,
        targetAudience: request.targetAudience,
        userPrompt: request.userPrompt
      };

      const productAnalysis = await this.productIntelligence.analyzeProduct(productContext);
      console.log('✅ Product analysis completed');

      // Phase 2: Web Research (if requested)
      let webResearch: WebResearchAnalysis;
      if (request.includeWebResearch) {
        console.log('🌐 Phase 2: Web Research Analysis');
        webResearch = await this.webResearch.conductResearch(
          request.productName,
          request.industry || 'general',
          request.targetAudience || 'general'
        );
        console.log('✅ Web research completed');
      } else {
        webResearch = this.createBasicWebResearch();
      }

      // Phase 3: Advanced Personalization
      console.log('🎨 Phase 3: Advanced Personalization');
      const personalizationContext: PersonalizationContext = {
        productAnalysis,
        webResearch,
        userPrompt: request.userPrompt,
        targetAudience: request.targetAudience || 'general users',
        industry: request.industry || 'general',
        personalizationLevel: request.personalizationLevel
      };

      const personalizedExperience = await this.personalization.createPersonalizedExperience(personalizationContext);
      console.log('✅ Personalized experience created');

      // Phase 4: Database Storage
      console.log('💾 Phase 4: Database Storage');
      const databaseRecord = await this.saveFunnelToDatabase(personalizedExperience, request);

      // Calculate metrics
      const processingTime = Date.now() - startTime;
      const metadata = {
        processingTime,
        confidenceScore: (productAnalysis.confidenceScore + webResearch.confidenceScore) / 2,
        uniquenessIndex: personalizedExperience.uniquenessScore,
        personalizationScore: personalizedExperience.personalizationScore,
        analysisQuality: this.calculateAnalysisQuality(productAnalysis, webResearch)
      };

      console.log('🎉 Intelligent funnel generation completed successfully');
      console.log('Metrics:', metadata);

      return {
        success: true,
        experience: personalizedExperience,
        databaseRecord,
        metadata
      };

    } catch (error) {
      console.error('💥 Intelligent funnel generation failed:', error);
      
      return {
        success: false,
        experience: await this.createFallbackExperience(request),
        metadata: {
          processingTime: Date.now() - startTime,
          confidenceScore: 0.4,
          uniquenessIndex: 0.3,
          personalizationScore: 0.3,
          analysisQuality: 0.3
        },
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  private async saveFunnelToDatabase(
    experience: PersonalizedExperience, 
    request: IntelligentFunnelRequest
  ) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const shareToken = crypto.randomUUID();

      // Create the funnel record
      const { data: funnel, error: funnelError } = await supabase
        .from('interactive_funnels')
        .insert({
          name: experience.name,
          description: experience.description,
          created_by: user?.id || null,
          share_token: shareToken,
          is_public: true,
          status: 'active',
          settings: {
            ...experience.settings,
            intelligentGeneration: true,
            originalRequest: request,
            personalizationLevel: request.personalizationLevel
          }
        })
        .select()
        .single();

      if (funnelError) {
        console.error('Database error creating funnel:', funnelError);
        throw new Error('Failed to save funnel to database');
      }

      // Create the steps
      const stepsToInsert = experience.steps.map((step, index) => ({
        funnel_id: funnel.id,
        step_order: step.stepOrder,
        step_type: step.stepType,
        title: step.title,
        description: step.description,
        fields_config: step.fieldsConfig,
        settings: step.settings,
        is_required: step.stepType === 'lead_capture' || step.stepType === 'conversion'
      }));

      const { error: stepsError } = await supabase
        .from('interactive_funnel_steps')
        .insert(stepsToInsert);

      if (stepsError) {
        console.error('Database error creating steps:', stepsError);
        throw new Error('Failed to save funnel steps to database');
      }

      console.log('✅ Funnel saved to database successfully');
      return {
        id: funnel.id,
        shareToken
      };

    } catch (error) {
      console.error('💥 Database save failed:', error);
      throw error;
    }
  }

  private createBasicWebResearch(): WebResearchAnalysis {
    return {
      marketTrends: {
        currentTrends: ['Digital transformation', 'Customer experience focus'],
        emergingTrends: ['AI integration', 'Personalization'],
        industryInsights: ['Growing market', 'Competitive landscape']
      },
      competitorInsights: {
        topCompetitors: [],
        competitiveLandscape: 'Competitive but with opportunities',
        marketGaps: ['Personalization', 'User experience']
      },
      consumerBehavior: {
        buyingPatterns: ['Research-driven', 'Value-focused'],
        preferences: ['Quality', 'Support'],
        painPoints: ['Complexity', 'Cost'],
        motivations: ['Efficiency', 'Results']
      },
      contentOpportunities: {
        popularTopics: ['How-to guides', 'Best practices'],
        contentGaps: ['Educational content'],
        searchTrends: ['Solution reviews']
      },
      confidenceScore: 0.5,
      researchMetadata: {
        searchQueries: [],
        sourcesAnalyzed: 0,
        timestamp: new Date().toISOString(),
        dataFreshness: 0.5
      }
    };
  }

  private calculateAnalysisQuality(
    productAnalysis: ProductIntelligenceAnalysis,
    webResearch: WebResearchAnalysis
  ): number {
    const productQuality = productAnalysis.confidenceScore;
    const researchQuality = webResearch.confidenceScore;
    
    return (productQuality + researchQuality) / 2;
  }

  private async createFallbackExperience(request: IntelligentFunnelRequest): Promise<PersonalizedExperience> {
    console.log('🔄 Creating fallback experience...');
    
    return {
      name: `Funnel per ${request.productName}`,
      description: `Esperienza personalizzata per ${request.productName}`,
      steps: [
        {
          stepOrder: 1,
          stepType: 'lead_capture',
          title: 'Iniziamo',
          description: 'Condividi le tue informazioni',
          fieldsConfig: [
            {
              id: 'name',
              type: 'text',
              label: 'Nome',
              required: true,
              placeholder: 'Il tuo nome'
            },
            {
              id: 'email',
              type: 'email',
              label: 'Email',
              required: true,
              placeholder: 'La tua email'
            }
          ],
          settings: { submitButtonText: 'Continua' }
        },
        {
          stepOrder: 2,
          stepType: 'conversion',
          title: 'Contattaci',
          description: 'Ricevi informazioni personalizzate',
          fieldsConfig: [
            {
              id: 'message',
              type: 'textarea',
              label: 'Come possiamo aiutarti?',
              required: true,
              placeholder: 'Raccontaci le tue esigenze...'
            }
          ],
          settings: { submitButtonText: 'Invia' }
        }
      ],
      theme: {
        primaryColor: '#F59E0B',
        secondaryColor: '#D97706',
        fontFamily: 'Inter',
        style: 'modern'
      },
      narrative: {
        heroTitle: `Scopri ${request.productName}`,
        heroSubtitle: 'La soluzione che stavi cercando',
        valueProposition: 'Risultati personalizzati per te',
        socialProof: ['Esperienza comprovata'],
        urgencyMessages: ['Inizia oggi']
      },
      conversionOptimization: {
        ctaStrategy: 'Direct approach',
        persuasionTechniques: ['Trust'],
        trustSignals: ['Supporto dedicato'],
        riskReduction: ['Consulenza gratuita']
      },
      settings: {
        fallback: true,
        generatedAt: new Date().toISOString()
      },
      personalizationScore: 0.4,
      uniquenessScore: 0.3
    };
  }
}
