
// Adaptive Step Generator - Genera step dinamici basati su prodotto e utente

export interface UserBehaviorProfile {
  engagementLevel: 'low' | 'medium' | 'high';
  conversionIntent: number; // 0-1
  interactionPattern: 'explorer' | 'decisive' | 'analytical' | 'impulsive';
  deviceType: 'mobile' | 'tablet' | 'desktop';
  timeOnPage: number;
  previousInteractions: string[];
}

export interface ProductContext {
  name: string;
  description?: string;
  industry?: string;
  targetAudience?: string;
  pricePoint?: 'budget' | 'mid' | 'premium';
  complexity?: 'simple' | 'moderate' | 'complex';
  keyBenefits: string[];
  uniqueSellingPoints: string[];
}

export interface DynamicStep {
  id: string;
  type: 'hook' | 'interest' | 'problem' | 'solution' | 'social_proof' | 'urgency' | 'capture' | 'qualify';
  title: string;
  content: any;
  adaptiveLogic: {
    triggerConditions: string[];
    personalizedContent: Record<string, any>;
    nextStepLogic: (userResponse: any) => string;
  };
  estimatedDuration: number;
  conversionProbability: number;
}

export class AdaptiveStepGenerator {
  
  static generateUserProfile(interactions: any[]): UserBehaviorProfile {
    // Analizza i comportamenti dell'utente per creare un profilo
    const totalTime = interactions.reduce((sum, i) => sum + (i.timeOnStep || 0), 0);
    const interactionCount = interactions.length;
    
    let engagementLevel: 'low' | 'medium' | 'high' = 'medium';
    if (totalTime > 180 || interactionCount > 5) engagementLevel = 'high';
    else if (totalTime < 30 || interactionCount < 2) engagementLevel = 'low';
    
    const conversionIntent = Math.min(1, (totalTime / 300) + (interactionCount * 0.1));
    
    let interactionPattern: 'explorer' | 'decisive' | 'analytical' | 'impulsive' = 'explorer';
    if (totalTime < 60 && interactionCount > 3) interactionPattern = 'impulsive';
    else if (totalTime > 300) interactionPattern = 'analytical';
    else if (interactionCount < 3 && totalTime > 120) interactionPattern = 'decisive';
    
    return {
      engagementLevel,
      conversionIntent,
      interactionPattern,
      deviceType: window.innerWidth <= 768 ? 'mobile' : window.innerWidth <= 1024 ? 'tablet' : 'desktop',
      timeOnPage: totalTime,
      previousInteractions: interactions.map(i => i.type || 'unknown')
    };
  }

  static generateAdaptiveSteps(
    productContext: ProductContext, 
    userProfile: UserBehaviorProfile
  ): DynamicStep[] {
    const steps: DynamicStep[] = [];
    
    // Step 1: Hook dinamico basato su engagement
    steps.push(this.generateHookStep(productContext, userProfile));
    
    // Step 2-N: Generazione condizionale basata su profilo utente
    if (userProfile.conversionIntent < 0.3) {
      // Utente freddo - focus su educazione e valore
      steps.push(this.generateProblemAwarenessStep(productContext, userProfile));
      steps.push(this.generateSolutionEducationStep(productContext, userProfile));
      steps.push(this.generateSocialProofStep(productContext, userProfile));
    } else if (userProfile.conversionIntent > 0.7) {
      // Utente caldo - path accelerato
      steps.push(this.generateDirectValueStep(productContext, userProfile));
      steps.push(this.generateUrgencyStep(productContext, userProfile));
    } else {
      // Utente medio - path bilanciato
      steps.push(this.generateInterestQualificationStep(productContext, userProfile));
      steps.push(this.generateBenefitsStep(productContext, userProfile));
      steps.push(this.generateTrustBuildingStep(productContext, userProfile));
    }
    
    // Step finale: sempre capture, ma personalizzato
    steps.push(this.generateCaptureStep(productContext, userProfile));
    
    return steps;
  }

  private static generateHookStep(product: ProductContext, user: UserBehaviorProfile): DynamicStep {
    const hooks = {
      high: `🚀 ${product.name} sta rivoluzionando ${product.industry}`,
      medium: `Scopri come ${product.name} può trasformare il tuo business`,
      low: `Hai mai pensato a quanto tempo potresti risparmiare?`
    };

    return {
      id: 'hook-' + Date.now(),
      type: 'hook',
      title: hooks[user.engagementLevel],
      content: {
        headline: hooks[user.engagementLevel],
        subheadline: this.getPersonalizedSubheadline(product, user),
        visual: this.getAdaptiveVisual(product, user),
        cta: user.interactionPattern === 'impulsive' ? 'Scopri Subito' : 'Dimmi di Più'
      },
      adaptiveLogic: {
        triggerConditions: ['page_load'],
        personalizedContent: {
          mobile: { shortened: true, largerText: true },
          desktop: { fullContent: true, animations: true }
        },
        nextStepLogic: (response) => user.conversionIntent > 0.7 ? 'direct-value' : 'interest-qualification'
      },
      estimatedDuration: user.deviceType === 'mobile' ? 15 : 30,
      conversionProbability: 0.8
    };
  }

  private static generateInterestQualificationStep(product: ProductContext, user: UserBehaviorProfile): DynamicStep {
    const questions = this.generatePersonalizedQuestions(product, user);
    
    return {
      id: 'qualify-' + Date.now(),
      type: 'qualify',
      title: 'Dimmi di più sui tuoi obiettivi',
      content: {
        headline: 'Personalizziamo la tua esperienza',
        questions,
        interactiveElements: user.deviceType === 'mobile' ? 'cards' : 'sliders'
      },
      adaptiveLogic: {
        triggerConditions: ['user_engaged'],
        personalizedContent: {
          analytical: { detailedOptions: true, explanations: true },
          impulsive: { quickOptions: true, visualFeedback: true }
        },
        nextStepLogic: (response) => {
          if (response.urgency === 'immediate') return 'urgency';
          if (response.budget === 'high') return 'premium-benefits';
          return 'standard-benefits';
        }
      },
      estimatedDuration: user.interactionPattern === 'analytical' ? 90 : 45,
      conversionProbability: 0.6
    };
  }

  private static generateBenefitsStep(product: ProductContext, user: UserBehaviorProfile): DynamicStep {
    const prioritizedBenefits = this.prioritizeBenefits(product.keyBenefits, user);
    
    return {
      id: 'benefits-' + Date.now(),
      type: 'solution',
      title: 'Ecco come ti aiutiamo',
      content: {
        headline: `${product.name} risolve esattamente i tuoi problemi`,
        benefits: prioritizedBenefits,
        presentation: user.interactionPattern === 'analytical' ? 'detailed' : 'visual',
        proof: this.generateProofPoints(product, user)
      },
      adaptiveLogic: {
        triggerConditions: ['qualification_complete'],
        personalizedContent: {
          explorer: { interactiveDemo: true },
          decisive: { clearMetrics: true, testimonials: true }
        },
        nextStepLogic: (response) => response.needsMoreInfo ? 'social-proof' : 'capture'
      },
      estimatedDuration: 60,
      conversionProbability: 0.7
    };
  }

  private static generateCaptureStep(product: ProductContext, user: UserBehaviorProfile): DynamicStep {
    const incentives = {
      high: 'Consulenza gratuita di 30 minuti',
      medium: 'Analisi personalizzata gratuita',
      low: 'Guida gratuita + newsletter esclusiva'
    };

    return {
      id: 'capture-' + Date.now(),
      type: 'capture',
      title: 'Inizia la tua trasformazione',
      content: {
        headline: user.conversionIntent > 0.7 ? 'Prenota ora la tua consulenza' : 'Ricevi la tua analisi personalizzata',
        incentive: incentives[user.engagementLevel],
        form: this.generateAdaptiveForm(product, user),
        urgency: user.interactionPattern === 'impulsive' ? 'Solo per oggi' : null,
        trust: ['100% gratuito', 'No spam', 'Cancellazione facile']
      },
      adaptiveLogic: {
        triggerConditions: ['user_ready'],
        personalizedContent: {
          mobile: { minimumFields: true, largeButtons: true },
          desktop: { detailedForm: true, sideBenefits: true }
        },
        nextStepLogic: () => 'complete'
      },
      estimatedDuration: user.deviceType === 'mobile' ? 45 : 90,
      conversionProbability: 0.85
    };
  }

  // Metodi di supporto
  private static getPersonalizedSubheadline(product: ProductContext, user: UserBehaviorProfile): string {
    if (user.conversionIntent > 0.7) {
      return `La soluzione che stavi cercando per ${product.targetAudience}`;
    } else if (user.engagementLevel === 'low') {
      return 'Scopri in 2 minuti se può aiutarti';
    }
    return `Ottimizzato per ${product.targetAudience} come te`;
  }

  private static getAdaptiveVisual(product: ProductContext, user: UserBehaviorProfile): string {
    const visuals = {
      technology: user.deviceType === 'mobile' ? 'tech-mobile' : 'tech-desktop',
      healthcare: 'healthcare-clean',
      finance: 'finance-professional',
      default: 'gradient-dynamic'
    };
    return visuals[product.industry as keyof typeof visuals] || visuals.default;
  }

  private static generatePersonalizedQuestions(product: ProductContext, user: UserBehaviorProfile): any[] {
    const baseQuestions = [
      {
        id: 'primary_goal',
        text: `Qual è il tuo obiettivo principale con ${product.name}?`,
        type: user.deviceType === 'mobile' ? 'radio' : 'slider',
        options: product.keyBenefits.slice(0, 4)
      }
    ];

    if (user.interactionPattern === 'analytical') {
      baseQuestions.push({
        id: 'timeline',
        text: 'In quanto tempo vorresti vedere i risultati?',
        type: 'select',
        options: ['Immediatamente', 'Entro 1 mese', 'Entro 3 mesi', 'Sto valutando']
      });
    }

    if (product.pricePoint !== 'budget') {
      baseQuestions.push({
        id: 'investment',
        text: 'Che tipo di investimento stai considerando?',
        type: 'range',
        sensitive: true
      });
    }

    return baseQuestions;
  }

  private static prioritizeBenefits(benefits: string[], user: UserBehaviorProfile): string[] {
    // Riordina i benefici basandosi sul profilo utente
    if (user.interactionPattern === 'impulsive') {
      return benefits.filter(b => b.includes('veloce') || b.includes('immediato'));
    } else if (user.interactionPattern === 'analytical') {
      return benefits.filter(b => b.includes('dati') || b.includes('analisi'));
    }
    return benefits.slice(0, 3); // Top 3 per default
  }

  private static generateProofPoints(product: ProductContext, user: UserBehaviorProfile): any[] {
    const proofs = [];
    
    if (user.engagementLevel === 'high') {
      proofs.push({
        type: 'testimonial',
        content: `"${product.name} ha superato le mie aspettative"`,
        author: 'Cliente soddisfatto'
      });
    }
    
    if (user.interactionPattern === 'analytical') {
      proofs.push({
        type: 'statistic',
        content: '95% di soddisfazione clienti',
        source: 'Studio interno 2024'
      });
    }
    
    return proofs;
  }

  private static generateAdaptiveForm(product: ProductContext, user: UserBehaviorProfile): any {
    const baseFields = [
      { name: 'name', label: 'Nome', required: true },
      { name: 'email', label: 'Email', required: true }
    ];

    if (user.conversionIntent > 0.7) {
      baseFields.push({ name: 'phone', label: 'Telefono', required: true });
      baseFields.push({ name: 'company', label: 'Azienda', required: false });
    }

    if (user.interactionPattern === 'analytical' && user.deviceType !== 'mobile') {
      baseFields.push({
        name: 'specific_interest',
        label: `Cosa ti interessa di più di ${product.name}?`,
        type: 'textarea',
        required: false
      });
    }

    return {
      fields: baseFields,
      style: user.deviceType === 'mobile' ? 'stacked' : 'inline',
      submitText: user.conversionIntent > 0.7 ? 'Prenota Consulenza' : 'Ricevi Analisi Gratuita'
    };
  }
}
