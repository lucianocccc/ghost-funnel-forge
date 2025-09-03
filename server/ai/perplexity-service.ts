interface PerplexityResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
  citations?: string[];
}

export interface MarketResearchRequest {
  industry: string;
  targetAudience: string;
  mainProduct: string;
  businessLocation?: string;
  competitors?: string[];
}

export interface MarketResearchData {
  marketTrends: string[];
  competitorAnalysis: any[];
  customerInsights: string[];
  pricingBenchmarks: any;
  opportunityGaps: string[];
  citations: string[];
  searchDate: string;
}

class PerplexityService {
  private apiKey: string;
  private baseUrl = 'https://api.perplexity.ai/chat/completions';

  constructor() {
    this.apiKey = process.env.PERPLEXITY_API_KEY!;
    if (!this.apiKey) {
      throw new Error('PERPLEXITY_API_KEY is required');
    }
  }

  /**
   * Conduce ricerca mercato completa in tempo reale
   */
  async conductMarketResearch(request: MarketResearchRequest): Promise<MarketResearchData> {
    try {
      const searchQuery = this.buildMarketResearchQuery(request);
      
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: "llama-3.1-sonar-large-128k-online",
          messages: [
            {
              role: "system",
              content: `Sei un esperto analista di mercato specializzato in PMI italiane. 
                       Conduci ricerche approfondite e fornisci dati attuali e actionable.
                       Rispondi SEMPRE in formato JSON valido con la struttura richiesta.`
            },
            {
              role: "user",
              content: searchQuery
            }
          ],
          temperature: 0.2,
          top_p: 0.9,
          search_recency_filter: "month",
          return_citations: true,
          max_tokens: 4000
        })
      });

      if (!response.ok) {
        throw new Error(`Perplexity API error: ${response.status} ${response.statusText}`);
      }

      const data: PerplexityResponse = await response.json();
      const content = data.choices[0].message.content;
      
      let parsedData;
      try {
        parsedData = JSON.parse(content);
      } catch (parseError) {
        // Se la risposta non è JSON valido, strutturiamo i dati
        parsedData = this.structureRawContent(content);
      }

      return {
        ...parsedData,
        citations: data.citations || [],
        searchDate: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error in Perplexity market research:', error);
      throw new Error(`Market research failed: ${error.message}`);
    }
  }

  /**
   * Analizza competitor specifici nel settore
   */
  async analyzeCompetitors(
    industry: string, 
    competitors: string[], 
    location?: string
  ): Promise<any> {
    const competitorQuery = `
      Analizza in dettaglio questi competitor nel settore ${industry} ${location ? `in ${location}` : ''}:
      ${competitors.join(', ')}
      
      Per ognuno fornisci:
      - Strategie marketing principali
      - Punti di forza e debolezza
      - Pricing e posizionamento
      - Canali di acquisizione clienti
      - Opportunità di differenziazione
      
      Rispondi in formato JSON con array di competitor analizzati.
    `;

    const response = await this.makePerplexityRequest(competitorQuery);
    return this.parseCompetitorData(response);
  }

  /**
   * Identifica trend emergenti nel settore
   */
  async identifyEmergingTrends(industry: string, timeframe: string = "last 3 months"): Promise<any> {
    const trendQuery = `
      Identifica i trend più importanti nel settore ${industry} negli ultimi ${timeframe}.
      
      Focus su:
      - Nuove tecnologie adottate
      - Cambiamenti nel comportamento dei consumatori
      - Innovazioni di marketing
      - Shift nelle preferenze di acquisto
      - Opportunità emergenti per PMI
      
      Fornisci dati concreti con fonti e statistiche quando disponibili.
      Rispondi in formato JSON strutturato.
    `;

    return await this.makePerplexityRequest(trendQuery);
  }

  /**
   * Ricerca pricing e benchmark di mercato
   */
  async researchPricingBenchmarks(
    product: string, 
    industry: string, 
    targetMarket: string
  ): Promise<any> {
    const pricingQuery = `
      Ricerca i prezzi di mercato per ${product} nel settore ${industry} 
      per target ${targetMarket} in Italia.
      
      Analizza:
      - Fascia di prezzo tipica
      - Strategie pricing comuni
      - Differenziazione prezzo/valore
      - Prezzi premium vs economy
      - Modelli di pricing innovativi
      
      Rispondi con dati strutturati in JSON.
    `;

    return await this.makePerplexityRequest(pricingQuery);
  }

  /**
   * Costruisce query ottimizzata per ricerca mercato
   */
  private buildMarketResearchQuery(request: MarketResearchRequest): string {
    return `
      Conduci una ricerca mercato completa per un'azienda italiana nel settore ${request.industry}.
      
      DETTAGLI BUSINESS:
      - Prodotto/Servizio: ${request.mainProduct}
      - Target Audience: ${request.targetAudience}
      - Mercato: ${request.businessLocation || 'Italia'}
      ${request.competitors ? `- Competitor noti: ${request.competitors.join(', ')}` : ''}
      
      ANALISI RICHIESTA:
      1. Trend di mercato attuali (ultimi 6 mesi)
      2. Analisi competitor (top 5-10 player)
      3. Insights sui clienti target
      4. Benchmark prezzi di settore
      5. Gap/opportunità non sfruttate
      
      Fornisci dati concreti, statistiche e fonti verificabili.
      Rispondi SOLO in formato JSON con questa struttura esatta:
      {
        "marketTrends": ["trend1", "trend2", "..."],
        "competitorAnalysis": [{"name": "competitor", "strengths": [], "weaknesses": [], "pricing": "info"}],
        "customerInsights": ["insight1", "insight2", "..."],
        "pricingBenchmarks": {"low": "prezzo", "mid": "prezzo", "high": "prezzo", "average": "prezzo"},
        "opportunityGaps": ["gap1", "gap2", "..."]
      }
    `;
  }

  /**
   * Fa una richiesta generica a Perplexity
   */
  private async makePerplexityRequest(query: string): Promise<any> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "llama-3.1-sonar-large-128k-online",
        messages: [
          {
            role: "system",
            content: "Sei un ricercatore esperto. Fornisci sempre risposte accurate, aggiornate e ben strutturate."
          },
          {
            role: "user",
            content: query
          }
        ],
        temperature: 0.2,
        search_recency_filter: "month",
        return_citations: true
      })
    });

    if (!response.ok) {
      throw new Error(`Perplexity API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  /**
   * Struttura contenuto raw in formato utilizzabile
   */
  private structureRawContent(content: string): Partial<MarketResearchData> {
    return {
      marketTrends: this.extractListItems(content, /trend|tendenza/i),
      customerInsights: this.extractListItems(content, /insight|cliente|consumer/i),
      opportunityGaps: this.extractListItems(content, /opportunit|gap|nicchia/i),
      competitorAnalysis: [],
      pricingBenchmarks: {}
    };
  }

  /**
   * Estrae elementi lista dal contenuto testuale
   */
  private extractListItems(content: string, pattern: RegExp): string[] {
    const lines = content.split('\n');
    const items: string[] = [];
    
    lines.forEach(line => {
      if (pattern.test(line) && (line.includes('-') || line.includes('•') || line.includes('1.'))) {
        const cleanLine = line.replace(/^[\s\-•\d\.]+/, '').trim();
        if (cleanLine.length > 10) {
          items.push(cleanLine);
        }
      }
    });
    
    return items.slice(0, 10); // Massimo 10 items per categoria
  }

  /**
   * Parsing dati competitor da risposta Perplexity
   */
  private parseCompetitorData(content: string): any[] {
    try {
      const parsed = JSON.parse(content);
      return parsed.competitors || parsed;
    } catch {
      // Fallback parsing manuale se non è JSON
      const competitors: any[] = [];
      const lines = content.split('\n');
      let currentCompetitor: any = null;
      
      lines.forEach(line => {
        if (line.includes('Competitor') || line.includes('competitor')) {
          if (currentCompetitor) competitors.push(currentCompetitor);
          currentCompetitor = { name: line.replace(/.*competitor[:\s]*/i, '').trim() };
        } else if (currentCompetitor) {
          if (line.includes('strengths') || line.includes('punti di forza')) {
            currentCompetitor.strengths = [line.replace(/.*:/i, '').trim()];
          } else if (line.includes('weaknesses') || line.includes('debolezz')) {
            currentCompetitor.weaknesses = [line.replace(/.*:/i, '').trim()];
          }
        }
      });
      
      if (currentCompetitor) competitors.push(currentCompetitor);
      return competitors;
    }
  }
}

export const perplexityService = new PerplexityService();