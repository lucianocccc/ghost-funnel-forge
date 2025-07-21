
import type { ProductIntelligenceAnalysis } from './productIntelligenceService';
import type { WebResearchAnalysis } from './webResearchService';

export interface PersonalizationContext {
  productAnalysis: ProductIntelligenceAnalysis;
  webResearch: WebResearchAnalysis;
  userPrompt: string;
  targetAudience: string;
  industry: string;
  personalizationLevel: 'basic' | 'advanced' | 'maximum';
}

export interface PersonalizedExperience {
  name: string;
  description: string;
  steps: Array<{
    stepOrder: number;
    stepType: string;
    title: string;
    description: string;
    fieldsConfig: any[];
    settings: Record<string, any>;
  }>;
  theme: {
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
    style: string;
  };
  narrative: {
    heroTitle: string;
    heroSubtitle: string;
    valueProposition: string;
    socialProof: string[];
    urgencyMessages: string[];
  };
  conversionOptimization: {
    ctaStrategy: string;
    persuasionTechniques: string[];
    trustSignals: string[];
    riskReduction: string[];
  };
  settings: Record<string, any>;
  personalizationScore: number;
  uniquenessScore: number;
}

export class AdvancedPersonalizationService {
  private static instance: AdvancedPersonalizationService;

  public static getInstance(): AdvancedPersonalizationService {
    if (!AdvancedPersonalizationService.instance) {
      AdvancedPersonalizationService.instance = new AdvancedPersonalizationService();
    }
    return AdvancedPersonalizationService.instance;
  }

  async createPersonalizedExperience(context: PersonalizationContext): Promise<PersonalizedExperience> {
    console.log('🎨 Creating personalized experience...');
    
    try {
      const experience = await this.generatePersonalizedFunnel(context);
      console.log('✅ Personalized experience created successfully');
      return experience;
    } catch (error) {
      console.error('💥 Personalization error:', error);
      return this.createFallbackExperience(context);
    }
  }

  private async generatePersonalizedFunnel(context: PersonalizationContext): Promise<PersonalizedExperience> {
    const { productAnalysis, webResearch, userPrompt, targetAudience, industry } = context;
    
    // Generate personalized steps based on analysis
    const steps = this.generatePersonalizedSteps(productAnalysis, webResearch, userPrompt);
    
    // Create personalized theme
    const theme = this.generatePersonalizedTheme(industry, productAnalysis);
    
    // Generate compelling narrative
    const narrative = this.generatePersonalizedNarrative(productAnalysis, targetAudience);
    
    // Create conversion optimization strategy
    const conversionOptimization = this.generateConversionStrategy(productAnalysis, webResearch);
    
    return {
      name: `${productAnalysis.productSummary.name} - Esperienza Personalizzata`,
      description: `Funnel personalizzato per ${targetAudience} interessati a ${productAnalysis.productSummary.name}`,
      steps,
      theme,
      narrative,
      conversionOptimization,
      settings: {
        personalizationLevel: context.personalizationLevel,
        targetAudience,
        industry,
        generatedAt: new Date().toISOString(),
        aiEnhanced: true
      },
      personalizationScore: this.calculatePersonalizationScore(context),
      uniquenessScore: this.calculateUniquenessScore(productAnalysis, webResearch)
    };
  }

  private generatePersonalizedSteps(
    productAnalysis: ProductIntelligenceAnalysis,
    webResearch: WebResearchAnalysis,
    userPrompt: string
  ) {
    const steps = [];
    
    // Step 1: Personalized lead capture
    steps.push({
      stepOrder: 1,
      stepType: 'lead_capture',
      title: `Scopri ${productAnalysis.productSummary.name}`,
      description: 'Inizia il tuo percorso personalizzato',
      fieldsConfig: [
        {
          id: 'name',
          type: 'text',
          label: 'Come ti chiami?',
          required: true,
          placeholder: 'Il tuo nome'
        },
        {
          id: 'email',
          type: 'email',
          label: 'La tua email',
          required: true,
          placeholder: 'nome@esempio.com'
        }
      ],
      settings: {
        submitButtonText: 'Inizia ora',
        heroMessage: productAnalysis.strategicRecommendations.positioningStatement
      }
    });
    
    // Step 2: Intelligent qualification
    steps.push({
      stepOrder: 2,
      stepType: 'qualification',
      title: 'Personalizza la tua esperienza',
      description: 'Aiutaci a capire le tue esigenze specifiche',
      fieldsConfig: [
        {
          id: 'primary_need',
          type: 'radio',
          label: 'Qual è la tua priorità principale?',
          required: true,
          options: productAnalysis.targetAudienceInsights.painPoints.slice(0, 4)
        },
        {
          id: 'experience_level',
          type: 'select',
          label: 'Il tuo livello di esperienza',
          required: true,
          options: ['Principiante', 'Intermedio', 'Esperto', 'Professional']
        }
      ],
      settings: {
        submitButtonText: 'Continua',
        adaptiveLogic: true
      }
    });
    
    // Step 3: Value discovery
    steps.push({
      stepOrder: 3,
      stepType: 'discovery',
      title: 'Scopri i vantaggi personalizzati',
      description: `Vedi come ${productAnalysis.productSummary.name} può aiutarti`,
      fieldsConfig: [
        {
          id: 'interests',
          type: 'checkbox',
          label: 'Cosa ti interessa di più?',
          required: false,
          options: productAnalysis.productSummary.keyFeatures
        }
      ],
      settings: {
        submitButtonText: 'Voglio saperne di più',
        showBenefits: true,
        socialProof: webResearch.consumerBehavior.motivations
      }
    });
    
    // Step 4: Conversion-optimized contact
    steps.push({
      stepOrder: 4,
      stepType: 'conversion',
      title: 'Ottieni la tua soluzione personalizzata',
      description: 'Parlaci delle tue esigenze specifiche',
      fieldsConfig: [
        {
          id: 'phone',
          type: 'tel',
          label: 'Telefono (opzionale)',
          required: false,
          placeholder: '+39 123 456 7890'
        },
        {
          id: 'specific_needs',
          type: 'textarea',
          label: 'Raccontaci di più delle tue esigenze',
          required: true,
          placeholder: 'Descrivi la tua situazione e cosa stai cercando...'
        },
        {
          id: 'timeline',
          type: 'select',
          label: 'Quando vorresti iniziare?',
          required: true,
          options: ['Subito', 'Entro 1 mese', 'Entro 3 mesi', 'Sto solo esplorando']
        }
      ],
      settings: {
        submitButtonText: 'Ricevi la tua proposta personalizzata',
        urgencyMessage: 'Offerta limitata nel tempo',
        trustSignals: ['Consulenza gratuita', 'Senza impegno', 'Risposta in 24h']
      }
    });
    
    return steps;
  }

  private generatePersonalizedTheme(industry: string, productAnalysis: ProductIntelligenceAnalysis) {
    const industryThemes: Record<string, any> = {
      'technology': {
        primaryColor: '#3B82F6',
        secondaryColor: '#1E40AF',
        fontFamily: 'Inter',
        style: 'modern'
      },
      'healthcare': {
        primaryColor: '#059669',
        secondaryColor: '#047857',
        fontFamily: 'Inter',
        style: 'trustworthy'
      },
      'finance': {
        primaryColor: '#1F2937',
        secondaryColor: '#374151',
        fontFamily: 'Inter',
        style: 'professional'
      },
      'education': {
        primaryColor: '#7C3AED',
        secondaryColor: '#5B21B6',
        fontFamily: 'Inter',
        style: 'inspiring'
      },
      'default': {
        primaryColor: '#F59E0B',
        secondaryColor: '#D97706',
        fontFamily: 'Inter',
        style: 'warm'
      }
    };
    
    return industryThemes[industry.toLowerCase()] || industryThemes['default'];
  }

  private generatePersonalizedNarrative(
    productAnalysis: ProductIntelligenceAnalysis,
    targetAudience: string
  ) {
    return {
      heroTitle: `Trasforma il modo in cui ${targetAudience.toLowerCase()} utilizzano ${productAnalysis.productSummary.name}`,
      heroSubtitle: productAnalysis.productSummary.uniqueValueProposition,
      valueProposition: productAnalysis.strategicRecommendations.positioningStatement,
      socialProof: [
        'Migliaia di clienti soddisfatti',
        'Risultati garantiti',
        'Supporto dedicato 24/7'
      ],
      urgencyMessages: [
        'Offerta limitata nel tempo',
        'Solo per i primi 100 clienti',
        'Inizia oggi e risparmia il 30%'
      ]
    };
  }

  private generateConversionStrategy(
    productAnalysis: ProductIntelligenceAnalysis,
    webResearch: WebResearchAnalysis
  ) {
    return {
      ctaStrategy: 'Progressive commitment with value-first approach',
      persuasionTechniques: [
        'Social proof',
        'Scarcity',
        'Authority',
        'Reciprocity'
      ],
      trustSignals: [
        'Certificazioni di qualità',
        'Testimonianze verificate',
        'Garanzia soddisfatti o rimborsati',
        'Sicurezza dati garantita'
      ],
      riskReduction: [
        'Prova gratuita',
        'Consulenza iniziale gratuita',
        'Garanzia 30 giorni',
        'Supporto incluso'
      ]
    };
  }

  private calculatePersonalizationScore(context: PersonalizationContext): number {
    let score = 0.5; // Base score
    
    // Increase based on personalization level
    switch (context.personalizationLevel) {
      case 'maximum': score += 0.3; break;
      case 'advanced': score += 0.2; break;
      case 'basic': score += 0.1; break;
    }
    
    // Increase based on data quality
    if (context.productAnalysis.confidenceScore > 0.8) score += 0.1;
    if (context.webResearch.confidenceScore > 0.8) score += 0.1;
    
    return Math.min(score, 1.0);
  }

  private calculateUniquenessScore(
    productAnalysis: ProductIntelligenceAnalysis,
    webResearch: WebResearchAnalysis
  ): number {
    let score = 0.6; // Base uniqueness
    
    // Higher uniqueness if we have specific market gaps
    if (webResearch.competitorInsights.marketGaps.length > 3) {
      score += 0.2;
    }
    
    // Higher uniqueness based on competitive advantages
    if (productAnalysis.competitorAnalysis.competitiveAdvantages.length > 2) {
      score += 0.2;
    }
    
    return Math.min(score, 1.0);
  }

  private createFallbackExperience(context: PersonalizationContext): PersonalizedExperience {
    console.log('🔄 Creating fallback personalized experience...');
    
    return {
      name: `Esperienza Personalizzata - ${context.userPrompt.substring(0, 30)}`,
      description: `Funnel personalizzato basato su: ${context.userPrompt}`,
      steps: [
        {
          stepOrder: 1,
          stepType: 'lead_capture',
          title: 'Iniziamo insieme',
          description: 'Condividi le tue informazioni per iniziare',
          fieldsConfig: [
            {
              id: 'name',
              type: 'text',
              label: 'Nome',
              required: true,
              placeholder: 'Il tuo nome'
            },
            {
              id: 'email',
              type: 'email',
              label: 'Email',
              required: true,
              placeholder: 'La tua email'
            }
          ],
          settings: { submitButtonText: 'Continua' }
        },
        {
          stepOrder: 2,
          stepType: 'qualification',
          title: 'Le tue esigenze',
          description: 'Aiutaci a capire cosa cerchi',
          fieldsConfig: [
            {
              id: 'needs',
              type: 'checkbox',
              label: 'Cosa ti interessa?',
              required: true,
              options: ['Qualità', 'Prezzo', 'Velocità', 'Supporto']
            }
          ],
          settings: { submitButtonText: 'Avanti' }
        },
        {
          stepOrder: 3,
          stepType: 'conversion',
          title: 'Contattaci',
          description: 'Ricevi una proposta personalizzata',
          fieldsConfig: [
            {
              id: 'message',
              type: 'textarea',
              label: 'Messaggio',
              required: true,
              placeholder: 'Raccontaci di più...'
            }
          ],
          settings: { submitButtonText: 'Invia richiesta' }
        }
      ],
      theme: {
        primaryColor: '#F59E0B',
        secondaryColor: '#D97706',
        fontFamily: 'Inter',
        style: 'modern'
      },
      narrative: {
        heroTitle: 'La soluzione che stavi cercando',
        heroSubtitle: 'Personalizzata per le tue esigenze',
        valueProposition: 'Risultati garantiti con il nostro approccio personalizzato',
        socialProof: ['Clienti soddisfatti', 'Risultati comprovati'],
        urgencyMessages: ['Inizia oggi']
      },
      conversionOptimization: {
        ctaStrategy: 'Direct and clear',
        persuasionTechniques: ['Social proof', 'Trust'],
        trustSignals: ['Esperienza comprovata', 'Supporto dedicato'],
        riskReduction: ['Consulenza gratuita']
      },
      settings: {
        personalizationLevel: context.personalizationLevel,
        fallback: true
      },
      personalizationScore: 0.6,
      uniquenessScore: 0.5
    };
  }
}
