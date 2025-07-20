// Intelligent Cinematic Player - Updated for Dynamic Steps

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
  const [userInteractions, setUserInteractions] = useState<any[]>([]);
  const [performanceMode, setPerformanceMode] = useState<'high' | 'medium' | 'low'>('high');
  
  const playerRef = useRef<HTMLDivElement>(null);
  const sceneStartTime = useRef(Date.now());
  const sessionStartTime = useRef(Date.now());

  useEffect(() => {
    generateIntelligentFunnel();
  }, [productContext]);

  useEffect(() => {
    if (funnel) {
      // Track scene view e analizza comportamento utente
      const timeOnScene = Date.now() - sceneStartTime.current;
      const sceneData = {
        sceneIndex: currentSceneIndex,
        sceneType: funnel.scenes[currentSceneIndex]?.type,
        timeOnScene,
        totalSessionTime: Date.now() - sessionStartTime.current,
        deviceType: window.innerWidth <= 768 ? 'mobile' : 'desktop',
        timestamp: Date.now()
      };

      // Aggiungi interazione alla cronologia
      setUserInteractions(prev => [...prev, {
        type: 'scene_view',
        ...sceneData
      }]);

      IntelligentCinematicService.trackAnalytics(funnel.id, 'scene_view', sceneData);
      
      sceneStartTime.current = Date.now();
    }
  }, [currentSceneIndex, funnel]);

  const generateIntelligentFunnel = async () => {
    setLoading(true);
    try {
      console.log('🎬 Generating adaptive cinematic funnel...');
      
      // Passa le interazioni esistenti per la generazione del profilo utente
      let generatedFunnel = await IntelligentCinematicService.generateAdaptiveFunnel(
        productContext, 
        userInteractions
      );
      
      // Ottimizza per il dispositivo corrente
      const deviceType = window.innerWidth <= 768 ? 'mobile' : 
                        window.innerWidth <= 1024 ? 'tablet' : 'desktop';
      
      generatedFunnel = await IntelligentCinematicService.optimizeForDevice(generatedFunnel, deviceType);
      
      setFunnel(generatedFunnel);
      
      console.log('🎯 Generated funnel with', generatedFunnel.scenes.length, 'adaptive scenes');
      console.log('👤 User profile:', generatedFunnel.userProfile);
      
      toast({
        title: "🎭 Esperienza Personalizzata Attivata",
        description: `Funnel adattivo generato per ${productContext.name} basato sul tuo profilo`,
        duration: 3000,
      });
      
    } catch (error) {
      console.error('❌ Error generating adaptive funnel:', error);
      toast({
        title: "⚠️ Errore",
        description: "Impossibile generare l'esperienza personalizzata. Riprova più tardi.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSceneProgress = async (userResponse?: any) => {
    if (!funnel) return;
    
    const currentScene = funnel.scenes[currentSceneIndex];
    const timeOnCurrentScene = Date.now() - sceneStartTime.current;
    
    // Registra l'interazione dettagliata
    const interactionData = {
      type: 'scene_interaction',
      sceneId: currentScene.id,
      sceneType: currentScene.type,
      userResponse,
      timeOnScene: timeOnCurrentScene,
      timestamp: Date.now()
    };
    
    setUserInteractions(prev => [...prev, interactionData]);
    
    // Determina il prossimo step usando la logica adattiva
    let nextSceneIndex = currentSceneIndex + 1;
    
    if (currentScene.adaptiveRules.nextStepLogic && userResponse) {
      const nextStepId = currentScene.adaptiveRules.nextStepLogic(userResponse);
      const foundIndex = funnel.scenes.findIndex(scene => scene.id === nextStepId);
      if (foundIndex !== -1) {
        nextSceneIndex = foundIndex;
      }
    }
    
    if (nextSceneIndex < funnel.scenes.length) {
      setIsTransitioning(true);
      
      // Track progression con nuovi dati
      IntelligentCinematicService.trackAnalytics(funnel.id, 'adaptive_progression', {
        fromScene: currentSceneIndex,
        toScene: nextSceneIndex,
        userResponse,
        interactionCount: userInteractions.length,
        adaptiveDecision: currentScene.adaptiveRules.nextStepLogic ? 'dynamic' : 'linear'
      });
      
      setTimeout(() => {
        setCurrentSceneIndex(nextSceneIndex);
        setIsTransitioning(false);
      }, currentScene.transitions.duration);
    } else {
      // Funnel completato - analisi finale
      await handleFunnelCompletion();
    }
  };

  const handleFunnelCompletion = async () => {
    if (!funnel) return;
    
    const totalSessionTime = Date.now() - sessionStartTime.current;
    const completionData = {
      totalInteractions: userInteractions.length,
      totalTime: totalSessionTime,
      scenesCompleted: currentSceneIndex + 1,
      userProfile: funnel.userProfile,
      conversionPath: userInteractions.map(i => i.type),
      adaptiveAdjustments: funnel.dynamicSteps?.length || 0
    };
    
    IntelligentCinematicService.trackAnalytics(funnel.id, 'funnel_completed', completionData);
    
    toast({
      title: "🎉 Esperienza Completata!",
      description: "Grazie per aver completato il tuo percorso personalizzato.",
      duration: 4000,
    });
    
    onComplete?.();
  };

  const handleLeadSubmission = async (leadData: any) => {
    if (!funnel) return;
    
    // Arricchisci i dati del lead con intelligenza comportamentale
    const enrichedLeadData = {
      ...leadData,
      funnelId: funnel.id,
      productContext,
      userProfile: funnel.userProfile,
      behavioralInsights: {
        totalInteractions: userInteractions.length,
        engagementScore: calculateEngagementScore(),
        conversionIntent: funnel.userProfile?.conversionIntent || 0.5,
        preferredInteractionStyle: funnel.userProfile?.interactionPattern,
        devicePreference: funnel.userProfile?.deviceType,
        timeInvested: Date.now() - sessionStartTime.current
      },
      adaptiveJourney: {
        scenesExperienced: currentSceneIndex + 1,
        totalScenesGenerated: funnel.scenes.length,
        personalizedElements: funnel.dynamicSteps?.length || 0,
        completionRate: (currentSceneIndex + 1) / funnel.scenes.length
      },
      timestamp: new Date().toISOString()
    };
    
    // Track conversion con dati dettagliati
    IntelligentCinematicService.trackAnalytics(funnel.id, 'intelligent_conversion', enrichedLeadData);
    
    onLeadCapture?.(enrichedLeadData);
    
    toast({
      title: "🎯 Perfetto!",
      description: "I tuoi dati sono stati inviati. Ti contatteremo con un'offerta personalizzata!",
      duration: 5000,
    });
  };

  const calculateEngagementScore = (): number => {
    if (userInteractions.length === 0) return 0;
    
    const totalTime = userInteractions.reduce((sum, interaction) => 
      sum + (interaction.timeOnScene || 0), 0);
    const avgTimePerInteraction = totalTime / userInteractions.length;
    const interactionCount = userInteractions.length;
    
    // Score basato su tempo e interazioni
    const timeScore = Math.min(avgTimePerInteraction / 30000, 1); // Normalizzato a 30s max
    const interactionScore = Math.min(interactionCount / 10, 1); // Normalizzato a 10 interazioni max
    
    return Math.round((timeScore + interactionScore) * 50); // Score da 0 a 100
  };

  const handlePerformanceUpdate = (newMode: 'high' | 'medium' | 'low') => {
    setPerformanceMode(newMode);
    if (funnel) {
      IntelligentCinematicService.trackAnalytics(funnel.id, 'performance_optimization', {
        oldMode: performanceMode,
        newMode,
        sceneIndex: currentSceneIndex,
        deviceType: funnel.userProfile?.deviceType
      });
    }
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
              🧠 Creando la Tua Esperienza Personalizzata
            </h2>
            <p className="text-muted-foreground text-lg">
              Analizzando il tuo profilo per <span className="font-semibold text-primary">{productContext.name}</span>
            </p>
            
            <div className="mt-6 space-y-2">
              <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                <motion.span
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  🎯 Analisi comportamentale
                </motion.span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                <motion.span
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
                >
                  🎨 Generazione step adattivi
                </motion.span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                <motion.span
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 1 }}
                >
                  🎭 Ottimizzazione cinematica
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
          <h2 className="text-xl font-semibold mb-4">⚠️ Errore nella Personalizzazione</h2>
          <p className="text-muted-foreground mb-4">
            Impossibile generare l'esperienza personalizzata per {productContext.name}
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

      {/* Enhanced Progress Indicator */}
      <motion.div 
        className="fixed top-0 left-0 right-0 z-50 p-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-white/80 font-medium">
              Step {currentSceneIndex + 1} di {funnel.scenes.length} • Personalizzato per te
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/60">
                Profilo: {funnel.userProfile?.interactionPattern}
              </span>
              <span className="text-sm text-white/80">
                {Math.round(progress)}%
              </span>
            </div>
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
                adaptiveData={{
                  userProfile: funnel.userProfile,
                  currentEngagement: calculateEngagementScore(),
                  sessionTime: Date.now() - sessionStartTime.current
                }}
              />
            </CinematicTransitionManager>
          )}
        </AnimatePresence>
      </div>

      {/* Enhanced Scene Navigation */}
      <motion.div 
        className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
      >
        <div className="flex items-center space-x-2 bg-black/20 backdrop-blur-sm rounded-full px-4 py-2">
          {funnel.scenes.map((scene, index) => (
            <motion.button
              key={scene.id}
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
              title={`Step ${index + 1}: ${scene.title}`}
            />
          ))}
          <div className="ml-2 text-xs text-white/60">
            AI-Personalizzato
          </div>
        </div>
      </motion.div>

      {/* Development Info (enhanced) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed top-20 right-4 z-50 bg-black/80 text-white p-3 rounded-lg text-xs max-w-xs">
          <div><strong>Scene:</strong> {currentScene.type}</div>
          <div><strong>Performance:</strong> {performanceMode}</div>
          <div><strong>Interactions:</strong> {userInteractions.length}</div>
          <div><strong>Engagement:</strong> {calculateEngagementScore()}/100</div>
          <div><strong>Profile:</strong> {funnel.userProfile?.interactionPattern}</div>
          <div><strong>Intent:</strong> {Math.round((funnel.userProfile?.conversionIntent || 0) * 100)}%</div>
          <div><strong>Device:</strong> {funnel.userProfile?.deviceType}</div>
        </div>
      )}
    </div>
  );
};
