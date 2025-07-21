
import { supabase } from '@/integrations/supabase/client';

export interface ProductContext {
  productName: string;
  productDescription: string;
  category?: string;
  industry?: string;
  targetAudience?: string;
  keyFeatures?: string[];
  competitiveAdvantages?: string[];
  painPoints?: string[];
  userPrompt?: string;
}

export interface ProductIntelligenceAnalysis {
  productSummary: {
    name: string;
    description: string;
    category: string;
    industry: string;
    targetAudience: string;
    uniqueValueProposition: string;
    keyFeatures: string[];
    competitiveAdvantages: string[];
  };
  marketAnalysis: {
    marketSize: string;
    growthTrends: string[];
    competitiveLandscape: string;
    marketOpportunities: string[];
    threats: string[];
  };
  targetAudienceInsights: {
    primaryAudience: string;
    demographics: Record<string, any>;
    psychographics: Record<string, any>;
    painPoints: string[];
    motivations: string[];
    buyingBehavior: Record<string, any>;
  };
  competitorAnalysis: {
    directCompetitors: string[];
    competitiveAdvantages: string[];
    marketGaps: string[];
    positioning: string;
  };
  strategicRecommendations: {
    messagingStrategy: string;
    positioningStatement: string;
    keyDifferentiators: string[];
    marketingChannels: string[];
    contentStrategy: string;
  };
  confidenceScore: number;
  analysisMetadata: {
    analysisId: string;
    timestamp: string;
    sources: string[];
    dataQuality: number;
  };
}

export class ProductIntelligenceService {
  private static instance: ProductIntelligenceService;

  public static getInstance(): ProductIntelligenceService {
    if (!ProductIntelligenceService.instance) {
      ProductIntelligenceService.instance = new ProductIntelligenceService();
    }
    return ProductIntelligenceService.instance;
  }

  async analyzeProduct(context: ProductContext): Promise<ProductIntelligenceAnalysis> {
    console.log('🔍 Starting product intelligence analysis...');
    
    try {
      const { data, error } = await supabase.functions.invoke('product-intelligence-analysis', {
        body: {
          context,
          sessionId: crypto.randomUUID(),
          userId: null, // Can be set if user is authenticated
          analysisId: crypto.randomUUID()
        }
      });

      if (error) {
        console.error('❌ Product intelligence error:', error);
        throw new Error(`Product intelligence analysis failed: ${error.message}`);
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Product intelligence analysis failed');
      }

      console.log('✅ Product intelligence analysis completed');
      return data.analysis;
    } catch (error) {
      console.error('💥 Product intelligence service error:', error);
      
      // Return fallback analysis
      return this.createFallbackAnalysis(context);
    }
  }

  private createFallbackAnalysis(context: ProductContext): ProductIntelligenceAnalysis {
    console.log('🔄 Creating fallback product analysis...');
    
    return {
      productSummary: {
        name: context.productName,
        description: context.productDescription,
        category: context.category || 'General',
        industry: context.industry || 'Technology',
        targetAudience: context.targetAudience || 'General consumers',
        uniqueValueProposition: `${context.productName} provides innovative solutions for modern needs`,
        keyFeatures: context.keyFeatures || ['High Quality', 'User Friendly', 'Reliable'],
        competitiveAdvantages: context.competitiveAdvantages || ['Innovation', 'Quality', 'Support']
      },
      marketAnalysis: {
        marketSize: 'Growing market with strong potential',
        growthTrends: ['Digital transformation', 'Increased demand', 'Market expansion'],
        competitiveLandscape: 'Competitive but opportunities exist',
        marketOpportunities: ['Market expansion', 'Product innovation', 'Customer education'],
        threats: ['Competition', 'Economic factors', 'Technological changes']
      },
      targetAudienceInsights: {
        primaryAudience: context.targetAudience || 'Professional users',
        demographics: { age: '25-45', income: 'Medium-High' },
        psychographics: { values: ['Quality', 'Efficiency', 'Innovation'] },
        painPoints: context.painPoints || ['Time constraints', 'Budget concerns', 'Complex solutions'],
        motivations: ['Better results', 'Time savings', 'Professional growth'],
        buyingBehavior: { research: 'Thorough', timeline: 'Medium', influences: ['Reviews', 'Recommendations'] }
      },
      competitorAnalysis: {
        directCompetitors: ['Market leader', 'Emerging player', 'Traditional provider'],
        competitiveAdvantages: ['Better pricing', 'Superior features', 'Excellent support'],
        marketGaps: ['Personalization', 'Integration', 'User experience'],
        positioning: 'Premium quality with competitive pricing'
      },
      strategicRecommendations: {
        messagingStrategy: 'Focus on unique benefits and value proposition',
        positioningStatement: `The leading solution for ${context.targetAudience} seeking ${context.productName}`,
        keyDifferentiators: ['Innovation', 'Quality', 'Support', 'Value'],
        marketingChannels: ['Digital marketing', 'Content marketing', 'Social media'],
        contentStrategy: 'Educational content highlighting benefits and use cases'
      },
      confidenceScore: 0.65,
      analysisMetadata: {
        analysisId: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        sources: ['Fallback analysis'],
        dataQuality: 0.6
      }
    };
  }
}
