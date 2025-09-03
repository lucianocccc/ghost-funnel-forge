import OpenAI from "openai";

/*
The newest OpenAI model is "gpt-5", not "gpt-4o" or "gpt-4". gpt-5 was released August 7, 2025.
Always prefer using gpt-5 as it is the latest model unless explicitly requested otherwise.
*/

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface AIOrchestrationRequest {
  businessContext: {
    businessName: string;
    industry: string;
    targetAudience: string;
    mainProduct: string;
    uniqueValueProposition: string;
    budget?: number;
  };
  marketResearch?: any;
  storytellingData?: any;
  previousIterations?: number;
}

export interface FunnelStructure {
  id: string;
  name: string;
  description: string;
  steps: FunnelStep[];
  estimatedConversion: number;
  targetAudience: string;
  uniqueElements: string[];
}

export interface FunnelStep {
  id: string;
  type: string;
  name: string;
  description: string;
  content: any;
  position: number;
  nextStepId?: string;
}

class OpenAIService {
  /**
   * Main orchestration method that coordinates the entire funnel generation process
   * Uses GPT-5 as the master conductor to create unique, data-driven funnels
   */
  async orchestrateFunnelGeneration(request: AIOrchestrationRequest): Promise<FunnelStructure> {
    try {
      const systemPrompt = `
        Sei il MASTER AI ORCHESTRATOR di GhostFunnel, il più avanzato sistema di generazione funnel marketing al mondo.
        
        Il tuo compito è creare funnel marketing UNICI e personalizzati per PMI italiane utilizzando:
        - Ricerca mercato in tempo reale (da Perplexity)
        - Storytelling emotivo (da Claude)
        - La tua intelligenza strategica per orchestrare tutto
        
        REGOLE FONDAMENTALI:
        1. OGNI FUNNEL DEVE ESSERE COMPLETAMENTE UNICO - mai template predefiniti
        2. Utilizza i dati di mercato per personalizzazione estrema
        3. Crea strutture innovative basate sul settore specifico
        4. Considera budget, target e obiettivi del cliente
        5. Genera elementi visuali/grafici unici per ogni step
        
        Rispondi SEMPRE in formato JSON valido con questa struttura esatta.
      `;

      const userPrompt = `
        Genera un funnel marketing completamente unico per:
        
        BUSINESS: ${request.businessContext.businessName}
        SETTORE: ${request.businessContext.industry}
        PRODOTTO: ${request.businessContext.mainProduct}
        TARGET: ${request.businessContext.targetAudience}
        UVP: ${request.businessContext.uniqueValueProposition}
        BUDGET: €${request.businessContext.budget || 'Non specificato'}
        
        ${request.marketResearch ? `RICERCA MERCATO: ${JSON.stringify(request.marketResearch)}` : ''}
        ${request.storytellingData ? `STORYTELLING DATA: ${JSON.stringify(request.storytellingData)}` : ''}
        
        Crea un funnel con 4-7 step innovativi, ognuno con elementi unici mai visti prima.
        Considera conversion rate realistici basati sul settore.
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.8, // Creatività alta per unicità
        max_tokens: 4000
      });

      const funnelData = JSON.parse(response.choices[0].message.content || '{}');
      
      // Aggiungi ID univoci se mancanti
      if (!funnelData.id) {
        funnelData.id = `funnel_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      }
      
      funnelData.steps = funnelData.steps?.map((step: any, index: number) => ({
        ...step,
        id: step.id || `step_${index}_${Math.random().toString(36).substr(2, 6)}`,
        position: index
      })) || [];

      return funnelData;
    } catch (error) {
      console.error('Error in OpenAI orchestration:', error);
      throw new Error(`Orchestration failed: ${error.message}`);
    }
  }

  /**
   * Analizza e ottimizza un funnel esistente utilizzando feedback e metriche
   */
  async optimizeFunnel(
    originalFunnel: FunnelStructure, 
    performanceData: any,
    userFeedback?: string
  ): Promise<FunnelStructure> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [
          {
            role: "system",
            content: "Sei un esperto di ottimizzazione funnel marketing. Analizza le performance e suggerisci miglioramenti mantenendo l'unicità del funnel."
          },
          {
            role: "user",
            content: `
              FUNNEL ORIGINALE: ${JSON.stringify(originalFunnel)}
              PERFORMANCE DATA: ${JSON.stringify(performanceData)}
              FEEDBACK UTENTE: ${userFeedback || 'Nessun feedback specifico'}
              
              Ottimizza questo funnel mantenendone l'unicità ma migliorando le conversioni.
            `
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.6
      });

      return JSON.parse(response.choices[0].message.content || '{}');
    } catch (error) {
      console.error('Error optimizing funnel:', error);
      throw error;
    }
  }

  /**
   * Genera varianti creative di un funnel per A/B testing
   */
  async generateFunnelVariants(
    baseFunnel: FunnelStructure, 
    variantCount: number = 2
  ): Promise<FunnelStructure[]> {
    const variants: FunnelStructure[] = [];
    
    for (let i = 0; i < variantCount; i++) {
      try {
        const response = await openai.chat.completions.create({
          model: "gpt-5",
          messages: [
            {
              role: "system",
              content: "Crea una variante creativa del funnel mantenendo l'obiettivo ma cambiando approccio, struttura e elementi visivi."
            },
            {
              role: "user",
              content: `
                FUNNEL BASE: ${JSON.stringify(baseFunnel)}
                
                Crea la variante ${i + 1} con:
                - Struttura diversa (diversi step o ordine)
                - Approccio comunicativo alternativo
                - Elementi grafici/visivi completamente nuovi
                - Mantenendo target e obiettivi
              `
            }
          ],
          response_format: { type: "json_object" },
          temperature: 0.9 // Alta creatività per varianti diverse
        });

        const variant = JSON.parse(response.choices[0].message.content || '{}');
        variant.id = `${baseFunnel.id}_variant_${i + 1}`;
        variants.push(variant);
      } catch (error) {
        console.error(`Error generating variant ${i + 1}:`, error);
      }
    }
    
    return variants;
  }
}

export const openAIService = new OpenAIService();