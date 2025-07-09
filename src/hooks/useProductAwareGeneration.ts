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
      currentStep: '🎬 Inizializzazione sistema cinematografico...',
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
      updateProgress(15, '🎨 Creando scene product-aware...');

      // Generate scenes with product context
      const baseScenes = await generateProductAwareScenes(productContext);
      
      updateProgress(40, '🖼️ Generando immagini cinematografiche...');
      
      // Generate high-quality images for each scene
      const scenesWithImages = await generateScenesWithImages(baseScenes, productContext);
      
      setScenes(scenesWithImages);
      updateProgress(100, '✅ Esperienza cinematografica pronta!');

      setState(prev => ({
        ...prev,
        isGenerating: false,
        canCancel: false,
        totalImages: scenesWithImages.length,
        imagesLoaded: scenesWithImages.length
      }));

      toast({
        title: "🎬 Esperienza Generata!",
        description: `${scenesWithImages.length} scene cinematografiche per ${productContext.name}`,
      });

      return scenesWithImages;

    } catch (error: any) {
      console.error('💥 Generation error:', error);
      
      // Generate fallback scenes if main generation fails
      const fallbackScenes = await createSmartFallbackScenes(productContext);
      setScenes(fallbackScenes);
      
      setState(prev => ({
        ...prev,
        isGenerating: false,
        error: null,
        canRetry: retryCount < 2,
        canCancel: false,
        totalImages: fallbackScenes.length,
        imagesLoaded: fallbackScenes.length
      }));

      toast({
        title: "🎬 Esperienza Creata",
        description: `Scene di fallback generate per ${productContext.name}`,
      });

      return fallbackScenes;
    }
  }, [updateProgress, retryCount, toast]);

  const generateProductAwareScenes = async (productContext: ProductContext) => {
    const sceneTemplates = [
      {
        type: 'hero' as const,
        title: `Scopri ${productContext.name}`,
        subtitle: 'L\'innovazione che cambia tutto',
        content: `${productContext.description || 'Un\'esperienza unica che supera ogni aspettativa.'}`,
        cta: { text: 'Scopri di più', action: 'scroll' },
        priority: 'high' as const
      },
      {
        type: 'benefit' as const,
        title: `Perché scegliere ${productContext.name}`,
        subtitle: 'Vantaggi che fanno la differenza',
        content: `Con ${productContext.name} ottieni qualità superiore, risultati garantiti e un'esperienza senza pari.`,
        priority: 'high' as const
      },
      {
        type: 'proof' as const,
        title: 'Risultati comprovati',
        subtitle: 'La fiducia dei nostri clienti',
        content: `Migliaia di clienti soddisfatti hanno già scelto ${productContext.name}. Unisciti a loro.`,
        priority: 'low' as const
      },
      {
        type: 'demo' as const,
        title: `${productContext.name} in azione`,
        subtitle: 'Guarda come funziona',
        content: `Scopri ${productContext.name} all'opera: prestazioni superiori che superano ogni aspettativa.`,
        priority: 'high' as const
      },
      {
        type: 'conversion' as const,
        title: 'Inizia ora',
        subtitle: 'Il tuo futuro ti aspetta',
        content: `Non aspettare oltre. Inizia la tua esperienza con ${productContext.name} oggi stesso.`,
        priority: 'low' as const
      }
    ];

    return sceneTemplates.map((scene, index) => ({
      id: `scene_${scene.type}_${index}`,
      ...scene,
      imagePrompt: generateAdvancedImagePrompt(scene, productContext),
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
      loadingPriority: scene.priority
    }));
  };

  const generateScenesWithImages = async (scenes: any[], productContext: ProductContext) => {
    const scenesWithImages = [];
    
    for (let i = 0; i < scenes.length; i++) {
      const scene = scenes[i];
      updateProgress(40 + (i * 12), `🎨 Generando immagine ${i + 1}/${scenes.length}...`);
      
      try {
        const { data, error } = await supabase.functions.invoke('generate-cinematic-images', {
          body: {
            productName: productContext.name,
            productDescription: productContext.description,
            industry: productContext.industry,
            sceneType: scene.type,
            visualStyle: productContext.visualStyle || 'cinematic',
            specificPrompt: scene.imagePrompt
          }
        });

        if (error) {
          console.warn(`⚠️ Image generation failed for scene ${scene.type}, using fallback`);
          scene.imageUrl = generateFallbackImageUrl(scene.type, productContext);
        } else {
          scene.imageUrl = data.imageUrl;
          console.log(`✅ Generated image for ${scene.type} scene`);
        }
      } catch (error) {
        console.warn(`⚠️ Image generation error for scene ${scene.type}:`, error);
        scene.imageUrl = generateFallbackImageUrl(scene.type, productContext);
      }
      
      scenesWithImages.push(scene);
    }
    
    return scenesWithImages;
  };

  const createSmartFallbackScenes = async (productContext: ProductContext): Promise<CinematicScene[]> => {
    const baseScenes = await generateProductAwareScenes(productContext);
    
    return baseScenes.map(scene => ({
      ...scene,
      imageUrl: generateFallbackImageUrl(scene.type, productContext),
      fallbackImage: generateFallbackImageUrl(scene.type, productContext)
    }));
  };

  const generateAdvancedImagePrompt = (scene: any, productContext: ProductContext): string => {
    const industry = productContext.industry || 'business';
    const visualStyle = productContext.visualStyle || 'cinematic';
    const productName = productContext.name;
    const productDescription = productContext.description || '';
    
    // Advanced style specifications
    const styleSpecs = {
      minimal: 'clean minimalist design, white background, simple composition, elegant simplicity',
      dynamic: 'energetic composition, vibrant colors, dynamic lighting, movement and action',
      elegant: 'sophisticated luxury aesthetic, premium materials, refined composition, timeless elegance',
      technical: 'high-tech precision, modern engineering, clean lines, professional technical environment',
      cinematic: 'dramatic lighting, film-quality composition, depth of field, professional cinematography'
    };

    // Industry-specific contexts
    const industryContexts = {
      'technology': 'modern tech environment, sleek interfaces, digital innovation, futuristic workspace',
      'health': 'clean medical environment, wellness atmosphere, professional healthcare setting, serene lighting',
      'finance': 'professional office space, success indicators, business growth visuals, corporate elegance',
      'education': 'learning environment, knowledge transfer, academic excellence, inspiring atmosphere',
      'automotive': 'precision engineering, performance focus, dynamic movement, premium materials',
      'fitness': 'energy and vitality, athletic performance, strength and determination, dynamic action',
      'food': 'appetizing presentation, fresh ingredients, culinary artistry, warm inviting atmosphere',
      'fashion': 'style and elegance, premium materials, sophisticated design, fashion-forward aesthetic',
      'travel': 'exploration and adventure, beautiful destinations, luxury experience, wanderlust inspiration',
      'real estate': 'architectural excellence, luxury living, premium locations, lifestyle aspiration',
      'default': 'professional, premium quality, sophisticated atmosphere, success and excellence'
    };

    // Scene-specific contexts
    const sceneContexts = {
      hero: `flagship presentation of ${productName}, premium hero shot, aspirational lifestyle, market leadership`,
      benefit: `demonstrating key advantages of ${productName}, problem-solving in action, clear value proposition, transformation`,
      proof: `real-world success with ${productName}, authentic testimonials, credible results, social proof`,
      demo: `${productName} in professional use, detailed functionality, expert demonstration, technical excellence`,
      conversion: `compelling call-to-action for ${productName}, urgency and opportunity, decision moment, exclusive access`
    };

    const industryContext = industryContexts[industry as keyof typeof industryContexts] || industryContexts.default;
    const styleSpec = styleSpecs[visualStyle as keyof typeof styleSpecs] || styleSpecs.cinematic;
    const sceneContext = sceneContexts[scene.type as keyof typeof sceneContexts] || `professional ${productName} presentation`;

    // Build comprehensive, product-specific prompt
    let prompt = `Professional commercial photography: ${sceneContext}. `;
    
    if (productDescription) {
      prompt += `Product context: ${productDescription}. `;
    }
    
    prompt += `Visual style: ${styleSpec}. `;
    prompt += `Environment: ${industryContext}. `;
    prompt += `Ultra-high quality, photorealistic, commercial grade, perfect lighting, `;
    prompt += `professional composition, sharp focus, premium aesthetic, 8K resolution, `;
    prompt += `shot with professional camera equipment, no text overlays, no logos, clean composition, `;
    prompt += `hyper-realistic, award-winning photography`;

    return prompt;
  };

  const generateFallbackImageUrl = (sceneType: string, productContext: ProductContext): string => {
    const industry = productContext.industry || 'business';
    
    // High-quality, industry-specific Unsplash images
    const fallbackImages = {
      hero: {
        technology: 'photo-1518709268805-4e9042af2176?w=1792&h=1024',
        health: 'photo-1559757148-5c350d0d3c56?w=1792&h=1024',
        finance: 'photo-1560472354-b33ff0c44a43?w=1792&h=1024',
        education: 'photo-1523240795612-9a054b0db644?w=1792&h=1024',
        automotive: 'photo-1493238792000-8113da705763?w=1792&h=1024',
        fitness: 'photo-1571019613454-1cb2f99b2d8b?w=1792&h=1024',
        default: 'photo-1560472354-b33ff0c44a43?w=1792&h=1024'
      },
      benefit: {
        technology: 'photo-1460925895917-afdab827c52f?w=1792&h=1024',
        health: 'photo-1576091160399-112ba8d25d1f?w=1792&h=1024',
        finance: 'photo-1507003211169-0a1dd7228f2d?w=1792&h=1024',
        education: 'photo-1522202176988-66273c2fd55f?w=1792&h=1024',
        default: 'photo-1460925895917-afdab827c52f?w=1792&h=1024'
      },
      proof: {
        technology: 'photo-1552664730-d307ca884978?w=1792&h=1024',
        health: 'photo-1582750433449-648ed127bb54?w=1792&h=1024',
        finance: 'photo-1554224155-6726b3ff858f?w=1792&h=1024',
        default: 'photo-1552664730-d307ca884978?w=1792&h=1024'
      },
      demo: {
        technology: 'photo-1531297484001-80022131f5a1?w=1792&h=1024',
        health: 'photo-1576091160550-2173dba999ef?w=1792&h=1024',
        finance: 'photo-1551288049-bebda4e38f71?w=1792&h=1024',
        default: 'photo-1531297484001-80022131f5a1?w=1792&h=1024'
      },
      conversion: {
        technology: 'photo-1519389950473-47ba0277781c?w=1792&h=1024',
        health: 'photo-1576091160399-112ba8d25d1f?w=1792&h=1024',
        finance: 'photo-1560472354-b33ff0c44a43?w=1792&h=1024',
        default: 'photo-1519389950473-47ba0277781c?w=1792&h=1024'
      }
    };

    const sceneImages = fallbackImages[sceneType as keyof typeof fallbackImages];
    const imageId = sceneImages?.[industry as keyof typeof sceneImages] || sceneImages?.default || fallbackImages.hero.default;
    
    return `https://images.unsplash.com/${imageId}&fit=crop&q=80&auto=format&cs=tinysrgb`;
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