import React, { useEffect, useRef, useState } from 'react';
import { ScrollBasedImageRenderer } from './ScrollBasedImageRenderer';
import { ParallaxSceneManager } from './ParallaxSceneManager';
import { IntegratedTextOverlay } from './IntegratedTextOverlay';
import { ConversionOptimizedFlow } from './ConversionOptimizedFlow';
import { CinematicPhysicsEngine } from './advanced/CinematicPhysicsEngine';
import { CinematicMountainBikeEngine } from './enhanced/CinematicMountainBikeEngine';
import { CinematicSmoothScrollController } from './enhanced/CinematicSmoothScrollController';
import { AdvancedSceneGenerator } from './advanced/AdvancedSceneGenerator';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useProgressiveCinematicGeneration } from '@/hooks/useProgressiveCinematicGeneration';
import { AlertTriangle, RefreshCw, X, Settings, Wand2 } from 'lucide-react';
import { CinematicScene } from './core/types';

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
  const [scrollVelocity, setScrollVelocity] = useState(0);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [advancedScenes, setAdvancedScenes] = useState<any[]>([]);
  
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
      console.log('🎬 Starting product-aware cinematic funnel generation...');
      generateSceneStructure({
        productName,
        productDescription: productDescription || `Un prodotto innovativo che rivoluziona il settore con qualità superiore e prestazioni eccezionali.`,
        targetAudience: targetAudience || 'Clienti che cercano qualità e innovazione',
        industry: industry || 'business'
      });
    }
  }, [productName, productDescription, targetAudience, industry, generateSceneStructure, hasScenes, isGenerating]);

  const handleRetry = () => {
    retryGeneration({
      productName,
      productDescription: productDescription || `Un prodotto innovativo che rivoluziona il settore`,
      targetAudience: targetAudience || 'Clienti che cercano qualità e innovazione',
      industry: industry || 'business'
    });
  };

  const handleFormSubmit = async (data: any) => {
    try {
      const leadData = {
        ...data,
        productName,
        productDescription,
        funnelType: 'cinematic_product_aware',
        scrollProgress,
        currentScene,
        userBehavior: {
          timeSpent: Date.now(),
          scenesViewed: currentScene + 1,
          scrollDepth: scrollProgress,
          industry: industry,
          productEngagement: true
        }
      };

      onLeadCapture?.(leadData);
      
      toast({
        title: "🎬 Perfetto!",
        description: "La tua esperienza con il prodotto sta iniziando!",
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

  // Enhanced loading state for cinematic experience
  if (isGenerating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-black to-blue-900 flex items-center justify-center">
        <div className="text-center space-y-8 max-w-md px-6">
          <div className="text-white space-y-4">
            <h2 className="text-2xl font-bold">🎬 Creando esperienza cinematografica</h2>
            <p className="text-white/70">Generando contenuti personalizzati per {productName}</p>
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
            <span>🎨 AI Cinematico</span>
            <span>•</span>
            <span>🖼️ Immagini HD</span>
            <span>•</span>
            <span>⚡ Esperienza Immersiva</span>
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

  // Error state with cinematic theme
  if (error && !hasScenes) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-black to-slate-900 flex items-center justify-center">
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
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-black to-slate-900 flex items-center justify-center">
        <div className="text-center space-y-8 max-w-md px-6">
          <div className="text-white space-y-4">
            <h2 className="text-2xl font-bold">🎬 Inizializzazione sistema...</h2>
            <p className="text-white/70">Preparando l'esperienza per {productName}</p>
          </div>
          <div className="animate-pulse">
            <div className="text-6xl">🎨</div>
          </div>
        </div>
      </div>
    );
  }

  const handleScrollMetrics = (metrics: any) => {
    setScrollVelocity(metrics.smoothVelocity || metrics.velocity);
  };

  const handleSceneChange = (sceneIndex: number, progress: number) => {
    setCurrentScene(sceneIndex);
    setScrollProgress(progress);
  };

  const handleAdvancedScenesGenerated = (generatedScenes: any[]) => {
    setAdvancedScenes(generatedScenes);
    toast({
      title: "🎬 Scene Avanzate Pronte!",
      description: `${generatedScenes.length} scene cinematografiche generate`,
    });
  };

  // Helper to ensure scenes have animationConfig
  const ensureAnimationConfig = (scene: any): CinematicScene => {
    return {
      ...scene,
      animationConfig: scene.animationConfig || {
        textAnimation: scene.type === 'hero' ? 'typewriter' : 'fade',
        backgroundParallax: 0.3,
        scaleOnScroll: true
      }
    };
  };

  // Transform scenes to include animationConfig
  const scenesWithAnimation = scenes.map(ensureAnimationConfig);

  // Show advanced scene generator
  if (showAdvancedSettings) {
    return (
      <div className="min-h-screen bg-black p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-white">🎬 Sistema Cinematografico Avanzato</h1>
            <Button
              variant="outline"
              onClick={() => setShowAdvancedSettings(false)}
              className="text-white border-white/20 hover:bg-white/10"
            >
              <X className="w-4 h-4 mr-2" />
              Chiudi Editor
            </Button>
          </div>
          
          <AdvancedSceneGenerator
            productName={productName}
            productDescription={productDescription}
            industry={industry}
            onScenesGenerated={handleAdvancedScenesGenerated}
            initialScenes={advancedScenes}
          />
        </div>
      </div>
    );
  }

  return (
    <CinematicSmoothScrollController
      totalScenes={scenesWithAnimation.length}
      onScrollMetrics={handleScrollMetrics}
      onSceneChange={handleSceneChange}
    >
      <div ref={containerRef} className="relative">
        {/* Advanced Settings Button - Subtle */}
        <div className="fixed top-4 left-4 z-50 opacity-0 hover:opacity-100 transition-opacity duration-500">
          <Button
            onClick={() => setShowAdvancedSettings(true)}
            className="bg-black/20 hover:bg-black/40 text-white/60 border-white/10 backdrop-blur-sm"
            size="sm"
          >
            <Wand2 className="w-4 h-4 mr-2" />
            Editor
          </Button>
        </div>

        {/* Create immersive sections for each scene */}
        {scenesWithAnimation.map((scene, index) => (
          <div key={scene.id} className="relative min-h-screen overflow-hidden">
            {/* Background image renderer */}
            <ScrollBasedImageRenderer 
              scenes={[scene]}
              currentScene={0}
              scrollProgress={scrollProgress}
              getImageLoadingState={getImageLoadingState}
            />

            {/* Enhanced Mountain Bike Physics Engine */}
            <CinematicMountainBikeEngine
              sceneType={scene.type}
              scrollVelocity={scrollVelocity}
              isActive={index === currentScene}
            />

            {/* Additional Physics Engine for atmospheric effects */}
            <CinematicPhysicsEngine
              sceneType={scene.type}
              scrollVelocity={scrollVelocity * 0.3}
              isActive={index === currentScene}
              productType="mountain-bike"
            />

            {/* Parallax effects */}
            <ParallaxSceneManager
              scenes={[scene]}
              currentScene={0}
              scrollProgress={scrollProgress}
            />

            {/* Text overlay */}
            <IntegratedTextOverlay
              scenes={[scene]}
              currentScene={0}
              scrollProgress={scrollProgress}
            />
          </div>
        ))}

        {/* Conversion form at the end */}
        <div className="relative min-h-screen">
          <ConversionOptimizedFlow
            scenes={scenesWithAnimation}
            currentScene={currentScene}
            scrollProgress={scrollProgress}
            formData={formData}
            onFormChange={setFormData}
            onSubmit={handleFormSubmit}
          />
        </div>

        {/* Subtle progress indicator with mountain bike theme */}
        <div className="fixed top-0 left-0 w-full h-0.5 bg-black/10 z-40 pointer-events-none">
          <div 
            className="h-full bg-gradient-to-r from-green-500 via-orange-500 to-red-500 transition-all duration-700"
            style={{ width: `${scrollProgress * 100}%` }}
          />
        </div>
      </div>
    </CinematicSmoothScrollController>
  );
};