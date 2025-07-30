import { createClient } from '@supabase/supabase-js';

export interface CreativityParameters {
  linguisticCreativity: number; // 0-100
  emotionalResonance: number; // 0-100  
  marketPsychology: number; // 0-100
  visualStorytelling: number; // 0-100
  persuasionArchitecture: number; // 0-100
}

export interface CreativeContext {
  industry: string;
  targetAudience: string;
  productType: string;
  brandPersonality: string;
  competitivePosition: string;
  emotionalTriggers: string[];
  painPoints: string[];
  desires: string[];
}

export interface CreativeContent {
  headlines: string[];
  descriptions: string[];
  ctaTexts: string[];
  narrativeElements: string[];
  visualPrompts: string[];
  emotionalHooks: string[];
  persuasionFrameworks: string[];
}

export interface QualityMetrics {
  coherenceScore: number;
  persuasionScore: number;
  uniquenessScore: number;
  brandConsistency: number;
  emotionalImpact: number;
  overallQuality: number;
}

class CreativeIntelligenceEngine {
  private static instance: CreativeIntelligenceEngine;
  private supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY
  );

  static getInstance(): CreativeIntelligenceEngine {
    if (!CreativeIntelligenceEngine.instance) {
      CreativeIntelligenceEngine.instance = new CreativeIntelligenceEngine();
    }
    return CreativeIntelligenceEngine.instance;
  }

  async generateCreativeContent(
    context: CreativeContext,
    parameters: CreativityParameters,
    contentType: 'headline' | 'description' | 'cta' | 'full_funnel'
  ): Promise<CreativeContent> {
    try {
      const { data, error } = await this.supabase.functions.invoke('advanced-creative-generator', {
        body: {
          context,
          parameters,
          contentType,
          timestamp: new Date().toISOString()
        }
      });

      if (error) throw error;
      return data.content;
    } catch (error) {
      console.error('Error generating creative content:', error);
      throw error;
    }
  }

  async analyzeContentQuality(content: CreativeContent, context: CreativeContext): Promise<QualityMetrics> {
    try {
      const { data, error } = await this.supabase.functions.invoke('content-quality-analyzer', {
        body: {
          content,
          context,
          timestamp: new Date().toISOString()
        }
      });

      if (error) throw error;
      return data.metrics;
    } catch (error) {
      console.error('Error analyzing content quality:', error);
      throw error;
    }
  }

  async optimizeCreativity(
    initialContent: CreativeContent,
    context: CreativeContext,
    targetMetrics: Partial<QualityMetrics>
  ): Promise<CreativeContent> {
    try {
      const { data, error } = await this.supabase.functions.invoke('creativity-optimizer', {
        body: {
          initialContent,
          context,
          targetMetrics,
          timestamp: new Date().toISOString()
        }
      });

      if (error) throw error;
      return data.optimizedContent;
    } catch (error) {
      console.error('Error optimizing creativity:', error);
      throw error;
    }
  }

  async generateVisualPrompts(
    content: CreativeContent,
    context: CreativeContext,
    style: 'cinematic' | 'minimalist' | 'dynamic' | 'emotional'
  ): Promise<string[]> {
    try {
      const { data, error } = await this.supabase.functions.invoke('visual-prompt-generator', {
        body: {
          content,
          context,
          style,
          timestamp: new Date().toISOString()
        }
      });

      if (error) throw error;
      return data.visualPrompts;
    } catch (error) {
      console.error('Error generating visual prompts:', error);
      throw error;
    }
  }

  calculateCreativityScore(parameters: CreativityParameters): number {
    const weights = {
      linguisticCreativity: 0.25,
      emotionalResonance: 0.20,
      marketPsychology: 0.20,
      visualStorytelling: 0.20,
      persuasionArchitecture: 0.15
    };

    return Object.entries(parameters).reduce((score, [key, value]) => {
      return score + (value * weights[key as keyof typeof weights]);
    }, 0);
  }

  generateBalancedParameters(industryType: string): CreativityParameters {
    const industryPresets: Record<string, CreativityParameters> = {
      tech: {
        linguisticCreativity: 75,
        emotionalResonance: 60,
        marketPsychology: 80,
        visualStorytelling: 70,
        persuasionArchitecture: 85
      },
      healthcare: {
        linguisticCreativity: 55,
        emotionalResonance: 85,
        marketPsychology: 75,
        visualStorytelling: 60,
        persuasionArchitecture: 80
      },
      finance: {
        linguisticCreativity: 60,
        emotionalResonance: 70,
        marketPsychology: 90,
        visualStorytelling: 55,
        persuasionArchitecture: 85
      },
      ecommerce: {
        linguisticCreativity: 80,
        emotionalResonance: 75,
        marketPsychology: 85,
        visualStorytelling: 85,
        persuasionArchitecture: 90
      },
      default: {
        linguisticCreativity: 70,
        emotionalResonance: 70,
        marketPsychology: 75,
        visualStorytelling: 70,
        persuasionArchitecture: 80
      }
    };

    return industryPresets[industryType.toLowerCase()] || industryPresets.default;
  }
}

export default CreativeIntelligenceEngine;