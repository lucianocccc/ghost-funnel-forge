import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface MemoryPattern {
  id: string;
  pattern_type: 'successful_funnel' | 'user_preference' | 'optimization_rule';
  pattern_data: any;
  success_rate: number;
  usage_count: number;
  last_applied: Date;
  confidence_score: number;
}

interface CrossConversationLearning {
  conversation_patterns: any[];
  successful_strategies: any[];
  user_behaviors: any[];
  optimization_insights: any[];
}

export const useAdvancedMemory = () => {
  const { user } = useAuth();
  const [memoryPatterns, setMemoryPatterns] = useState<MemoryPattern[]>([]);
  const [crossConversationData, setCrossConversationData] = useState<CrossConversationLearning | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Carica pattern di memoria esistenti
  const loadMemoryPatterns = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('revolution_learning_memory')
        .select('*')
        .eq('user_id', user.id)
        .order('confidence_score', { ascending: false });

      if (error) throw error;

      const patterns = data?.map(item => ({
        id: item.id,
        pattern_type: item.memory_type as any,
        pattern_data: item.learning_data,
        success_rate: item.success_rate || 0,
        usage_count: item.usage_count || 0,
        last_applied: new Date(item.last_applied_at || item.created_at),
        confidence_score: item.confidence_score || 0
      })) || [];

      setMemoryPatterns(patterns);
    } catch (error) {
      console.error('Error loading memory patterns:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Salva pattern di successo
  const saveSuccessfulPattern = useCallback(async (
    patternType: MemoryPattern['pattern_type'],
    patternData: any,
    successMetrics: { conversion_rate?: number; engagement_score?: number; user_satisfaction?: number }
  ) => {
    if (!user) return;

    try {
      const confidenceScore = calculateConfidenceScore(successMetrics);
      
      const { error } = await supabase
        .from('revolution_learning_memory')
        .insert({
          user_id: user.id,
          memory_type: patternType,
          context_data: { metrics: successMetrics },
          learning_data: patternData,
          performance_metrics: successMetrics,
          confidence_score: confidenceScore,
          usage_count: 1,
          success_rate: successMetrics.conversion_rate || 0.5
        });

      if (error) throw error;
      
      await loadMemoryPatterns();
      console.log('✅ Pattern saved successfully with confidence:', confidenceScore);
    } catch (error) {
      console.error('Error saving successful pattern:', error);
    }
  }, [user, loadMemoryPatterns]);

  // Analizza pattern cross-conversazione
  const analyzeCrossConversationPatterns = useCallback(async () => {
    if (!user) return null;

    try {
      // Recupera tutte le conversazioni dell'utente
      const { data: conversations, error: convError } = await supabase
        .from('chatbot_conversations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (convError) throw convError;

      // Recupera funnel generati
      const { data: funnels, error: funnelError } = await supabase
        .from('interactive_funnels')
        .select('*, funnel_submissions(*)')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false });

      if (funnelError) throw funnelError;

      // Analizza pattern comportamentali
      const conversationPatterns = analyzeConversationPatterns(conversations || []);
      const successfulStrategies = analyzeSuccessfulStrategies(funnels || []);
      const userBehaviors = analyzeUserBehaviors(conversations || []);
      const optimizationInsights = generateOptimizationInsights(conversationPatterns, successfulStrategies);

      const crossLearning: CrossConversationLearning = {
        conversation_patterns: conversationPatterns,
        successful_strategies: successfulStrategies,
        user_behaviors: userBehaviors,
        optimization_insights: optimizationInsights
      };

      setCrossConversationData(crossLearning);
      return crossLearning;
    } catch (error) {
      console.error('Error analyzing cross-conversation patterns:', error);
      return null;
    }
  }, [user]);

  // Ottieni raccomandazioni basate su pattern
  const getPatternBasedRecommendations = useCallback((currentContext: any) => {
    if (!memoryPatterns.length || !crossConversationData) return [];

    const recommendations = [];

    // Raccomandazioni basate su pattern di successo
    const relevantPatterns = memoryPatterns
      .filter(pattern => pattern.confidence_score > 0.7)
      .sort((a, b) => b.success_rate - a.success_rate)
      .slice(0, 3);

    for (const pattern of relevantPatterns) {
      if (pattern.pattern_type === 'successful_funnel') {
        recommendations.push({
          type: 'funnel_structure',
          priority: 'high',
          message: `Basandomi sui tuoi successi passati, ti consiglio di utilizzare una struttura simile al funnel che ha avuto ${Math.round(pattern.success_rate * 100)}% di conversion rate`,
          data: pattern.pattern_data,
          confidence: pattern.confidence_score
        });
      }
    }

    // Raccomandazioni da pattern cross-conversazione
    if (crossConversationData.optimization_insights.length > 0) {
      const topInsight = crossConversationData.optimization_insights[0];
      recommendations.push({
        type: 'optimization',
        priority: 'medium',
        message: topInsight.recommendation,
        data: topInsight.data,
        confidence: topInsight.confidence
      });
    }

    return recommendations;
  }, [memoryPatterns, crossConversationData]);

  // Funzioni helper
  const calculateConfidenceScore = (metrics: any): number => {
    const factors = [
      metrics.conversion_rate || 0,
      metrics.engagement_score ? metrics.engagement_score / 100 : 0,
      metrics.user_satisfaction || 0
    ];
    
    return factors.reduce((sum, factor) => sum + factor, 0) / factors.length;
  };

  const analyzeConversationPatterns = (conversations: any[]) => {
    const patterns = [];
    
    // Analizza lunghezza conversazioni di successo
    const successfulConversations = conversations.filter(conv => 
      conv.metadata?.success_indicators?.length > 0
    );
    
    if (successfulConversations.length > 0) {
      const avgLength = successfulConversations.reduce((sum, conv) => 
        sum + (conv.metadata?.message_count || 0), 0
      ) / successfulConversations.length;
      
      patterns.push({
        type: 'conversation_length',
        value: avgLength,
        confidence: successfulConversations.length / conversations.length
      });
    }

    return patterns;
  };

  const analyzeSuccessfulStrategies = (funnels: any[]) => {
    const strategies = [];
    
    // Analizza funnel con alte conversioni
    const highPerformingFunnels = funnels.filter(funnel => 
      funnel.funnel_submissions && funnel.funnel_submissions.length > 5 && 
      funnel.views_count > 0 && 
      (funnel.funnel_submissions.length / funnel.views_count) > 0.1
    );

    if (highPerformingFunnels.length > 0) {
      strategies.push({
        type: 'high_conversion_structure',
        examples: highPerformingFunnels.map(f => ({
          name: f.name,
          conversion_rate: f.funnel_submissions.length / f.views_count,
          structure: f.settings
        })),
        confidence: 0.8
      });
    }

    return strategies;
  };

  const analyzeUserBehaviors = (conversations: any[]) => {
    const behaviors = [];
    
    // Analizza orari preferiti
    const hours = conversations.map(conv => new Date(conv.created_at).getHours());
    const hourFrequency = hours.reduce((acc, hour) => {
      acc[hour] = (acc[hour] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);
    
    const preferredHour = Object.entries(hourFrequency)
      .sort(([,a], [,b]) => b - a)[0]?.[0];
    
    if (preferredHour) {
      behaviors.push({
        type: 'preferred_interaction_time',
        value: parseInt(preferredHour),
        confidence: 0.7
      });
    }

    return behaviors;
  };

  const generateOptimizationInsights = (patterns: any[], strategies: any[]) => {
    const insights = [];
    
    // Genera insights basati su pattern e strategie
    if (strategies.length > 0 && patterns.length > 0) {
      insights.push({
        type: 'conversion_optimization',
        recommendation: 'Basandomi sui tuoi pattern di successo, ti consiglio di mantenere conversazioni più interattive e personalizzate',
        data: { patterns, strategies },
        confidence: 0.75
      });
    }

    return insights;
  };

  useEffect(() => {
    loadMemoryPatterns();
  }, [loadMemoryPatterns]);

  return {
    memoryPatterns,
    crossConversationData,
    isLoading,
    saveSuccessfulPattern,
    analyzeCrossConversationPatterns,
    getPatternBasedRecommendations,
    loadMemoryPatterns
  };
};