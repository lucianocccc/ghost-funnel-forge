import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { InteractiveFunnelStep } from '@/types/interactiveFunnel';

interface ContentGenerationRequest {
  sectionType: 'hero' | 'discovery' | 'benefits' | 'emotional' | 'conversion' | 'qualification';
  productName: string;
  industry?: string;
  audience?: string;
  benefits?: string[];
  brandVoice?: 'apple' | 'nike' | 'amazon' | 'luxury' | 'friendly' | 'professional' | 'startup';
  customContext?: Record<string, any>;
}

interface GeneratedContent {
  title: string;
  subtitle: string;
  content: string;
  cta: string;
  metadata?: {
    sectionType: string;
    productName: string;
    industry?: string;
    audience?: string;
    brandVoice?: string;
    generatedAt: string;
    model: string;
  };
}

interface ContentCache {
  [key: string]: GeneratedContent;
}

export const useAIContentPopulator = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [contentCache, setContentCache] = useState<ContentCache>({});
  const [generationProgress, setGenerationProgress] = useState(0);

  // Generate cache key for content
  const getCacheKey = useCallback((request: ContentGenerationRequest): string => {
    return `${request.sectionType}-${request.productName}-${request.brandVoice || 'professional'}`;
  }, []);

  // Generate single section content
  const generateSectionContent = useCallback(async (
    request: ContentGenerationRequest
  ): Promise<GeneratedContent> => {
    const cacheKey = getCacheKey(request);
    
    // Check cache first
    if (contentCache[cacheKey]) {
      console.log(`Using cached content for ${cacheKey}`);
      return contentCache[cacheKey];
    }

    try {
      console.log(`Generating ${request.sectionType} content for ${request.productName}`);
      
      const { data, error } = await supabase.functions.invoke('generate-section-content', {
        body: request
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(error.message || 'Failed to generate content');
      }

      if (!data || !data.title) {
        throw new Error('Invalid response from content generation service');
      }

      // Cache the result
      setContentCache(prev => ({
        ...prev,
        [cacheKey]: data
      }));

      return data;
    } catch (error) {
      console.error(`Error generating ${request.sectionType} content:`, error);
      throw error;
    }
  }, [contentCache, getCacheKey]);

  // Populate all funnel steps with AI content
  const populateFunnelContent = useCallback(async (
    steps: InteractiveFunnelStep[],
    baseRequest: Omit<ContentGenerationRequest, 'sectionType'>
  ): Promise<InteractiveFunnelStep[]> => {
    setIsGenerating(true);
    setGenerationProgress(0);

    try {
      const totalSteps = steps.length;
      const populatedSteps: InteractiveFunnelStep[] = [];

      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        setGenerationProgress((i / totalSteps) * 100);

        // Map step types to section types
        const sectionTypeMap: Record<string, ContentGenerationRequest['sectionType']> = {
          'lead_capture': 'hero',
          'discovery': 'discovery', 
          'qualification': 'qualification',
          'conversion': 'conversion',
          'thank_you': 'emotional',
          'form': 'benefits'
        };

        const sectionType = sectionTypeMap[step.step_type] || 'benefits';

        try {
          const generatedContent = await generateSectionContent({
            ...baseRequest,
            sectionType
          });

          // Update step with AI-generated content
          const updatedStep: InteractiveFunnelStep = {
            ...step,
            title: generatedContent.title,
            description: generatedContent.subtitle,
            settings: {
              ...step.settings,
              ai_generated: true,
              content: {
                headline: generatedContent.title,
                subheadline: generatedContent.subtitle,
                description: generatedContent.content,
                cta: generatedContent.cta
              },
              generation_metadata: generatedContent.metadata
            }
          };

          populatedSteps.push(updatedStep);
          
          // Small delay to prevent rate limiting
          if (i < steps.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 500));
          }

        } catch (error) {
          console.error(`Failed to generate content for step ${i + 1}:`, error);
          
          // Use original step if generation fails
          populatedSteps.push({
            ...step,
            settings: {
              ...step.settings,
              ai_generated: false,
              generation_error: error instanceof Error ? error.message : 'Unknown error'
            }
          });
        }
      }

      setGenerationProgress(100);
      toast.success(`Generated content for ${populatedSteps.length} funnel steps`);
      
      return populatedSteps;

    } catch (error) {
      console.error('Error populating funnel content:', error);
      toast.error('Failed to generate funnel content');
      throw error;
    } finally {
      setIsGenerating(false);
      setGenerationProgress(0);
    }
  }, [generateSectionContent]);

  // Smart content refresh based on performance
  const refreshUnderperformingContent = useCallback(async (
    step: InteractiveFunnelStep,
    baseRequest: Omit<ContentGenerationRequest, 'sectionType'>,
    performanceThreshold: number = 0.02 // 2% conversion rate threshold
  ): Promise<InteractiveFunnelStep> => {
    // This would typically check analytics data
    // For now, we'll just regenerate the content
    
    const sectionTypeMap: Record<string, ContentGenerationRequest['sectionType']> = {
      'lead_capture': 'hero',
      'discovery': 'discovery',
      'qualification': 'qualification', 
      'conversion': 'conversion',
      'thank_you': 'emotional',
      'form': 'benefits'
    };

    const sectionType = sectionTypeMap[step.step_type] || 'benefits';

    try {
      // Clear cache to force regeneration
      const cacheKey = getCacheKey({ ...baseRequest, sectionType });
      setContentCache(prev => {
        const newCache = { ...prev };
        delete newCache[cacheKey];
        return newCache;
      });

      const generatedContent = await generateSectionContent({
        ...baseRequest,
        sectionType
      });

      return {
        ...step,
        title: generatedContent.title,
        description: generatedContent.subtitle,
        settings: {
          ...step.settings,
          ai_generated: true,
          content: {
            headline: generatedContent.title,
            subheadline: generatedContent.subtitle,
            description: generatedContent.content,
            cta: generatedContent.cta
          },
          generation_metadata: {
            ...generatedContent.metadata,
            refreshedAt: new Date().toISOString(),
            reason: 'performance_optimization'
          }
        }
      };
    } catch (error) {
      console.error('Error refreshing content:', error);
      toast.error('Failed to refresh content');
      throw error;
    }
  }, [generateSectionContent, getCacheKey]);

  // Clear content cache
  const clearCache = useCallback(() => {
    setContentCache({});
    toast.success('Content cache cleared');
  }, []);

  return {
    isGenerating,
    generationProgress,
    contentCache,
    generateSectionContent,
    populateFunnelContent,
    refreshUnderperformingContent,
    clearCache
  };
};