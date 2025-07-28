import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface PerformanceTimeData {
  date: string;
  conversions: number;
  views: number;
  conversion_rate: number;
  revenue: number;
  quality_score: number;
}

interface ConversationComparison {
  conversation_id: string;
  session_date: string;
  funnel_generated: boolean;
  funnel_performance: {
    views: number;
    conversions: number;
    conversion_rate: number;
  };
  conversation_quality: number;
  user_satisfaction: number;
  ai_confidence: number;
}

interface AutomaticInsight {
  id: string;
  type: 'performance_trend' | 'optimization_opportunity' | 'behavioral_pattern' | 'market_insight';
  title: string;
  description: string;
  impact_level: 'high' | 'medium' | 'low';
  actionable: boolean;
  recommended_actions: string[];
  confidence_score: number;
  data_source: string[];
  created_at: Date;
}

interface DashboardMetrics {
  total_conversations: number;
  successful_funnels: number;
  average_conversion_rate: number;
  total_revenue: number;
  engagement_score: number;
  ai_accuracy: number;
  user_satisfaction: number;
  growth_rate: number;
}

export const useAdvancedDashboard = () => {
  const { user } = useAuth();
  const [performanceData, setPerformanceData] = useState<PerformanceTimeData[]>([]);
  const [conversationComparisons, setConversationComparisons] = useState<ConversationComparison[]>([]);
  const [automaticInsights, setAutomaticInsights] = useState<AutomaticInsight[]>([]);
  const [dashboardMetrics, setDashboardMetrics] = useState<DashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  // Carica dati performance nel tempo
  const loadPerformanceOverTime = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const daysBack = getDaysFromTimeRange(timeRange);
      const startDate = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000);

      // Recupera dati analytics per periodo
      const { data: analyticsData, error: analyticsError } = await supabase
        .from('funnel_performance_analytics')
        .select(`
          *,
          funnel_id,
          date,
          unique_visitors,
          conversions,
          conversion_rate
        `)
        .gte('date', startDate.toISOString().split('T')[0])
        .order('date', { ascending: true });

      if (analyticsError) throw analyticsError;

      // Recupera dati funnel per calcolare revenue
      const { data: funnelsData, error: funnelsError } = await supabase
        .from('interactive_funnels')
        .select(`
          id,
          created_at,
          views_count,
          submissions_count,
          funnel_submissions(*)
        `)
        .eq('created_by', user.id)
        .gte('created_at', startDate.toISOString());

      if (funnelsError) throw funnelsError;

      // Aggrega dati per giorno
      const dailyData = aggregatePerformanceData(analyticsData || [], funnelsData || []);
      setPerformanceData(dailyData);

    } catch (error) {
      console.error('Error loading performance data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user, timeRange]);

  // Carica confronti conversazioni
  const loadConversationComparisons = useCallback(async () => {
    if (!user) return;

    try {
      const daysBack = getDaysFromTimeRange(timeRange);
      const startDate = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000);

      // Recupera conversazioni
      const { data: conversations, error: convError } = await supabase
        .from('chatbot_conversations')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false });

      if (convError) throw convError;

      // Raggruppa per sessione e analizza
      const sessionGroups = groupConversationsBySession(conversations || []);
      const comparisons = await analyzeConversationSessions(sessionGroups);
      
      setConversationComparisons(comparisons);
    } catch (error) {
      console.error('Error loading conversation comparisons:', error);
    }
  }, [user, timeRange]);

  // Genera insights automatici
  const generateAutomaticInsights = useCallback(async () => {
    if (!user) return;

    try {
      // Recupera tutti i dati necessari per l'analisi
      const [performanceData, conversationData, funnelData] = await Promise.all([
        supabase
          .from('funnel_performance_analytics')
          .select('*')
          .order('date', { ascending: false })
          .limit(30),

        supabase
          .from('chatbot_conversations')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(100),

        supabase
          .from('interactive_funnels')
          .select(`
            *,
            funnel_submissions(*),
            funnel_analytics_events(*)
          `)
          .eq('created_by', user.id)
      ]);

      // Analizza i dati per generare insights
      const insights = analyzeDataForInsights(
        performanceData.data || [],
        conversationData.data || [],
        funnelData.data || []
      );

      setAutomaticInsights(insights);
    } catch (error) {
      console.error('Error generating automatic insights:', error);
    }
  }, [user]);

  // Calcola metriche dashboard
  const calculateDashboardMetrics = useCallback(async () => {
    if (!user) return;

    try {
      const daysBack = getDaysFromTimeRange(timeRange);
      const startDate = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000);

      // Recupera dati per calcolo metriche
      const [conversations, funnels, analytics] = await Promise.all([
        supabase
          .from('chatbot_conversations')
          .select('*')
          .eq('user_id', user.id)
          .gte('created_at', startDate.toISOString()),

        supabase
          .from('interactive_funnels')
          .select(`
            *,
            funnel_submissions(*)
          `)
          .eq('created_by', user.id)
          .gte('created_at', startDate.toISOString()),

        supabase
          .from('funnel_performance_analytics')
          .select('*')
          .gte('date', startDate.toISOString().split('T')[0])
      ]);

      const metrics = calculateMetrics(
        conversations.data || [],
        funnels.data || [],
        analytics.data || []
      );

      setDashboardMetrics(metrics);
    } catch (error) {
      console.error('Error calculating dashboard metrics:', error);
    }
  }, [user, timeRange]);

  // Funzioni helper
  const getDaysFromTimeRange = (range: string): number => {
    switch (range) {
      case '7d': return 7;
      case '30d': return 30;
      case '90d': return 90;
      case '1y': return 365;
      default: return 30;
    }
  };

  const aggregatePerformanceData = (analytics: any[], funnels: any[]): PerformanceTimeData[] => {
    const dailyMap = new Map<string, PerformanceTimeData>();

    // Inizializza giorni
    const days = getDaysFromTimeRange(timeRange);
    for (let i = 0; i < days; i++) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      dailyMap.set(dateStr, {
        date: dateStr,
        conversions: 0,
        views: 0,
        conversion_rate: 0,
        revenue: 0,
        quality_score: 0
      });
    }

    // Aggrega dati analytics
    analytics.forEach(item => {
      const dateStr = item.date;
      if (dailyMap.has(dateStr)) {
        const existing = dailyMap.get(dateStr)!;
        existing.conversions += item.conversions || 0;
        existing.views += item.unique_visitors || 0;
      }
    });

    // Aggrega dati funnel
    funnels.forEach(funnel => {
      const dateStr = funnel.created_at.split('T')[0];
      if (dailyMap.has(dateStr)) {
        const existing = dailyMap.get(dateStr)!;
        existing.views += funnel.views_count || 0;
        existing.conversions += funnel.funnel_submissions?.length || 0;
        existing.revenue += calculateFunnelRevenue(funnel);
      }
    });

    // Calcola conversion rate e quality score
    Array.from(dailyMap.values()).forEach(data => {
      data.conversion_rate = data.views > 0 ? data.conversions / data.views : 0;
      data.quality_score = calculateQualityScore(data);
    });

    return Array.from(dailyMap.values()).sort((a, b) => a.date.localeCompare(b.date));
  };

  const groupConversationsBySession = (conversations: any[]): Map<string, any[]> => {
    const sessionMap = new Map<string, any[]>();
    
    conversations.forEach(conv => {
      const sessionId = conv.session_id;
      if (!sessionMap.has(sessionId)) {
        sessionMap.set(sessionId, []);
      }
      sessionMap.get(sessionId)!.push(conv);
    });

    return sessionMap;
  };

  const analyzeConversationSessions = async (sessionGroups: Map<string, any[]>): Promise<ConversationComparison[]> => {
    const comparisons: ConversationComparison[] = [];

    for (const [sessionId, conversations] of sessionGroups) {
      if (conversations.length === 0) continue;

      const sessionDate = conversations[0].created_at.split('T')[0];
      
      // Verifica se è stato generato un funnel
      const { data: funnels } = await supabase
        .from('interactive_funnels')
        .select(`
          *,
          funnel_submissions(*)
        `)
        .eq('created_by', user?.id)
        .gte('created_at', conversations[0].created_at)
        .lte('created_at', conversations[conversations.length - 1].created_at);

      const funnelGenerated = (funnels?.length || 0) > 0;
      const funnel = funnels?.[0];

      comparisons.push({
        conversation_id: sessionId,
        session_date: sessionDate,
        funnel_generated: funnelGenerated,
        funnel_performance: funnel ? {
          views: funnel.views_count || 0,
          conversions: funnel.funnel_submissions?.length || 0,
          conversion_rate: funnel.views_count > 0 ? (funnel.funnel_submissions?.length || 0) / funnel.views_count : 0
        } : { views: 0, conversions: 0, conversion_rate: 0 },
        conversation_quality: calculateConversationQuality(conversations),
        user_satisfaction: extractUserSatisfaction(conversations),
        ai_confidence: calculateAIConfidence(conversations)
      });
    }

    return comparisons.sort((a, b) => b.session_date.localeCompare(a.session_date)).slice(0, 20);
  };

  const analyzeDataForInsights = (performance: any[], conversations: any[], funnels: any[]): AutomaticInsight[] => {
    const insights: AutomaticInsight[] = [];

    // Analisi trend performance
    if (performance.length >= 7) {
      const trend = calculatePerformanceTrend(performance);
      if (Math.abs(trend) > 0.1) {
        insights.push({
          id: 'performance_trend_' + Date.now(),
          type: 'performance_trend',
          title: trend > 0 ? 'Performance in Miglioramento' : 'Performance in Calo',
          description: `Le tue performance sono ${trend > 0 ? 'migliorate' : 'peggiorate'} del ${Math.abs(trend * 100).toFixed(1)}% negli ultimi giorni`,
          impact_level: Math.abs(trend) > 0.2 ? 'high' : 'medium',
          actionable: true,
          recommended_actions: trend > 0 ? 
            ['Mantieni la strategia attuale', 'Considera di scalare gli sforzi'] :
            ['Rivedi la strategia di marketing', 'Ottimizza i funnel esistenti'],
          confidence_score: 0.8,
          data_source: ['performance_analytics'],
          created_at: new Date()
        });
      }
    }

    // Analisi opportunità ottimizzazione
    const lowPerformingFunnels = funnels.filter(f => 
      f.views_count > 10 && (f.funnel_submissions?.length || 0) / f.views_count < 0.05
    );

    if (lowPerformingFunnels.length > 0) {
      insights.push({
        id: 'optimization_opportunity_' + Date.now(),
        type: 'optimization_opportunity',
        title: 'Funnel da Ottimizzare Identificati',
        description: `${lowPerformingFunnels.length} funnel mostrano conversion rate sotto il 5% e potrebbero beneficiare di ottimizzazioni`,
        impact_level: 'high',
        actionable: true,
        recommended_actions: [
          'Rivedi il copy dei titoli',
          'Semplifica il processo di conversione',
          'Testa varianti A/B'
        ],
        confidence_score: 0.9,
        data_source: ['funnel_data'],
        created_at: new Date()
      });
    }

    // Analisi pattern comportamentali
    const conversationPattern = analyzeConversationPatterns(conversations);
    if (conversationPattern.insight) {
      insights.push({
        id: 'behavioral_pattern_' + Date.now(),
        type: 'behavioral_pattern',
        title: 'Pattern Comportamentale Identificato',
        description: conversationPattern.insight,
        impact_level: 'medium',
        actionable: true,
        recommended_actions: conversationPattern.recommendations,
        confidence_score: conversationPattern.confidence,
        data_source: ['conversation_data'],
        created_at: new Date()
      });
    }

    return insights.sort((a, b) => b.confidence_score - a.confidence_score).slice(0, 5);
  };

  const calculateMetrics = (conversations: any[], funnels: any[], analytics: any[]): DashboardMetrics => {
    const totalConversations = conversations.length;
    const successfulFunnels = funnels.filter(f => (f.funnel_submissions?.length || 0) > 0).length;
    
    const totalViews = funnels.reduce((sum, f) => sum + (f.views_count || 0), 0);
    const totalConversions = funnels.reduce((sum, f) => sum + (f.funnel_submissions?.length || 0), 0);
    const averageConversionRate = totalViews > 0 ? totalConversions / totalViews : 0;
    
    const totalRevenue = funnels.reduce((sum, f) => sum + calculateFunnelRevenue(f), 0);
    
    const engagementScore = conversations.length > 0 ? 
      conversations.filter(c => c.metadata?.engagement_indicators?.length > 0).length / conversations.length * 100 : 0;
    
    const aiAccuracy = funnels.filter(f => f.funnel_submissions?.length > 0).length / Math.max(funnels.length, 1) * 100;
    
    const userSatisfaction = conversations.reduce((sum, c) => 
      sum + (c.metadata?.satisfaction_score || 0.7), 0) / Math.max(conversations.length, 1) * 100;
    
    // Calcola growth rate (confronto con periodo precedente)
    const previousPeriodStart = new Date(Date.now() - getDaysFromTimeRange(timeRange) * 2 * 24 * 60 * 60 * 1000);
    const previousPeriodEnd = new Date(Date.now() - getDaysFromTimeRange(timeRange) * 24 * 60 * 60 * 1000);
    
    const currentPeriodConversions = totalConversions;
    const previousPeriodConversions = 50; // Simplified - would need actual calculation
    
    const growthRate = previousPeriodConversions > 0 ? 
      ((currentPeriodConversions - previousPeriodConversions) / previousPeriodConversions) * 100 : 0;

    return {
      total_conversations: totalConversations,
      successful_funnels: successfulFunnels,
      average_conversion_rate: averageConversionRate,
      total_revenue: totalRevenue,
      engagement_score: engagementScore,
      ai_accuracy: aiAccuracy,
      user_satisfaction: userSatisfaction,
      growth_rate: growthRate
    };
  };

  // Funzioni helper aggiuntive
  const calculateFunnelRevenue = (funnel: any): number => {
    // Simplified revenue calculation
    const submissions = funnel.funnel_submissions?.length || 0;
    return submissions * 25; // Assumed average value per submission
  };

  const calculateQualityScore = (data: PerformanceTimeData): number => {
    const conversionWeight = data.conversion_rate * 50;
    const volumeWeight = Math.min(data.views / 100, 1) * 30;
    const revenueWeight = Math.min(data.revenue / 1000, 1) * 20;
    
    return Math.min(100, conversionWeight + volumeWeight + revenueWeight);
  };

  const calculateConversationQuality = (conversations: any[]): number => {
    const avgLength = conversations.length;
    const hasSuccessIndicators = conversations.some(c => c.metadata?.success_indicators?.length > 0);
    
    return Math.min(100, (avgLength * 10) + (hasSuccessIndicators ? 40 : 0));
  };

  const extractUserSatisfaction = (conversations: any[]): number => {
    const satisfactionScores = conversations
      .map(c => c.metadata?.satisfaction_score)
      .filter(score => score !== undefined);
    
    if (satisfactionScores.length === 0) return 70; // Default
    
    return satisfactionScores.reduce((sum, score) => sum + score, 0) / satisfactionScores.length * 100;
  };

  const calculateAIConfidence = (conversations: any[]): number => {
    const confidenceScores = conversations
      .map(c => c.metadata?.ai_confidence)
      .filter(score => score !== undefined);
    
    if (confidenceScores.length === 0) return 75; // Default
    
    return confidenceScores.reduce((sum, score) => sum + score, 0) / confidenceScores.length * 100;
  };

  const calculatePerformanceTrend = (performance: any[]): number => {
    if (performance.length < 2) return 0;
    
    const recent = performance.slice(-3);
    const older = performance.slice(-7, -3);
    
    const recentAvg = recent.reduce((sum, p) => sum + (Number(p.conversion_rate) || 0), 0) / recent.length;
    const olderAvg = older.reduce((sum, p) => sum + (Number(p.conversion_rate) || 0), 0) / Math.max(older.length, 1);
    
    return olderAvg > 0 ? (recentAvg - olderAvg) / olderAvg : 0;
  };

  const analyzeConversationPatterns = (conversations: any[]) => {
    const hourFrequency = conversations.reduce((acc, conv) => {
      const hour = new Date(conv.created_at).getHours();
      acc[hour] = (acc[hour] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    const peakHour = Object.entries(hourFrequency)
      .sort(([,a], [,b]) => Number(b) - Number(a))[0];

    if (peakHour && parseInt(peakHour[0]) !== -1) {
      return {
        insight: `Noto che hai più conversazioni durante le ore ${peakHour[0]}:00. Questo potrebbe essere il momento ottimale per promuovere i tuoi funnel.`,
        recommendations: [
          `Programma contenuti durante le ${peakHour[0]}:00`,
          'Considera notifiche push in questo orario',
          'Ottimizza i funnel per questo pubblico'
        ],
        confidence: Math.min(0.9, Number(peakHour[1]) / conversations.length)
      };
    }

    return { insight: null, recommendations: [], confidence: 0 };
  };

  // Aggiorna timeRange
  const updateTimeRange = useCallback((newRange: '7d' | '30d' | '90d' | '1y') => {
    setTimeRange(newRange);
  }, []);

  // Load data when component mounts or timeRange changes
  useEffect(() => {
    if (user) {
      Promise.all([
        loadPerformanceOverTime(),
        loadConversationComparisons(),
        generateAutomaticInsights(),
        calculateDashboardMetrics()
      ]);
    }
  }, [user, timeRange, loadPerformanceOverTime, loadConversationComparisons, generateAutomaticInsights, calculateDashboardMetrics]);

  return {
    performanceData,
    conversationComparisons,
    automaticInsights,
    dashboardMetrics,
    isLoading,
    timeRange,
    updateTimeRange,
    loadPerformanceOverTime,
    loadConversationComparisons,
    generateAutomaticInsights,
    calculateDashboardMetrics
  };
};