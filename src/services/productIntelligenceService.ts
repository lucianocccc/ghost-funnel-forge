
// Product Intelligence Service - Analisi avanzata del prodotto
import { supabase } from '@/integrations/supabase/client';

interface ProductContext {
  name: string;
  description: string;
  category?: string;
  targetMarket?: string;
  priceRange?: string;
  features?: string[];
  benefits?: string[];
  competitors?: string[];
  uniqueSellingPoints?: string[];
  industry?: string;
  businessModel?: string;
  targetAudience?: string;
  painPoints?: string[];
  solutions?: string[];
  marketPosition?: string;
  brandPersonality?: string;
  communicationStyle?: string;
  customerJourneyStage?: string;
  conversionGoals?: string[];
  businessObjectives?: string[];
  marketingChallenges?: string[];
  existingAssets?: string[];
  budget?: string;
  timeline?: string;
  successMetrics?: string[];
  competitiveAdvantages?: string[];
  marketTrends?: string[];
  customerFeedback?: string[];
  salesProcess?: string;
  distributionChannels?: string[];
  partnershipOpportunities?: string[];
  technicalRequirements?: string[];
  complianceRequirements?: string[];
  scalabilityGoals?: string[];
  geographicMarkets?: string[];
  seasonalFactors?: string[];
  economicFactors?: string[];
  socialTrends?: string[];
  regulatoryChanges?: string[];
  innovationOpportunities?: string[];
  resourceConstraints?: string[];
  strategicPartnerships?: string[];
  emergingTechnologies?: string[];
  customerRetentionStrategies?: string[];
  crossSellingOpportunities?: string[];
  upsellPotential?: string[];
  marketSegmentation?: string[];
  valuePropositioning?: string[];
  brandDifferentiation?: string[];
  customerExperienceGoals?: string[];
  digitalTransformationNeeds?: string[];
  dataInsights?: string[];
  performanceMetrics?: string[];
  optimizationOpportunities?: string[];
}

interface ProductIntelligenceAnalysis {
  productProfile: {
    coreValue: string;
    marketFit: string;
    customerSegments: string[];
    painPointsAddressed: string[];
    competitiveAdvantages: string[];
    growthOpportunities: string[];
  };
  marketIntelligence: {
    industryTrends: string[];
    competitorAnalysis: string[];
    marketGaps: string[];
    opportunityAreas: string[];
    threatAnalysis: string[];
    marketSize: string;
    growthPotential: string;
  };
  customerInsights: {
    primaryPersonas: string[];
    behavioralPatterns: string[];
    purchaseDrivers: string[];
    objectionHandling: string[];
    preferredChannels: string[];
    decisionMakingProcess: string[];
  };
  strategicRecommendations: {
    positioningStrategy: string;
    messagingFramework: string[];
    contentStrategy: string[];
    channelStrategy: string[];
    pricingStrategy: string;
    conversionStrategy: string[];
  };
  personalizedApproach: {
    uniqueAngles: string[];
    storytellingElements: string[];
    emotionalTriggers: string[];
    logicalArguments: string[];
    socialProof: string[];
    urgencyFactors: string[];
  };
  implementationPlan: {
    immediateActions: string[];
    shortTermGoals: string[];
    longTermObjectives: string[];
    successMetrics: string[];
    optimizationAreas: string[];
    scalabilityFactors: string[];
  };
  confidenceScore: number;
  analysisDepth: 'basic' | 'intermediate' | 'advanced' | 'comprehensive';
  lastUpdated: string;
}

export class ProductIntelligenceService {
  private static instance: ProductIntelligenceService;
  private cache: Map<string, ProductIntelligenceAnalysis> = new Map();
  private readonly CACHE_DURATION = 30 * 60 * 1000; // 30 minuti

  static getInstance(): ProductIntelligenceService {
    if (!ProductIntelligenceService.instance) {
      ProductIntelligenceService.instance = new ProductIntelligenceService();
    }
    return ProductIntelligenceService.instance;
  }

  async analyzeProduct(productContext: ProductContext): Promise<ProductIntelligenceAnalysis> {
    const cacheKey = this.generateCacheKey(productContext);
    
    // Controlla cache
    const cached = this.cache.get(cacheKey);
    if (cached && this.isCacheValid(cached)) {
      console.log('🎯 Returning cached product intelligence');
      return cached;
    }

    console.log('🔍 Starting deep product intelligence analysis...');
    
    try {
      // Chiamata all'edge function per analisi avanzata
      const { data, error } = await supabase.functions.invoke('product-intelligence-analysis', {
        body: {
          productContext,
          analysisLevel: 'comprehensive',
          includeMarketResearch: true,
          includeCompetitorAnalysis: true,
          includeCustomerInsights: true,
          includeStrategicRecommendations: true,
          includeTrendAnalysis: true,
          includePersonalizationFactors: true
        }
      });

      if (error) {
        console.error('❌ Product intelligence error:', error);
        throw new Error(`Errore nell'analisi del prodotto: ${error.message}`);
      }

      if (!data || !data.success) {
        throw new Error('Analisi del prodotto non riuscita');
      }

      const analysis: ProductIntelligenceAnalysis = {
        ...data.analysis,
        lastUpdated: new Date().toISOString()
      };

      // Salva in cache
      this.cache.set(cacheKey, analysis);
      
      console.log('✅ Product intelligence analysis completed', {
        confidenceScore: analysis.confidenceScore,
        analysisDepth: analysis.analysisDepth,
        uniqueAngles: analysis.personalizedApproach.uniqueAngles.length,
        strategicRecommendations: analysis.strategicRecommendations.conversionStrategy.length
      });

      return analysis;

    } catch (error) {
      console.error('💥 Product intelligence analysis failed:', error);
      throw error;
    }
  }

  async getMarketIntelligence(productName: string, industry: string): Promise<any> {
    try {
      const { data, error } = await supabase.functions.invoke('market-intelligence', {
        body: {
          productName,
          industry,
          includeCompetitors: true,
          includeTrends: true,
          includeOpportunities: true,
          includeThreats: true
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('❌ Market intelligence error:', error);
      throw error;
    }
  }

  async getCustomerInsights(productContext: ProductContext): Promise<any> {
    try {
      const { data, error } = await supabase.functions.invoke('customer-insights-analysis', {
        body: {
          productContext,
          includePersonas: true,
          includeBehavioral: true,
          includePreferences: true,
          includeJourney: true
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('❌ Customer insights error:', error);
      throw error;
    }
  }

  private generateCacheKey(productContext: ProductContext): string {
    const key = `${productContext.name}-${productContext.category}-${productContext.industry}`;
    return btoa(key).replace(/[^a-zA-Z0-9]/g, '');
  }

  private isCacheValid(analysis: ProductIntelligenceAnalysis): boolean {
    const now = new Date().getTime();
    const lastUpdated = new Date(analysis.lastUpdated).getTime();
    return (now - lastUpdated) < this.CACHE_DURATION;
  }

  clearCache(): void {
    this.cache.clear();
  }

  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

export { ProductContext, ProductIntelligenceAnalysis };
