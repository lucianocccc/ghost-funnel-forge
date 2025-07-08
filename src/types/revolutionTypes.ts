// Ghost Funnel Revolution - Advanced Types System

import { Database } from '@/integrations/supabase/types';

// Document Analysis Types
export type DocumentAnalysis = Database['public']['Tables']['document_analysis']['Row'];
export type DocumentAnalysisInsert = Database['public']['Tables']['document_analysis']['Insert'];

export interface DocumentUpload {
  file: File;
  type: 'pdf' | 'docx' | 'txt' | 'image' | 'url';
  purpose: 'audience_analysis' | 'competitor_research' | 'content_strategy' | 'market_research';
}

export interface AIAnalysisResult {
  insights: string[];
  actionableRecommendations: string[];
  businessOpportunities: string[];
  targetAudienceInsights: {
    demographics: Record<string, any>;
    psychographics: Record<string, any>;
    painPoints: string[];
    motivations: string[];
  };
  competitiveAnalysis: {
    competitors: string[];
    differentiators: string[];
    marketGaps: string[];
    positioning: string;
  };
  marketPositioning: {
    uniqueValueProp: string;
    targetMarkets: string[];
    pricingStrategy: string;
    distributionChannels: string[];
  };
}

// Behavioral Intelligence Types
export type UserBehavioralData = Database['public']['Tables']['user_behavioral_data']['Row'];

export interface BehaviorPattern {
  userId: string;
  sessionId: string;
  engagementScore: number;
  conversionIntentScore: number;
  actions: BehaviorAction[];
  predictions: {
    nextLikelyAction: string;
    conversionProbability: number;
    optimalContactTime: Date;
  };
}

export interface BehaviorAction {
  type: 'page_view' | 'scroll' | 'click' | 'form_interaction' | 'download' | 'video_watch';
  data: Record<string, any>;
  timestamp: Date;
  engagementValue: number;
}

// AI Recommendations Types
export type AIRecommendation = Database['public']['Tables']['ai_recommendations']['Row'];

export interface SmartRecommendation {
  id: string;
  type: 'funnel_optimization' | 'lead_nurturing' | 'content_strategy' | 'audience_targeting' | 'conversion_improvement';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  actionItems: string[];
  expectedImpact: {
    conversionIncrease: number;
    revenueImpact: number;
    timeToImplement: string;
  };
  difficulty: 'easy' | 'medium' | 'hard';
  aiConfidence: number;
}

// Advanced Funnel Templates
export type AIFunnelTemplate = Database['public']['Tables']['ai_funnel_templates']['Row'];

export interface IntelligentTemplate {
  id: string;
  name: string;
  description: string;
  industry: string;
  useCase: string;
  conversionRate: number;
  aiOptimizations: string[];
  templateData: {
    steps: FunnelStep[];
    triggers: AutomationTrigger[];
    personalizations: PersonalizationRule[];
  };
  performanceMetrics: {
    avgConversionRate: number;
    avgEngagementTime: number;
    leadQualityScore: number;
  };
}

export interface FunnelStep {
  id: string;
  title: string;
  type: 'capture' | 'nurture' | 'qualify' | 'convert' | 'upsell';
  content: any;
  aiPersonalization: boolean;
  smartTriggers: AutomationTrigger[];
}

export interface AutomationTrigger {
  id: string;
  condition: string;
  action: string;
  delay?: number;
  personalizedContent?: boolean;
}

export interface PersonalizationRule {
  id: string;
  condition: string;
  contentVariant: any;
  targetAudience: string;
  expectedLift: number;
}

// Market Intelligence Types
export type MarketIntelligence = Database['public']['Tables']['market_intelligence']['Row'];

export interface CompetitiveIntelligence {
  competitors: {
    name: string;
    strengths: string[];
    weaknesses: string[];
    pricing: any;
    marketShare: number;
  }[];
  marketTrends: {
    trend: string;
    impact: 'high' | 'medium' | 'low';
    timeframe: string;
    opportunity: string;
  }[];
  positioningRecommendations: string[];
  pricingInsights: {
    marketAverage: number;
    recommendedRange: [number, number];
    priceElasticity: number;
  };
}

// Advanced Lead Scoring V2
export type AdvancedLeadScoringV2 = Database['public']['Tables']['advanced_lead_scoring_v2']['Row'];

export interface IntelligentLeadScore {
  demographicScore: number;
  behavioralScore: number;
  engagementScore: number;
  intentScore: number;
  timingScore: number;
  contextualScore: number;
  aiPredictedScore: number;
  totalScore: number;
  scoreBreakdown: {
    factors: Record<string, number>;
    reasoning: string[];
  };
  improvementActions: string[];
  nextBestAction: string;
  optimalContactTime: Date;
  personalizationData: {
    preferredChannels: string[];
    contentTopics: string[];
    communicationStyle: string;
  };
}

// Performance Analytics
export type FunnelPerformanceAnalytics = Database['public']['Tables']['funnel_performance_analytics']['Row'];

export interface AdvancedAnalytics {
  conversionFunnel: {
    stage: string;
    visitors: number;
    conversions: number;
    rate: number;
    dropoffReasons: string[];
  }[];
  audienceInsights: {
    demographics: Record<string, any>;
    behavior: Record<string, any>;
    preferences: Record<string, any>;
  };
  optimizationOpportunities: {
    opportunity: string;
    impact: 'high' | 'medium' | 'low';
    effort: 'easy' | 'medium' | 'hard';
    expectedLift: number;
  }[];
  aiInsights: string[];
  predictiveMetrics: {
    futureConversions: number;
    revenueProjection: number;
    churnRisk: number;
  };
}

// Revolution Dashboard Types
export interface RevolutionDashboard {
  overview: {
    totalLeads: number;
    conversionRate: number;
    revenueGrowth: number;
    aiOptimizations: number;
  };
  realTimeInsights: AIRecommendation[];
  performanceMetrics: AdvancedAnalytics;
  documentAnalysis: DocumentAnalysis[];
  behaviorInsights: BehaviorPattern[];
  marketIntelligence: CompetitiveIntelligence;
}