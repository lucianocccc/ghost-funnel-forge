import { useState, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface CinematicScene {
  id: string;
  type: 'hero' | 'benefit' | 'proof' | 'demo' | 'conversion';
  imagePrompt: string;
  imageUrl?: string;
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
  progress: number;
  currentStep: string;
  error: string | null;
  canRetry: boolean;
  canCancel: boolean;
}

interface GenerationOptions {
  productName: string;
  productDescription?: string;
  targetAudience?: string;
  industry?: string;
  timeout?: number;
  maxRetries?: number;
}

export const useCinematicFunnelGeneration = () => {
  const { toast } = useToast();
  const abortControllerRef = useRef<AbortController | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const [state, setState] = useState<GenerationState>({
    isGenerating: false,
    progress: 0,
    currentStep: 'Inizializzazione...',
    error: null,
    canRetry: false,
    canCancel: false
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

  const handleError = useCallback((error: any, canRetry: boolean = true) => {
    console.error('🚨 Cinematic generation error:', error);
    
    let errorMessage = 'Errore sconosciuto nella generazione';
    let shouldRetry = canRetry && retryCount < 3;
    
    if (error.name === 'AbortError') {
      errorMessage = 'Generazione annullata dall\'utente';
      shouldRetry = false;
    } else if (error.message?.includes('timeout') || error.message?.includes('timed out')) {
      errorMessage = 'Timeout nella generazione - le immagini saranno generate in seguito';
      shouldRetry = retryCount < 2; // Less retries for timeout
    } else if (error.message?.includes('OpenAI') || error.message?.includes('API')) {
      errorMessage = 'Errore nel servizio AI - riprova tra poco';
      shouldRetry = retryCount < 2;
    } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
      errorMessage = 'Errore di connessione - controlla la rete';
      shouldRetry = retryCount < 2;
    } else if (error.message?.includes('Scene structure generation')) {
      errorMessage = 'Errore nella generazione delle scene - riprova';
      shouldRetry = retryCount < 2;
    } else if (typeof error.message === 'string') {
      errorMessage = error.message;
    }

    setState(prev => ({
      ...prev,
      isGenerating: false,
      error: errorMessage,
      canRetry: shouldRetry,
      canCancel: false
    }));

    if (shouldRetry) {
      toast({
        title: "⚠️ Errore nella generazione",
        description: `${errorMessage}. Tentativo ${retryCount + 1}/3`,
        variant: "destructive"
      });
    } else {
      toast({
        title: "❌ Generazione fallita",
        description: errorMessage,
        variant: "destructive"
      });
    }
  }, [retryCount, toast]);

  const cancelGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    setState(prev => ({
      ...prev,
      isGenerating: false,
      canCancel: false,
      error: 'Generazione annullata'
    }));

    toast({
      title: "🛑 Generazione annullata",
      description: "La generazione è stata interrotta",
    });
  }, [toast]);

  const generateCinematicFunnel = useCallback(async (options: GenerationOptions) => {
    const {
      productName,
      productDescription,
      targetAudience,
      industry,
      timeout = 60000, // Reduced to 60 seconds to match Edge Function optimization
      maxRetries = 2
    } = options;

    // Reset state
    setState({
      isGenerating: true,
      progress: 0,
      currentStep: 'Inizializzazione sistema cinematografico...',
      error: null,
      canRetry: false,
      canCancel: true
    });
    setScenes([]);

    // Create abort controller for cancellation
    abortControllerRef.current = new AbortController();
    
    // Set timeout with buffer for Edge Function execution
    timeoutRef.current = setTimeout(() => {
      handleError(new Error('Timeout: generazione troppo lenta - riprova'), true);
    }, timeout);

    try {
      updateProgress(10, 'Connessione al sistema AI...');

      const startTime = Date.now();
      console.log('🎬 Starting optimized cinematic funnel generation for:', productName);

      // Use AbortController signal for better cancellation handling
      const { data, error } = await supabase.functions.invoke('generate-dynamic-product-funnel', {
        body: {
          productName,
          productDescription,
          targetAudience,
          industry,
          funnelType: 'cinematic',
          generateImages: true
        }
      });

      if (error) {
        throw new Error(`API Error: ${error.message || 'Errore sconosciuto'}`);
      }

      updateProgress(30, 'Elaborazione risposta AI...');

      if (!data?.success) {
        throw new Error(data?.error || 'Risposta API non valida');
      }

      updateProgress(60, 'Validazione scene cinematiche...');

      if (!data.cinematicScenes || !Array.isArray(data.cinematicScenes)) {
        throw new Error('Scene cinematiche non generate correttamente');
      }

      if (data.cinematicScenes.length === 0) {
        throw new Error('Nessuna scena generata');
      }

      updateProgress(80, 'Ottimizzazione esperienza cinematica...');

      // Validate each scene
      const validatedScenes = data.cinematicScenes.map((scene: any, index: number) => {
        if (!scene.id || !scene.type || !scene.title) {
          throw new Error(`Scena ${index + 1} non valida`);
        }
        
        return {
          ...scene,
          // Ensure required fields
          id: scene.id || `scene_${index + 1}`,
          scrollTrigger: scene.scrollTrigger || { start: index * 0.2, end: (index + 1) * 0.2 },
          parallaxLayers: scene.parallaxLayers || []
        };
      });

      updateProgress(95, 'Finalizzazione esperienza...');

      setScenes(validatedScenes);
      setRetryCount(0); // Reset retry count on success

      updateProgress(100, 'Esperienza cinematografica completata!');

      const generationTime = ((Date.now() - startTime) / 1000).toFixed(1);
      console.log(`🎬 Cinematic generation completed in ${generationTime}s`);

      // Handle warnings from Edge Function
      if (data.warning) {
        toast({
          title: "⚠️ Generazione parziale",
          description: data.warning,
          variant: "destructive"
        });
      }

      setTimeout(() => {
        setState(prev => ({
          ...prev,
          isGenerating: false,
          canCancel: false
        }));
      }, 500);

      const imagesGenerated = data.metadata?.imagesGenerated || validatedScenes.filter(s => s.imageUrl).length;
      const totalScenes = data.metadata?.totalScenes || validatedScenes.length;
      
      toast({
        title: "🎬 Esperienza cinematografica creata!",
        description: `${totalScenes} scene generate in ${generationTime}s (${imagesGenerated} immagini)`,
      });

      return validatedScenes;

    } catch (error: any) {
      handleError(error, true);
      throw error;
    } finally {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      abortControllerRef.current = null;
    }
  }, [updateProgress, handleError, toast]);

  const retryGeneration = useCallback(async (options: GenerationOptions) => {
    if (retryCount >= 2) {
      toast({
        title: "❌ Troppi tentativi",
        description: "Riprova più tardi o contatta l'assistenza",
        variant: "destructive"
      });
      return;
    }

    setRetryCount(prev => prev + 1);
    setState(prev => ({ ...prev, error: null, canRetry: false }));
    
    // Add exponential backoff with shorter delays for better UX
    const delay = Math.min(2000 * Math.pow(1.5, retryCount), 5000);
    await new Promise(resolve => setTimeout(resolve, delay));
    
    return generateCinematicFunnel(options);
  }, [retryCount, generateCinematicFunnel, toast]);

  const resetGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    setState({
      isGenerating: false,
      progress: 0,
      currentStep: 'Pronto per la generazione...',
      error: null,
      canRetry: false,
      canCancel: false
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
    generateCinematicFunnel,
    retryGeneration,
    cancelGeneration,
    resetGeneration,
    
    // Utils
    isReady: !state.isGenerating && !state.error,
    hasScenes: scenes.length > 0,
    progressPercentage: state.progress,
    canProceed: !state.isGenerating && scenes.length > 0
  };
};