import { useState, useCallback, useRef, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface CinematicScene {
  id: string;
  type: 'hero' | 'benefit' | 'proof' | 'demo' | 'conversion';
  imagePrompt: string;
  imageUrl?: string;
  fallbackImage?: string;
  loadingPriority?: 'high' | 'low';
  title: string;
  subtitle: string;
  content: string;
  cta?: {
    text: string;
    action: string;
  };
  scrollTrigger: {
    start: number;
    end: number;
  };
  parallaxLayers: Array<{
    element: string;
    speed: number;
    scale: number;
    opacity: number;
  }>;
}

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

interface GenerationOptions {
  productName: string;
  productDescription?: string;
  targetAudience?: string;
  industry?: string;
}

export const useProgressiveCinematicGeneration = () => {
  const { toast } = useToast();
  const abortControllerRef = useRef<AbortController | null>(null);
  const imageLoadingQueue = useRef<Set<string>>(new Set());
  
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
  const [imageLoadingProgress, setImageLoadingProgress] = useState<Record<string, 'loading' | 'loaded' | 'error'>>({});

  const updateProgress = useCallback((progress: number, step: string) => {
    setState(prev => ({
      ...prev,
      progress: Math.min(Math.max(progress, 0), 100),
      currentStep: step
    }));
  }, []);

  const generateSceneStructure = useCallback(async (options: GenerationOptions) => {
    const { productName, productDescription, targetAudience, industry } = options;

    // Reset state
    setState({
      isGenerating: true,  
      isLoadingImages: false,
      progress: 0,
      currentStep: '🎬 Creando esperienza mountain bike...',
      error: null,
      canRetry: false,
      canCancel: true,
      imagesLoaded: 0,
      totalImages: 0
    });
    setScenes([]);
    setImageLoadingProgress({});

    // Create abort controller
    abortControllerRef.current = new AbortController();

    try {
      updateProgress(10, '🚀 Connessione AI per mountain bike...');

      console.log('🎬 Calling generate-dynamic-product-funnel with enhanced mountain bike params:', {
        productName,
        productDescription: productDescription || `La mountain bike più avanzata al mondo per terreni estremi`,
        targetAudience: targetAudience || 'Appassionati di mountain bike e ciclisti professionisti',
        industry: industry || 'Sport e Outdoor',
        funnelType: 'cinematic',
        generateImages: true
      });

      const { data, error } = await supabase.functions.invoke('generate-dynamic-product-funnel', {
        body: {
          productName,
          productDescription: productDescription || `La mountain bike più avanzata al mondo per terreni estremi`,
          targetAudience: targetAudience || 'Appassionati di mountain bike e ciclisti professionisti',
          industry: industry || 'Sport e Outdoor',
          funnelType: 'cinematic',
          generateImages: true
        }
      });

      updateProgress(30, '🔧 Processando scene mountain bike...');

      if (error) {
        console.error('🚨 Edge Function error:', error);
        throw new Error(`Errore API: ${error.message || JSON.stringify(error)}`);
      }

      if (!data?.success) {
        console.warn('⚠️ AI generation failed, creating fallback mountain bike scenes...');
        // Create enhanced fallback scenes for mountain bike
        const fallbackScenes = [
          {
            id: 'hero_mountain_bike',
            type: 'hero' as const,
            title: `${productName} - Conquista ogni sentiero`,
            subtitle: 'La mountain bike che ridefinisce i limiti',
            content: 'Esperienza adrenalina pura su terreni impossibili',
            imagePrompt: `Epic mountain bike scene: professional rider on ${productName} flying through forest trail, mud and rocks flying from wheels, dramatic mountain landscape`,
            imageUrl: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=1920&h=1080&fit=crop&crop=center',
            scrollTrigger: { start: 0, end: 0.2 },
            parallaxLayers: [
              { element: 'background', speed: 0.3, scale: 1.2, opacity: 0.8 },
              { element: 'midground', speed: 0.6, scale: 1.1, opacity: 0.9 },
              { element: 'foreground', speed: 1.0, scale: 1.0, opacity: 1.0 }
            ]
          },
          {
            id: 'benefit_suspension',
            type: 'benefit' as const,
            title: 'Sospensioni Avanzate',
            subtitle: 'Tecnologia che assorbe ogni impatto',
            content: 'Sistema di sospensioni rivoluzionario per controllo totale',
            imagePrompt: `Close-up ${productName} mountain bike suspension system, carbon fiber details, technical photography`,
            imageUrl: 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=1920&h=1080&fit=crop&crop=center',
            scrollTrigger: { start: 0.2, end: 0.4 },
            parallaxLayers: [
              { element: 'background', speed: 0.4, scale: 1.1, opacity: 0.7 },
              { element: 'foreground', speed: 0.9, scale: 1.0, opacity: 1.0 }
            ]
          },
          {
            id: 'demo_action',
            type: 'demo' as const,
            title: 'In Azione Estrema',
            subtitle: 'Prestazioni che superano ogni aspettativa',
            content: 'Guarda come domina i terreni più difficili',
            imagePrompt: `Dynamic action shot of ${productName} mountain bike on extreme terrain, rider in motion, spectacular landscape`,
            imageUrl: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=1920&h=1080&fit=crop&crop=center',
            scrollTrigger: { start: 0.4, end: 0.6 },
            parallaxLayers: [
              { element: 'background', speed: 0.2, scale: 1.3, opacity: 0.6 },
              { element: 'action', speed: 0.8, scale: 1.05, opacity: 1.0 }
            ]
          },
          {
            id: 'proof_testimonial',
            type: 'proof' as const,
            title: 'Testimonianze Reali',
            subtitle: 'Rider professionisti la scelgono',
            content: 'Scopri perché è la preferita dei campioni',
            imagePrompt: `Professional mountain bike rider with ${productName}, testimonial scene, mountain backdrop`,
            imageUrl: 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=1920&h=1080&fit=crop&crop=center',
            scrollTrigger: { start: 0.6, end: 0.8 },
            parallaxLayers: [
              { element: 'background', speed: 0.5, scale: 1.1, opacity: 0.8 }
            ]
          },
          {
            id: 'conversion_final',
            type: 'conversion' as const,
            title: 'Inizia la tua Avventura',
            subtitle: 'Il tuo prossimo limite ti aspetta',
            content: 'Ottieni informazioni esclusive per rider seri',
            imagePrompt: `Beautiful ${productName} mountain bike on scenic mountain overlook, sunset, aspirational shot`,
            imageUrl: 'https://images.unsplash.com/photo-1544191696-15693072648c?w=1920&h=1080&fit=crop&crop=center',
            scrollTrigger: { start: 0.8, end: 1.0 },
            parallaxLayers: [
              { element: 'background', speed: 0.1, scale: 1.4, opacity: 0.7 },
              { element: 'bike', speed: 0.7, scale: 1.0, opacity: 1.0 }
            ]
          }
        ];
        
        updateProgress(70, '🎨 Creando scene mountain bike...');
        setScenes(fallbackScenes);
        updateProgress(100, '✅ Esperienza mountain bike pronta!');
        
        setState(prev => ({
          ...prev,
          isGenerating: false,
          canCancel: false,
          totalImages: fallbackScenes.length,
          imagesLoaded: fallbackScenes.length
        }));

        toast({
          title: "🎬 Esperienza Mountain Bike Pronta!",
          description: `${fallbackScenes.length} scene cinematografiche create`,
        });

        return fallbackScenes;
      }

      updateProgress(60, '🎨 Ottimizzando scene...');

      const enhancedScenes = (data.cinematicScenes || []).map((scene: any, index: number) => ({
        id: scene.id || `mountain_bike_scene_${index + 1}`,
        type: scene.type || ['hero', 'benefit', 'proof', 'demo', 'conversion'][index] || 'benefit',
        title: scene.title || `${productName} Scene ${index + 1}`,
        subtitle: scene.subtitle || 'Esperienza mountain bike estrema',
        content: scene.content || 'Scopri le prestazioni superiori',
        imagePrompt: `Mountain bike cinematic scene: ${scene.imagePrompt || `${productName} mountain bike in extreme action, professional cinematography`}`,
        imageUrl: scene.imageUrl || `https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=1920&h=1080&fit=crop&crop=center`,
        scrollTrigger: {
          start: index * 0.2,
          end: (index + 1) * 0.2
        },
        parallaxLayers: scene.parallaxLayers || [
          { element: 'background', speed: 0.5, scale: 1.2, opacity: 0.8 },
          { element: 'midground', speed: 0.7, scale: 1.1, opacity: 0.9 },
          { element: 'foreground', speed: 1.0, scale: 1.0, opacity: 1.0 }
        ]
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
        title: "🎬 Mountain Bike Experience Ready!",
        description: `${enhancedScenes.length} scene cinematografiche generate`,
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

  const loadImagesProgressively = useCallback(async (scenesToLoad: CinematicScene[]) => {
    setState(prev => ({ ...prev, isLoadingImages: true }));

    // Auto-start loading images after structure is ready
    setTimeout(() => {
      setState(prev => ({ 
        ...prev, 
        isLoadingImages: false,
        imagesLoaded: scenesToLoad.length,
        totalImages: scenesToLoad.length 
      }));
    }, 1000);
  }, []);

  const retryGeneration = useCallback(async (options: GenerationOptions) => {
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
    
    return generateSceneStructure(options);
  }, [retryCount, generateSceneStructure, toast]);

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
    setImageLoadingProgress({});
    imageLoadingQueue.current.clear();
  }, []);

  const getImageLoadingState = useCallback((sceneId: string) => {
    return imageLoadingProgress[sceneId] || 'loading';
  }, [imageLoadingProgress]);

  return {
    // State
    ...state,
    scenes,
    retryCount,
    imageLoadingProgress,
    
    // Actions
    generateSceneStructure,
    retryGeneration,
    cancelGeneration,
    resetGeneration,
    
    // Utils
    isReady: !state.isGenerating && !state.error,
    hasScenes: scenes.length > 0,
    canProceed: !state.isGenerating && scenes.length > 0,
    getImageLoadingState,
    
    // Progress info
    overallProgress: state.progress,
    imageProgress: state.totalImages > 0 ? (state.imagesLoaded / state.totalImages) * 100 : 0
  };
};
