// Web Research Service - Ricerca web avanzata per informazioni aggiornate
import { supabase } from '@/integrations/supabase/client';

interface WebResearchQuery {
  keywords: string[];
  domain?: string;
  language?: string;
  region?: string;
  dateRange?: 'day' | 'week' | 'month' | 'year' | 'all';
  sources?: string[];
  excludePatterns?: string[];
  depth?: 'basic' | 'comprehensive';
  focusAreas?: string[];
}

interface WebResearchResult {
  title: string;
  url: string;
  snippet: string;
  source: string;
  relevanceScore: number;
  timestamp: string;
  content?: string;
  metadata?: {
    author?: string;
    publishDate?: string;
    domain?: string;
    contentType?: string;
    language?: string;
  };
}

interface WebResearchAnalysis {
  query: WebResearchQuery;
  results: WebResearchResult[];
  insights: {
    keyFindings: string[];
    trends: string[];
    opportunities: string[];
    threats: string[];
    marketInfo: string[];
    competitorInfo: string[];
    customerInsights: string[];
  };
  confidence: number;
  totalResults: number;
  processingTime: number;
  timestamp: string;
}

export class WebResearchService {
  private static instance: WebResearchService;
  private cache: Map<string, WebResearchAnalysis> = new Map();
  private readonly CACHE_DURATION = 60 * 60 * 1000; // 1 ora

  static getInstance(): WebResearchService {
    if (!WebResearchService.instance) {
      WebResearchService.instance = new WebResearchService();
    }
    return WebResearchService.instance;
  }

  async conductResearch(query: WebResearchQuery): Promise<WebResearchAnalysis> {
    const cacheKey = this.generateCacheKey(query);
    
    // Controlla cache
    const cached = this.cache.get(cacheKey);
    if (cached && this.isCacheValid(cached)) {
      console.log('🔍 Returning cached web research');
      return cached;
    }

    console.log('🌐 Starting web research...', {
      keywords: query.keywords,
      depth: query.depth || 'basic',
      focusAreas: query.focusAreas || []
    });

    try {
      const { data, error } = await supabase.functions.invoke('web-research', {
        body: {
          query,
          maxResults: query.depth === 'comprehensive' ? 50 : 20,
          includeContent: true,
          analyzeContent: true,
          extractInsights: true
        }
      });

      if (error) {
        console.error('❌ Web research error:', error);
        throw new Error(`Errore nella ricerca web: ${error.message}`);
      }

      if (!data || !data.success) {
        throw new Error('Ricerca web non riuscita');
      }

      const analysis: WebResearchAnalysis = {
        ...data.analysis,
        timestamp: new Date().toISOString()
      };

      // Salva in cache
      this.cache.set(cacheKey, analysis);
      
      console.log('✅ Web research completed', {
        totalResults: analysis.totalResults,
        keyFindings: analysis.insights.keyFindings.length,
        confidence: analysis.confidence,
        processingTime: analysis.processingTime
      });

      return analysis;

    } catch (error) {
      console.error('💥 Web research failed:', error);
      throw error;
    }
  }

  async searchProductInfo(productName: string, category?: string): Promise<WebResearchAnalysis> {
    const query: WebResearchQuery = {
      keywords: [productName, category || '', 'review', 'features', 'benefits', 'comparison'].filter(Boolean),
      depth: 'comprehensive',
      focusAreas: ['product_features', 'user_reviews', 'market_position', 'pricing', 'competitors']
    };

    return this.conductResearch(query);
  }

  async searchCompetitors(productName: string, industry: string): Promise<WebResearchAnalysis> {
    const query: WebResearchQuery = {
      keywords: [productName, industry, 'competitors', 'alternative', 'comparison', 'vs'],
      depth: 'comprehensive',
      focusAreas: ['competitors', 'market_share', 'features_comparison', 'pricing_strategy']
    };

    return this.conductResearch(query);
  }

  async searchMarketTrends(industry: string, region?: string): Promise<WebResearchAnalysis> {
    const query: WebResearchQuery = {
      keywords: [industry, 'trends', 'market', 'growth', 'forecast', '2024', '2025'],
      depth: 'comprehensive',
      region: region || 'IT',
      dateRange: 'month',
      focusAreas: ['market_trends', 'growth_opportunities', 'industry_insights', 'future_outlook']
    };

    return this.conductResearch(query);
  }

  async searchCustomerInsights(productName: string, targetAudience?: string): Promise<WebResearchAnalysis> {
    const query: WebResearchQuery = {
      keywords: [productName, targetAudience || '', 'customer', 'user', 'feedback', 'review', 'experience'].filter(Boolean),
      depth: 'comprehensive',
      focusAreas: ['customer_feedback', 'user_experience', 'pain_points', 'satisfaction', 'testimonials']
    };

    return this.conductResearch(query);
  }

  private generateCacheKey(query: WebResearchQuery): string {
    const keyString = JSON.stringify({
      keywords: query.keywords.sort(),
      domain: query.domain,
      depth: query.depth,
      focusAreas: query.focusAreas?.sort()
    });
    return btoa(keyString).replace(/[^a-zA-Z0-9]/g, '');
  }

  private isCacheValid(analysis: WebResearchAnalysis): boolean {
    const now = new Date().getTime();
    const timestamp = new Date(analysis.timestamp).getTime();
    return (now - timestamp) < this.CACHE_DURATION;
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

export type { WebResearchQuery, WebResearchResult, WebResearchAnalysis };
