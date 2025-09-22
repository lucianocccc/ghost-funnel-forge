interface ComplianceIssue {
  severity: 'error' | 'warning';
  message: string;
  field?: string;
  suggestion?: string;
}

interface ComplianceResult {
  isCompliant: boolean;
  issues: ComplianceIssue[];
  correctedContent?: any;
}

export class LegalComplianceValidator {
  // Forbidden phrases that violate the Codice Deontologico Forense
  private static FORBIDDEN_PHRASES = [
    // Promises of results
    /garanzia di vittoria/i,
    /percentuale di successo/i,
    /vinco sempre/i,
    /risultato garantito/i,
    /100% di successo/i,
    /non hai mai perso/i,
    /vinciamo sempre/i,
    
    // Comparison with competitors
    /migliore avvocato/i,
    /superiore alla concorrenza/i,
    /meglio di altri studi/i,
    /i nostri competitor/i,
    /confronto con altri/i,
    
    // Captazione (solicitation)
    /chiamaci subito/i,
    /offerta limitata/i,
    /sconto speciale/i,
    /solo per oggi/i,
    /affrettati/i,
    /ultimi posti/i,
    
    // Sensationalistic language
    /shock/i,
    /incredibile/i,
    /rivoluzionario/i,
    /miracoloso/i,
    /segreto/i,
    /esclusivo/i,
  ];

  // Required compliance elements
  private static REQUIRED_ELEMENTS = {
    privacy_policy: true,
    professional_disclaimer: true,
    gdpr_consent: true,
    contact_information: true,
    bar_registration: false, // Optional but recommended
  };

  static validateFunnelContent(funnelData: any): ComplianceResult {
    const issues: ComplianceIssue[] = [];
    let correctedContent = { ...funnelData };

    // 1. Check funnel name and description
    if (funnelData.name) {
      const nameIssues = this.checkTextCompliance(funnelData.name, 'nome del funnel');
      issues.push(...nameIssues);
    }

    if (funnelData.description) {
      const descIssues = this.checkTextCompliance(funnelData.description, 'descrizione');
      issues.push(...descIssues);
    }

    // 2. Check hero section
    if (funnelData.settings?.personalizedSections?.hero) {
      const hero = funnelData.settings.personalizedSections.hero;
      
      if (hero.title) {
        const titleIssues = this.checkTextCompliance(hero.title, 'titolo hero');
        issues.push(...titleIssues);
      }
      
      if (hero.subtitle) {
        const subtitleIssues = this.checkTextCompliance(hero.subtitle, 'sottotitolo hero');
        issues.push(...subtitleIssues);
      }
      
      if (hero.value_proposition) {
        const vpIssues = this.checkTextCompliance(hero.value_proposition, 'value proposition');
        issues.push(...vpIssues);
      }
    }

    // 3. Check steps content
    if (funnelData.steps) {
      funnelData.steps.forEach((step: any, index: number) => {
        if (step.title) {
          const stepIssues = this.checkTextCompliance(step.title, `titolo step ${index + 1}`);
          issues.push(...stepIssues);
        }
        
        if (step.description) {
          const stepDescIssues = this.checkTextCompliance(step.description, `descrizione step ${index + 1}`);
          issues.push(...stepDescIssues);
        }

        // Check CTA buttons
        if (step.settings?.submitButtonText) {
          const ctaIssues = this.checkTextCompliance(step.settings.submitButtonText, `CTA step ${index + 1}`);
          issues.push(...ctaIssues);
        }
      });
    }

    // 4. Check for required compliance elements
    const complianceIssues = this.checkRequiredElements(funnelData);
    issues.push(...complianceIssues);

    // 5. Auto-correct minor issues
    correctedContent = this.autoCorrectContent(correctedContent, issues);

    return {
      isCompliant: issues.filter(i => i.severity === 'error').length === 0,
      issues,
      correctedContent: issues.length > 0 ? correctedContent : undefined
    };
  }

  private static checkTextCompliance(text: string, fieldName: string): ComplianceIssue[] {
    const issues: ComplianceIssue[] = [];

    // Check for forbidden phrases
    this.FORBIDDEN_PHRASES.forEach(phrase => {
      if (phrase.test(text)) {
        issues.push({
          severity: 'error',
          message: `Il ${fieldName} contiene linguaggio non conforme al Codice Deontologico`,
          field: fieldName,
          suggestion: 'Utilizzare un linguaggio professionale e informativo, evitando promesse o confronti'
        });
      }
    });

    // Check for excessive use of exclamation marks (unprofessional)
    const exclamationCount = (text.match(/!/g) || []).length;
    if (exclamationCount > 1) {
      issues.push({
        severity: 'warning',
        message: `Il ${fieldName} contiene troppi punti esclamativi (${exclamationCount})`,
        field: fieldName,
        suggestion: 'Limitare l\'uso di punti esclamativi per mantenere un tono professionale'
      });
    }

    // Check for all caps (aggressive tone)
    if (text === text.toUpperCase() && text.length > 10) {
      issues.push({
        severity: 'warning',
        message: `Il ${fieldName} è scritto completamente in maiuscolo`,
        field: fieldName,
        suggestion: 'Utilizzare maiuscole solo quando necessario per mantenere un tono professionale'
      });
    }

    return issues;
  }

  private static checkRequiredElements(funnelData: any): ComplianceIssue[] {
    const issues: ComplianceIssue[] = [];

    // Check for privacy policy
    if (!funnelData.settings?.legal_compliance?.privacy_gdpr) {
      issues.push({
        severity: 'error',
        message: 'Manca l\'informativa privacy conforme al GDPR',
        suggestion: 'Aggiungere clausole privacy specifiche per il settore legale'
      });
    }

    // Check for professional disclaimer
    if (!funnelData.settings?.legal_compliance?.professional_disclaimer) {
      issues.push({
        severity: 'error',
        message: 'Manca il disclaimer di responsabilità professionale',
        suggestion: 'Aggiungere disclaimer sulla responsabilità professionale'
      });
    }

    // Check for contact information transparency
    if (!funnelData.settings?.trust_elements?.contact_transparency) {
      issues.push({
        severity: 'warning',
        message: 'Mancano informazioni trasparenti sui contatti',
        suggestion: 'Aggiungere orari, modalità di contatto e sede dello studio'
      });
    }

    return issues;
  }

  private static autoCorrectContent(content: any, issues: ComplianceIssue[]): any {
    let corrected = { ...content };

    // Auto-add required compliance elements if missing
    if (!corrected.settings) corrected.settings = {};
    if (!corrected.settings.legal_compliance) {
      corrected.settings.legal_compliance = {
        privacy_gdpr: "Informativa privacy conforme al segreto professionale e GDPR",
        professional_disclaimer: "Le informazioni fornite non costituiscono consulenza legale. Per questioni specifiche è necessaria una consulenza personalizzata.",
        data_protection: "I dati personali sono trattati nel rispetto del segreto professionale e della normativa privacy vigente."
      };
    }

    if (!corrected.settings.trust_elements) {
      corrected.settings.trust_elements = {
        professional_credentials: "Esperienza e competenza nel settore legale",
        contact_transparency: "Orari di ricevimento e modalità di contatto disponibili",
        areas_expertise: "Aree di specializzazione specifiche"
      };
    }

    // Auto-correct tone issues
    if (corrected.settings?.personalizedSections?.hero?.title) {
      corrected.settings.personalizedSections.hero.title = 
        this.correctTone(corrected.settings.personalizedSections.hero.title);
    }

    return corrected;
  }

  private static correctTone(text: string): string {
    let corrected = text;
    
    // Remove excessive exclamation marks
    corrected = corrected.replace(/!{2,}/g, '.');
    
    // Convert from all caps if too long
    if (corrected === corrected.toUpperCase() && corrected.length > 10) {
      corrected = corrected.charAt(0).toUpperCase() + corrected.slice(1).toLowerCase();
    }
    
    // Replace problematic words with professional alternatives
    const replacements = {
      'shock': 'importante',
      'incredibile': 'significativo',
      'rivoluzionario': 'innovativo',
      'miracoloso': 'efficace',
      'garantisco': 'mi impegno a',
      'vinco sempre': 'ho esperienza in',
      'chiamaci subito': 'contattaci per informazioni'
    };
    
    Object.entries(replacements).forEach(([bad, good]) => {
      const regex = new RegExp(bad, 'gi');
      corrected = corrected.replace(regex, good);
    });
    
    return corrected;
  }

  // Get compliance guidelines for AI prompts
  static getComplianceGuidelines(): string {
    return `
CONFORMITÀ OBBLIGATORIA AL CODICE DEONTOLOGICO FORENSE:

DIVIETI ASSOLUTI:
- NON promettere risultati specifici o percentuali di successo
- NON fare confronti con altri professionisti o studi
- NON utilizzare linguaggio sensazionalistico o aggressivo
- NON sollecitare direttamente potenziali clienti (captazione vietata)
- NON utilizzare testimonial identificabili di clienti
- NON garantire vittorie o esiti favorevoli

LINGUAGGIO OBBLIGATORIO:
- Professionale, decoroso e misurato
- Informativo ma non promozionale aggressivo
- Rispettoso della dignità professionale
- Veritiero e verificabile
- Conforme al segreto professionale

ELEMENTI OBBLIGATORI:
- Disclaimer responsabilità professionale
- Informativa privacy GDPR per settore legale
- Trasparenza su titoli e competenze
- Modalità di contatto chiare
- Rispetto del segreto professionale nella raccolta dati

VERIFICA: Ogni contenuto deve superare il test di conformità prima della generazione finale.
`;
  }
}