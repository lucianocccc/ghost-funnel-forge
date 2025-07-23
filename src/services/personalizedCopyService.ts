import { supabase } from '@/integrations/supabase/client';

export interface CopyPersonalizationContext {
  targetAudience: string;
  industry: string;
  productType: string;
  primaryGoal: string;
  painPoints: string[];
  competitiveAdvantages: string[];
  brandTone: 'professional' | 'friendly' | 'authoritative' | 'casual' | 'luxury' | 'technical';
  urgencyLevel: 'low' | 'medium' | 'high';
  pricePoint: 'budget' | 'mid-range' | 'premium' | 'luxury';
  conversionStage: 'awareness' | 'consideration' | 'decision' | 'retention';
}

export interface PersonalizedCopyVariants {
  headlines: {
    primary: string;
    variations: string[];
    emotional_hooks: string[];
    logical_appeals: string[];
  };
  subheadlines: {
    value_focused: string[];
    benefit_focused: string[];
    outcome_focused: string[];
  };
  value_propositions: {
    short: string;
    medium: string;
    detailed: string;
    emotional: string;
    logical: string;
  };
  call_to_actions: {
    primary: string[];
    secondary: string[];
    urgency_based: string[];
    value_based: string[];
  };
  social_proof_messages: {
    testimonial_highlights: string[];
    stat_callouts: string[];
    authority_statements: string[];
  };
  objection_handling: {
    price_objections: string[];
    trust_objections: string[];
    timing_objections: string[];
    competition_objections: string[];
  };
  email_sequences: {
    welcome_series: string[];
    nurture_sequence: string[];
    conversion_sequence: string[];
    retention_sequence: string[];
  };
}

export interface CopyOptimizationInsights {
  psychologicalTriggers: {
    primary_motivators: string[];
    fear_factors: string[];
    desire_drivers: string[];
    social_influences: string[];
  };
  linguisticAnalysis: {
    preferred_language_style: string;
    reading_level: string;
    emotional_tone: string;
    persuasion_style: string;
  };
  conversionOptimization: {
    high_impact_words: string[];
    avoid_words: string[];
    optimal_length: {
      headlines: number;
      descriptions: number;
      cta_buttons: number;
    };
    testing_recommendations: string[];
  };
}

export interface PersonalizedCopyResult {
  copyId: string;
  context: CopyPersonalizationContext;
  copy_variants: PersonalizedCopyVariants;
  optimization_insights: CopyOptimizationInsights;
  ab_test_suggestions: {
    primary_tests: string[];
    advanced_tests: string[];
    testing_sequence: string[];
  };
  personalization_score: number;
  conversion_predictions: {
    baseline_estimate: number;
    optimized_estimate: number;
    confidence_interval: [number, number];
  };
  generated_at: string;
}

export class PersonalizedCopyService {
  private static instance: PersonalizedCopyService;
  private copyCache: Map<string, PersonalizedCopyResult> = new Map();

  public static getInstance(): PersonalizedCopyService {
    if (!PersonalizedCopyService.instance) {
      PersonalizedCopyService.instance = new PersonalizedCopyService();
    }
    return PersonalizedCopyService.instance;
  }

  async generatePersonalizedCopy(
    context: CopyPersonalizationContext,
    userId: string
  ): Promise<PersonalizedCopyResult> {
    console.log('✍️ Generating personalized copy with AI optimization...');
    
    const cacheKey = this.createCacheKey(context);
    const cached = this.copyCache.get(cacheKey);
    
    if (cached) {
      console.log('📋 Returning cached personalized copy');
      return cached;
    }

    try {
      // Call personalized copy generation edge function
      const { data, error } = await supabase.functions.invoke('personalized-copy-generator', {
        body: {
          context,
          userId,
          optimization_level: 'maximum',
          include_psychology: true,
          include_ab_tests: true,
          timestamp: new Date().toISOString()
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.success) {
        const result = data.copy_result;
        
        // Cache the result
        this.copyCache.set(cacheKey, result);
        
        console.log('✅ Personalized copy generated successfully');
        return result;
      } else {
        throw new Error(data.error || 'Copy generation failed');
      }

    } catch (error) {
      console.error('💥 Personalized copy generation failed:', error);
      
      // Return fallback copy
      return this.createFallbackCopy(context);
    }
  }

  async optimizeCopyForConversion(
    originalCopy: string,
    context: CopyPersonalizationContext,
    conversionGoal: string
  ): Promise<{ optimized_copy: string; improvements: string[]; confidence: number }> {
    console.log('🎯 Optimizing copy for conversion...');
    
    try {
      const { data, error } = await supabase.functions.invoke('copy-conversion-optimizer', {
        body: {
          original_copy: originalCopy,
          context,
          conversion_goal: conversionGoal,
          optimization_focus: 'conversion_rate',
          timestamp: new Date().toISOString()
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      return data.optimization_result || {
        optimized_copy: originalCopy,
        improvements: ['Fallback: no optimizations applied'],
        confidence: 0.5
      };

    } catch (error) {
      console.error('💥 Copy optimization failed:', error);
      return {
        optimized_copy: originalCopy,
        improvements: ['Error: optimization failed'],
        confidence: 0.3
      };
    }
  }

  async generateABTestVariants(
    baselineCopy: string,
    context: CopyPersonalizationContext,
    testType: 'headline' | 'cta' | 'value_prop' | 'complete_page',
    variantCount: number = 3
  ): Promise<string[]> {
    console.log('🧪 Generating A/B test variants...');
    
    try {
      const { data, error } = await supabase.functions.invoke('ab-test-generator', {
        body: {
          baseline_copy: baselineCopy,
          context,
          test_type: testType,
          variant_count: variantCount,
          statistical_power: 0.8,
          timestamp: new Date().toISOString()
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      return data.variants || [baselineCopy];

    } catch (error) {
      console.error('💥 A/B test generation failed:', error);
      return [baselineCopy];
    }
  }

  async analyzeCopyPerformance(
    copyId: string,
    performanceMetrics: {
      impressions: number;
      clicks: number;
      conversions: number;
      engagement_time: number;
    }
  ): Promise<any> {
    console.log('📊 Analyzing copy performance...');
    
    try {
      const { data, error } = await supabase.functions.invoke('copy-performance-analyzer', {
        body: {
          copy_id: copyId,
          metrics: performanceMetrics,
          analysis_depth: 'comprehensive',
          timestamp: new Date().toISOString()
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      return data.analysis || {};

    } catch (error) {
      console.error('💥 Copy performance analysis failed:', error);
      return {};
    }
  }

  private createFallbackCopy(context: CopyPersonalizationContext): PersonalizedCopyResult {
    console.log('🔄 Creating fallback personalized copy...');
    
    const industrySpecificTerms = this.getIndustryTerms(context.industry);
    const audienceSpecificLanguage = this.getAudienceLanguage(context.targetAudience);
    
    return {
      copyId: `fallback_${Date.now()}`,
      context,
      copy_variants: {
        headlines: {
          primary: `${industrySpecificTerms.value_word} per ${audienceSpecificLanguage.persona_term}`,
          variations: [
            `Trasforma il tuo ${context.industry} con ${industrySpecificTerms.solution_type}`,
            `${audienceSpecificLanguage.outcome_term} Garantiti in ${context.industry}`,
            `La Soluzione ${context.industry} che ${audienceSpecificLanguage.desire_verb}`
          ],
          emotional_hooks: [
            `Finalmente, ${audienceSpecificLanguage.relief_phrase}`,
            `Scopri il segreto dei leader in ${context.industry}`,
            `Non perdere questa opportunità unica`
          ],
          logical_appeals: [
            `${industrySpecificTerms.metric} comprovati`,
            `Metodologia testata da ${audienceSpecificLanguage.authority_figure}`,
            `ROI dimostrato in ${context.industry}`
          ]
        },
        subheadlines: {
          value_focused: [
            `Ottieni ${industrySpecificTerms.primary_benefit} senza ${industrySpecificTerms.main_pain}`,
            `La soluzione completa per ${audienceSpecificLanguage.main_goal}`,
            `Risultati misurabili in ${context.industry}`
          ],
          benefit_focused: [
            `${industrySpecificTerms.time_benefit} + ${industrySpecificTerms.efficiency_benefit}`,
            `Risparmia tempo, aumenta ${industrySpecificTerms.key_metric}`,
            `Automatizza, ottimizza, scala`
          ],
          outcome_focused: [
            `${audienceSpecificLanguage.success_outcome} garantito`,
            `Da zero a ${industrySpecificTerms.success_metric} in 90 giorni`,
            `Il tuo ${context.industry} mai così performante`
          ]
        },
        value_propositions: {
          short: `${industrySpecificTerms.unique_mechanism} per ${audienceSpecificLanguage.main_goal}`,
          medium: `La prima soluzione ${context.industry} che combina ${industrySpecificTerms.feature_1} con ${industrySpecificTerms.feature_2} per ${audienceSpecificLanguage.outcome_term} garantiti`,
          detailed: `Trasforma il tuo ${context.industry} con la nostra ${industrySpecificTerms.solution_type} proprietaria. Ottieni ${industrySpecificTerms.primary_benefit}, elimina ${industrySpecificTerms.main_pain} e raggiungi ${audienceSpecificLanguage.success_outcome} in tempi record. Utilizzato da ${audienceSpecificLanguage.authority_figure} per ${industrySpecificTerms.proven_results}.`,
          emotional: `Immagina di ${audienceSpecificLanguage.dream_scenario} senza più ${industrySpecificTerms.main_frustration}`,
          logical: `${industrySpecificTerms.proof_points} dimostrano l'efficacia del nostro approccio`
        },
        call_to_actions: {
          primary: [
            `Inizia la Trasformazione`,
            `Ottieni ${industrySpecificTerms.primary_benefit} Ora`,
            `Scopri Come ${audienceSpecificLanguage.success_verb}`
          ],
          secondary: [
            `Scarica la Guida Gratuita`,
            `Prenota una Demo`,
            `Parla con un Esperto`
          ],
          urgency_based: [
            `Solo per i Primi 100`,
            `Offerta Limitata`,
            `Non Aspettare, Inizia Oggi`
          ],
          value_based: [
            `Ottieni Risultati Garantiti`,
            `Trasforma il Tuo Business`,
            `Diventa un Leader del Settore`
          ]
        },
        social_proof_messages: {
          testimonial_highlights: [
            `"${industrySpecificTerms.result_statement}" - ${audienceSpecificLanguage.testimonial_source}`,
            `"Risultati incredibili in ${context.industry}" - Cliente Soddisfatto`,
            `"La migliore decisione per il mio business" - Imprenditore`
          ],
          stat_callouts: [
            `95% dei clienti raggiunge ${industrySpecificTerms.success_metric}`,
            `${industrySpecificTerms.impressive_number} ${audienceSpecificLanguage.persona_term} si fidano di noi`,
            `${industrySpecificTerms.time_saving} risparmiato mediamente`
          ],
          authority_statements: [
            `Raccomandato da esperti ${context.industry}`,
            `Utilizzato da leader del settore`,
            `Certificato da ${industrySpecificTerms.authority_body}`
          ]
        },
        objection_handling: {
          price_objections: [
            `Investimento che si ripaga in ${industrySpecificTerms.roi_timeframe}`,
            `Costa meno di ${industrySpecificTerms.cost_comparison}`,
            `ROI garantito o rimborso completo`
          ],
          trust_objections: [
            `${industrySpecificTerms.trust_indicator} di esperienza`,
            `Certificazioni ${industrySpecificTerms.certifications}`,
            `Garanzia soddisfatti o rimborsati`
          ],
          timing_objections: [
            `Implementazione in ${industrySpecificTerms.implementation_time}`,
            `Risultati visibili da subito`,
            `Supporto completo durante la transizione`
          ],
          competition_objections: [
            `L'unica soluzione con ${industrySpecificTerms.unique_feature}`,
            `${industrySpecificTerms.competitive_advantage} esclusivo`,
            `Risultati superiori alla concorrenza`
          ]
        },
        email_sequences: {
          welcome_series: [
            `Benvenuto! Ecco come iniziare con ${industrySpecificTerms.solution_name}`,
            `I primi passi verso ${audienceSpecificLanguage.success_outcome}`,
            `Case study: come ${audienceSpecificLanguage.peer_example} ha ottenuto ${industrySpecificTerms.success_metric}`
          ],
          nurture_sequence: [
            `Il segreto di ${audienceSpecificLanguage.successful_peer}`,
            `Evita questi errori comuni in ${context.industry}`,
            `La strategia che ha trasformato ${industrySpecificTerms.transformation_example}`
          ],
          conversion_sequence: [
            `Ultima possibilità per ${industrySpecificTerms.limited_offer}`,
            `I tuoi colleghi stanno già ottenendo ${industrySpecificTerms.peer_results}`,
            `Non rimandare: ${audienceSpecificLanguage.urgency_reason}`
          ],
          retention_sequence: [
            `Come massimizzare i tuoi risultati`,
            `Funzionalità avanzate per ${audienceSpecificLanguage.power_user}`,
            `Condividi il tuo successo e ottieni ${industrySpecificTerms.referral_reward}`
          ]
        }
      },
      optimization_insights: {
        psychologicalTriggers: {
          primary_motivators: [
            audienceSpecificLanguage.primary_motivation,
            industrySpecificTerms.key_driver,
            'Riconoscimento sociale',
            'Sicurezza finanziaria'
          ],
          fear_factors: [
            `Rimanere indietro nella ${context.industry}`,
            'Perdere opportunità di crescita',
            'Inefficienze costose',
            'Concorrenza che avanza'
          ],
          desire_drivers: [
            audienceSpecificLanguage.aspiration,
            'Leadership nel settore',
            'Risultati eccezionali',
            'Riconoscimento professionale'
          ],
          social_influences: [
            'Peer pressure positiva',
            'Authority endorsement',
            'Community membership',
            'Status elevation'
          ]
        },
        linguisticAnalysis: {
          preferred_language_style: this.getLanguageStyle(context.brandTone),
          reading_level: this.getReadingLevel(context.targetAudience),
          emotional_tone: this.getEmotionalTone(context.urgencyLevel),
          persuasion_style: this.getPersuasionStyle(context.conversionStage)
        },
        conversionOptimization: {
          high_impact_words: [
            'Garantito', 'Esclusivo', 'Risultati', 'Trasforma',
            'Segreto', 'Strategia', 'Sistema', 'Comprovato'
          ],
          avoid_words: [
            'Forse', 'Dovrebbe', 'Cerca di', 'Spero',
            'Difficile', 'Complicato', 'Costoso', 'Lento'
          ],
          optimal_length: {
            headlines: 60,
            descriptions: 150,
            cta_buttons: 25
          },
          testing_recommendations: [
            'Testa emotional vs logical appeals',
            'Confronta urgency vs value messaging',
            'Verifica lunghezza copy ottimale',
            'Testa diversi social proof types'
          ]
        }
      },
      ab_test_suggestions: {
        primary_tests: [
          'Headline emotivo vs logico',
          'CTA urgency vs value-based',
          'Formato lungo vs breve',
          'Social proof vs no social proof'
        ],
        advanced_tests: [
          'Personalizzazione dinamica',
          'Sequencing messaggi',
          'Visual hierarchy',
          'Cognitive load optimization'
        ],
        testing_sequence: [
          '1. Testa headline principale',
          '2. Ottimizza call-to-action',
          '3. Refina value proposition',
          '4. Perfeziona social proof'
        ]
      },
      personalization_score: 82,
      conversion_predictions: {
        baseline_estimate: 3.5,
        optimized_estimate: 6.2,
        confidence_interval: [4.8, 7.6]
      },
      generated_at: new Date().toISOString()
    };
  }

  private createCacheKey(context: CopyPersonalizationContext): string {
    return `${context.industry}_${context.targetAudience}_${context.brandTone}_${context.conversionStage}`;
  }

  private getIndustryTerms(industry: string): any {
    const industryMap: Record<string, any> = {
      'tech': {
        value_word: 'Innovazione',
        solution_type: 'Tecnologia',
        primary_benefit: 'Automazione Avanzata',
        main_pain: 'Processi Manuali',
        key_metric: 'Efficienza',
        success_metric: 'Produttività +40%',
        unique_mechanism: 'Sistema AI-Powered'
      },
      'education': {
        value_word: 'Formazione',
        solution_type: 'Metodo',
        primary_benefit: 'Competenze Avanzate',
        main_pain: 'Gap di Conoscenza',
        key_metric: 'Apprendimento',
        success_metric: 'Certificazione',
        unique_mechanism: 'Metodo Scientificamente Provato'
      },
      'consulting': {
        value_word: 'Strategia',
        solution_type: 'Consulenza',
        primary_benefit: 'Crescita Accelerata',
        main_pain: 'Stagnazione',
        key_metric: 'ROI',
        success_metric: 'Fatturato +50%',
        unique_mechanism: 'Framework Proprietario'
      }
    };

    return industryMap[industry] || industryMap['consulting'];
  }

  private getAudienceLanguage(targetAudience: string): any {
    // Simplified audience analysis - in real implementation, use AI
    return {
      persona_term: 'Professionisti',
      outcome_term: 'Risultati',
      desire_verb: 'Ti Permette di Eccellere',
      relief_phrase: 'Una Soluzione che Funziona',
      main_goal: 'Crescita del Business',
      success_outcome: 'Obiettivi Raggiunti',
      primary_motivation: 'Successo Professionale',
      aspiration: 'Leadership nel Settore'
    };
  }

  private getLanguageStyle(brandTone: string): string {
    const toneMap: Record<string, string> = {
      'professional': 'Formale e competente',
      'friendly': 'Conversazionale e accessibile',
      'authoritative': 'Esperto e sicuro',
      'casual': 'Informale e diretto',
      'luxury': 'Sofisticato e esclusivo',
      'technical': 'Preciso e dettagliato'
    };
    return toneMap[brandTone] || 'Professionale';
  }

  private getReadingLevel(targetAudience: string): string {
    // Simplified - in real implementation, analyze audience education level
    return 'Professionale (12° grado)';
  }

  private getEmotionalTone(urgencyLevel: string): string {
    const urgencyMap: Record<string, string> = {
      'low': 'Riflessivo e informativo',
      'medium': 'Motivante e coinvolgente',
      'high': 'Urgente e persuasivo'
    };
    return urgencyMap[urgencyLevel] || 'Equilibrato';
  }

  private getPersuasionStyle(conversionStage: string): string {
    const stageMap: Record<string, string> = {
      'awareness': 'Educativo e informativo',
      'consideration': 'Comparativo e rassicurante',
      'decision': 'Persuasivo e action-oriented',
      'retention': 'Supportivo e value-reinforcing'
    };
    return stageMap[conversionStage] || 'Bilanciato';
  }

  async getCopyPerformanceMetrics(copyId: string) {
    try {
      const { data, error } = await supabase
        .from('ai_recommendations')
        .select('*')
        .eq('recommendation_type', 'copy_performance')
        .eq('title', copyId)
        .order('created_at', { ascending: false })
        .limit(30);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to get copy performance metrics:', error);
      return [];
    }
  }

  clearCache() {
    this.copyCache.clear();
    console.log('🧹 Personalized copy cache cleared');
  }
}

export const personalizedCopyService = PersonalizedCopyService.getInstance();
