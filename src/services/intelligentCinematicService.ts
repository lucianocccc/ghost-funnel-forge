// Intelligent Cinematic Funnel Service - Core Intelligence Engine (Updated)

import { supabase } from '@/integrations/supabase/client';
import { AdaptiveStepGenerator, UserBehaviorProfile, DynamicStep, ProductContext as AdaptiveProductContext } from './adaptiveStepGenerator';

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
  pricePoint?: 'budget' | 'mid' | 'premium';
  complexity?: 'simple' | 'moderate' | 'complex';
  keyBenefits?: string[];
  uniqueSellingPoints?: string[];
}

export interface CinematicScene {
  id: string;
  type: 'hero' | 'benefits' | 'social_proof' | 'demo' | 'conversion' | 'hook' | 'interest' | 'problem' | 'solution' | 'urgency' | 'capture' | 'qualify';
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
    triggerConditions: string[];
    personalizedContent: Record<string, any>;
    nextStepLogic: (userResponse: any) => string;
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
  userProfile?: UserBehaviorProfile;
  dynamicSteps?: DynamicStep[];
}

export class IntelligentCinematicService {
  static async generateAdaptiveFunnel(
    productContext: ProductContext, 
    existingInteractions: any[] = []
  ): Promise<IntelligentCinematicFunnel> {
    console.log('🎬 Generating intelligent adaptive funnel for:', productContext.name);
    
    try {
      // Prima genera il profilo utente dalle interazioni esistenti
      const userProfile = AdaptiveStepGenerator.generateUserProfile(existingInteractions);
      console.log('👤 User profile generated:', userProfile);

      // Arricchisci il contesto del prodotto con dati mancanti
      const enrichedProductContext = this.enrichProductContext(productContext);
      
      // Converti il ProductContext per l'AdaptiveStepGenerator
      const adaptiveProductContext = this.convertToAdaptiveProductContext(enrichedProductContext);
      
      // Genera step dinamici basati su prodotto e utente
      const dynamicSteps = AdaptiveStepGenerator.generateAdaptiveSteps(
        adaptiveProductContext, 
        userProfile
      );
      console.log('🎯 Generated', dynamicSteps.length, 'adaptive steps');

      // Converti gli step dinamici in scene cinematiche
      const cinematicScenes = this.convertStepsToScenes(dynamicSteps, enrichedProductContext, userProfile);
      console.log('🎥 Converted to', cinematicScenes.length, 'cinematic scenes');

      // Crea il funnel cinematico completo
      const intelligentFunnel: IntelligentCinematicFunnel = {
        id: crypto.randomUUID(),
        productContext: enrichedProductContext,
        scenes: cinematicScenes,
        globalTheme: this.generateAdaptiveTheme(enrichedProductContext, userProfile),
        adaptiveSettings: this.generateAdaptiveSettings(userProfile),
        analyticsConfig: {
          trackingEvents: ['scene_view', 'interaction', 'conversion', 'user_behavior'],
          heatmapEnabled: true,
          conversionGoals: ['lead_capture', 'demo_request', 'purchase']
        },
        userProfile,
        dynamicSteps
      };

      console.log('✅ Adaptive cinematic funnel generated successfully');
      return intelligentFunnel;

    } catch (error) {
      console.error('❌ Service error:', error);
      // Fallback con step minimi ma comunque personalizzati
      return this.createMinimalAdaptiveFunnel(productContext);
    }
  }

  private static enrichProductContext(context: ProductContext): ProductContext {
    return {
      ...context,
      keyBenefits: context.keyBenefits || [
        'Risparmia tempo prezioso',
        'Aumenta l\'efficienza',
        'Riduci i costi operativi',
        'Migliora i risultati'
      ],
      uniqueSellingPoints: context.uniqueSellingPoints || [
        'Soluzione innovativa',
        'Risultati comprovati',
        'Supporto dedicato'
      ],
      pricePoint: context.pricePoint || 'mid',
      complexity: context.complexity || 'moderate'
    };
  }

  private static convertToAdaptiveProductContext(context: ProductContext): AdaptiveProductContext {
    return {
      name: context.name,
      description: context.description,
      industry: context.industry,
      targetAudience: context.targetAudience,
      pricePoint: context.pricePoint,
      complexity: context.complexity,
      keyBenefits: context.keyBenefits || [],
      uniqueSellingPoints: context.uniqueSellingPoints || []
    };
  }

  private static convertStepsToScenes(
    steps: DynamicStep[], 
    product: ProductContext, 
    user: UserBehaviorProfile
  ): CinematicScene[] {
    return steps.map((step, index) => ({
      id: step.id,
      type: step.type as CinematicScene['type'],
      title: step.title,
      content: this.enhanceContentForCinematic(step.content, product, user),
      cinematicElements: this.generateCinematicElements(step.type, product, user),
      transitions: this.generateAdaptiveTransitions(index, steps.length, user),
      adaptiveRules: {
        ...step.adaptiveLogic,
        industryModifiers: this.getIndustryModifiers(product.industry || 'general'),
        audienceModifiers: this.getAudienceModifiers(user),
        performanceOptimizations: this.getPerformanceOptimizations(user)
      }
    }));
  }

  private static enhanceContentForCinematic(content: any, product: ProductContext, user: UserBehaviorProfile): any {
    return {
      ...content,
      cinematicEnhancements: {
        parallaxText: user.deviceType !== 'mobile',
        particleEffects: user.engagementLevel === 'high',
        soundEffects: false, // Può essere abilitato in base alle preferenze
        hapticFeedback: user.deviceType === 'mobile'
      },
      responsiveContent: {
        mobile: this.getMobileOptimizedContent(content),
        desktop: this.getDesktopEnhancedContent(content)
      }
    };
  }

  private static generateCinematicElements(stepType: string, product: ProductContext, user: UserBehaviorProfile) {
    const baseElements = {
      background: `cinematic-${stepType}-${this.getColorScheme(product, user)}`,
      parallaxLayers: this.getAdaptiveParallaxLayers(stepType, product, user),
      particles: {
        type: this.getParticleType(product, user),
        density: this.getParticleDensity(user),
        color: this.getParticleColor(product)
      },
      lighting: this.getAdaptiveLighting(stepType, user)
    };

    return baseElements;
  }

  private static getAdaptiveParallaxLayers(stepType: string, product: ProductContext, user: UserBehaviorProfile) {
    const layers = [];
    
    if (product.industry === 'technology') {
      layers.push(
        { element: '⚡', speed: 0.6, opacity: 0.7, scale: 1.1 },
        { element: '🔮', speed: 0.9, opacity: 0.5, scale: 1.0 }
      );
    } else if (product.industry === 'healthcare') {
      layers.push(
        { element: '🌿', speed: 0.4, opacity: 0.6, scale: 1.3 },
        { element: '💚', speed: 0.7, opacity: 0.5, scale: 1.0 }
      );
    } else {
      layers.push(
        { element: '✨', speed: 0.5, opacity: 0.6, scale: 1.2 },
        { element: '🌟', speed: 0.8, opacity: 0.4, scale: 1.0 }
      );
    }

    // Riduci layer per mobile
    if (user.deviceType === 'mobile') {
      return layers.slice(0, 2);
    }

    return layers;
  }

  private static getParticleType(product: ProductContext, user: UserBehaviorProfile): 'floating' | 'glow' | 'geometric' {
    if (product.visualStyle === 'technical') return 'geometric';
    if (user.interactionPattern === 'analytical') return 'geometric';
    if (product.visualStyle === 'elegant') return 'glow';
    return 'floating';
  }

  private static getParticleDensity(user: UserBehaviorProfile): number {
    if (user.deviceType === 'mobile') return 20;
    if (user.engagementLevel === 'low') return 30;
    return 50;
  }

  private static getParticleColor(product: ProductContext): string {
    if (product.brandColors?.primary) {
      return product.brandColors.primary + '1A'; // Con trasparenza
    }
    return 'rgba(255, 255, 255, 0.1)';
  }

  private static getAdaptiveLighting(stepType: string, user: UserBehaviorProfile) {
    if (stepType === 'capture' || stepType === 'urgency') {
      return {
        ambient: 'warm-glow',
        spotlight: 'focused-beam',
        shadows: true
      };
    }
    
    return {
      ambient: user.interactionPattern === 'analytical' ? 'cool-professional' : 'soft-glow',
      spotlight: 'dynamic-focus',
      shadows: user.deviceType !== 'mobile'
    };
  }

  private static generateAdaptiveTransitions(index: number, total: number, user: UserBehaviorProfile): CinematicScene['transitions'] {
    const transitionSpeed = user.interactionPattern === 'impulsive' ? 0.8 : 1.2;
    const baseDuration = 800;
    
    return {
      in: index === 0 ? 'fade' : (user.deviceType === 'mobile' ? 'slide' : 'zoom'),
      out: index === total - 1 ? 'fade' : 'slide',
      duration: Math.round(baseDuration * transitionSpeed)
    };
  }

  private static generateAdaptiveTheme(product: ProductContext, user: UserBehaviorProfile) {
    return {
      colorScheme: this.getColorScheme(product, user),
      typography: this.getTypography(product, user),
      spacing: user.deviceType === 'mobile' ? 'compact' : 'generous',
      animations: user.engagementLevel === 'high' ? 'dynamic' : 'subtle'
    };
  }

  private static getColorScheme(product: ProductContext, user: UserBehaviorProfile): string {
    if (product.brandColors) return 'brand-custom';
    
    const industrySchemes = {
      technology: 'tech-gradient',
      healthcare: 'health-clean',
      finance: 'finance-professional',
      education: 'education-warm',
      retail: 'retail-vibrant'
    };
    
    return industrySchemes[product.industry as keyof typeof industrySchemes] || 'adaptive-dynamic';
  }

  private static getTypography(product: ProductContext, user: UserBehaviorProfile): string {
    if (product.visualStyle === 'elegant') return 'serif-elegant';
    if (product.visualStyle === 'technical') return 'mono-technical';
    if (user.interactionPattern === 'analytical') return 'clean-professional';
    return 'sans-modern';
  }

  private static generateAdaptiveSettings(user: UserBehaviorProfile) {
    return {
      deviceOptimizations: {
        mobile: { 
          reducedParticles: true, 
          simplifiedAnimations: true,
          quickTransitions: user.interactionPattern === 'impulsive'
        },
        tablet: { 
          optimizedTransitions: true,
          balancedEffects: true
        },
        desktop: { 
          fullEffects: user.engagementLevel === 'high',
          advancedAnimations: user.interactionPattern !== 'analytical'
        }
      },
      performanceMode: this.getPerformanceMode(user),
      accessibilityMode: false,
      reducedMotion: false
    };
  }

  private static getPerformanceMode(user: UserBehaviorProfile): 'high' | 'medium' | 'low' {
    if (user.deviceType === 'mobile') return 'medium';
    if (user.engagementLevel === 'high') return 'high';
    return 'medium';
  }

  private static getMobileOptimizedContent(content: any): any {
    return {
      ...content,
      shortened: true,
      largerButtons: true,
      stackedLayout: true
    };
  }

  private static getDesktopEnhancedContent(content: any): any {
    return {
      ...content,
      sidebarContent: true,
      parallelElements: true,
      enhancedVisuals: true
    };
  }

  private static getIndustryModifiers(industry: string): Record<string, any> {
    const modifiers: Record<string, any> = {
      technology: { techElements: true, fasterPace: true },
      healthcare: { trustElements: true, calmerTones: true },
      finance: { securityBadges: true, professionalTone: true },
      education: { progressIndicators: true, encouragingTone: true }
    };
    
    return modifiers[industry] || {};
  }

  private static getAudienceModifiers(user: UserBehaviorProfile): Record<string, any> {
    return {
      engagementLevel: user.engagementLevel,
      interactionPattern: user.interactionPattern,
      deviceOptimizations: user.deviceType
    };
  }

  private static getPerformanceOptimizations(user: UserBehaviorProfile): string[] {
    const optimizations = ['lazyLoadImages', 'preloadCriticalAssets'];
    
    if (user.deviceType === 'mobile') {
      optimizations.push('reducedAnimations', 'compressedAssets');
    }
    
    if (user.engagementLevel === 'high') {
      optimizations.push('preloadAllAssets', 'enhancedCaching');
    }
    
    return optimizations;
  }

  private static createMinimalAdaptiveFunnel(productContext: ProductContext): IntelligentCinematicFunnel {
    // Fallback con profilo utente di default
    const defaultUserProfile: UserBehaviorProfile = {
      engagementLevel: 'medium',
      conversionIntent: 0.5,
      interactionPattern: 'explorer',
      deviceType: window.innerWidth <= 768 ? 'mobile' : 'desktop',
      timeOnPage: 0,
      previousInteractions: []
    };

    const enrichedContext = this.enrichProductContext(productContext);
    const adaptiveProductContext = this.convertToAdaptiveProductContext(enrichedContext);
    const dynamicSteps = AdaptiveStepGenerator.generateAdaptiveSteps(adaptiveProductContext, defaultUserProfile);
    const cinematicScenes = this.convertStepsToScenes(dynamicSteps, enrichedContext, defaultUserProfile);

    return {
      id: crypto.randomUUID(),
      productContext: enrichedContext,
      scenes: cinematicScenes,
      globalTheme: this.generateAdaptiveTheme(enrichedContext, defaultUserProfile),
      adaptiveSettings: this.generateAdaptiveSettings(defaultUserProfile),
      analyticsConfig: {
        trackingEvents: ['scene_view', 'interaction', 'conversion'],
        heatmapEnabled: true,
        conversionGoals: ['lead_capture']
      },
      userProfile: defaultUserProfile,
      dynamicSteps
    };
  }

  static async optimizeForDevice(funnel: IntelligentCinematicFunnel, deviceType: string): Promise<IntelligentCinematicFunnel> {
    const optimizedFunnel = { ...funnel };
    
    if (deviceType === 'mobile') {
      optimizedFunnel.scenes = optimizedFunnel.scenes.map(scene => ({
        ...scene,
        cinematicElements: {
          ...scene.cinematicElements,
          particles: {
            ...scene.cinematicElements.particles!,
            density: Math.floor(scene.cinematicElements.particles!.density / 2)
          },
          parallaxLayers: scene.cinematicElements.parallaxLayers.slice(0, 2)
        },
        transitions: {
          ...scene.transitions,
          duration: scene.transitions.duration * 0.8
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
