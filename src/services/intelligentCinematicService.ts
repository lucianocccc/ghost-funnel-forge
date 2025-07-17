
// Intelligent Cinematic Funnel Service - Core Intelligence Engine

import { supabase } from '@/integrations/supabase/client';

export interface ProductContext {
  name: string;
  description?: string;
  industry?: string;
  targetAudience?: string;
  visualStyle?: 'minimal' | 'dynamic' | 'elegant' | 'technical';
  brandColors?: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

export interface CinematicScene {
  id: string;
  type: 'hero' | 'benefits' | 'social_proof' | 'demo' | 'conversion';
  title: string;
  content: any;
  cinematicElements: {
    background: string;
    parallaxLayers: Array<{
      element: string;
      speed: number;
      opacity: number;
      scale: number;
    }>;
    particles?: {
      type: 'floating' | 'glow' | 'geometric';
      density: number;
      color: string;
    };
    lighting: {
      ambient: string;
      spotlight: string;
      shadows: boolean;
    };
  };
  transitions: {
    in: 'fade' | 'slide' | 'zoom' | 'morph';
    out: 'fade' | 'slide' | 'zoom' | 'morph';
    duration: number;
  };
  adaptiveRules: {
    industryModifiers: Record<string, any>;
    audienceModifiers: Record<string, any>;
    performanceOptimizations: string[];
  };
}

export interface IntelligentCinematicFunnel {
  id: string;
  productContext: ProductContext;
  scenes: CinematicScene[];
  globalTheme: {
    colorScheme: string;
    typography: string;
    spacing: string;
    animations: string;
  };
  adaptiveSettings: {
    deviceOptimizations: Record<string, any>;
    performanceMode: 'high' | 'medium' | 'low';
    accessibilityMode: boolean;
    reducedMotion: boolean;
  };
  analyticsConfig: {
    trackingEvents: string[];
    heatmapEnabled: boolean;
    conversionGoals: string[];
  };
}

export class IntelligentCinematicService {
  static async generateAdaptiveFunnel(productContext: ProductContext): Promise<IntelligentCinematicFunnel> {
    console.log('🎬 Generating intelligent cinematic funnel for:', productContext.name);
    
    try {
      // Call AI edge function to generate adaptive funnel
      const { data, error } = await supabase.functions.invoke('generate-intelligent-cinematic-funnel', {
        body: {
          productContext,
          timestamp: Date.now()
        }
      });

      if (error) {
        console.error('❌ Error generating cinematic funnel:', error);
        throw error;
      }

      if (data?.success) {
        console.log('✅ Intelligent cinematic funnel generated successfully');
        return data.funnelData;
      } else {
        throw new Error(data?.error || 'Failed to generate intelligent cinematic funnel');
      }
    } catch (error) {
      console.error('❌ Service error:', error);
      // Fallback to default cinematic funnel
      return this.createDefaultCinematicFunnel(productContext);
    }
  }

  private static createDefaultCinematicFunnel(productContext: ProductContext): IntelligentCinematicFunnel {
    const colorScheme = this.adaptColorSchemeToIndustry(productContext.industry || 'general');
    
    return {
      id: crypto.randomUUID(),
      productContext,
      globalTheme: {
        colorScheme,
        typography: this.adaptTypographyToStyle(productContext.visualStyle || 'dynamic'),
        spacing: 'modern',
        animations: 'smooth'
      },
      adaptiveSettings: {
        deviceOptimizations: {
          mobile: { reducedParticles: true, simplifiedAnimations: true },
          tablet: { optimizedTransitions: true },
          desktop: { fullEffects: true }
        },
        performanceMode: 'high',
        accessibilityMode: false,
        reducedMotion: false
      },
      analyticsConfig: {
        trackingEvents: ['scene_view', 'interaction', 'conversion'],
        heatmapEnabled: true,
        conversionGoals: ['lead_capture', 'demo_request', 'purchase']
      },
      scenes: this.generateAdaptiveScenes(productContext, colorScheme)
    };
  }

  private static adaptColorSchemeToIndustry(industry: string): string {
    const industryColorSchemes: Record<string, string> = {
      'technology': 'blue-purple-gradient',
      'healthcare': 'green-blue-gradient',
      'finance': 'dark-blue-gold',
      'education': 'purple-orange-gradient',
      'retail': 'pink-purple-gradient',
      'real-estate': 'earth-tones',
      'consulting': 'professional-blue',
      'general': 'dynamic-gradient'
    };
    
    return industryColorSchemes[industry] || industryColorSchemes.general;
  }

  private static adaptTypographyToStyle(visualStyle: string): string {
    const typographyMappings: Record<string, string> = {
      'minimal': 'clean-modern',
      'dynamic': 'bold-contemporary',
      'elegant': 'refined-serif',
      'technical': 'mono-precision'
    };
    
    return typographyMappings[visualStyle] || typographyMappings.dynamic;
  }

  private static generateAdaptiveScenes(productContext: ProductContext, colorScheme: string): CinematicScene[] {
    const baseScenes: Partial<CinematicScene>[] = [
      {
        type: 'hero',
        title: `Scopri ${productContext.name}`,
        content: {
          headline: `${productContext.name} - Innovazione che Trasforma`,
          subheadline: productContext.description || 'Scopri una nuova dimensione di possibilità',
          ctaText: 'Inizia il Viaggio'
        }
      },
      {
        type: 'benefits',
        title: 'Vantaggi Rivoluzionari',
        content: {
          benefits: this.generateAdaptiveBenefits(productContext)
        }
      },
      {
        type: 'social_proof',
        title: 'Testimonianze',
        content: {
          testimonials: this.generateAdaptiveTestimonials(productContext)
        }
      },
      {
        type: 'conversion',
        title: 'Trasforma il Tuo Futuro',
        content: {
          headline: 'Pronto per il Cambiamento?',
          form: this.generateAdaptiveForm(productContext)
        }
      }
    ];

    return baseScenes.map((scene, index) => ({
      id: crypto.randomUUID(),
      ...scene,
      cinematicElements: this.generateCinematicElements(scene.type!, colorScheme, productContext),
      transitions: this.generateAdaptiveTransitions(index, baseScenes.length),
      adaptiveRules: this.generateAdaptiveRules(productContext, scene.type!)
    })) as CinematicScene[];
  }

  private static generateCinematicElements(sceneType: string, colorScheme: string, productContext: ProductContext) {
    const baseElements = {
      background: `cinematic-${sceneType}-${colorScheme}`,
      parallaxLayers: [
        { element: '✨', speed: 0.5, opacity: 0.6, scale: 1.2 },
        { element: '🌟', speed: 0.8, opacity: 0.4, scale: 1.0 },
        { element: '💫', speed: 1.2, opacity: 0.3, scale: 0.8 }
      ],
      particles: {
        type: 'floating' as const,
        density: productContext.visualStyle === 'minimal' ? 20 : 50,
        color: 'rgba(255, 255, 255, 0.1)'
      },
      lighting: {
        ambient: 'soft-glow',
        spotlight: 'dynamic-focus',
        shadows: true
      }
    };

    // Adapt based on industry
    if (productContext.industry === 'technology') {
      baseElements.parallaxLayers = [
        { element: '⚡', speed: 0.6, opacity: 0.7, scale: 1.1 },
        { element: '🔮', speed: 0.9, opacity: 0.5, scale: 1.0 },
        { element: '💎', speed: 1.1, opacity: 0.4, scale: 0.9 }
      ];
    } else if (productContext.industry === 'healthcare') {
      baseElements.parallaxLayers = [
        { element: '🌿', speed: 0.4, opacity: 0.6, scale: 1.3 },
        { element: '💚', speed: 0.7, opacity: 0.5, scale: 1.0 },
        { element: '🌱', speed: 1.0, opacity: 0.4, scale: 0.8 }
      ];
    }

    return baseElements;
  }

  private static generateAdaptiveTransitions(index: number, total: number) {
    const transitionTypes: Array<'fade' | 'slide' | 'zoom' | 'morph'> = ['fade', 'slide', 'zoom', 'morph'];
    
    return {
      in: transitionTypes[index % transitionTypes.length],
      out: transitionTypes[(index + 1) % transitionTypes.length],
      duration: 800 + (index * 100) // Progressive timing
    };
  }

  private static generateAdaptiveRules(productContext: ProductContext, sceneType: string) {
    return {
      industryModifiers: {
        technology: { increaseAnimationSpeed: 1.2, addTechElements: true },
        healthcare: { softerTransitions: true, trustIndicators: true },
        finance: { professionalTone: true, securityBadges: true }
      },
      audienceModifiers: {
        young: { vibrantColors: true, fastPaced: true },
        professional: { cleanDesign: true, dataFocus: true },
        senior: { largerText: true, simpleNavigation: true }
      },
      performanceOptimizations: [
        'lazyLoadImages',
        'preloadCriticalAssets',
        'optimizeAnimations',
        'intelligentCaching'
      ]
    };
  }

  private static generateAdaptiveBenefits(productContext: ProductContext) {
    const baseBenefits = [
      {
        title: 'Innovazione Avanzata',
        description: 'Tecnologie all\'avanguardia per risultati superiori',
        icon: '🚀',
        animation: 'slideInFromLeft'
      },
      {
        title: 'Risultati Garantiti',
        description: 'Performance measurabili e ROI comprovato',
        icon: '📈',
        animation: 'slideInFromRight'
      },
      {
        title: 'Supporto Completo',
        description: 'Assistenza dedicata in ogni fase del percorso',
        icon: '🤝',
        animation: 'fadeInUp'
      }
    ];

    // Adapt based on industry
    if (productContext.industry === 'technology') {
      baseBenefits[0].title = 'AI-Powered Innovation';
      baseBenefits[0].icon = '🤖';
    } else if (productContext.industry === 'healthcare') {
      baseBenefits[0].title = 'Soluzioni per il Benessere';
      baseBenefits[0].icon = '💚';
    }

    return baseBenefits;
  }

  private static generateAdaptiveTestimonials(productContext: ProductContext) {
    return [
      {
        name: 'Marco Rossi',
        role: 'CEO, Innovazione S.r.l.',
        text: `${productContext.name} ha trasformato completamente il nostro business. Risultati incredibili in tempi record.`,
        rating: 5,
        animation: 'slideInFromBottom'
      },
      {
        name: 'Laura Bianchi',
        role: 'Marketing Director',
        text: 'La qualità e l\'efficacia sono superiori a qualsiasi altra soluzione che abbiamo testato.',
        rating: 5,
        animation: 'fadeInScale'
      }
    ];
  }

  private static generateAdaptiveForm(productContext: ProductContext) {
    const baseForm = {
      title: 'Inizia la Tua Trasformazione',
      fields: [
        { name: 'name', label: 'Nome', type: 'text', required: true },
        { name: 'email', label: 'Email', type: 'email', required: true },
        { name: 'company', label: 'Azienda', type: 'text', required: false }
      ],
      submitText: 'Trasforma il Tuo Business',
      incentive: '🎁 Analisi gratuita inclusa'
    };

    // Adapt based on industry
    if (productContext.industry === 'technology') {
      baseForm.fields.push({
        name: 'tech_interest',
        label: 'Area di Interesse Tecnologico',
        type: 'select',
        required: false
      });
    }

    return baseForm;
  }

  static async optimizeForDevice(funnel: IntelligentCinematicFunnel, deviceType: string): Promise<IntelligentCinematicFunnel> {
    const optimizedFunnel = { ...funnel };
    
    if (deviceType === 'mobile') {
      // Reduce particle density and simplify animations for mobile
      optimizedFunnel.scenes = optimizedFunnel.scenes.map(scene => ({
        ...scene,
        cinematicElements: {
          ...scene.cinematicElements,
          particles: {
            ...scene.cinematicElements.particles!,
            density: Math.floor(scene.cinematicElements.particles!.density / 2)
          },
          parallaxLayers: scene.cinematicElements.parallaxLayers.slice(0, 2) // Reduce layers
        },
        transitions: {
          ...scene.transitions,
          duration: scene.transitions.duration * 0.8 // Faster transitions
        }
      }));
    }
    
    return optimizedFunnel;
  }

  static async trackAnalytics(funnelId: string, event: string, data: any): Promise<void> {
    try {
      await supabase.functions.invoke('track-cinematic-analytics', {
        body: {
          funnelId,
          event,
          data,
          timestamp: Date.now()
        }
      });
    } catch (error) {
      console.warn('📊 Analytics tracking failed:', error);
    }
  }
}
