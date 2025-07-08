// Ghost Funnel Revolution - Advanced Services Layer

import { supabase } from '@/integrations/supabase/client';
import { 
  DocumentAnalysis, 
  DocumentAnalysisInsert, 
  AIRecommendation,
  UserBehavioralData,
  MarketIntelligence,
  AdvancedLeadScoringV2,
  AIAnalysisResult,
  BehaviorPattern
} from '@/types/revolutionTypes';

// Document Analysis Service
export class DocumentAnalysisService {
  static async uploadAndAnalyze(file: File, purpose: string): Promise<DocumentAnalysis> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Create document record
    const documentData: DocumentAnalysisInsert = {
      user_id: user.id,
      document_name: file.name,
      document_type: this.getFileType(file),
      processing_status: 'pending'
    };

    const { data: document, error } = await supabase
      .from('document_analysis')
      .insert(documentData)
      .select()
      .single();

    if (error) throw error;

    // Process document with AI
    this.processDocumentWithAI(document.id, file, purpose);

    return document;
  }

  static async processDocumentWithAI(documentId: string, file: File, purpose: string) {
    try {
      await supabase
        .from('document_analysis')
        .update({ processing_status: 'processing' })
        .eq('id', documentId);

      // Call edge function for AI analysis
      const { data, error } = await supabase.functions.invoke('analyze-document-revolution', {
        body: { 
          documentId, 
          purpose,
          // Note: In production, implement file upload to storage first
          fileName: file.name,
          fileType: file.type
        }
      });

      if (error) throw error;

      await supabase
        .from('document_analysis')
        .update({ 
          processing_status: 'completed',
          ai_analysis: data.analysis,
          insights: data.insights,
          actionable_recommendations: data.recommendations,
          business_opportunities: data.opportunities,
          confidence_score: data.confidence
        })
        .eq('id', documentId);

    } catch (error) {
      console.error('Document processing failed:', error);
      await supabase
        .from('document_analysis')
        .update({ processing_status: 'failed' })
        .eq('id', documentId);
    }
  }

  static getFileType(file: File): 'pdf' | 'docx' | 'txt' | 'image' | 'url' {
    if (file.type.includes('pdf')) return 'pdf';
    if (file.type.includes('document') || file.name.endsWith('.docx')) return 'docx';
    if (file.type.includes('text')) return 'txt';
    if (file.type.includes('image')) return 'image';
    return 'txt';
  }

  static async getUserDocuments(): Promise<DocumentAnalysis[]> {
    const { data, error } = await supabase
      .from('document_analysis')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }
}

// Behavioral Intelligence Service
export class BehavioralIntelligenceService {
  static async trackUserBehavior(action: {
    actionType: string;
    pagePath?: string;
    actionData?: any;
  }): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return; // Anonymous tracking allowed

    const sessionId = this.getOrCreateSessionId();
    const deviceType = this.detectDeviceType();

    const behaviorData = {
      user_id: user?.id,
      session_id: sessionId,
      action_type: action.actionType,
      page_path: action.pagePath || window.location.pathname,
      action_data: action.actionData || {},
      user_agent: navigator.userAgent,
      device_type: deviceType,
      engagement_score: this.calculateEngagementScore(action.actionType),
      conversion_intent_score: this.calculateIntentScore(action)
    };

    await supabase
      .from('user_behavioral_data')
      .insert(behaviorData);

    // Real-time analysis
    this.analyzeUserBehaviorPattern(user?.id, sessionId);
  }

  static getOrCreateSessionId(): string {
    let sessionId = sessionStorage.getItem('ghost_session_id');
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      sessionStorage.setItem('ghost_session_id', sessionId);
    }
    return sessionId;
  }

  static detectDeviceType(): string {
    const width = window.innerWidth;
    if (width <= 768) return 'mobile';
    if (width <= 1024) return 'tablet';
    return 'desktop';
  }

  static calculateEngagementScore(actionType: string): number {
    const scores: Record<string, number> = {
      'page_view': 1,
      'scroll': 2,
      'click': 3,
      'form_interaction': 5,
      'download': 8,
      'video_watch': 6,
      'document_upload': 10
    };
    return scores[actionType] || 1;
  }

  static calculateIntentScore(action: any): number {
    // AI-powered intent scoring based on action context
    let score = 0.1;
    
    if (action.actionType === 'form_interaction') score += 0.3;
    if (action.actionType === 'download') score += 0.4;
    if (action.actionType === 'document_upload') score += 0.5;
    if (action.pagePath?.includes('pricing')) score += 0.2;
    if (action.pagePath?.includes('dashboard')) score += 0.3;

    return Math.min(score, 1.0);
  }

  static async analyzeUserBehaviorPattern(userId?: string, sessionId?: string): Promise<void> {
    if (!userId) return;

    // Get recent behavior data
    const { data: behaviors } = await supabase
      .from('user_behavioral_data')
      .select('*')
      .eq('user_id', userId)
      .eq('session_id', sessionId)
      .order('timestamp', { ascending: false })
      .limit(50);

    if (!behaviors || behaviors.length < 3) return;

    // Analyze pattern and generate recommendations
    const analysis = this.analyzeBehaviorPattern(behaviors);
    
    if (analysis.shouldGenerateRecommendation) {
      await AIRecommendationService.generateBehaviorBasedRecommendation(userId, analysis);
    }
  }

  static analyzeBehaviorPattern(behaviors: UserBehavioralData[]): any {
    const totalEngagement = behaviors.reduce((sum, b) => sum + (b.engagement_score || 0), 0);
    const avgIntentScore = behaviors.reduce((sum, b) => sum + (b.conversion_intent_score || 0), 0) / behaviors.length;
    
    return {
      totalEngagement,
      avgIntentScore,
      shouldGenerateRecommendation: totalEngagement > 20 && avgIntentScore > 0.6,
      pattern: this.identifyPattern(behaviors)
    };
  }

  static identifyPattern(behaviors: UserBehavioralData[]): string {
    const actionTypes = behaviors.map(b => b.action_type);
    
    if (actionTypes.includes('document_upload')) return 'high_intent_user';
    if (actionTypes.filter(a => a === 'form_interaction').length > 2) return 'engaged_user';
    if (actionTypes.includes('pricing')) return 'price_sensitive_user';
    
    return 'exploring_user';
  }
}

// AI Recommendations Service
export class AIRecommendationService {
  static async generateRecommendations(userId: string): Promise<AIRecommendation[]> {
    // Call AI edge function for intelligent recommendations
    const { data, error } = await supabase.functions.invoke('generate-ai-recommendations', {
      body: { userId }
    });

    if (error) throw error;

    return data.recommendations || [];
  }

  static async generateBehaviorBasedRecommendation(userId: string, behaviorAnalysis: any): Promise<void> {
    const recommendation = {
      user_id: userId,
      recommendation_type: 'conversion_improvement' as const,
      priority_level: behaviorAnalysis.avgIntentScore > 0.8 ? 'high' as const : 'medium' as const,
      title: this.getRecommendationTitle(behaviorAnalysis.pattern),
      description: this.getRecommendationDescription(behaviorAnalysis.pattern),
      action_items: this.getActionItems(behaviorAnalysis.pattern),
      expected_impact: {
        conversionIncrease: this.calculateExpectedLift(behaviorAnalysis),
        confidenceLevel: 0.85
      },
      implementation_difficulty: 'easy' as const,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    };

    await supabase
      .from('ai_recommendations')
      .insert(recommendation);
  }

  static getRecommendationTitle(pattern: string): string {
    const titles: Record<string, string> = {
      'high_intent_user': '🚀 Utente ad Alto Potenziale - Contatto Immediato Consigliato',
      'engaged_user': '💡 Opportunità di Conversione - Personalizza l\'Esperienza',
      'price_sensitive_user': '💰 Interesse per i Prezzi - Mostra il Valore',
      'exploring_user': '🔍 Utente in Esplorazione - Guidalo nel Journey'
    };
    return titles[pattern] || 'Raccomandazione Personalizzata';
  }

  static getRecommendationDescription(pattern: string): string {
    const descriptions: Record<string, string> = {
      'high_intent_user': 'Questo utente ha caricato documenti e mostra forte interesse. È il momento ideale per un contatto personalizzato.',
      'engaged_user': 'L\'utente ha interagito attivamente con i form. Considera di offrire contenuto personalizzato o una demo.',
      'price_sensitive_user': 'L\'utente ha visitato la pagina prezzi. Focus sul ROI e sui benefici economici.',
      'exploring_user': 'L\'utente sta esplorando la piattaforma. Fornisci guide e risorse per accelerare la scoperta.'
    };
    return descriptions[pattern] || 'Raccomandazione basata sul comportamento dell\'utente.';
  }

  static getActionItems(pattern: string): string[] {
    const actions: Record<string, string[]> = {
      'high_intent_user': [
        'Invia email personalizzata entro 1 ora',
        'Offri demo personalizzata',
        'Proponi trial esteso o sconto speciale'
      ],
      'engaged_user': [
        'Mostra case study rilevanti',
        'Attiva automazione nurturing avanzata',
        'Personalizza dashboard con contenuti specifici'
      ],
      'price_sensitive_user': [
        'Evidenzia ROI e benefici economici',
        'Mostra comparazioni di valore',
        'Offri trial gratuito esteso'
      ],
      'exploring_user': [
        'Attiva tour guidato',
        'Invia contenuti educativi',
        'Mostra success stories'
      ]
    };
    return actions[pattern] || ['Monitora comportamento futuro'];
  }

  static calculateExpectedLift(behaviorAnalysis: any): number {
    if (behaviorAnalysis.avgIntentScore > 0.8) return 35;
    if (behaviorAnalysis.avgIntentScore > 0.6) return 25;
    if (behaviorAnalysis.avgIntentScore > 0.4) return 15;
    return 10;
  }

  static async getUserRecommendations(): Promise<AIRecommendation[]> {
    const { data, error } = await supabase
      .from('ai_recommendations')
      .select('*')
      .eq('status', 'pending')
      .order('priority_level', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async markRecommendationAsViewed(id: string): Promise<void> {
    await supabase
      .from('ai_recommendations')
      .update({ status: 'viewed' })
      .eq('id', id);
  }

  static async markRecommendationAsImplemented(id: string): Promise<void> {
    await supabase
      .from('ai_recommendations')
      .update({ status: 'implemented' })
      .eq('id', id);
  }
}

// Market Intelligence Service
export class MarketIntelligenceService {
  static async generateMarketAnalysis(industry: string): Promise<MarketIntelligence> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Call AI edge function for market analysis
    const { data, error } = await supabase.functions.invoke('analyze-market-intelligence', {
      body: { industry, userId: user.id }
    });

    if (error) throw error;

    const marketData = {
      user_id: user.id,
      industry,
      competitor_analysis: data.competitorAnalysis,
      market_trends: data.marketTrends,
      opportunity_scores: data.opportunityScores,
      positioning_recommendations: data.positioningRecommendations,
      pricing_insights: data.pricingInsights,
      feature_gap_analysis: data.featureGapAnalysis,
      confidence_level: data.confidenceLevel
    };

    const { data: intelligence, error: insertError } = await supabase
      .from('market_intelligence')
      .insert(marketData)
      .select()
      .single();

    if (insertError) throw insertError;
    return intelligence;
  }

  static async getUserMarketIntelligence(): Promise<MarketIntelligence[]> {
    const { data, error } = await supabase
      .from('market_intelligence')
      .select('*')
      .order('analysis_date', { ascending: false })
      .limit(10);

    if (error) throw error;
    return data || [];
  }
}

// Advanced Lead Scoring Service V2
export class AdvancedLeadScoringServiceV2 {
  static async calculateAdvancedScore(leadId: string): Promise<AdvancedLeadScoringV2> {
    // Call AI edge function for advanced scoring
    const { data, error } = await supabase.functions.invoke('calculate-advanced-lead-score', {
      body: { leadId }
    });

    if (error) throw error;

    const scoringData = {
      consolidated_lead_id: leadId,
      demographic_score: data.demographicScore,
      behavioral_score: data.behavioralScore,
      engagement_score: data.engagementScore,
      intent_score: data.intentScore,
      timing_score: data.timingScore,
      contextual_score: data.contextualScore,
      ai_predicted_score: data.aiPredictedScore,
      total_score: data.totalScore,
      score_breakdown: data.scoreBreakdown,
      improvement_actions: data.improvementActions,
      next_best_action: data.nextBestAction,
      optimal_contact_time: data.optimalContactTime,
      personalization_data: data.personalizationData
    };

    const { data: scoring, error: insertError } = await supabase
      .from('advanced_lead_scoring_v2')
      .upsert(scoringData, { onConflict: 'consolidated_lead_id' })
      .select()
      .single();

    if (insertError) throw insertError;
    return scoring;
  }

  static async getLeadAdvancedScoring(leadId: string): Promise<AdvancedLeadScoringV2 | null> {
    const { data, error } = await supabase
      .from('advanced_lead_scoring_v2')
      .select('*')
      .eq('consolidated_lead_id', leadId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }
}