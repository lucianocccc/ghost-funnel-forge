import { supabase } from '@/integrations/supabase/client';

export interface CustomerProfileData {
  businessInfo?: {
    name: string;
    industry: string;
    targetAudience: string;
    keyBenefits: string[];
  };
  psychographics?: {
    painPoints: string[];
    motivations: string[];
    preferredTone: string;
    communicationStyle: string;
  };
  behavioralData?: {
    engagementLevel: number;
    conversionIntent: number;
    informationGatheringStyle: string;
  };
  conversionStrategy?: {
    primaryGoal: string;
    secondaryGoals: string[];
    keyMessages: string[];
  };
}

export interface PersonalizedFunnelRequest {
  prompt: string;
  userId: string;
  customerProfile: CustomerProfileData;
  saveToLibrary?: boolean;
  funnelTypeId?: string;
}

export interface PersonalizedFunnelResponse {
  success: boolean;
  funnel?: any;
  error?: string;
}

export class RevolutionFunnelIntegrator {
  private static instance: RevolutionFunnelIntegrator;

  static getInstance(): RevolutionFunnelIntegrator {
    if (!RevolutionFunnelIntegrator.instance) {
      RevolutionFunnelIntegrator.instance = new RevolutionFunnelIntegrator();
    }
    return RevolutionFunnelIntegrator.instance;
  }

  /**
   * Estrae il profilo cliente dai dati raccolti dal Revolution Engine
   */
  extractCustomerProfile(customerData: any, questionResponses: Record<string, string>): CustomerProfileData {
    const profile: CustomerProfileData = {};

    // Estrai business info
    if (customerData) {
      profile.businessInfo = {
        name: customerData.businessName || customerData.companyName || 'Cliente',
        industry: customerData.industry || this.inferIndustryFromResponses(questionResponses),
        targetAudience: customerData.targetMarket || this.inferTargetFromResponses(questionResponses),
        keyBenefits: this.extractBenefitsFromResponses(questionResponses)
      };
    }

    // Estrai psicografia dalle risposte
    profile.psychographics = {
      painPoints: this.extractPainPointsFromResponses(questionResponses),
      motivations: this.extractMotivationsFromResponses(questionResponses),
      preferredTone: this.inferToneFromResponses(questionResponses),
      communicationStyle: this.inferCommunicationStyleFromResponses(questionResponses)
    };

    // Calcola dati comportamentali
    profile.behavioralData = {
      engagementLevel: this.calculateEngagementLevel(questionResponses),
      conversionIntent: this.calculateConversionIntent(questionResponses),
      informationGatheringStyle: this.inferInformationGatheringStyle(questionResponses)
    };

    // Definisci strategia di conversione
    profile.conversionStrategy = {
      primaryGoal: this.identifyPrimaryGoal(questionResponses),
      secondaryGoals: this.identifySecondaryGoals(questionResponses),
      keyMessages: this.generateKeyMessages(questionResponses)
    };

    return profile;
  }

  /**
   * Genera un funnel personalizzato utilizzando i dati del Revolution Engine
   */
  async generatePersonalizedFunnel(request: PersonalizedFunnelRequest): Promise<PersonalizedFunnelResponse> {
    try {
      console.log('🔄 Generating personalized funnel with Revolution data...');

      const { data, error } = await supabase.functions.invoke('generate-interactive-funnel-ai', {
        body: {
          prompt: request.prompt,
          userId: request.userId,
          customerProfile: request.customerProfile,
          saveToLibrary: request.saveToLibrary,
          funnelTypeId: request.funnelTypeId
        }
      });

      if (error) {
        console.error('❌ Error generating personalized funnel:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ Personalized funnel generated successfully');
      return { success: true, funnel: data.funnel };

    } catch (error) {
      console.error('❌ Revolution funnel integration error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Errore nella generazione del funnel personalizzato' 
      };
    }
  }

  /**
   * Aggiorna il form builder con dati personalizzati
   */
  generatePersonalizedFormConfig(customerProfile: CustomerProfileData, stepType: string) {
    const config = {
      fields: [] as any[],
      validation: {} as any,
      flow: {} as any,
      personalization: customerProfile
    };

    // Personalizza campi basati sui pain points
    if (customerProfile.psychographics?.painPoints) {
      customerProfile.psychographics.painPoints.forEach((painPoint, index) => {
        if (stepType === 'qualification') {
          config.fields.push({
            type: 'radio',
            name: `pain_point_${index}`,
            label: `Quanto è rilevante per te: "${painPoint}"?`,
            options: ['Per niente', 'Poco', 'Abbastanza', 'Molto', 'Estremamente'],
            required: true
          });
        }
      });
    }

    // Personalizza basato sul settore
    if (customerProfile.businessInfo?.industry && stepType === 'discovery') {
      const industrySpecificFields = this.getIndustrySpecificFields(customerProfile.businessInfo.industry);
      config.fields.push(...industrySpecificFields);
    }

    // Adatta il tono
    if (customerProfile.psychographics?.preferredTone) {
      config.validation.tone = customerProfile.psychographics.preferredTone;
    }

    return config;
  }

  // Metodi privati per l'estrazione dati
  private inferIndustryFromResponses(responses: Record<string, string>): string {
    const industryKeywords = {
      'tecnologia': ['software', 'app', 'digitale', 'tech', 'sviluppo'],
      'salute': ['medico', 'sanitario', 'benessere', 'fitness', 'salute'],
      'educazione': ['formazione', 'corso', 'insegnamento', 'scuola', 'università'],
      'e-commerce': ['vendita', 'prodotti', 'negozio', 'shop', 'commercio'],
      'servizi': ['consulenza', 'servizio', 'assistenza', 'supporto']
    };

    const allResponses = Object.values(responses).join(' ').toLowerCase();
    
    for (const [industry, keywords] of Object.entries(industryKeywords)) {
      if (keywords.some(keyword => allResponses.includes(keyword))) {
        return industry;
      }
    }
    
    return 'generale';
  }

  private inferTargetFromResponses(responses: Record<string, string>): string {
    const responseText = Object.values(responses).join(' ').toLowerCase();
    
    if (responseText.includes('b2b') || responseText.includes('aziende') || responseText.includes('imprese')) {
      return 'Aziende B2B';
    }
    if (responseText.includes('consumatori') || responseText.includes('privati') || responseText.includes('b2c')) {
      return 'Consumatori B2C';
    }
    
    return 'Professionisti e Aziende';
  }

  private extractBenefitsFromResponses(responses: Record<string, string>): string[] {
    const benefits: string[] = [];
    const responseText = Object.values(responses).join(' ').toLowerCase();
    
    const benefitKeywords = [
      'risparmio tempo', 'efficienza', 'produttività', 'qualità', 
      'convenienza', 'innovazione', 'personalizzazione', 'automazione'
    ];
    
    benefitKeywords.forEach(benefit => {
      if (responseText.includes(benefit)) {
        benefits.push(benefit);
      }
    });
    
    return benefits.length > 0 ? benefits : ['Soluzioni innovative', 'Qualità superiore'];
  }

  private extractPainPointsFromResponses(responses: Record<string, string>): string[] {
    const painPoints: string[] = [];
    const responseText = Object.values(responses).join(' ').toLowerCase();
    
    const painKeywords = [
      'difficoltà', 'problema', 'sfida', 'ostacolo', 'frustrazione',
      'perdita tempo', 'costi elevati', 'inefficienza', 'complessità'
    ];
    
    painKeywords.forEach(pain => {
      if (responseText.includes(pain)) {
        painPoints.push(pain);
      }
    });
    
    return painPoints.length > 0 ? painPoints : ['Inefficienze operative', 'Costi eccessivi'];
  }

  private extractMotivationsFromResponses(responses: Record<string, string>): string[] {
    const motivations: string[] = [];
    const responseText = Object.values(responses).join(' ').toLowerCase();
    
    const motivationKeywords = [
      'crescita', 'miglioramento', 'successo', 'obiettivo', 'risultato',
      'innovazione', 'competitività', 'espansione', 'ottimizzazione'
    ];
    
    motivationKeywords.forEach(motivation => {
      if (responseText.includes(motivation)) {
        motivations.push(motivation);
      }
    });
    
    return motivations.length > 0 ? motivations : ['Crescita del business', 'Miglioramento dei risultati'];
  }

  private inferToneFromResponses(responses: Record<string, string>): string {
    const responseText = Object.values(responses).join(' ').toLowerCase();
    
    if (responseText.includes('professionale') || responseText.includes('formale')) {
      return 'professionale';
    }
    if (responseText.includes('amichevole') || responseText.includes('informale')) {
      return 'amichevole';
    }
    
    return 'professionale ma accessibile';
  }

  private inferCommunicationStyleFromResponses(responses: Record<string, string>): string {
    const responseText = Object.values(responses).join(' ');
    
    if (responseText.length > 500) {
      return 'dettagliato';
    }
    if (responseText.length < 100) {
      return 'conciso';
    }
    
    return 'bilanciato';
  }

  private calculateEngagementLevel(responses: Record<string, string>): number {
    const responseCount = Object.keys(responses).length;
    const avgResponseLength = Object.values(responses).reduce((sum, response) => sum + response.length, 0) / responseCount;
    
    let score = 5;
    if (responseCount > 5) score += 2;
    if (avgResponseLength > 50) score += 2;
    if (avgResponseLength > 100) score += 1;
    
    return Math.min(10, score);
  }

  private calculateConversionIntent(responses: Record<string, string>): number {
    const responseText = Object.values(responses).join(' ').toLowerCase();
    const intentKeywords = ['interessato', 'acquistare', 'investire', 'implementare', 'urgente', 'subito'];
    
    let score = 5;
    intentKeywords.forEach(keyword => {
      if (responseText.includes(keyword)) score += 1;
    });
    
    return Math.min(10, score);
  }

  private inferInformationGatheringStyle(responses: Record<string, string>): string {
    const responseText = Object.values(responses).join(' ');
    const avgLength = responseText.length / Object.keys(responses).length;
    
    if (avgLength > 100) return 'approfondito';
    if (avgLength < 30) return 'rapido';
    return 'standard';
  }

  private identifyPrimaryGoal(responses: Record<string, string>): string {
    const responseText = Object.values(responses).join(' ').toLowerCase();
    
    if (responseText.includes('vendita') || responseText.includes('vendere')) {
      return 'Aumentare le vendite';
    }
    if (responseText.includes('lead') || responseText.includes('contatti')) {
      return 'Generare più lead';
    }
    if (responseText.includes('brand') || responseText.includes('visibilità')) {
      return 'Aumentare la brand awareness';
    }
    
    return 'Migliorare i risultati di business';
  }

  private identifySecondaryGoals(responses: Record<string, string>): string[] {
    return ['Ottimizzare il processo di vendita', 'Migliorare la customer experience'];
  }

  private generateKeyMessages(responses: Record<string, string>): string[] {
    const responseText = Object.values(responses).join(' ').toLowerCase();
    const messages: string[] = [];
    
    if (responseText.includes('qualità')) {
      messages.push('Soluzioni di alta qualità');
    }
    if (responseText.includes('veloce') || responseText.includes('rapido')) {
      messages.push('Risultati rapidi e misurabili');
    }
    if (responseText.includes('personalizzato')) {
      messages.push('Approccio personalizzato');
    }
    
    return messages.length > 0 ? messages : ['Soluzioni innovative', 'Risultati garantiti'];
  }

  private getIndustrySpecificFields(industry: string): any[] {
    const industryFields: Record<string, any[]> = {
      'tecnologia': [
        {
          type: 'select',
          name: 'tech_stack',
          label: 'Qual è il tuo stack tecnologico principale?',
          options: ['Frontend', 'Backend', 'Full Stack', 'Mobile', 'DevOps']
        }
      ],
      'salute': [
        {
          type: 'select',
          name: 'health_sector',
          label: 'In quale area della salute operi?',
          options: ['Clinica', 'Farmaceutico', 'Dispositivi medici', 'Telemedicina', 'Wellness']
        }
      ],
      'e-commerce': [
        {
          type: 'select',
          name: 'ecommerce_platform',
          label: 'Quale piattaforma e-commerce utilizzi?',
          options: ['Shopify', 'WooCommerce', 'Magento', 'Custom', 'Amazon']
        }
      ]
    };

    return industryFields[industry] || [];
  }
}

export const revolutionFunnelIntegrator = RevolutionFunnelIntegrator.getInstance();