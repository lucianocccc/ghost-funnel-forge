import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface FunnelPrediction {
  funnel_id: string;
  predicted_conversion_rate: number;
  predicted_traffic: number;
  confidence_interval: [number, number];
  key_factors: string[];
  optimization_score: number;
}

interface ABTestSuggestion {
  id: string;
  test_type: 'headline' | 'cta' | 'color_scheme' | 'layout' | 'content_flow';
  current_element: string;
  suggested_variant: string;
  expected_improvement: number;
  priority: 'high' | 'medium' | 'low';
  reasoning: string;
}

interface AutoOptimization {
  id: string;
  funnel_id: string;
  optimization_type: 'content' | 'structure' | 'timing' | 'targeting';
  recommendation: string;
  implementation_difficulty: 'easy' | 'medium' | 'hard';
  expected_impact: number;
  auto_applicable: boolean;
}

export const usePredictiveAnalytics = () => {
  const { user } = useAuth();
  const [predictions, setPredictions] = useState<FunnelPrediction[]>([]);
  const [abTestSuggestions, setAbTestSuggestions] = useState<ABTestSuggestion[]>([]);
  const [autoOptimizations, setAutoOptimizations] = useState<AutoOptimization[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Predice performance funnel
  const predictFunnelPerformance = useCallback(async (funnelId: string) => {
    if (!user) return null;

    setIsAnalyzing(true);
    try {
      // Recupera dati storici del funnel
      const { data: funnelData, error: funnelError } = await supabase
        .from('interactive_funnels')
        .select(`
          *,
          funnel_submissions(*),
          funnel_analytics_events(*)
        `)
        .eq('id', funnelId)
        .single();

      if (funnelError) throw funnelError;

      // Recupera funnel simili per confronto
      const { data: similarFunnels, error: similarError } = await supabase
        .from('interactive_funnels')
        .select(`
          *,
          funnel_submissions(*),
          funnel_analytics_events(*)
        `)
        .eq('created_by', user.id)
        .neq('id', funnelId);

      if (similarError) throw similarError;

      // Calcola predizione basata su algoritmi ML semplificati
      const prediction = calculateFunnelPrediction(funnelData, similarFunnels || []);
      
      setPredictions(prev => {
        const filtered = prev.filter(p => p.funnel_id !== funnelId);
        return [...filtered, prediction];
      });

      return prediction;
    } catch (error) {
      console.error('Error predicting funnel performance:', error);
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  }, [user]);

  // Genera suggerimenti A/B test
  const generateABTestSuggestions = useCallback(async (funnelId: string) => {
    if (!user) return [];

    try {
      const { data: funnelData, error } = await supabase
        .from('interactive_funnels')
        .select(`
          *,
          interactive_funnel_steps(*),
          funnel_submissions(*),
          funnel_analytics_events(*)
        `)
        .eq('id', funnelId)
        .single();

      if (error) throw error;

      // Analizza performance attuali per identificare aree di miglioramento
      const suggestions = analyzeForABTestOpportunities(funnelData);
      
      setAbTestSuggestions(prev => {
        const filtered = prev.filter(s => !s.id.startsWith(funnelId));
        return [...filtered, ...suggestions];
      });

      return suggestions;
    } catch (error) {
      console.error('Error generating A/B test suggestions:', error);
      return [];
    }
  }, [user]);

  // Genera raccomandazioni di ottimizzazione automatica
  const generateAutoOptimizations = useCallback(async (funnelId: string) => {
    if (!user) return [];

    try {
      // Recupera tutti i dati necessari per l'analisi
      const { data: analyticsData, error: analyticsError } = await supabase
        .from('funnel_performance_analytics')
        .select('*')
        .eq('funnel_id', funnelId)
        .order('date', { ascending: false })
        .limit(30);

      if (analyticsError) throw analyticsError;

      const { data: submissionsData, error: submissionsError } = await supabase
        .from('funnel_submissions')
        .select('*')
        .eq('funnel_id', funnelId)
        .order('created_at', { ascending: false })
        .limit(100);

      if (submissionsError) throw submissionsError;

      // Analizza pattern e genera ottimizzazioni
      const optimizations = analyzeForAutoOptimizations(
        funnelId,
        analyticsData || [],
        submissionsData || []
      );

      setAutoOptimizations(prev => {
        const filtered = prev.filter(o => o.funnel_id !== funnelId);
        return [...filtered, ...optimizations];
      });

      return optimizations;
    } catch (error) {
      console.error('Error generating auto optimizations:', error);
      return [];
    }
  }, [user]);

  // Applica ottimizzazione automatica
  const applyAutoOptimization = useCallback(async (optimizationId: string) => {
    const optimization = autoOptimizations.find(o => o.id === optimizationId);
    if (!optimization || !optimization.auto_applicable) return false;

    try {
      // Log dell'applicazione dell'ottimizzazione
      const { error } = await supabase
        .from('revolution_learning_memory')
        .insert({
          user_id: user?.id,
          memory_type: 'auto_optimization',
          context_data: { 
            funnel_id: optimization.funnel_id,
            optimization_type: optimization.optimization_type 
          },
          learning_data: {
            recommendation: optimization.recommendation,
            expected_impact: optimization.expected_impact,
            applied_at: new Date().toISOString()
          },
          confidence_score: optimization.expected_impact / 100
        });

      if (error) throw error;

      // Rimuovi l'ottimizzazione applicata dalla lista
      setAutoOptimizations(prev => 
        prev.filter(o => o.id !== optimizationId)
      );

      return true;
    } catch (error) {
      console.error('Error applying auto optimization:', error);
      return false;
    }
  }, [autoOptimizations, user]);

  // Funzioni helper per l'analisi
  const calculateFunnelPrediction = (funnelData: any, similarFunnels: any[]): FunnelPrediction => {
    const currentConversionRate = funnelData.views_count > 0 
      ? funnelData.submissions_count / funnelData.views_count 
      : 0;

    // Calcola media conversion rate di funnel simili
    const similarConversionRates = similarFunnels
      .filter(f => f.views_count > 0)
      .map(f => f.submissions_count / f.views_count);

    const avgSimilarConversion = similarConversionRates.length > 0
      ? similarConversionRates.reduce((sum, rate) => sum + rate, 0) / similarConversionRates.length
      : 0.05;

    // Stima predizione usando mix di dati storici e benchmark
    const weightedPrediction = (currentConversionRate * 0.7) + (avgSimilarConversion * 0.3);
    const predicted_conversion_rate = Math.max(0.01, Math.min(0.5, weightedPrediction));

    // Stima traffico basato su trend
    const predicted_traffic = Math.max(10, funnelData.views_count * 1.2);

    // Intervallo di confidenza
    const margin = predicted_conversion_rate * 0.3;
    const confidence_interval: [number, number] = [
      Math.max(0.001, predicted_conversion_rate - margin),
      Math.min(0.8, predicted_conversion_rate + margin)
    ];

    // Fattori chiave
    const key_factors = identifyKeyFactors(funnelData);

    // Score di ottimizzazione
    const optimization_score = calculateOptimizationScore(funnelData);

    return {
      funnel_id: funnelData.id,
      predicted_conversion_rate,
      predicted_traffic,
      confidence_interval,
      key_factors,
      optimization_score
    };
  };

  const analyzeForABTestOpportunities = (funnelData: any): ABTestSuggestion[] => {
    const suggestions: ABTestSuggestion[] = [];
    const funnelId = funnelData.id;

    // Analizza conversion rate per suggerire test
    const conversionRate = funnelData.views_count > 0 
      ? funnelData.submissions_count / funnelData.views_count 
      : 0;

    if (conversionRate < 0.1) {
      suggestions.push({
        id: `${funnelId}_headline_test`,
        test_type: 'headline',
        current_element: 'Titolo principale',
        suggested_variant: 'Headline più orientato ai benefici specifici',
        expected_improvement: 15,
        priority: 'high',
        reasoning: 'Conversion rate basso suggerisce che il messaggio iniziale non cattura abbastanza attenzione'
      });

      suggestions.push({
        id: `${funnelId}_cta_test`,
        test_type: 'cta',
        current_element: 'Call-to-action button',
        suggested_variant: 'CTA più specifica e orientata all\'azione',
        expected_improvement: 12,
        priority: 'high',
        reasoning: 'CTA generica potrebbe non comunicare abbastanza valore'
      });
    }

    if (funnelData.interactive_funnel_steps?.length > 3) {
      suggestions.push({
        id: `${funnelId}_flow_test`,
        test_type: 'content_flow',
        current_element: 'Flusso multi-step',
        suggested_variant: 'Ridurre il numero di step o semplificare',
        expected_improvement: 20,
        priority: 'medium',
        reasoning: 'Troppi step potrebbero causare abbandono'
      });
    }

    return suggestions;
  };

  const analyzeForAutoOptimizations = (
    funnelId: string,
    analytics: any[],
    submissions: any[]
  ): AutoOptimization[] => {
    const optimizations: AutoOptimization[] = [];

    // Analizza pattern temporali
    if (submissions.length > 10) {
      const submissionHours = submissions.map(s => new Date(s.created_at).getHours());
      const hourFrequency = submissionHours.reduce((acc, hour) => {
        acc[hour] = (acc[hour] || 0) + 1;
        return acc;
      }, {} as Record<number, number>);

      const peakHour = Object.entries(hourFrequency)
        .sort(([,a], [,b]) => b - a)[0]?.[0];

      if (peakHour) {
        optimizations.push({
          id: `${funnelId}_timing_opt`,
          funnel_id: funnelId,
          optimization_type: 'timing',
          recommendation: `Ottimizza la promozione del funnel durante le ore ${peakHour}:00-${parseInt(peakHour)+1}:00 quando l'engagement è più alto`,
          implementation_difficulty: 'easy',
          expected_impact: 15,
          auto_applicable: false
        });
      }
    }

    // Analizza bounce rate
    if (analytics.length > 0) {
      const avgBounceRate = analytics.reduce((sum, a) => sum + (a.bounce_rate || 0), 0) / analytics.length;
      
      if (avgBounceRate > 0.7) {
        optimizations.push({
          id: `${funnelId}_content_opt`,
          funnel_id: funnelId,
          optimization_type: 'content',
          recommendation: 'Alto bounce rate: migliorare il contenuto iniziale per catturare meglio l\'attenzione',
          implementation_difficulty: 'medium',
          expected_impact: 25,
          auto_applicable: false
        });
      }
    }

    return optimizations;
  };

  const identifyKeyFactors = (funnelData: any): string[] => {
    const factors = [];
    
    if (funnelData.description?.length > 100) {
      factors.push('Descrizione dettagliata');
    }
    
    if (funnelData.interactive_funnel_steps?.length <= 2) {
      factors.push('Processo semplificato');
    }
    
    if (funnelData.settings?.design?.colors) {
      factors.push('Design personalizzato');
    }

    return factors.length > 0 ? factors : ['Struttura base', 'Contenuto standard'];
  };

  const calculateOptimizationScore = (funnelData: any): number => {
    let score = 50; // Base score
    
    // Fattori positivi
    if (funnelData.description?.length > 50) score += 10;
    if (funnelData.interactive_funnel_steps?.length >= 2) score += 15;
    if (funnelData.submissions_count > 0) score += 20;
    
    // Fattori che riducono il score
    if (funnelData.views_count > 50 && funnelData.submissions_count === 0) score -= 20;
    if (funnelData.interactive_funnel_steps?.length > 4) score -= 10;

    return Math.max(0, Math.min(100, score));
  };

  // Analizza tutti i funnel dell'utente
  const analyzeAllUserFunnels = useCallback(async () => {
    if (!user) return;

    setIsAnalyzing(true);
    try {
      const { data: funnels, error } = await supabase
        .from('interactive_funnels')
        .select('id')
        .eq('created_by', user.id);

      if (error) throw error;

      if (funnels) {
        for (const funnel of funnels) {
          await Promise.all([
            predictFunnelPerformance(funnel.id),
            generateABTestSuggestions(funnel.id),
            generateAutoOptimizations(funnel.id)
          ]);
        }
      }
    } catch (error) {
      console.error('Error analyzing all funnels:', error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [user, predictFunnelPerformance, generateABTestSuggestions, generateAutoOptimizations]);

  return {
    predictions,
    abTestSuggestions,
    autoOptimizations,
    isAnalyzing,
    predictFunnelPerformance,
    generateABTestSuggestions,
    generateAutoOptimizations,
    applyAutoOptimization,
    analyzeAllUserFunnels
  };
};