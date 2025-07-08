import React, { useEffect, useRef, useState } from 'react';
import { ScrollBasedImageRenderer } from './ScrollBasedImageRenderer';
import { ParallaxSceneManager } from './ParallaxSceneManager';
import { IntegratedTextOverlay } from './IntegratedTextOverlay';
import { ConversionOptimizedFlow } from './ConversionOptimizedFlow';
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
  const [scenes, setScenes] = useState<CinematicScene[]>([]);
  const [currentScene, setCurrentScene] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isGenerating, setIsGenerating] = useState(true);
  const [formData, setFormData] = useState<Record<string, any>>({});

  useEffect(() => {
    generateCinematicScenes();
  }, [productName]);

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

  const generateCinematicScenes = async () => {
    setIsGenerating(true);
    try {
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

      if (error) throw error;

      if (data?.success && data?.cinematicScenes) {
        setScenes(data.cinematicScenes);
      }
    } catch (error) {
      console.error('Error generating cinematic scenes:', error);
      toast({
        title: "Errore",
        description: "Impossibile generare il funnel cinematografico",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
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

  if (isGenerating) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
        <div className="text-center space-y-6">
          <div className="w-20 h-20 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          <div className="text-white space-y-2">
            <h2 className="text-2xl font-bold">Creando la tua esperienza cinematografica</h2>
            <p className="text-white/70">Generando immagini e scene per {productName}</p>
          </div>
          <div className="flex items-center justify-center space-x-4 text-sm text-white/50">
            <span>🎬 Regia AI</span>
            <span>•</span>
            <span>📸 Immagini Full-Screen</span>
            <span>•</span>
            <span>✨ Effetti Parallax</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      {/* Scroll-based image renderer */}
      <ScrollBasedImageRenderer 
        scenes={scenes}
        currentScene={currentScene}
        scrollProgress={scrollProgress}
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