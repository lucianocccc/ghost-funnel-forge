import { useState, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { CreativityParameters, CreativeContext, CreativeContent, QualityMetrics } from '@/services/creativeIntelligenceEngine';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export const useAdvancedCreativeSystem = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<CreativeContent | null>(null);
  const [qualityMetrics, setQualityMetrics] = useState<QualityMetrics | null>(null);
  const [parameters, setParameters] = useState<CreativityParameters>({
    linguisticCreativity: 70,
    emotionalResonance: 70,
    marketPsychology: 75,
    visualStorytelling: 70,
    persuasionArchitecture: 80
  });
  const [context, setContext] = useState<CreativeContext>({
    industry: '',
    targetAudience: '',
    productType: '',
    brandPersonality: '',
    competitivePosition: '',
    emotionalTriggers: [],
    painPoints: [],
    desires: []
  });

  const generateCreativeContent = useCallback(async (contentType: 'headline' | 'description' | 'cta' | 'full_funnel' = 'full_funnel') => {
    if (!context.industry || !context.targetAudience) {
      toast.error('Please fill in basic context information');
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('advanced-creative-generator', {
        body: { context, parameters, contentType }
      });

      if (error) throw error;
      
      setGeneratedContent(data.content);
      toast.success('Creative content generated successfully!');
      
      // Calculate quality metrics
      if (data.content) {
        const mockQuality: QualityMetrics = {
          coherenceScore: 85 + Math.random() * 10,
          persuasionScore: parameters.persuasionArchitecture + Math.random() * 10,
          uniquenessScore: parameters.linguisticCreativity + Math.random() * 15,
          brandConsistency: 80 + Math.random() * 15,
          emotionalImpact: parameters.emotionalResonance + Math.random() * 10,
          overallQuality: 0
        };
        mockQuality.overallQuality = Object.values(mockQuality).slice(0, -1).reduce((sum, val) => sum + val, 0) / 5;
        setQualityMetrics(mockQuality);
      }
      
    } catch (error) {
      console.error('Error generating content:', error);
      toast.error('Failed to generate creative content');
    } finally {
      setIsGenerating(false);
    }
  }, [context, parameters]);

  return {
    // State
    isGenerating,
    generatedContent,
    qualityMetrics,
    parameters,
    context,
    
    // Actions
    generateCreativeContent,
    setParameters,
    setContext,
    
    // Utils
    clearResults: () => {
      setGeneratedContent(null);
      setQualityMetrics(null);
    }
  };
};

export default useAdvancedCreativeSystem;