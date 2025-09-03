import { apiClient } from './apiClient';

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
      const data: any = await apiClient.generateCreative({
        context,
        parameters,
        contentType
      });

      return data.content || {
        headlines: [],
        descriptions: [],
        ctaTexts: [],
        narrativeElements: [],
        visualPrompts: [],
        emotionalHooks: [],
        persuasionFrameworks: []
      };
    } catch (error) {
      console.error('Error generating creative content:', error);
      throw error;
    }
  }

  async analyzeContentQuality(content: CreativeContent, context: CreativeContext): Promise<QualityMetrics> {
    try {
      // Mock implementation during migration - replace with actual API call later
      return {
        coherenceScore: Math.random() * 40 + 60, // 60-100
        persuasionScore: Math.random() * 30 + 70, // 70-100
        uniquenessScore: Math.random() * 20 + 80, // 80-100
        brandConsistency: Math.random() * 25 + 75, // 75-100
        emotionalImpact: Math.random() * 30 + 70, // 70-100
        overallQuality: Math.random() * 20 + 80, // 80-100
      };
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
      // Mock implementation during migration - return enhanced version of initial content
      return {
        ...initialContent,
        headlines: [...initialContent.headlines, 'Optimized Headline'],
        emotionalHooks: [...initialContent.emotionalHooks, 'Enhanced Emotional Appeal'],
        persuasionFrameworks: [...initialContent.persuasionFrameworks, 'AIDA Framework']
      };
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
      // Mock implementation during migration
      const stylePrompts = {
        cinematic: ['Wide angle shot', 'Dramatic lighting', 'Professional setting'],
        minimalist: ['Clean background', 'Simple composition', 'Bold typography'],
        dynamic: ['Action shots', 'Movement blur', 'Vibrant colors'],
        emotional: ['Close-up portraits', 'Warm lighting', 'Authentic expressions']
      };
      
      return stylePrompts[style] || stylePrompts.dynamic;
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