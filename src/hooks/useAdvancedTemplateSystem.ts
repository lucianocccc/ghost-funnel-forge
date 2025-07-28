import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface TemplateVersion {
  id: string;
  template_id: string;
  version_number: number;
  changes_description: string;
  template_data: any;
  performance_metrics: {
    conversion_rate: number;
    usage_count: number;
    user_rating: number;
  };
  created_at: Date;
  is_active: boolean;
}

interface LivePreviewData {
  funnel_id: string;
  template_id: string;
  preview_url: string;
  performance_preview: {
    estimated_conversion: number;
    estimated_traffic: number;
    optimization_score: number;
  };
  real_time_metrics: {
    current_views: number;
    current_submissions: number;
    real_time_conversion: number;
  };
}

interface TemplatePerformanceComparison {
  template_a: string;
  template_b: string;
  metrics_comparison: {
    conversion_rate_diff: number;
    engagement_diff: number;
    completion_rate_diff: number;
  };
  recommendation: 'use_a' | 'use_b' | 'hybrid_approach';
  confidence_level: number;
}

export const useAdvancedTemplateSystem = () => {
  const { user } = useAuth();
  const [templateVersions, setTemplateVersions] = useState<TemplateVersion[]>([]);
  const [livePreviewData, setLivePreviewData] = useState<LivePreviewData[]>([]);
  const [templateComparisons, setTemplateComparisons] = useState<TemplatePerformanceComparison[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Crea nuova versione template
  const createTemplateVersion = useCallback(async (
    templateId: string,
    changes: any,
    changesDescription: string
  ) => {
    if (!user) return null;

    setIsProcessing(true);
    try {
      // Ottieni ultima versione esistente
      const { data: existingVersions, error: versionError } = await supabase
        .from('revolution_funnel_templates')
        .select('*')
        .eq('id', templateId)
        .order('updated_at', { ascending: false })
        .limit(1);

      if (versionError) throw versionError;

      const currentVersion = existingVersions?.[0];
      const currentStructure = currentVersion?.funnel_structure as any;
      const newVersionNumber = currentVersion ? 
        (currentStructure?.version || 1) + 1 : 1;

      // Crea nuova versione
      const newTemplateData = {
        ...(typeof currentStructure === 'object' ? currentStructure : {}),
        ...changes,
        version: newVersionNumber,
        changes_log: [
          ...(currentStructure?.changes_log || []),
          {
            version: newVersionNumber,
            description: changesDescription,
            timestamp: new Date().toISOString(),
            changes
          }
        ]
      };

      const { data: newTemplate, error: createError } = await supabase
        .from('revolution_funnel_templates')
        .insert({
          user_id: user.id,
          template_name: `${currentVersion?.template_name || 'Template'} v${newVersionNumber}`,
          customer_profile_match: currentVersion?.customer_profile_match || {},
          funnel_structure: newTemplateData,
          copy_templates: currentVersion?.copy_templates || {},
          design_system: currentVersion?.design_system || {},
          conversion_strategy: currentVersion?.conversion_strategy || {},
          performance_score: 0,
          is_ai_generated: true
        })
        .select()
        .single();

      if (createError) throw createError;

      await loadTemplateVersions(templateId);
      return newTemplate;
    } catch (error) {
      console.error('Error creating template version:', error);
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, [user]);

  // Carica versioni template
  const loadTemplateVersions = useCallback(async (templateId?: string) => {
    if (!user) return;

    try {
      let query = supabase
        .from('revolution_funnel_templates')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (templateId) {
        query = query.eq('id', templateId);
      }

      const { data, error } = await query;
      if (error) throw error;

      const versions: TemplateVersion[] = data?.map(template => {
        const structure = template.funnel_structure as any;
        return {
          id: template.id,
          template_id: template.id,
          version_number: structure?.version || 1,
          changes_description: structure?.changes_log?.slice(-1)?.[0]?.description || 'Versione iniziale',
          template_data: template.funnel_structure,
          performance_metrics: {
            conversion_rate: template.avg_conversion_rate || 0,
            usage_count: template.usage_count || 0,
            user_rating: template.performance_score || 0
          },
          created_at: new Date(template.created_at),
          is_active: true
        };
      }) || [];

      setTemplateVersions(versions);
    } catch (error) {
      console.error('Error loading template versions:', error);
    }
  }, [user]);

  // Genera live preview
  const generateLivePreview = useCallback(async (funnelId: string, templateId: string) => {
    if (!user) return null;

    setIsProcessing(true);
    try {
      // Recupera dati funnel e template
      const [funnelResponse, templateResponse] = await Promise.all([
        supabase
          .from('interactive_funnels')
          .select(`
            *,
            funnel_submissions(*),
            funnel_analytics_events(*)
          `)
          .eq('id', funnelId)
          .single(),
        
        supabase
          .from('revolution_funnel_templates')
          .select('*')
          .eq('id', templateId)
          .single()
      ]);

      if (funnelResponse.error) throw funnelResponse.error;
      if (templateResponse.error) throw templateResponse.error;

      const funnel = funnelResponse.data;
      const template = templateResponse.data;

      // Calcola metriche preview
      const performancePreview = calculatePerformancePreview(funnel, template);
      const realTimeMetrics = calculateRealTimeMetrics(funnel);

      const previewData: LivePreviewData = {
        funnel_id: funnelId,
        template_id: templateId,
        preview_url: `${window.location.origin}/funnel/${funnel.share_token}`,
        performance_preview: performancePreview,
        real_time_metrics: realTimeMetrics
      };

      setLivePreviewData(prev => {
        const filtered = prev.filter(p => p.funnel_id !== funnelId);
        return [...filtered, previewData];
      });

      return previewData;
    } catch (error) {
      console.error('Error generating live preview:', error);
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, [user]);

  // Confronta template performance
  const compareTemplatePerformance = useCallback(async (templateAId: string, templateBId: string) => {
    if (!user) return null;

    try {
      // Recupera dati performance per entrambi i template
      const [templateA, templateB] = await Promise.all([
        supabase
          .from('revolution_funnel_templates')
          .select('*')
          .eq('id', templateAId)
          .single(),
        
        supabase
          .from('revolution_funnel_templates')
          .select('*')
          .eq('id', templateBId)
          .single()
      ]);

      if (templateA.error || templateB.error) {
        throw templateA.error || templateB.error;
      }

      // Recupera funnel che usano questi template
      const [funnelsA, funnelsB] = await Promise.all([
        supabase
          .from('interactive_funnels')
          .select(`
            *,
            funnel_submissions(*)
          `)
          .eq('created_by', user.id)
          .contains('settings', { template_id: templateAId }),
        
        supabase
          .from('interactive_funnels')
          .select(`
            *,
            funnel_submissions(*)
          `)
          .eq('created_by', user.id)
          .contains('settings', { template_id: templateBId })
      ]);

      // Calcola metriche comparative
      const metricsA = calculateTemplateMetrics(funnelsA.data || []);
      const metricsB = calculateTemplateMetrics(funnelsB.data || []);

      const comparison: TemplatePerformanceComparison = {
        template_a: templateAId,
        template_b: templateBId,
        metrics_comparison: {
          conversion_rate_diff: metricsA.conversion_rate - metricsB.conversion_rate,
          engagement_diff: metricsA.engagement_rate - metricsB.engagement_rate,
          completion_rate_diff: metricsA.completion_rate - metricsB.completion_rate
        },
        recommendation: determineRecommendation(metricsA, metricsB),
        confidence_level: calculateConfidenceLevel(metricsA, metricsB)
      };

      setTemplateComparisons(prev => {
        const filtered = prev.filter(c => 
          !(c.template_a === templateAId && c.template_b === templateBId) &&
          !(c.template_a === templateBId && c.template_b === templateAId)
        );
        return [...filtered, comparison];
      });

      return comparison;
    } catch (error) {
      console.error('Error comparing template performance:', error);
      return null;
    }
  }, [user]);

  // Ottimizza template automaticamente
  const optimizeTemplate = useCallback(async (templateId: string, optimizationGoals: string[]) => {
    if (!user) return null;

    setIsProcessing(true);
    try {
      // Recupera template corrente
      const { data: template, error } = await supabase
        .from('revolution_funnel_templates')
        .select('*')
        .eq('id', templateId)
        .single();

      if (error) throw error;

      // Analizza performance e genera ottimizzazioni
      const optimizations = generateOptimizations(template, optimizationGoals);
      
      // Crea versione ottimizzata
      const optimizedVersion = await createTemplateVersion(
        templateId,
        optimizations,
        `Ottimizzazione automatica: ${optimizationGoals.join(', ')}`
      );

      return optimizedVersion;
    } catch (error) {
      console.error('Error optimizing template:', error);
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, [user, createTemplateVersion]);

  // Funzioni helper
  const calculatePerformancePreview = (funnel: any, template: any) => {
    const currentConversion = funnel.views_count > 0 
      ? funnel.funnel_submissions?.length / funnel.views_count 
      : 0;

    const templatePerformance = template.avg_conversion_rate || 0.05;
    const estimatedConversion = Math.max(currentConversion, templatePerformance * 1.2);

    return {
      estimated_conversion: estimatedConversion,
      estimated_traffic: Math.max(funnel.views_count * 1.3, 50),
      optimization_score: template.performance_score || 75
    };
  };

  const calculateRealTimeMetrics = (funnel: any) => {
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentSubmissions = funnel.funnel_submissions?.filter(
      (sub: any) => new Date(sub.created_at) > last24Hours
    ) || [];

    return {
      current_views: funnel.views_count || 0,
      current_submissions: funnel.funnel_submissions?.length || 0,
      real_time_conversion: funnel.views_count > 0 
        ? (funnel.funnel_submissions?.length || 0) / funnel.views_count 
        : 0
    };
  };

  const calculateTemplateMetrics = (funnels: any[]) => {
    if (funnels.length === 0) {
      return {
        conversion_rate: 0,
        engagement_rate: 0,
        completion_rate: 0,
        total_views: 0,
        total_submissions: 0
      };
    }

    const totalViews = funnels.reduce((sum, f) => sum + (f.views_count || 0), 0);
    const totalSubmissions = funnels.reduce((sum, f) => sum + (f.funnel_submissions?.length || 0), 0);

    return {
      conversion_rate: totalViews > 0 ? totalSubmissions / totalViews : 0,
      engagement_rate: funnels.filter(f => f.views_count > 0).length / funnels.length,
      completion_rate: totalSubmissions > 0 ? 0.8 : 0, // Simplified
      total_views: totalViews,
      total_submissions: totalSubmissions
    };
  };

  const determineRecommendation = (metricsA: any, metricsB: any): 'use_a' | 'use_b' | 'hybrid_approach' => {
    const scoreA = metricsA.conversion_rate + metricsA.engagement_rate;
    const scoreB = metricsB.conversion_rate + metricsB.engagement_rate;
    
    if (Math.abs(scoreA - scoreB) < 0.05) {
      return 'hybrid_approach';
    }
    
    return scoreA > scoreB ? 'use_a' : 'use_b';
  };

  const calculateConfidenceLevel = (metricsA: any, metricsB: any): number => {
    const sampleSizeA = metricsA.total_views;
    const sampleSizeB = metricsB.total_views;
    
    const minSampleSize = Math.min(sampleSizeA, sampleSizeB);
    
    if (minSampleSize < 10) return 0.3;
    if (minSampleSize < 50) return 0.6;
    if (minSampleSize < 100) return 0.8;
    return 0.9;
  };

  const generateOptimizations = (template: any, goals: string[]) => {
    const optimizations: any = {};

    if (goals.includes('conversion')) {
      optimizations.cta_improvements = {
        more_specific_text: true,
        color_optimization: true,
        positioning_improvements: true
      };
    }

    if (goals.includes('engagement')) {
      optimizations.content_improvements = {
        shorter_forms: true,
        visual_enhancements: true,
        interactive_elements: true
      };
    }

    if (goals.includes('completion')) {
      optimizations.flow_improvements = {
        reduce_steps: true,
        progress_indicators: true,
        simplified_language: true
      };
    }

    return optimizations;
  };

  useEffect(() => {
    loadTemplateVersions();
  }, [loadTemplateVersions]);

  return {
    templateVersions,
    livePreviewData,
    templateComparisons,
    isProcessing,
    createTemplateVersion,
    loadTemplateVersions,
    generateLivePreview,
    compareTemplatePerformance,
    optimizeTemplate
  };
};