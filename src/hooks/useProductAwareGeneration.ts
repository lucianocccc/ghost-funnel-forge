import { useState, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { CinematicScene, ProductContext } from '@/components/dynamic-funnel/cinematic/core/types';

interface GenerationState {
  isGenerating: boolean;
  isLoadingImages: boolean;
  progress: number;
  currentStep: string;
  error: string | null;
  canRetry: boolean;
  canCancel: boolean;
  imagesLoaded: number;
  totalImages: number;
}

export const useProductAwareGeneration = () => {
  const { toast } = useToast();
  const abortControllerRef = useRef<AbortController | null>(null);
  
  const [state, setState] = useState<GenerationState>({
    isGenerating: false,
    isLoadingImages: false,
    progress: 0,
    currentStep: 'Pronto...',
    error: null,
    canRetry: false,
    canCancel: false,
    imagesLoaded: 0,
    totalImages: 0
  });
  
  const [scenes, setScenes] = useState<CinematicScene[]>([]);
  const [retryCount, setRetryCount] = useState(0);

  const updateProgress = useCallback((progress: number, step: string) => {
    setState(prev => ({
      ...prev,
      progress: Math.min(Math.max(progress, 0), 100),
      currentStep: step
    }));
  }, []);

  const generateScenes = useCallback(async (productContext: ProductContext) => {
    // Reset state
    setState({
      isGenerating: true,
      isLoadingImages: false,
      progress: 0,
      currentStep: '🎬 Inizializzazione sistema product-aware...',
      error: null,
      canRetry: false,
      canCancel: true,
      imagesLoaded: 0,
      totalImages: 0
    });
    setScenes([]);

    // Create abort controller
    abortControllerRef.current = new AbortController();

    try {
      updateProgress(10, '🚀 Connessione AI per prodotto specifico...');

      console.log('🎬 Calling generate-dynamic-product-funnel with product-aware params:', {
        productName: productContext.name,
        productDescription: productContext.description,
        targetAudience: productContext.targetAudience,
        industry: productContext.industry,
        visualStyle: productContext.visualStyle || 'dynamic',
        funnelType: 'cinematic_product_aware',
        generateImages: true
      });

      const { data, error } = await supabase.functions.invoke('generate-dynamic-product-funnel', {
        body: {
          productName: productContext.name,
          productDescription: productContext.description,
          targetAudience: productContext.targetAudience,
          industry: productContext.industry,
          visualStyle: productContext.visualStyle || 'dynamic',
          funnelType: 'cinematic_product_aware',
          generateImages: true
        }
      });

      updateProgress(30, '🔧 Processando contenuti personalizzati...');

      if (error) {
        console.error('🚨 Edge Function error:', error);
        throw new Error(`Errore API: ${error.message || JSON.stringify(error)}`);
      }

      if (!data?.success) {
        console.warn('⚠️ AI generation failed, creating smart fallback scenes...');
        
        // Create enhanced fallback scenes based on product context
        const fallbackScenes = createSmartFallbackScenes(productContext);
        
        updateProgress(70, '🎨 Creando scene ottimizzate...');
        setScenes(fallbackScenes);
        updateProgress(100, '✅ Esperienza pronta!');
        
        setState(prev => ({
          ...prev,
          isGenerating: false,
          canCancel: false,
          totalImages: fallbackScenes.length,
          imagesLoaded: fallbackScenes.length
        }));

        toast({
          title: "🎬 Esperienza Pronta!",
          description: `${fallbackScenes.length} scene create per ${productContext.name}`,
        });

        return fallbackScenes;
      }

      updateProgress(60, '🎨 Ottimizzando scene per il prodotto...');

      // Process AI-generated scenes
      const enhancedScenes = (data.cinematicScenes || []).map((scene: any, index: number) => ({
        id: scene.id || `scene_${index + 1}`,
        type: scene.type || ['hero', 'benefit', 'proof', 'demo', 'conversion'][index] || 'benefit',
        title: scene.title || `${productContext.name} - Scene ${index + 1}`,
        subtitle: scene.subtitle || 'Scopri l\'esperienza unica',
        content: scene.content || 'Contenuto generato per il tuo prodotto',
        imagePrompt: generateContextualImagePrompt(scene, productContext),
        imageUrl: scene.imageUrl || generateFallbackImageUrl(scene.type, productContext),
        animationConfig: {
          textAnimation: getTextAnimationForScene(scene.type, productContext.visualStyle),
          backgroundParallax: getParallaxSpeedForScene(scene.type),
          scaleOnScroll: scene.type === 'hero' || scene.type === 'demo'
        },
        scrollTrigger: {
          start: index * 0.2,
          end: (index + 1) * 0.2
        },
        parallaxLayers: [
          { element: 'background', speed: 0.5, scale: 1.2, opacity: 0.8 }
        ],
        cta: scene.cta || (index === 0 ? { text: 'Scopri di più', action: 'scroll' } : undefined)
      }));

      setScenes(enhancedScenes);
      updateProgress(100, '✅ Esperienza cinematografica pronta!');

      setState(prev => ({
        ...prev,
        isGenerating: false,
        canCancel: false,
        totalImages: enhancedScenes.length,
        imagesLoaded: enhancedScenes.length
      }));

      toast({
        title: "🎬 Esperienza Generata!",
        description: `${enhancedScenes.length} scene create per ${productContext.name}`,
      });

      return enhancedScenes;

    } catch (error: any) {
      console.error('💥 Generation error:', error);
      setState(prev => ({
        ...prev,
        isGenerating: false,
        error: error.message,
        canRetry: retryCount < 2,
        canCancel: false
      }));

      toast({
        title: "❌ Errore nella generazione",
        description: error.message,
        variant: "destructive"
      });

      throw error;
    }
  }, [updateProgress, retryCount, toast]);

  const createSmartFallbackScenes = (productContext: ProductContext): CinematicScene[] => {
    const baseScenes = [
      {
        type: 'hero' as const,
        title: `Scopri ${productContext.name}`,
        subtitle: 'L\'innovazione che cambia tutto',
        content: `${productContext.description || 'Un\'esperienza unica che supera ogni aspettativa.'}`,
        cta: { text: 'Scopri di più', action: 'scroll' }
      },
      {
        type: 'benefit' as const,
        title: `Perché scegliere ${productContext.name}`,
        subtitle: 'Vantaggi che fanno la differenza',
        content: `Con ${productContext.name} ottieni qualità superiore, risultati garantiti e un'esperienza senza pari.`
      },
      {
        type: 'proof' as const,
        title: 'Risultati comprovati',
        subtitle: 'La fiducia dei nostri clienti',
        content: `Migliaia di clienti soddisfatti hanno già scelto ${productContext.name}. Unisciti a loro.`
      },
      {
        type: 'demo' as const,
        title: `${productContext.name} in azione`,
        subtitle: 'Guarda come funziona',
        content: `Scopri ${productContext.name} all'opera: prestazioni superiori che superano ogni aspettativa.`
      },
      {
        type: 'conversion' as const,
        title: 'Inizia ora',
        subtitle: 'Il tuo futuro ti aspetta',
        content: `Non aspettare oltre. Inizia la tua esperienza con ${productContext.name} oggi stesso.`
      }
    ];

    return baseScenes.map((scene, index) => ({
      id: `fallback_${scene.type}_${index}`,
      ...scene,
      imagePrompt: generateContextualImagePrompt(scene, productContext),
      imageUrl: generateFallbackImageUrl(scene.type, productContext),
      animationConfig: {
        textAnimation: getTextAnimationForScene(scene.type, productContext.visualStyle),
        backgroundParallax: getParallaxSpeedForScene(scene.type),
        scaleOnScroll: scene.type === 'hero' || scene.type === 'demo'
      },
      scrollTrigger: {
        start: index * 0.2,
        end: (index + 1) * 0.2
      },
      parallaxLayers: [
        { element: 'background', speed: 0.5, scale: 1.2, opacity: 0.8 }
      ]
    }));
  };

  const generateContextualImagePrompt = (scene: any, productContext: ProductContext): string => {
    const industry = productContext.industry || 'business';
    const visualStyle = productContext.visualStyle || 'dynamic';
    const productName = productContext.name;
    
    const styleMap = {
      minimal: 'clean, minimalist, white background',
      dynamic: 'energetic, vibrant, dynamic lighting',
      elegant: 'sophisticated, premium, luxury aesthetic',
      technical: 'high-tech, precise, modern technology'
    };

    const industryMap = {
      'technology': 'modern tech environment, digital interfaces, innovation',
      'health': 'clean medical environment, wellness focus, professional healthcare',
      'finance': 'professional office, financial growth, business success',
      'education': 'learning environment, knowledge transfer, academic excellence',
      'default': 'professional business environment, success, innovation'
    };

    const sceneContext = {
      hero: `Hero shot of ${productName}, ${styleMap[visualStyle]}, ${industryMap[industry] || industryMap.default}`,
      benefit: `Professional demonstration of ${productName} benefits, ${styleMap[visualStyle]}`,
      proof: `Real testimonials and results, ${productName} users, authentic photography`,
      demo: `${productName} in action, dynamic demonstration, ${styleMap[visualStyle]}`,
      conversion: `Call to action scene, ${productName} invitation, ${styleMap[visualStyle]}`
    };

    return sceneContext[scene.type] || `Professional ${productName} photography, ${styleMap[visualStyle]}`;
  };

  const generateFallbackImageUrl = (sceneType: string, productContext: ProductContext): string => {
    const searchTerms = {
      hero: 'success,innovation,leadership,technology',
      benefit: 'growth,improvement,quality,excellence',
      proof: 'testimonial,results,satisfaction,trust',
      demo: 'demonstration,action,performance,work',
      conversion: 'opportunity,future,decision,start'
    };

    const industry = productContext.industry || 'business';
    const terms = `${searchTerms[sceneType]},${industry}`;
    
    return `https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=1920&h=1080&fit=crop&q=80&auto=format&cs=tinysrgb`;
  };

  const getTextAnimationForScene = (sceneType: string, visualStyle?: string): 'fade' | 'slide' | 'typewriter' => {
    if (visualStyle === 'minimal') return 'fade';
    if (visualStyle === 'technical') return 'typewriter';
    
    return sceneType === 'hero' ? 'typewriter' : 'slide';
  };

  const getParallaxSpeedForScene = (sceneType: string): number => {
    const speeds = {
      hero: 0.3,
      benefit: 0.2,
      proof: 0.1,
      demo: 0.4,
      conversion: 0.2
    };
    return speeds[sceneType] || 0.2;
  };

  const retryGeneration = useCallback(async (productContext: ProductContext) => {
    if (retryCount >= 2) {
      toast({
        title: "❌ Troppi tentativi",
        description: "Riprova più tardi",
        variant: "destructive"
      });
      return;
    }

    setRetryCount(prev => prev + 1);
    setState(prev => ({ ...prev, error: null, canRetry: false }));
    
    const delay = Math.min(1000 * Math.pow(1.5, retryCount), 3000);
    await new Promise(resolve => setTimeout(resolve, delay));
    
    return generateScenes(productContext);
  }, [retryCount, generateScenes, toast]);

  const cancelGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    setState(prev => ({
      ...prev,
      isGenerating: false,
      isLoadingImages: false,
      canCancel: false,
      error: 'Generazione annullata'
    }));

    toast({
      title: "🛑 Generazione annullata",
      description: "La generazione è stata interrotta",
    });
  }, [toast]);

  const resetGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    setState({
      isGenerating: false,
      isLoadingImages: false,
      progress: 0,
      currentStep: 'Pronto...',
      error: null,
      canRetry: false,
      canCancel: false,
      imagesLoaded: 0,
      totalImages: 0
    });
    setScenes([]);
    setRetryCount(0);
  }, []);

  return {
    // State
    ...state,
    scenes,
    retryCount,
    
    // Actions
    generateScenes,
    retryGeneration,
    cancelGeneration,
    resetGeneration,
    
    // Utils
    isReady: !state.isGenerating && !state.error,
    hasScenes: scenes.length > 0,
    canProceed: !state.isGenerating && scenes.length > 0,
    
    // Progress info
    overallProgress: state.progress,
    imageProgress: state.totalImages > 0 ? (state.imagesLoaded / state.totalImages) * 100 : 0
  };
};