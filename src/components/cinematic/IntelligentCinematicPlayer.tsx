
// Intelligent Cinematic Funnel Player - Main Component

import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { 
  IntelligentCinematicService, 
  IntelligentCinematicFunnel, 
  ProductContext,
  CinematicScene 
} from '@/services/intelligentCinematicService';
import { CinematicSceneRenderer } from './CinematicSceneRenderer';
import { CinematicTransitionManager } from './CinematicTransitionManager';
import { AdaptivePerformanceMonitor } from './AdaptivePerformanceMonitor';
import { motion, AnimatePresence } from 'framer-motion';

interface IntelligentCinematicPlayerProps {
  productContext: ProductContext;
  onLeadCapture?: (data: any) => void;
  onComplete?: () => void;
  className?: string;
}

export const IntelligentCinematicPlayer: React.FC<IntelligentCinematicPlayerProps> = ({
  productContext,
  onLeadCapture,
  onComplete,
  className = ''
}) => {
  const { toast } = useToast();
  const [funnel, setFunnel] = useState<IntelligentCinematicFunnel | null>(null);
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [userInteractions, setUserInteractions] = useState<number>(0);
  const [performanceMode, setPerformanceMode] = useState<'high' | 'medium' | 'low'>('high');
  
  const playerRef = useRef<HTMLDivElement>(null);
  const sceneStartTime = useRef(Date.now());

  useEffect(() => {
    generateIntelligentFunnel();
  }, [productContext]);

  useEffect(() => {
    if (funnel) {
      // Track scene view analytics
      IntelligentCinematicService.trackAnalytics(funnel.id, 'scene_view', {
        sceneIndex: currentSceneIndex,
        sceneType: funnel.scenes[currentSceneIndex]?.type,
        timeOnPreviousScene: Date.now() - sceneStartTime.current
      });
      
      sceneStartTime.current = Date.now();
    }
  }, [currentSceneIndex, funnel]);

  const generateIntelligentFunnel = async () => {
    setLoading(true);
    try {
      console.log('🎬 Generating intelligent cinematic funnel...');
      
      let generatedFunnel = await IntelligentCinematicService.generateAdaptiveFunnel(productContext);
      
      // Optimize for current device
      const deviceType = window.innerWidth <= 768 ? 'mobile' : 
                        window.innerWidth <= 1024 ? 'tablet' : 'desktop';
      
      generatedFunnel = await IntelligentCinematicService.optimizeForDevice(generatedFunnel, deviceType);
      
      setFunnel(generatedFunnel);
      
      toast({
        title: "🎭 Esperienza Cinematica Attivata",
        description: `Funnel intelligente generato per ${productContext.name}`,
        duration: 3000,
      });
      
    } catch (error) {
      console.error('❌ Error generating intelligent funnel:', error);
      toast({
        title: "⚠️ Errore",
        description: "Impossibile generare l'esperienza cinematica. Riprova più tardi.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSceneProgress = () => {
    if (!funnel) return;
    
    const nextIndex = currentSceneIndex + 1;
    
    if (nextIndex < funnel.scenes.length) {
      setIsTransitioning(true);
      
      // Track interaction
      setUserInteractions(prev => prev + 1);
      IntelligentCinematicService.trackAnalytics(funnel.id, 'scene_progression', {
        fromScene: currentSceneIndex,
        toScene: nextIndex,
        userInteractions
      });
      
      setTimeout(() => {
        setCurrentSceneIndex(nextIndex);
        setIsTransitioning(false);
      }, funnel.scenes[currentSceneIndex].transitions.duration);
    } else {
      // Funnel completed
      IntelligentCinematicService.trackAnalytics(funnel.id, 'funnel_completed', {
        totalInteractions: userInteractions,
        totalTime: Date.now() - sceneStartTime.current
      });
      
      onComplete?.();
    }
  };

  const handleLeadSubmission = async (leadData: any) => {
    if (!funnel) return;
    
    const enrichedLeadData = {
      ...leadData,
      funnelId: funnel.id,
      productContext,
      userJourney: {
        totalScenes: funnel.scenes.length,
        completedScenes: currentSceneIndex + 1,
        interactions: userInteractions,
        performanceMode
      },
      timestamp: new Date().toISOString()
    };
    
    // Track conversion
    IntelligentCinematicService.trackAnalytics(funnel.id, 'lead_conversion', enrichedLeadData);
    
    onLeadCapture?.(enrichedLeadData);
    
    toast({
      title: "🎉 Perfetto!",
      description: "I tuoi dati sono stati inviati con successo!",
      duration: 5000,
    });
  };

  const handlePerformanceUpdate = (newMode: 'high' | 'medium' | 'low') => {
    setPerformanceMode(newMode);
    IntelligentCinematicService.trackAnalytics(funnel?.id || '', 'performance_mode_change', {
      oldMode: performanceMode,
      newMode,
      sceneIndex: currentSceneIndex
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10">
        <motion.div 
          className="text-center space-y-6"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div className="relative">
            <motion.div 
              className="w-24 h-24 border-4 border-primary border-t-transparent rounded-full mx-auto"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <motion.div 
              className="absolute inset-0 w-24 h-24 border-2 border-secondary border-b-transparent rounded-full mx-auto"
              animate={{ rotate: -360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            />
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-2xl font-bold text-foreground mb-2">
              🎬 Creando la Tua Esperienza Cinematica
            </h2>
            <p className="text-muted-foreground text-lg">
              Generando un funnel intelligente per <span className="font-semibold text-primary">{productContext.name}</span>
            </p>
            
            <div className="mt-6 space-y-2">
              <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                <motion.span
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  ✨ Analisi del prodotto
                </motion.span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                <motion.span
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
                >
                  🎨 Generazione grafica cinematica
                </motion.span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                <motion.span
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 1 }}
                >
                  🎭 Ottimizzazione adattiva
                </motion.span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  if (!funnel) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-semibold mb-4">⚠️ Errore di Generazione</h2>
          <p className="text-muted-foreground mb-4">
            Impossibile generare l'esperienza cinematica per {productContext.name}
          </p>
          <Button onClick={generateIntelligentFunnel}>
            🔄 Riprova
          </Button>
        </Card>
      </div>
    );
  }

  const currentScene = funnel.scenes[currentSceneIndex];
  const progress = ((currentSceneIndex + 1) / funnel.scenes.length) * 100;

  return (
    <div 
      ref={playerRef}
      className={`min-h-screen relative overflow-hidden ${className}`}
      style={{
        background: `var(--cinematic-${currentScene.cinematicElements.background})`,
      }}
    >
      {/* Adaptive Performance Monitor */}
      <AdaptivePerformanceMonitor 
        onPerformanceChange={handlePerformanceUpdate}
        currentMode={performanceMode}
      />

      {/* Progress Indicator */}
      <motion.div 
        className="fixed top-0 left-0 right-0 z-50 p-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-white/80 font-medium">
              Scena {currentSceneIndex + 1} di {funnel.scenes.length}
            </span>
            <span className="text-sm text-white/80">
              {Math.round(progress)}% completato
            </span>
          </div>
          <Progress 
            value={progress} 
            className="h-1 bg-white/20"
          />
        </div>
      </motion.div>

      {/* Main Content Area */}
      <div className="relative z-10 min-h-screen">
        <AnimatePresence mode="wait">
          {!isTransitioning && (
            <CinematicTransitionManager
              key={currentSceneIndex}
              transition={currentScene.transitions}
              isActive={!isTransitioning}
            >
              <CinematicSceneRenderer
                scene={currentScene}
                funnel={funnel}
                onProgress={handleSceneProgress}
                onLeadSubmit={handleLeadSubmission}
                performanceMode={performanceMode}
                userInteractions={userInteractions}
              />
            </CinematicTransitionManager>
          )}
        </AnimatePresence>
      </div>

      {/* Scene Navigation */}
      <motion.div 
        className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
      >
        <div className="flex space-x-2">
          {funnel.scenes.map((_, index) => (
            <motion.button
              key={index}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSceneIndex 
                  ? 'bg-white scale-125' 
                  : index < currentSceneIndex 
                    ? 'bg-white/60' 
                    : 'bg-white/30'
              }`}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                if (index <= currentSceneIndex) {
                  setCurrentSceneIndex(index);
                }
              }}
            />
          ))}
        </div>
      </motion.div>

      {/* Development Info (only in dev mode) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed top-20 right-4 z-50 bg-black/80 text-white p-3 rounded-lg text-xs">
          <div>Scene: {currentScene.type}</div>
          <div>Performance: {performanceMode}</div>
          <div>Interactions: {userInteractions}</div>
          <div>Transitioning: {isTransitioning ? 'Yes' : 'No'}</div>
        </div>
      )}
    </div>
  );
};
