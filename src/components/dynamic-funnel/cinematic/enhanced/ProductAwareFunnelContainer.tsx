import React, { useEffect, useRef, useState } from 'react';
import { CinematicScene, ProductContext, ScrollMetrics } from '../core/types';
import { ImageSystem } from '../core/ImageSystem';
import { TextAnimations } from '../core/TextAnimations';
import { MinimalParallax } from '../core/MinimalParallax';
import { OptimizedScrollController } from '../core/OptimizedScrollController';
import { ConversionOptimizedFlow } from '../ConversionOptimizedFlow';
import { useProductAwareGeneration } from '@/hooks/useProductAwareGeneration';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle, RefreshCw, X } from 'lucide-react';

interface ProductAwareFunnelContainerProps {
  productContext: ProductContext;
  onLeadCapture?: (data: any) => void;
}

export const ProductAwareFunnelContainer: React.FC<ProductAwareFunnelContainerProps> = ({
  productContext,
  onLeadCapture
}) => {
  const { toast } = useToast();
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentScene, setCurrentScene] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [scrollMetrics, setScrollMetrics] = useState<ScrollMetrics>({
    velocity: 0,
    position: 0,
    normalizedPosition: 0,
    isScrolling: false,
    direction: 'none'
  });

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
    generateScenes,
    retryGeneration,
    cancelGeneration,
    resetGeneration,
    hasScenes,
    canProceed,
    overallProgress,
    imageProgress,
    imagesLoaded,
    totalImages
  } = useProductAwareGeneration();

  // Generate scenes when component mounts
  useEffect(() => {
    if (productContext.name && !hasScenes && !isGenerating) {
      console.log('🎬 Starting product-aware funnel generation...', productContext);
      generateScenes(productContext);
    }
  }, [productContext, hasScenes, isGenerating, generateScenes]);

  const handleRetry = () => {
    retryGeneration(productContext);
  };

  const handleFormSubmit = async (data: any) => {
    try {
      const leadData = {
        ...data,
        product: productContext,
        funnelType: 'cinematic_product_aware',
        scrollProgress,
        currentScene,
        userBehavior: {
          timeSpent: Date.now(),
          scenesViewed: currentScene + 1,
          scrollDepth: scrollProgress,
          scrollVelocity: scrollMetrics.velocity,
          engagementLevel: calculateEngagementLevel()
        }
      };

      onLeadCapture?.(leadData);
      
      toast({
        title: "🎬 Perfetto!",
        description: "La tua avventura sta iniziando!",
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

  const calculateEngagementLevel = (): 'low' | 'medium' | 'high' => {
    const factors = {
      scenesViewed: currentScene + 1,
      scrollDepth: scrollProgress,
      timeSpent: Date.now(), // This would be calculated properly
      scrollActivity: Math.abs(scrollMetrics.velocity)
    };

    // Simple engagement calculation
    const score = (factors.scenesViewed / scenes.length) * 0.4 + 
                  factors.scrollDepth * 0.3 + 
                  Math.min(factors.scrollActivity / 10, 1) * 0.3;

    return score > 0.7 ? 'high' : score > 0.4 ? 'medium' : 'low';
  };

  const handleScrollMetrics = (metrics: ScrollMetrics) => {
    setScrollMetrics(metrics);
  };

  const handleSceneChange = (sceneIndex: number, progress: number) => {
    setCurrentScene(sceneIndex);
    setScrollProgress(progress);
  };

  // Loading state
  if (isGenerating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center space-y-8 max-w-md px-6">
          <div className="text-white space-y-4">
            <h2 className="text-2xl font-bold">🎬 Creando esperienza cinematografica</h2>
            <p className="text-white/70">
              Generando contenuti per <span className="text-blue-400">{productContext.name}</span>
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="text-white/90 font-medium">{currentStep}</div>
            <Progress value={overallProgress} className="h-3 bg-black/30" />
            <div className="text-white/60 text-sm">{overallProgress}% completato</div>
            {retryCount > 0 && (
              <div className="text-orange-400 text-sm">
                Tentativo {retryCount + 1}/3 - Perfezionando l'esperienza
              </div>
            )}
          </div>
          
          <div className="flex items-center justify-center space-x-4 text-sm text-white/50">
            <span>🎯 Product-Aware AI</span>
            <span>•</span>
            <span>🎨 Design Adattivo</span>
            <span>•</span>
            <span>⚡ Performance Ottimizzata</span>
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

  // Error state
  if (error && !hasScenes) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-slate-900 to-slate-900 flex items-center justify-center">
        <div className="text-center space-y-8 max-w-md px-6">
          <div className="text-red-400 space-y-4">
            <AlertTriangle className="w-16 h-16 mx-auto" />
            <h2 className="text-2xl font-bold">Errore nel sistema</h2>
            <p className="text-red-300">{error}</p>
          </div>
          
          <div className="space-y-4">
            {canRetry && (
              <Button
                onClick={handleRetry}
                className="bg-orange-600 hover:bg-orange-700 text-white"
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
              Ricomincia Esperienza
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // No scenes generated fallback
  if (!hasScenes) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center space-y-8 max-w-md px-6">
          <div className="text-white space-y-4">
            <h2 className="text-2xl font-bold">🎬 Inizializzazione...</h2>
            <p className="text-white/70">Preparando l'esperienza per {productContext.name}</p>
          </div>
          <div className="animate-pulse">
            <div className="text-6xl">🎭</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <OptimizedScrollController
      totalScenes={scenes.length}
      onScrollMetrics={handleScrollMetrics}
      onSceneChange={handleSceneChange}
    >
      <div ref={containerRef} className="relative">
        
        {/* Create immersive sections for each scene */}
        {scenes.map((scene, index) => (
          <div key={scene.id} className="relative min-h-screen overflow-hidden">
            {/* Background image system */}
            <ImageSystem
              scene={scene}
              scrollProgress={scrollProgress}
              isActive={index === currentScene}
            />

            {/* Minimal parallax effects */}
            <MinimalParallax
              scene={scene}
              scrollProgress={scrollProgress}
              isActive={index === currentScene}
            />

            {/* Text animations */}
            <TextAnimations
              scene={scene}
              scrollProgress={scrollProgress}
              isActive={index === currentScene}
              sceneIndex={index}
              totalScenes={scenes.length}
            />
          </div>
        ))}

        {/* Conversion form at the end */}
        <div className="relative min-h-screen">
          <ConversionOptimizedFlow
            scenes={scenes}
            currentScene={currentScene}
            scrollProgress={scrollProgress}
            formData={formData}
            onFormChange={setFormData}
            onSubmit={handleFormSubmit}
          />
        </div>

        {/* Minimal progress indicator */}
        <div className="fixed top-0 left-0 w-full h-1 bg-black/10 z-40 pointer-events-none">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-300"
            style={{ width: `${(currentScene / scenes.length) * 100}%` }}
          />
        </div>
      </div>
    </OptimizedScrollController>
  );
};