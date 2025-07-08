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
      currentStep: 'Generando struttura cinematica...',
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
      updateProgress(10, 'Connessione al sistema AI...');

      const { data, error } = await supabase.functions.invoke('generate-dynamic-product-funnel', {
        body: {
          productName,
          productDescription,
          targetAudience,
          industry,
          funnelType: 'cinematic',
          generateImages: false // Structure only
        }
      });

      if (error) {
        throw new Error(`API Error: ${error.message || 'Errore sconosciuto'}`);
      }

      updateProgress(50, 'Elaborazione scene...');

      if (!data?.success) {
        throw new Error(data?.error || 'Risposta API non valida');
      }

      if (!data.cinematicScenes || !Array.isArray(data.cinematicScenes)) {
        throw new Error('Scene cinematiche non generate correttamente');
      }

      updateProgress(80, 'Preparazione esperienza...');

      const structureScenes = data.cinematicScenes.map((scene: any) => ({
        ...scene,
        imageUrl: scene.fallbackImage, // Start with fallback
        isPlaceholder: true
      }));

      setScenes(structureScenes);
      
      updateProgress(100, 'Struttura completata!');

      setState(prev => ({
        ...prev,
        isGenerating: false,
        canCancel: false,
        totalImages: structureScenes.length
      }));

      toast({
        title: "🎬 Struttura creata!",
        description: `${structureScenes.length} scene pronte. Caricamento immagini in corso...`,
      });

      // Start progressive image loading
      await loadImagesProgressively(structureScenes);

      return structureScenes;

    } catch (error: any) {
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

    // Sort scenes by priority (hero first, then others)
    const sortedScenes = [...scenesToLoad].sort((a, b) => {
      if (a.loadingPriority === 'high' && b.loadingPriority !== 'high') return -1;
      if (a.loadingPriority !== 'high' && b.loadingPriority === 'high') return 1;
      return 0;
    });

    // Load images with controlled concurrency
    const concurrentLimit = 2;
    let loadedCount = 0;

    for (let i = 0; i < sortedScenes.length; i += concurrentLimit) {
      const batch = sortedScenes.slice(i, i + concurrentLimit);
      
      const batchPromises = batch.map(async (scene) => {
        if (imageLoadingQueue.current.has(scene.id)) return;
        
        imageLoadingQueue.current.add(scene.id);
        
        try {
          setImageLoadingProgress(prev => ({
            ...prev,
            [scene.id]: 'loading'
          }));

          const { data, error } = await supabase.functions.invoke('generate-scene-image', {
            body: {
              sceneId: scene.id,
              imagePrompt: scene.imagePrompt,
              sceneType: scene.type,
              priority: scene.loadingPriority || 'low'
            }
          });

          if (error || !data?.success) {
            throw new Error(data?.error || 'Errore generazione immagine');
          }

          // Update scene with new image
          setScenes(prevScenes => 
            prevScenes.map(s => 
              s.id === scene.id 
                ? { ...s, imageUrl: data.imageUrl, isPlaceholder: false }
                : s
            )
          );

          setImageLoadingProgress(prev => ({
            ...prev,
            [scene.id]: 'loaded'
          }));

          loadedCount++;
          setState(prev => ({ ...prev, imagesLoaded: loadedCount }));

        } catch (error) {
          console.warn(`Failed to load image for scene ${scene.id}:`, error);
          
          setImageLoadingProgress(prev => ({
            ...prev,
            [scene.id]: 'error'
          }));
          
          // Keep fallback image - don't update scene
        } finally {
          imageLoadingQueue.current.delete(scene.id);
        }
      });

      await Promise.all(batchPromises);
    }

    setState(prev => ({ ...prev, isLoadingImages: false }));

    const successCount = Object.values(imageLoadingProgress).filter(status => status === 'loaded').length;
    
    toast({
      title: "🖼️ Caricamento completato",
      description: `${successCount}/${scenesToLoad.length} immagini caricate con successo`,
    });
  }, [imageLoadingProgress, toast]);

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
