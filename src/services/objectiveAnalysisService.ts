
import { supabase } from '@/integrations/supabase/client';

export interface ObjectiveAnalysisRequest {
  primaryGoal: string;
  targetAudience: string;
  industry: string;
  businessStage: string;
  urgency: 'low' | 'medium' | 'high';
  timeline: string;
  budget: string;
  userId: string;
}

export interface DynamicQuestion {
  id: string;
  question: string;
  type: 'text' | 'textarea' | 'select' | 'multiselect' | 'number';
  placeholder?: string;
  options?: string[];
  required: boolean;
  reasoning: string;
}

export interface FunnelTypeSuggestion {
  id: string;
  name: string;
  description: string;
  matchScore: number;
  expectedConversion: number;
  complexity: 'Bassa' | 'Media' | 'Alta';
  benefits: string[];
  reasoning: string;
  estimatedROI: number;
  recommendedBudget: string;
}

export interface ObjectiveAnalysisResult {
  analysisId: string;
  intelligenceScore: number;
  dynamicQuestions: DynamicQuestion[];
  suggestedFunnelTypes: FunnelTypeSuggestion[];
  competitiveInsights: {
    competitors: string[];
    marketGaps: string[];
    differentiationOpportunities: string[];
  };
  marketTrends: {
    trendingTopics: string[];
    seasonalFactors: string[];
    urgencyIndicators: string[];
  };
  personalizedRecommendations: string[];
  nextSteps: string[];
}

export class ObjectiveAnalysisService {
  private static instance: ObjectiveAnalysisService;

  public static getInstance(): ObjectiveAnalysisService {
    if (!ObjectiveAnalysisService.instance) {
      ObjectiveAnalysisService.instance = new ObjectiveAnalysisService();
    }
    return ObjectiveAnalysisService.instance;
  }

  async analyzeObjectives(request: ObjectiveAnalysisRequest): Promise<ObjectiveAnalysisResult> {
    console.log('🎯 Starting comprehensive objective analysis...');
    
    try {
      // Call intelligent objective analysis edge function
      const { data, error } = await supabase.functions.invoke('intelligent-objective-analyzer', {
        body: {
          ...request,
          timestamp: new Date().toISOString()
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.success) {
        console.log('✅ Objective analysis completed successfully');
        return data.analysis;
      } else {
        throw new Error(data.error || 'Analysis failed');
      }

    } catch (error) {
      console.error('💥 Objective analysis failed:', error);
      
      // Fallback analysis
      return this.createFallbackAnalysis(request);
    }
  }

  async generateDynamicQuestions(
    analysisId: string, 
    previousAnswers: Record<string, any>
  ): Promise<DynamicQuestion[]> {
    console.log('❓ Generating dynamic follow-up questions...');
    
    try {
      const { data, error } = await supabase.functions.invoke('dynamic-question-generator', {
        body: {
          analysisId,
          previousAnswers,
          timestamp: new Date().toISOString()
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      return data.questions || [];

    } catch (error) {
      console.error('💥 Dynamic question generation failed:', error);
      return this.createFallbackQuestions();
    }
  }

  async refineFunnelSuggestions(
    analysisId: string,
    dynamicAnswers: Record<string, any>
  ): Promise<FunnelTypeSuggestion[]> {
    console.log('🔄 Refining funnel suggestions based on additional data...');
    
    try {
      const { data, error } = await supabase.functions.invoke('funnel-suggestion-refiner', {
        body: {
          analysisId,
          dynamicAnswers,
          timestamp: new Date().toISOString()
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      return data.refinedSuggestions || [];

    } catch (error) {
      console.error('💥 Funnel suggestion refinement failed:', error);
      return this.createFallbackSuggestions();
    }
  }

  private createFallbackAnalysis(request: ObjectiveAnalysisRequest): ObjectiveAnalysisResult {
    console.log('🔄 Creating fallback analysis...');
    
    const fallbackQuestions: DynamicQuestion[] = [
      {
        id: 'current_marketing_channels',
        question: 'Quali canali di marketing stai utilizzando attualmente?',
        type: 'multiselect',
        options: [
          'Social Media Advertising',
          'Email Marketing',
          'SEO/Content Marketing',
          'Google Ads',
          'Influencer Marketing',
          'Referral Programs',
          'Events/Webinar',
          'Direct Mail'
        ],
        required: true,
        reasoning: 'Per comprendere il tuo mix marketing attuale e identificare gap'
      },
      {
        id: 'main_conversion_challenge',
        question: 'Qual è la principale sfida nella conversione dei tuoi prospect?',
        type: 'select',
        options: [
          'Generare lead qualificati',
          'Convertire visitor in lead',
          'Convertire lead in clienti',
          'Aumentare il valore medio ordine',
          'Ridurre il churn rate',
          'Accelerare il ciclo di vendita'
        ],
        required: true,
        reasoning: 'Per focalizzare la strategia del funnel sul punto critico'
      },
      {
        id: 'competitive_advantage',
        question: 'Cosa ti differenzia principalmente dalla concorrenza?',
        type: 'textarea',
        placeholder: 'Descrivi la tua unique value proposition, vantaggi competitivi, punti di forza unici...',
        required: true,
        reasoning: 'Per creare messaging e positioning differenziante nel funnel'
      },
      {
        id: 'customer_pain_points',
        question: 'Quali sono i principali pain point dei tuoi clienti?',
        type: 'multiselect',
        options: [
          'Mancanza di tempo',
          'Costi troppo elevati',
          'Complessità delle soluzioni',
          'Mancanza di risultati',
          'Difficoltà di implementazione',
          'Supporto insufficiente',
          'Scarsa personalizzazione',
          'Integrazione con sistemi esistenti'
        ],
        required: true,
        reasoning: 'Per costruire messaging che risuoni con i problemi reali'
      }
    ];

    const fallbackSuggestions: FunnelTypeSuggestion[] = [
      {
        id: 'lead_magnet_advanced',
        name: 'Lead Magnet Funnel Avanzato',
        description: 'Cattura lead con contenuto di alto valore, segmenta automaticamente e nutri con sequence personalizzate',
        matchScore: 88,
        expectedConversion: 15,
        complexity: 'Media',
        benefits: [
          'Segmentazione automatica dei lead',
          'Nurturing personalizzato',
          'Costruzione authority',
          'Database qualificato'
        ],
        reasoning: 'Ideale per business che puntano a costruire relazioni a lungo termine',
        estimatedROI: 250,
        recommendedBudget: request.budget
      },
      {
        id: 'tripwire_conversion',
        name: 'Tripwire Conversion Funnel',
        description: 'Offerta irresistibile a basso prezzo per identificare buyer e creare momentum d\'acquisto',
        matchScore: 82,
        expectedConversion: 8,
        complexity: 'Bassa',
        benefits: [
          'Qualifica buyer reali',
          'ROI immediato',
          'Momentum d\'acquisto',
          'Upsell naturale'
        ],
        reasoning: 'Perfetto per validare interesse d\'acquisto e generare cash flow',
        estimatedROI: 180,
        recommendedBudget: request.budget
      },
      {
        id: 'webinar_authority',
        name: 'Webinar Authority Funnel',
        description: 'Educational webinar che dimostra expertise e converte attraverso social proof e scarsità',
        matchScore: 85,
        expectedConversion: 12,
        complexity: 'Alta',
        benefits: [
          'Costruzione di authority',
          'Alto valore percepito',
          'Interazione diretta',
          'Conversioni premium'
        ],
        reasoning: 'Efficace per prodotti/servizi ad alto valore che richiedono educazione',
        estimatedROI: 320,
        recommendedBudget: request.budget
      }
    ];

    return {
      analysisId: `fallback_${Date.now()}`,
      intelligenceScore: 75,
      dynamicQuestions: fallbackQuestions,
      suggestedFunnelTypes: fallbackSuggestions,
      competitiveInsights: {
        competitors: ['Competitor A', 'Competitor B'],
        marketGaps: ['Personalizzazione insufficiente', 'Supporto post-vendita carente'],
        differentiationOpportunities: ['Focus sulla customer experience', 'Automazione intelligente']
      },
      marketTrends: {
        trendingTopics: ['AI Personalization', 'Mobile-First Experience'],
        seasonalFactors: ['Q4 high intent', 'January fresh starts'],
        urgencyIndicators: ['Market saturation increasing', 'Customer acquisition costs rising']
      },
      personalizedRecommendations: [
        'Implementa segmentazione comportamentale',
        'Testa messaggi basati sui pain point specifici',
        'Sviluppa contenuti educational per nurturing',
        'Ottimizza per mobile experience'
      ],
      nextSteps: [
        'Definire KPI specifici per ogni step del funnel',
        'Implementare tracking avanzato',
        'Preparare contenuti per test A/B',
        'Setup automazioni email'
      ]
    };
  }

  private createFallbackQuestions(): DynamicQuestion[] {
    return [
      {
        id: 'fallback_channel_preference',
        question: 'Quale canale preferisci per raggiungere i tuoi clienti?',
        type: 'select',
        options: ['Email', 'Social Media', 'Telefono', 'Chat'],
        required: true,
        reasoning: 'Per ottimizzare il touchpoint principale'
      }
    ];
  }

  private createFallbackSuggestions(): FunnelTypeSuggestion[] {
    return [
      {
        id: 'generic_funnel',
        name: 'Funnel Generico',
        description: 'Funnel standard per lead generation',
        matchScore: 70,
        expectedConversion: 10,
        complexity: 'Media',
        benefits: ['Versatile', 'Testato'],
        reasoning: 'Opzione di fallback',
        estimatedROI: 150,
        recommendedBudget: '1000-5000'
      }
    ];
  }

  // Analytics and tracking methods
  async trackAnalysisEvent(analysisId: string, eventType: string, data: any) {
    try {
      await supabase.from('objective_analysis_events').insert({
        analysis_id: analysisId,
        event_type: eventType,
        event_data: data,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to track analysis event:', error);
    }
  }

  async getAnalysisHistory(userId: string, limit: number = 10) {
    try {
      const { data, error } = await supabase
        .from('objective_analyses')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to get analysis history:', error);
      return [];
    }
  }
}

export const objectiveAnalysisService = ObjectiveAnalysisService.getInstance();
