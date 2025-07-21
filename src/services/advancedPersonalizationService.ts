
// Advanced Personalization Service - Personalizzazione avanzata basata su AI
import { supabase } from '@/integrations/supabase/client';
import { ProductContext, ProductIntelligenceAnalysis } from './productIntelligenceService';
import { WebResearchAnalysis } from './webResearchService';

interface PersonalizationContext {
  productContext: ProductContext;
  productIntelligence: ProductIntelligenceAnalysis;
  webResearch: WebResearchAnalysis[];
  userIntent: string;
  userProfile?: {
    industry?: string;
    role?: string;
    experience?: string;
    preferences?: string[];
    painPoints?: string[];
    goals?: string[];
  };
  conversationHistory?: any[];
  marketContext?: {
    season?: string;
    events?: string[];
    trends?: string[];
    economicFactors?: string[];
  };
}

interface PersonalizedExperience {
  name: string;
  description: string;
  theme: {
    primary: string;
    secondary: string;
    accent: string;
    style: 'modern' | 'classic' | 'minimalist' | 'bold' | 'elegant';
  };
  narrative: {
    storyline: string;
    emotionalJourney: string[];
    keyMessages: string[];
    callToActions: string[];
    personalTouches: string[];
  };
  structure: {
    totalSteps: number;
    stepTypes: string[];
    progressFlow: string;
    interactionStyle: string;
  };
  steps: PersonalizedStep[];
  settings: {
    adaptiveElements: boolean;
    dynamicContent: boolean;
    personalizedMessaging: boolean;
    contextualOffers: boolean;
    behavioralTriggers: boolean;
  };
  personalizationScore: number;
  uniquenessScore: number;
  conversionOptimization: {
    primaryGoal: string;
    secondaryGoals: string[];
    optimizationStrategies: string[];
    conversionTriggers: string[];
  };
}

interface PersonalizedStep {
  stepOrder: number;
  stepType: 'lead_capture' | 'qualification' | 'discovery' | 'conversion' | 'contact_form' | 'thank_you';
  title: string;
  description: string;
  personalizedContent: {
    headline: string;
    subheadline: string;
    body: string;
    benefits: string[];
    features: string[];
    socialProof: string[];
    objectionHandling: string[];
    urgencyFactors: string[];
  };
  fieldsConfig: any[];
  visualElements: {
    backgroundStyle: string;
    colorScheme: string;
    typography: string;
    animations: string[];
    mediaElements: string[];
  };
  behavioralTriggers: {
    entryTriggers: string[];
    engagementTriggers: string[];
    exitTriggers: string[];
    conversionTriggers: string[];
  };
  adaptiveRules: {
    conditions: string[];
    actions: string[];
    personalizations: string[];
  };
  settings: {
    timeOnStep?: number;
    allowBack?: boolean;
    showProgress?: boolean;
    submitButtonText?: string;
    placeholderTexts?: string[];
  };
}

export class AdvancedPersonalizationService {
  private static instance: AdvancedPersonalizationService;
  private cache: Map<string, PersonalizedExperience> = new Map();
  private readonly CACHE_DURATION = 15 * 60 * 1000; // 15 minuti

  static getInstance(): AdvancedPersonalizationService {
    if (!AdvancedPersonalizationService.instance) {
      AdvancedPersonalizationService.instance = new AdvancedPersonalizationService();
    }
    return AdvancedPersonalizationService.instance;
  }

  async createPersonalizedExperience(context: PersonalizationContext): Promise<PersonalizedExperience> {
    const cacheKey = this.generateCacheKey(context);
    
    // Controlla cache
    const cached = this.cache.get(cacheKey);
    if (cached && this.isCacheValid(cached)) {
      console.log('🎨 Returning cached personalized experience');
      return cached;
    }

    console.log('✨ Creating personalized experience...', {
      productName: context.productContext.name,
      userIntent: context.userIntent,
      hasIntelligence: !!context.productIntelligence,
      researchResults: context.webResearch.length
    });

    try {
      const { data, error } = await supabase.functions.invoke('advanced-personalization', {
        body: {
          context,
          personalizationLevel: 'maximum',
          includeNarrative: true,
          includeVisualElements: true,
          includeBehavioralTriggers: true,
          includeAdaptiveRules: true,
          optimizeForConversion: true
        }
      });

      if (error) {
        console.error('❌ Personalization error:', error);
        throw new Error(`Errore nella personalizzazione: ${error.message}`);
      }

      if (!data || !data.success) {
        throw new Error('Personalizzazione non riuscita');
      }

      const experience: PersonalizedExperience = data.experience;

      // Salva in cache
      this.cache.set(cacheKey, experience);
      
      console.log('🎯 Personalized experience created', {
        name: experience.name,
        steps: experience.steps.length,
        personalizationScore: experience.personalizationScore,
        uniquenessScore: experience.uniquenessScore,
        theme: experience.theme.style
      });

      return experience;

    } catch (error) {
      console.error('💥 Personalization failed:', error);
      throw error;
    }
  }

  async optimizeForConversion(experience: PersonalizedExperience, metrics?: any): Promise<PersonalizedExperience> {
    try {
      const { data, error } = await supabase.functions.invoke('conversion-optimization', {
        body: {
          experience,
          metrics,
          optimizationGoals: ['conversion_rate', 'engagement', 'completion_rate'],
          testVariants: true,
          includeABTesting: true
        }
      });

      if (error) throw error;
      return data.optimizedExperience;
    } catch (error) {
      console.error('❌ Conversion optimization error:', error);
      throw error;
    }
  }

  async adaptExperience(experience: PersonalizedExperience, userBehavior: any): Promise<PersonalizedExperience> {
    try {
      const { data, error } = await supabase.functions.invoke('adaptive-experience', {
        body: {
          experience,
          userBehavior,
          adaptationRules: 'smart',
          realTimeAdjustments: true,
          behavioralTriggers: true
        }
      });

      if (error) throw error;
      return data.adaptedExperience;
    } catch (error) {
      console.error('❌ Experience adaptation error:', error);
      throw error;
    }
  }

  private generateCacheKey(context: PersonalizationContext): string {
    const keyString = JSON.stringify({
      productName: context.productContext.name,
      userIntent: context.userIntent,
      industry: context.productContext.industry,
      category: context.productContext.category,
      userProfile: context.userProfile
    });
    return btoa(keyString).replace(/[^a-zA-Z0-9]/g, '');
  }

  private isCacheValid(experience: PersonalizedExperience): boolean {
    const now = new Date().getTime();
    const cacheTime = this.cache.get(this.generateCacheKey({} as any))?.personalizationScore || 0;
    return (now - cacheTime) < this.CACHE_DURATION;
  }

  clearCache(): void {
    this.cache.clear();
  }

  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

export { PersonalizationContext, PersonalizedExperience, PersonalizedStep };
