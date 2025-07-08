import React, { useEffect, useRef, useState } from 'react';
import { ScrollBasedImageRenderer } from './ScrollBasedImageRenderer';
import { ParallaxSceneManager } from './ParallaxSceneManager';
import { IntegratedTextOverlay } from './IntegratedTextOverlay';
import { ConversionOptimizedFlow } from './ConversionOptimizedFlow';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useProgressiveCinematicGeneration } from '@/hooks/useProgressiveCinematicGeneration';
import { AlertTriangle, RefreshCw, X } from 'lucide-react';

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

interface CinematicFunnelContainerProps {
  productName: string;
  productDescription?: string;
  targetAudience?: string;
  industry?: string;
  onLeadCapture?: (data: any) => void;
}

export const CinematicFunnelContainer: React.FC<CinematicFunnelContainerProps> = ({
  productName,
  productDescription,
  targetAudience,
  industry,
  onLeadCapture
}) => {
  const { toast } = useToast();
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentScene, setCurrentScene] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>({});
  
  const {
    isGenerating,
    isLoadingImages,
    progress,
    currentStep,
    error,
    canRetry,
    canCancel,
    scenes,
    retryCount,
    generateSceneStructure,
    retryGeneration,
    cancelGeneration,
    resetGeneration,
    hasScenes,
    canProceed,
    overallProgress,
    imageProgress,
    imagesLoaded,
    totalImages,
    getImageLoadingState
  } = useProgressiveCinematicGeneration();

  // Generate scenes when component mounts
  useEffect(() => {
    if (productName && !hasScenes && !isGenerating) {
      generateSceneStructure({
        productName,
        productDescription,
        targetAudience,
        industry
      });
    }
  }, [productName, productDescription, targetAudience, industry, generateSceneStructure, hasScenes, isGenerating]);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;

      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      
      const progress = scrollY / (documentHeight - windowHeight);
      setScrollProgress(Math.min(Math.max(progress, 0), 1));

      // Determine current scene based on scroll position
      const sceneIndex = Math.floor(progress * scenes.length);
      setCurrentScene(Math.min(sceneIndex, scenes.length - 1));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scenes.length]);

  const handleRetry = () => {
    retryGeneration({
      productName,
      productDescription,
      targetAudience,
      industry
    });
  };

  const handleFormSubmit = async (data: any) => {
    try {
      const leadData = {
        ...data,
        productName,
        productDescription,
        funnelType: 'cinematic',
        scrollProgress,
        currentScene,
        userBehavior: {
          timeSpent: Date.now(),
          scenesViewed: currentScene + 1,
          scrollDepth: scrollProgress
        }
      };

      onLeadCapture?.(leadData);
      
      toast({
        title: "🎬 Perfetto!",
        description: "La tua esperienza cinematografica è completa!",
      });
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: "Errore",
        description: "Errore nell'invio del form",
        variant: "destructive"
      });
    }
  };

  // Loading state with real progress
  if (isGenerating) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
        <div className="text-center space-y-8 max-w-md px-6">
          <div className="text-white space-y-4">
            <h2 className="text-2xl font-bold">Creando la tua esperienza cinematografica</h2>
            <p className="text-white/70">Generando struttura per {productName}</p>
          </div>
          
          <div className="space-y-4">
            <div className="text-white/90 font-medium">{currentStep}</div>
            <Progress value={overallProgress} className="h-3" />
            <div className="text-white/60 text-sm">{overallProgress}% completato</div>
            {retryCount > 0 && (
              <div className="text-yellow-400 text-sm">
                Tentativo {retryCount + 1}/3
              </div>
            )}
          </div>
          
          <div className="flex items-center justify-center space-x-4 text-sm text-white/50">
            <span>🎬 Struttura AI</span>
            <span>•</span>
            <span>⚡ Caricamento Rapido</span>
            <span>•</span>
            <span>🖼️ Immagini Progressive</span>
          </div>

          {canCancel && (
            <div className="pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={cancelGeneration}
                className="text-white border-white/20 hover:bg-white/10"
              >
                <X className="w-4 h-4 mr-2" />
                Annulla
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Error state with retry option
  if (error && !hasScenes) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
        <div className="text-center space-y-8 max-w-md px-6">
          <div className="text-red-400 space-y-4">
            <AlertTriangle className="w-16 h-16 mx-auto" />
            <h2 className="text-2xl font-bold">Errore nella generazione</h2>
            <p className="text-red-300">{error}</p>
          </div>
          
          <div className="space-y-4">
            {canRetry && (
              <Button
                onClick={handleRetry}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Riprova ({2 - retryCount} tentativi rimasti)
              </Button>
            )}
            
            <Button
              variant="outline"
              onClick={resetGeneration}
              className="text-white border-white/20 hover:bg-white/10"
            >
              Ricomincia
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // No scenes generated fallback
  if (!hasScenes) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
        <div className="text-center space-y-8 max-w-md px-6">
          <div className="text-white space-y-4">
            <h2 className="text-2xl font-bold">Inizializzazione...</h2>
            <p className="text-white/70">Preparando l'esperienza per {productName}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      {/* Scroll-based image renderer with progressive loading */}
      <ScrollBasedImageRenderer 
        scenes={scenes}
        currentScene={currentScene}
        scrollProgress={scrollProgress}
        getImageLoadingState={getImageLoadingState}
      />

      {/* Parallax scene manager */}
      <ParallaxSceneManager
        scenes={scenes}
        currentScene={currentScene}
        scrollProgress={scrollProgress}
      />

      {/* Integrated text overlay */}
      <IntegratedTextOverlay
        scenes={scenes}
        currentScene={currentScene}
        scrollProgress={scrollProgress}
      />

      {/* Conversion optimized flow */}
      <ConversionOptimizedFlow
        scenes={scenes}
        currentScene={currentScene}
        scrollProgress={scrollProgress}
        formData={formData}
        onFormChange={setFormData}
        onSubmit={handleFormSubmit}
      />

      {/* Cinematic progress indicator */}
      <div className="fixed top-0 left-0 w-full h-1 bg-black/20 z-50">
        <div 
          className="h-full bg-gradient-to-r from-white via-blue-200 to-blue-400 transition-all duration-300"
          style={{ width: `${scrollProgress * 100}%` }}
        />
      </div>

      {/* Image loading progress indicator */}
      {isLoadingImages && (
        <div className="fixed top-4 right-4 z-50">
          <div className="bg-black/80 text-white px-4 py-2 rounded-lg backdrop-blur-sm">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span className="text-sm">
                Caricando immagini... {imagesLoaded}/{totalImages}
              </span>
            </div>
            <div className="mt-2">
              <div className="w-32 h-1 bg-white/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-white transition-all duration-300"
                  style={{ width: `${imageProgress}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Scene indicator */}
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50">
        <div className="flex space-x-2">
          {scenes.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-500 ${
                index === currentScene 
                  ? 'bg-white scale-125' 
                  : 'bg-white/30'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};