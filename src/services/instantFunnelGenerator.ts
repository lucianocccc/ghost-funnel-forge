import { supabase } from '@/integrations/supabase/client';
import { CustomerProfileData } from './revolutionFunnelIntegrator';

export interface InstantFunnelRequest {
  prompt: string;
  userId: string;
  includeCustomerPreview?: boolean;
  saveToLibrary?: boolean;
}

export interface InstantFunnelResponse {
  success: boolean;
  funnel?: any;
  customerProfile?: CustomerProfileData;
  error?: string;
  metadata?: {
    promptQuality: number;
    inferenceConfidence: number;
    generationTime: number;
  };
}

export class InstantFunnelGenerator {
  private static instance: InstantFunnelGenerator;

  public static getInstance(): InstantFunnelGenerator {
    if (!InstantFunnelGenerator.instance) {
      InstantFunnelGenerator.instance = new InstantFunnelGenerator();
    }
    return InstantFunnelGenerator.instance;
  }

  /**
   * Generate an instant funnel from a detailed prompt
   */
  public async generateInstantFunnel(request: InstantFunnelRequest): Promise<InstantFunnelResponse> {
    const startTime = Date.now();
    
    try {
      console.log('🚀 InstantFunnelGenerator: Starting prompt analysis...');
      
      // Step 1: Analyze and validate prompt quality
      const promptAnalysis = this.analyzePromptQuality(request.prompt);
      
      if (promptAnalysis.score < 3) {
        return {
          success: false,
          error: 'Il prompt fornito non contiene informazioni sufficienti per generare un funnel personalizzato. Includi dettagli su business, target e obiettivi.',
          metadata: {
            promptQuality: promptAnalysis.score,
            inferenceConfidence: 0,
            generationTime: Date.now() - startTime
          }
        };
      }

      // Step 2: Extract customer profile from prompt using intelligent inference
      console.log('🧠 Extracting customer profile from prompt...');
      const customerProfile = this.extractCustomerProfileFromPrompt(request.prompt);
      
      // Step 3: Call Revolution Funnel Engine with instant_funnel_generation action
      console.log('⚡ Calling Revolution Funnel Engine for instant generation...');
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('Autenticazione richiesta');
      }

      const { data, error } = await supabase.functions.invoke('revolution-funnel-engine', {
        body: {
          action: 'instant_funnel_generation',
          prompt: request.prompt,
          userId: request.userId,
          customerProfile: customerProfile,
          options: {
            includeCustomerPreview: request.includeCustomerPreview ?? true,
            saveToLibrary: request.saveToLibrary ?? true
          }
        },
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (error) {
        throw error;
      }

      const generationTime = Date.now() - startTime;
      
      console.log('✅ Instant funnel generated successfully in', generationTime, 'ms');

      return {
        success: true,
        funnel: data.funnel,
        customerProfile: data.customerProfile || customerProfile,
        metadata: {
          promptQuality: promptAnalysis.score,
          inferenceConfidence: data.inferenceConfidence || promptAnalysis.inferenceConfidence,
          generationTime
        }
      };

    } catch (error) {
      console.error('❌ InstantFunnelGenerator error:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Errore sconosciuto nella generazione istantanea';
      
      return {
        success: false,
        error: errorMessage,
        metadata: {
          promptQuality: 0,
          inferenceConfidence: 0,
          generationTime: Date.now() - startTime
        }
      };
    }
  }

  /**
   * Analyze prompt quality and completeness
   */
  private analyzePromptQuality(prompt: string): { score: number; inferenceConfidence: number; issues: string[] } {
    const issues: string[] = [];
    let score = 0;
    
    // Length check
    if (prompt.length >= 100) {
      score += 1;
    } else {
      issues.push('Prompt troppo breve');
    }
    
    // Business information
    const hasBusinessInfo = /business|azienda|startup|brand|servizio|prodotto|app|software|sito|negozio|corso|consulenza/i.test(prompt);
    if (hasBusinessInfo) {
      score += 1;
    } else {
      issues.push('Mancano informazioni sul business');
    }
    
    // Target audience
    const hasTarget = /target|clienti|audience|utenti|persone|mercato|segmento|demografico|età|sesso|professione/i.test(prompt);
    if (hasTarget) {
      score += 1;
    } else {
      issues.push('Target audience non definito');
    }
    
    // Goals/objectives
    const hasGoals = /obiettivo|goal|vendite|conversioni|lead|iscrizioni|download|acquisti|fatturato|crescita/i.test(prompt);
    if (hasGoals) {
      score += 1;
    } else {
      issues.push('Obiettivi non chiari');
    }
    
    // Pain points
    const hasPainPoints = /problema|difficoltà|sfida|pain|frustrazione|ostacolo|limiti|critica/i.test(prompt);
    if (hasPainPoints) {
      score += 1;
    } else {
      issues.push('Pain points non specificati');
    }
    
    // Calculate inference confidence based on detail level
    const wordCount = prompt.split(' ').length;
    const inferenceConfidence = Math.min((wordCount / 100) * 0.8 + (score / 5) * 0.2, 1);
    
    return { score, inferenceConfidence, issues };
  }

  /**
   * Extract customer profile from prompt using intelligent inference
   */
  private extractCustomerProfileFromPrompt(prompt: string): CustomerProfileData {
    const lowerPrompt = prompt.toLowerCase();
    
    // Extract business information
    const businessInfo = {
      name: this.extractBusinessName(prompt),
      industry: this.extractIndustry(lowerPrompt),
      targetAudience: this.extractTargetAudience(prompt),
      keyBenefits: this.extractKeyBenefits(prompt)
    };

    // Extract psychographics
    const psychographics = {
      painPoints: this.extractPainPoints(prompt),
      motivations: this.extractMotivations(prompt),
      preferredTone: this.extractPreferredTone(lowerPrompt),
      communicationStyle: this.extractCommunicationStyle(lowerPrompt)
    };

    // Extract behavioral data
    const behavioralData = {
      engagementLevel: this.inferEngagementLevel(lowerPrompt),
      conversionIntent: this.inferConversionIntent(lowerPrompt),
      informationGatheringStyle: this.inferInformationGatheringStyle(lowerPrompt)
    };

    // Extract conversion strategy
    const conversionStrategy = {
      primaryGoal: this.extractPrimaryGoal(prompt),
      secondaryGoals: this.extractSecondaryGoals(prompt),
      keyMessages: this.extractKeyMessages(prompt)
    };

    return {
      businessInfo,
      psychographics,
      behavioralData,
      conversionStrategy
    };
  }

  // Helper methods for intelligent extraction
  private extractBusinessName(prompt: string): string {
    // Look for common business name patterns
    const patterns = [
      /(?:brand|azienda|startup|business|società|impresa|ditta)\s+([A-Z][a-zA-Z\s]+)/i,
      /([A-Z][a-zA-Z]+)\s+(?:brand|company|corp|inc|srl|spa)/i,
      /"([^"]+)"/g // Look for quoted company names
    ];
    
    for (const pattern of patterns) {
      const match = prompt.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    
    return 'Il mio business';
  }

  private extractIndustry(prompt: string): string {
    const industries = {
      'moda|fashion|abbigliamento|vestiti|capi': 'moda',
      'tech|software|app|saas|tecnologia|digitale': 'tecnologia',
      'coaching|consulenza|formazione|corso|training': 'formazione',
      'e-commerce|ecommerce|negozio online|vendita online': 'e-commerce',
      'salute|benessere|fitness|yoga|nutrizione': 'salute e benessere',
      'beauty|cosmetica|skincare|makeup': 'beauty',
      'food|cibo|ristorazione|cucina|ricette': 'food & beverage',
      'immobiliare|casa|appartamenti|vendita case': 'immobiliare',
      'automotive|auto|macchine|veicoli': 'automotive',
      'finance|finanza|investimenti|trading|banca': 'finanza'
    };
    
    for (const [keywords, industry] of Object.entries(industries)) {
      if (new RegExp(keywords, 'i').test(prompt)) {
        return industry;
      }
    }
    
    return 'generale';
  }

  private extractTargetAudience(prompt: string): string {
    // Extract age ranges
    const ageMatch = prompt.match(/(\d{2})-(\d{2})\s*anni|(\d{2})\+\s*anni/i);
    let ageInfo = '';
    if (ageMatch) {
      ageInfo = ageMatch[0];
    }
    
    // Extract gender
    const genderMatch = prompt.match(/(donne|uomini|maschi|femmine|women|men)/i);
    let genderInfo = '';
    if (genderMatch) {
      genderInfo = genderMatch[1];
    }
    
    // Extract profession/role
    const professions = [
      'imprenditori', 'manager', 'professionisti', 'studenti', 'freelancer',
      'ceo', 'founder', 'dirigenti', 'consulenti', 'designer', 'sviluppatori',
      'marketers', 'venditori', 'coach', 'medici', 'avvocati'
    ];
    
    let professionInfo = '';
    for (const profession of professions) {
      if (new RegExp(profession, 'i').test(prompt)) {
        professionInfo = profession;
        break;
      }
    }
    
    // Combine information
    const parts = [ageInfo, genderInfo, professionInfo].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : 'Professionisti';
  }

  private extractPainPoints(prompt: string): string[] {
    const painPatterns = [
      /(?:problema|difficoltà|sfida|pain|frustrazione|ostacolo|limite|critica|fatica)\s+(?:nel|nella|con|a)?\s*([^.!?]+)/gi,
      /non\s+riescono?\s+a\s+([^.!?]+)/gi,
      /mancanza\s+di\s+([^.!?]+)/gi,
      /difficile?\s+([^.!?]+)/gi
    ];
    
    const painPoints: string[] = [];
    
    for (const pattern of painPatterns) {
      let match;
      while ((match = pattern.exec(prompt)) !== null) {
        if (match[1] && match[1].length > 5) {
          painPoints.push(match[1].trim());
        }
      }
    }
    
    return painPoints.length > 0 ? painPoints.slice(0, 3) : ['Inefficienze operative', 'Mancanza di tempo'];
  }

  private extractMotivations(prompt: string): string[] {
    const motivationKeywords = [
      'crescita', 'successo', 'miglioramento', 'efficienza', 'produttività',
      'risultati', 'performance', 'qualità', 'innovazione', 'competitività'
    ];
    
    const motivations: string[] = [];
    
    for (const keyword of motivationKeywords) {
      if (new RegExp(keyword, 'i').test(prompt)) {
        motivations.push(keyword.charAt(0).toUpperCase() + keyword.slice(1));
      }
    }
    
    return motivations.length > 0 ? motivations.slice(0, 3) : ['Crescita del business', 'Miglioramento della produttività'];
  }

  private extractPreferredTone(prompt: string): 'formale' | 'informale' | 'professionale' | 'amichevole' {
    if (/formale|professionale|business|corporate|serio/i.test(prompt)) {
      return 'professionale';
    } else if (/informale|casual|rilassato|friendly|amichevole/i.test(prompt)) {
      return 'amichevole';
    } else if (/tecnico|esperto|competente|autorevole/i.test(prompt)) {
      return 'formale';
    }
    return 'professionale';
  }

  private extractCommunicationStyle(prompt: string): 'diretto' | 'emotivo' | 'analitico' | 'bilanciato' {
    if (/dati|numeri|statistiche|analisi|ricerca|roi|metriche/i.test(prompt)) {
      return 'analitico';
    } else if (/emozioni|sentimenti|passione|cuore|ispirare/i.test(prompt)) {
      return 'emotivo';
    } else if (/diretto|chiaro|conciso|veloce|immediato/i.test(prompt)) {
      return 'diretto';
    }
    return 'bilanciato';
  }

  private inferEngagementLevel(prompt: string): number {
    // High engagement indicators
    if (/attiv[oi]|coinvolt[oi]|partecipativi|engagement alto/i.test(prompt)) {
      return 8;
    }
    // Medium engagement indicators
    if (/interessat[oi]|curiosi|attenti/i.test(prompt)) {
      return 6;
    }
    // Default medium-high engagement
    return 7;
  }

  private inferConversionIntent(prompt: string): number {
    // High intent indicators
    if (/comprano|acquistano|pagano|spendono|investono|budget alto/i.test(prompt)) {
      return 8;
    }
    // Medium intent indicators
    if (/interessat[oi] all'acquisto|considereranno|valuteranno/i.test(prompt)) {
      return 6;
    }
    // Default medium-high intent
    return 7;
  }

  private inferInformationGatheringStyle(prompt: string): 'rapido' | 'approfondito' | 'standard' {
    if (/veloce|rapido|immediato|no tempo|fretta/i.test(prompt)) {
      return 'rapido';
    } else if (/dettagli|approfondire|ricerca|analisi|confronto/i.test(prompt)) {
      return 'approfondito';
    }
    return 'standard';
  }

  private extractPrimaryGoal(prompt: string): string {
    const goalPatterns = [
      /obiettivo.*?(?:è|sono|:)\s*([^.!?\n]+)/i,
      /voglio\s+([^.!?\n]+)/i,
      /goal.*?(?:è|sono|:)\s*([^.!?\n]+)/i,
      /aumentare\s+([^.!?\n]+)/i,
      /generare\s+([^.!?\n]+)/i,
      /ottenere\s+([^.!?\n]+)/i
    ];
    
    for (const pattern of goalPatterns) {
      const match = prompt.match(pattern);
      if (match && match[1] && match[1].length > 5) {
        return match[1].trim();
      }
    }
    
    // Fallback based on business type
    if (/e-commerce|vendita|shop/i.test(prompt)) {
      return 'Aumentare le vendite online';
    } else if (/lead|contatti|email/i.test(prompt)) {
      return 'Generare lead qualificati';
    } else if (/iscrizioni|subscriber|newsletter/i.test(prompt)) {
      return 'Aumentare le iscrizioni';
    }
    
    return 'Migliorare le conversioni';
  }

  private extractSecondaryGoals(prompt: string): string[] {
    const secondaryGoals: string[] = [];
    
    // Common secondary goals
    if (/brand awareness|consapevolezza|notorietà/i.test(prompt)) {
      secondaryGoals.push('Aumentare la brand awareness');
    }
    if (/fidelizzazione|retention|clienti fedeli/i.test(prompt)) {
      secondaryGoals.push('Migliorare la fidelizzazione');
    }
    if (/community|comunità|engagement/i.test(prompt)) {
      secondaryGoals.push('Costruire una community');
    }
    if (/autorità|autorevolezza|thought leader/i.test(prompt)) {
      secondaryGoals.push('Stabilire autorità nel settore');
    }
    
    return secondaryGoals.length > 0 ? secondaryGoals : ['Migliorare la brand awareness'];
  }

  private extractKeyBenefits(prompt: string): string[] {
    const benefits: string[] = [];
    
    // Common benefit keywords
    const benefitKeywords = [
      'risparmio', 'efficienza', 'velocità', 'qualità', 'sicurezza',
      'convenienza', 'personalizzazione', 'supporto', 'garanzia', 'innovazione'
    ];
    
    for (const keyword of benefitKeywords) {
      if (new RegExp(keyword, 'i').test(prompt)) {
        benefits.push(keyword.charAt(0).toUpperCase() + keyword.slice(1));
      }
    }
    
    return benefits.length > 0 ? benefits.slice(0, 3) : ['Soluzioni innovative', 'Risultati garantiti'];
  }

  private extractKeyMessages(prompt: string): string[] {
    const messages: string[] = [];
    
    // Extract value propositions
    const valueProps = [
      'qualità', 'innovazione', 'convenienza', 'rapidità', 'affidabilità',
      'personalizzazione', 'expertise', 'risultati', 'trasparenza', 'supporto'
    ];
    
    for (const prop of valueProps) {
      if (new RegExp(prop, 'i').test(prompt)) {
        messages.push(prop.charAt(0).toUpperCase() + prop.slice(1));
      }
    }
    
    return messages.length > 0 ? messages.slice(0, 3) : ['Soluzioni innovative', 'Approccio personalizzato', 'Risultati garantiti'];
  }
}

// Export singleton instance
export const instantFunnelGenerator = InstantFunnelGenerator.getInstance();