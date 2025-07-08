// Ghost Funnel Revolution - Intelligent Funnel Service

import { supabase } from '@/integrations/supabase/client';
import { BehavioralIntelligenceService, AIRecommendationService } from './revolutionServices';

interface FunnelAdaptationRule {
  condition: {
    engagementScore?: { min?: number; max?: number };
    conversionIntent?: { min?: number; max?: number };
    behaviorPattern?: string[];
    timeOnPage?: number;
    formInteractions?: number;
  };
  action: {
    redirectTo: 'booking' | 'email_capture' | 'nurture' | 'qualify';
    priority: 'low' | 'medium' | 'high' | 'critical';
    content?: any;
  };
}

export class IntelligentFunnelService {
  private static adaptationRules: FunnelAdaptationRule[] = [
    // High-intent users: Direct to booking
    {
      condition: {
        conversionIntent: { min: 0.7 },
        behaviorPattern: ['high_intent_user']
      },
      action: {
        redirectTo: 'booking',
        priority: 'critical',
        content: {
          headline: '🚀 Prenota una Consultazione Esclusiva',
          description: 'Basandoci sul tuo profilo, abbiamo una proposta speciale per te',
          urgency: 'Solo per utenti qualificati come te',
          cta: 'Prenota Ora'
        }
      }
    },
    
    // Medium-high intent: Qualify first
    {
      condition: {
        conversionIntent: { min: 0.5, max: 0.7 },
        engagementScore: { min: 15 }
      },
      action: {
        redirectTo: 'qualify',
        priority: 'high',
        content: {
          headline: '🎯 Personalizza la Tua Esperienza',
          description: 'Dimmi di più sui tuoi obiettivi per offrirti la soluzione più adatta'
        }
      }
    },
    
    // Engaged but low intent: Nurture
    {
      condition: {
        engagementScore: { min: 10 },
        conversionIntent: { max: 0.5 },
        behaviorPattern: ['engaged_user']
      },
      action: {
        redirectTo: 'nurture',
        priority: 'medium',
        content: {
          headline: '⭐ Scopri le Storie di Successo',
          description: 'Guarda i risultati che abbiamo ottenuto per clienti come te'
        }
      }
    },
    
    // Low engagement: Email capture
    {
      condition: {
        engagementScore: { max: 10 },
        conversionIntent: { max: 0.4 }
      },
      action: {
        redirectTo: 'email_capture',
        priority: 'low',
        content: {
          headline: '📧 Ricevi Contenuti Esclusivi',
          description: 'Ti invieremo guide, casi studio e aggiornamenti personalizzati',
          incentive: 'Guida gratuita in omaggio'
        }
      }
    }
  ];

  static evaluateUserBehavior(behaviorData: {
    engagementScore: number;
    conversionIntent: number;
    behaviorPattern: string;
    timeOnPage?: number;
    formInteractions?: number;
  }) {
    const { engagementScore, conversionIntent, behaviorPattern, timeOnPage, formInteractions } = behaviorData;

    // Find matching rule (first match wins, rules are ordered by priority)
    const matchingRule = this.adaptationRules.find(rule => {
      const { condition } = rule;
      
      // Check engagement score range
      if (condition.engagementScore) {
        if (condition.engagementScore.min && engagementScore < condition.engagementScore.min) return false;
        if (condition.engagementScore.max && engagementScore > condition.engagementScore.max) return false;
      }
      
      // Check conversion intent range
      if (condition.conversionIntent) {
        if (condition.conversionIntent.min && conversionIntent < condition.conversionIntent.min) return false;
        if (condition.conversionIntent.max && conversionIntent > condition.conversionIntent.max) return false;
      }
      
      // Check behavior pattern
      if (condition.behaviorPattern && !condition.behaviorPattern.includes(behaviorPattern)) return false;
      
      // Check time on page
      if (condition.timeOnPage && timeOnPage && timeOnPage < condition.timeOnPage) return false;
      
      // Check form interactions
      if (condition.formInteractions && formInteractions && formInteractions < condition.formInteractions) return false;
      
      return true;
    });

    return matchingRule || this.adaptationRules[this.adaptationRules.length - 1]; // Default to last rule (email capture)
  }

  static async createIntelligentFunnelSubmission(data: {
    funnelId: string;
    userId?: string;
    submissionData: Record<string, any>;
    behaviorData: {
      engagementScore: number;
      conversionIntent: number;
      behaviorPattern: string;
    };
    funnelPath: string;
  }) {
    const { funnelId, userId, submissionData, behaviorData, funnelPath } = data;

    try {
      // Create the submission with behavioral context
      const { data: submission, error: submissionError } = await supabase
        .from('funnel_submissions')
        .insert({
          funnel_id: funnelId,
          step_id: funnelPath,
          submission_data: {
            ...submissionData,
            behavioral_context: behaviorData,
            funnel_path: funnelPath,
            submission_timestamp: new Date().toISOString()
          },
          user_email: submissionData.email,
          user_name: submissionData.name || `${submissionData.firstName} ${submissionData.lastName}`.trim(),
          source: 'intelligent_funnel',
          lead_status: this.determineLeadStatus(behaviorData, funnelPath),
          completion_time: Date.now()
        })
        .select()
        .single();

      if (submissionError) throw submissionError;

      // Generate AI recommendations for follow-up
      if (userId) {
        await AIRecommendationService.generateBehaviorBasedRecommendation(userId, {
          avgIntentScore: behaviorData.conversionIntent,
          totalEngagement: behaviorData.engagementScore,
          pattern: behaviorData.behaviorPattern,
          shouldGenerateRecommendation: true
        });
      }

      // Track the conversion event
      await BehavioralIntelligenceService.trackUserBehavior({
        actionType: 'form_completion',
        pagePath: window.location.pathname,
        actionData: {
          funnelId,
          funnelPath,
          conversionType: funnelPath === 'booking' ? 'high_value' : 'lead_capture',
          behaviorData
        }
      });

      return {
        success: true,
        submission,
        recommendedFollowUp: this.getFollowUpRecommendation(behaviorData, funnelPath)
      };

    } catch (error) {
      console.error('Failed to create intelligent funnel submission:', error);
      throw error;
    }
  }

  private static determineLeadStatus(behaviorData: any, funnelPath: string): string {
    if (funnelPath === 'booking' && behaviorData.conversionIntent > 0.7) {
      return 'hot';
    } else if (behaviorData.conversionIntent > 0.5) {
      return 'warm';
    } else if (behaviorData.engagementScore > 10) {
      return 'qualified';
    } else {
      return 'cold';
    }
  }

  private static getFollowUpRecommendation(behaviorData: any, funnelPath: string) {
    if (funnelPath === 'booking') {
      return {
        type: 'immediate_contact',
        priority: 'critical',
        timeframe: '1 hour',
        message: 'Contatta immediatamente - alta probabilità di conversione',
        actions: [
          'Chiama entro 1 ora',
          'Invia email personalizzata di conferma',
          'Prepara proposta commerciale dettagliata'
        ]
      };
    } else if (behaviorData.conversionIntent > 0.5) {
      return {
        type: 'nurture_sequence',
        priority: 'high',
        timeframe: '24 hours',
        message: 'Avvia sequenza di nurturing avanzata',
        actions: [
          'Invia case study rilevante',
          'Proponi demo personalizzata',
          'Pianifica follow-up in 3 giorni'
        ]
      };
    } else {
      return {
        type: 'email_marketing',
        priority: 'medium',
        timeframe: '7 days',
        message: 'Inserisci in automazione email educativa',
        actions: [
          'Aggiungi a lista newsletter',
          'Invia contenuti educativi settimanali',
          'Monitora engagement futuro'
        ]
      };
    }
  }

  static async getIntelligentFunnelAnalytics(funnelId: string) {
    try {
      // Get submissions with behavioral data
      const { data: submissions, error } = await supabase
        .from('funnel_submissions')
        .select('*')
        .eq('funnel_id', funnelId)
        .eq('source', 'intelligent_funnel')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Analyze behavioral patterns and conversion paths
      const analytics = this.analyzeIntelligentFunnelPerformance(submissions || []);
      
      return analytics;
    } catch (error) {
      console.error('Failed to get intelligent funnel analytics:', error);
      throw error;
    }
  }

  private static analyzeIntelligentFunnelPerformance(submissions: any[]) {
    const totalSubmissions = submissions.length;
    
    // Group by funnel path
    const pathAnalysis = submissions.reduce((acc, submission) => {
      const path = submission.submission_data?.funnel_path || 'unknown';
      
      if (!acc[path]) {
        acc[path] = {
          count: 0,
          totalEngagement: 0,
          totalIntent: 0,
          conversions: 0
        };
      }
      
      acc[path].count++;
      
      const behaviorData = submission.submission_data?.behavioral_context;
      if (behaviorData) {
        acc[path].totalEngagement += behaviorData.engagementScore || 0;
        acc[path].totalIntent += behaviorData.conversionIntent || 0;
        
        if (path === 'booking') {
          acc[path].conversions++;
        }
      }
      
      return acc;
    }, {});

    // Calculate metrics for each path
    const pathMetrics = Object.entries(pathAnalysis).map(([path, data]: [string, any]) => ({
      path,
      submissions: data.count,
      percentage: totalSubmissions > 0 ? (data.count / totalSubmissions) * 100 : 0,
      avgEngagement: data.count > 0 ? data.totalEngagement / data.count : 0,
      avgIntent: data.count > 0 ? data.totalIntent / data.count : 0,
      conversionRate: data.count > 0 ? (data.conversions / data.count) * 100 : 0
    }));

    // Overall intelligence metrics
    const totalHighValue = pathAnalysis.booking?.count || 0;
    const totalLeads = totalSubmissions - totalHighValue;
    const intelligentConversionRate = totalSubmissions > 0 ? (totalHighValue / totalSubmissions) * 100 : 0;

    return {
      overview: {
        totalSubmissions,
        highValueConversions: totalHighValue,
        leadCaptures: totalLeads,
        intelligentConversionRate: Math.round(intelligentConversionRate * 100) / 100
      },
      pathAnalysis: pathMetrics,
      recommendations: this.generateAnalyticsRecommendations(pathMetrics),
      performanceInsights: {
        mostEffectivePath: pathMetrics.sort((a, b) => b.conversionRate - a.conversionRate)[0]?.path,
        avgEngagementScore: pathMetrics.reduce((sum, p) => sum + p.avgEngagement, 0) / pathMetrics.length || 0,
        avgIntentScore: pathMetrics.reduce((sum, p) => sum + p.avgIntent, 0) / pathMetrics.length || 0
      }
    };
  }

  private static generateAnalyticsRecommendations(pathMetrics: any[]) {
    const recommendations = [];

    // Check for optimization opportunities
    const lowPerformingPaths = pathMetrics.filter(p => p.conversionRate < 20);
    if (lowPerformingPaths.length > 0) {
      recommendations.push({
        type: 'optimization',
        priority: 'high',
        message: `Ottimizza i path con basse conversioni: ${lowPerformingPaths.map(p => p.path).join(', ')}`,
        action: 'Rivedi i criteri di decisione AI per questi percorsi'
      });
    }

    // Check for engagement opportunities
    const lowEngagementPaths = pathMetrics.filter(p => p.avgEngagement < 10);
    if (lowEngagementPaths.length > 0) {
      recommendations.push({
        type: 'engagement',
        priority: 'medium',
        message: 'Alcuni percorsi hanno engagement basso',
        action: 'Aggiungi elementi interattivi per aumentare l\'engagement'
      });
    }

    // Success patterns
    const highPerformingPaths = pathMetrics.filter(p => p.conversionRate > 50);
    if (highPerformingPaths.length > 0) {
      recommendations.push({
        type: 'success',
        priority: 'low',
        message: `Eccellenti risultati per: ${highPerformingPaths.map(p => p.path).join(', ')}`,
        action: 'Replica questi pattern su altri funnel'
      });
    }

    return recommendations;
  }
}