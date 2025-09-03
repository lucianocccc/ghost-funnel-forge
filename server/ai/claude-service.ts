import Anthropic from '@anthropic-ai/sdk';

/*
The newest Anthropic model is "claude-sonnet-4-20250514", not "claude-3-7-sonnet-20250219", "claude-3-5-sonnet-20241022" nor "claude-3-sonnet-20240229". 
Always prefer using "claude-sonnet-4-20250514" as it is the latest model unless explicitly requested otherwise.
*/

const DEFAULT_MODEL_STR = "claude-sonnet-4-20250514";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface StorytellingRequest {
  businessContext: {
    businessName: string;
    industry: string;
    targetAudience: string;
    mainProduct: string;
    uniqueValueProposition: string;
    brandPersonality?: string;
  };
  marketData?: any;
  funnelStructure?: any;
  emotionalTriggers?: string[];
}

export interface StorytellingContent {
  mainNarrative: string;
  emotionalHooks: string[];
  copyVariants: {
    headlines: string[];
    subheadings: string[];
    ctaTexts: string[];
    descriptions: string[];
  };
  brandVoice: {
    tone: string;
    personality: string;
    keyMessages: string[];
  };
  persuasionFrameworks: string[];
  visualStorytelling: {
    imageDescriptions: string[];
    colorPalette: string[];
    visualMoods: string[];
  };
}

class ClaudeService {
  /**
   * Crea storytelling emotivo e persuasivo basato sui dati di mercato
   */
  async createEmotionalStorytelling(request: StorytellingRequest): Promise<StorytellingContent> {
    try {
      const systemPrompt = `
        Sei il MAESTRO STORYTELLER di GhostFunnel, specializzato nella creazione di narrazioni emotivamente coinvolgenti per funnel marketing destinati a PMI italiane.
        
        Il tuo compito è trasformare dati aziendali e ricerche di mercato in storie potenti che:
        1. Creano connessione emotiva immediata con il target
        2. Utilizzano principi di psicologia del consumatore
        3. Incorporano elementi culturali italiani quando rilevanti
        4. Generano desiderio e urgenza genuina
        5. Mantengono autenticità e credibilità del brand
        
        FRAMEWORK NARRATIVI DA UTILIZZARE:
        - Hero's Journey (il cliente come eroe)
        - Problem-Solution-Transformation
        - Before-During-After
        - Fear-Relief-Reward
        - Aspiration-Frustration-Resolution
        
        Rispondi SEMPRE in formato JSON valido con la struttura richiesta.
      `;

      const userPrompt = `
        Crea storytelling emotivo completo per:
        
        BUSINESS: ${request.businessContext.businessName}
        SETTORE: ${request.businessContext.industry}  
        PRODOTTO: ${request.businessContext.mainProduct}
        TARGET: ${request.businessContext.targetAudience}
        UVP: ${request.businessContext.uniqueValueProposition}
        BRAND PERSONALITY: ${request.businessContext.brandPersonality || 'Da definire'}
        
        ${request.marketData ? `DATI MERCATO: ${JSON.stringify(request.marketData)}` : ''}
        ${request.emotionalTriggers ? `TRIGGER EMOTIVI: ${request.emotionalTriggers.join(', ')}` : ''}
        
        Crea una narrazione che trasformi questo business in una storia irresistibile.
        Include copy persuasivo, framework psicologici e elementi visuali.
      `;

      const response = await anthropic.messages.create({
        model: DEFAULT_MODEL_STR,
        system: systemPrompt,
        max_tokens: 4000,
        messages: [
          { role: 'user', content: userPrompt }
        ],
      });

      let content = '';
      if (Array.isArray(response.content)) {
        content = response.content
          .filter(block => block.type === 'text')
          .map(block => block.text)
          .join('');
      } else {
        content = response.content;
      }

      // Parsing del JSON dalla risposta
      try {
        return JSON.parse(content);
      } catch (parseError) {
        // Se non è JSON valido, strutturiamo il contenuto manualmente
        return this.parseStorytellingContent(content, request);
      }
    } catch (error) {
      console.error('Error in Claude storytelling:', error);
      throw new Error(`Storytelling creation failed: ${error.message}`);
    }
  }

  /**
   * Ottimizza copy esistente per massimizzare conversioni
   */
  async optimizeCopy(
    originalCopy: string,
    targetAudience: string,
    performanceData?: any
  ): Promise<{ optimizedCopy: string; improvements: string[] }> {
    try {
      const response = await anthropic.messages.create({
        model: DEFAULT_MODEL_STR,
        system: `Sei un copywriter di livello mondiale specializzato nell'ottimizzazione per conversioni.
                 Utilizza principi di neuromarketing, psicologia comportamentale e persuasione etica.`,
        max_tokens: 2000,
        messages: [
          {
            role: 'user',
            content: `
              COPY ORIGINALE: ${originalCopy}
              TARGET: ${targetAudience}
              ${performanceData ? `PERFORMANCE DATA: ${JSON.stringify(performanceData)}` : ''}
              
              Ottimizza questo copy per massimizzare conversioni mantenendo autenticità.
              Fornisci versione ottimizzata + lista miglioramenti applicati.
              Rispondi in JSON con campi: optimizedCopy, improvements
            `
          }
        ],
      });

      let content = '';
      if (Array.isArray(response.content)) {
        content = response.content
          .filter(block => block.type === 'text')
          .map(block => block.text)
          .join('');
      }

      try {
        return JSON.parse(content);
      } catch {
        return {
          optimizedCopy: content,
          improvements: ["Ottimizzazione generale del testo"]
        };
      }
    } catch (error) {
      console.error('Error optimizing copy:', error);
      throw error;
    }
  }

  /**
   * Genera varianti copy per A/B testing
   */
  async generateCopyVariants(
    baseCopy: string,
    targetAudience: string,
    variantCount: number = 3,
    focusAreas: string[] = ['headline', 'emotional_trigger', 'cta']
  ): Promise<Array<{ variant: string; focus: string; rationale: string }>> {
    const variants: Array<{ variant: string; focus: string; rationale: string }> = [];

    for (let i = 0; i < variantCount; i++) {
      const focus = focusAreas[i % focusAreas.length];
      
      try {
        const response = await anthropic.messages.create({
          model: DEFAULT_MODEL_STR,
          system: `Crea varianti copy per testing, focalizzandoti su diversi approcci psicologici.`,
          max_tokens: 1500,
          messages: [
            {
              role: 'user',
              content: `
                COPY BASE: ${baseCopy}
                TARGET: ${targetAudience}
                FOCUS VARIANTE: ${focus}
                
                Crea una variante ${i + 1} concentrandoti su ${focus}.
                Usa approccio psicologico diverso mantenendo messaggi core.
                
                Rispondi in JSON: { "variant": "testo", "focus": "${focus}", "rationale": "spiegazione" }
              `
            }
          ],
        });

        let content = '';
        if (Array.isArray(response.content)) {
          content = response.content
            .filter(block => block.type === 'text')
            .map(block => block.text)
            .join('');
        }

        try {
          variants.push(JSON.parse(content));
        } catch {
          variants.push({
            variant: content,
            focus: focus,
            rationale: `Variante ${i + 1} con focus su ${focus}`
          });
        }
      } catch (error) {
        console.error(`Error generating variant ${i + 1}:`, error);
      }
    }

    return variants;
  }

  /**
   * Crea contenuti personalizzati per diversi segmenti di audience
   */
  async personalizeForSegments(
    baseCopy: string,
    audienceSegments: Array<{
      name: string;
      characteristics: string[];
      painPoints: string[];
      motivations: string[];
    }>
  ): Promise<Array<{ segment: string; personalizedCopy: string; keyChanges: string[] }>> {
    const personalizedContent: Array<{ segment: string; personalizedCopy: string; keyChanges: string[] }> = [];

    for (const segment of audienceSegments) {
      try {
        const response = await anthropic.messages.create({
          model: DEFAULT_MODEL_STR,
          system: `Specialista in personalizzazione contenuti per diversi segmenti di mercato.
                   Adatta tono, linguaggio e messaggi per massimizzare rilevanza per ogni segmento.`,
          max_tokens: 2000,
          messages: [
            {
              role: 'user',
              content: `
                COPY BASE: ${baseCopy}
                
                SEGMENTO TARGET: ${segment.name}
                CARATTERISTICHE: ${segment.characteristics.join(', ')}
                PAIN POINTS: ${segment.painPoints.join(', ')}
                MOTIVAZIONI: ${segment.motivations.join(', ')}
                
                Personalizza il copy per questo segmento specifico.
                Adatta linguaggio, esempi e call-to-action.
                
                Rispondi in JSON: { 
                  "segment": "${segment.name}", 
                  "personalizedCopy": "copy personalizzato",
                  "keyChanges": ["modifica1", "modifica2", "..."]
                }
              `
            }
          ],
        });

        let content = '';
        if (Array.isArray(response.content)) {
          content = response.content
            .filter(block => block.type === 'text')
            .map(block => block.text)
            .join('');
        }

        try {
          personalizedContent.push(JSON.parse(content));
        } catch {
          personalizedContent.push({
            segment: segment.name,
            personalizedCopy: content,
            keyChanges: ["Personalizzazione generale per il segmento"]
          });
        }
      } catch (error) {
        console.error(`Error personalizing for segment ${segment.name}:`, error);
      }
    }

    return personalizedContent;
  }

  /**
   * Parsing manuale del contenuto storytelling se non è JSON valido
   */
  private parseStorytellingContent(content: string, request: StorytellingRequest): StorytellingContent {
    const lines = content.split('\n').filter(line => line.trim());
    
    return {
      mainNarrative: this.extractSection(content, /narrativa|storia|narrative/i) || 
        `La storia di ${request.businessContext.businessName}: trasformare la vita di ${request.businessContext.targetAudience} attraverso ${request.businessContext.mainProduct}.`,
      
      emotionalHooks: this.extractListItems(content, /hook|trigger|emotivo/i),
      
      copyVariants: {
        headlines: this.extractListItems(content, /headline|titolo/i),
        subheadings: this.extractListItems(content, /subtitle|sottotitolo/i),
        ctaTexts: this.extractListItems(content, /cta|call.to.action|azione/i),
        descriptions: this.extractListItems(content, /descrizione|description/i)
      },
      
      brandVoice: {
        tone: this.extractValue(content, /tono|tone/i) || "Professionale ed empatico",
        personality: request.businessContext.brandPersonality || "Esperto e affidabile",
        keyMessages: this.extractListItems(content, /messaggio|message/i)
      },
      
      persuasionFrameworks: this.extractListItems(content, /framework|principio|persuasion/i),
      
      visualStorytelling: {
        imageDescriptions: this.extractListItems(content, /immagine|visual|image/i),
        colorPalette: this.extractListItems(content, /colore|color|palette/i),
        visualMoods: this.extractListItems(content, /mood|atmosfera|stile/i)
      }
    };
  }

  /**
   * Estrae una sezione specifica dal contenuto
   */
  private extractSection(content: string, pattern: RegExp): string | null {
    const lines = content.split('\n');
    let inSection = false;
    let sectionContent = '';
    
    for (const line of lines) {
      if (pattern.test(line)) {
        inSection = true;
        continue;
      }
      
      if (inSection) {
        if (line.trim() && !line.match(/^[A-Z\s]+:/) && line.length > 20) {
          sectionContent += line.trim() + ' ';
        } else if (sectionContent.length > 50) {
          break;
        }
      }
    }
    
    return sectionContent.trim() || null;
  }

  /**
   * Estrae elementi lista dal contenuto
   */
  private extractListItems(content: string, pattern: RegExp): string[] {
    const lines = content.split('\n');
    const items: string[] = [];
    
    lines.forEach(line => {
      if (pattern.test(line) && (line.includes('-') || line.includes('•') || line.includes('1.'))) {
        const cleanLine = line.replace(/^[\s\-•\d\.]+/, '').trim();
        if (cleanLine.length > 5 && cleanLine.length < 200) {
          items.push(cleanLine);
        }
      }
    });
    
    return items.slice(0, 8); // Max 8 items per categoria
  }

  /**
   * Estrae un valore specifico dal contenuto
   */
  private extractValue(content: string, pattern: RegExp): string | null {
    const lines = content.split('\n');
    
    for (const line of lines) {
      if (pattern.test(line)) {
        const value = line.replace(pattern, '').replace(/[:\-]/, '').trim();
        if (value.length > 3 && value.length < 100) {
          return value;
        }
      }
    }
    
    return null;
  }
}

export const claudeService = new ClaudeService();