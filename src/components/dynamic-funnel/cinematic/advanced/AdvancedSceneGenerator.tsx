import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Wand2, Camera, Sparkles, Download, RefreshCw } from 'lucide-react';

interface AdvancedScene {
  id: string;
  type: 'hero' | 'benefit' | 'proof' | 'demo' | 'conversion';
  title: string;
  subtitle: string;
  content: string;
  imagePrompt: string;
  generatedImageUrl?: string;
  isGenerating?: boolean;
  animationStyle: 'parallax' | 'zoom' | 'fade' | 'slide' | 'rotation';
  duration: number;
  physics: {
    particles: boolean;
    gravity: number;
    wind: number;
    collision: boolean;
  };
  cinematography: {
    camera: 'static' | 'pan' | 'zoom' | 'orbit';
    lighting: 'natural' | 'dramatic' | 'soft' | 'harsh';
    mood: 'energetic' | 'calm' | 'intense' | 'inspiring';
  };
  customization: {
    colorScheme: string[];
    fontWeight: 'light' | 'normal' | 'medium' | 'bold';
    textShadow: boolean;
    backgroundOverlay: boolean;
  };
}

interface AdvancedSceneGeneratorProps {
  productName: string;
  productDescription?: string;
  industry?: string;
  onScenesGenerated: (scenes: AdvancedScene[]) => void;
  initialScenes?: AdvancedScene[];
}

export const AdvancedSceneGenerator: React.FC<AdvancedSceneGeneratorProps> = ({
  productName,
  productDescription,
  industry,
  onScenesGenerated,
  initialScenes = []
}) => {
  const { toast } = useToast();
  const [scenes, setScenes] = useState<AdvancedScene[]>(initialScenes);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [customPrompt, setCustomPrompt] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<'action' | 'elegant' | 'technical' | 'emotional'>('action');

  const sceneTemplates = {
    action: {
      name: 'Azione Dinamica',
      description: 'Movimenti rapidi, particelle, effetti fisici',
      scenes: [
        { type: 'hero', animationStyle: 'zoom', physics: { particles: true, gravity: 0.2, wind: 0.1, collision: true } },
        { type: 'benefit', animationStyle: 'slide', physics: { particles: true, gravity: 0.1, wind: 0.05, collision: false } },
        { type: 'proof', animationStyle: 'parallax', physics: { particles: false, gravity: 0, wind: 0, collision: false } },
        { type: 'demo', animationStyle: 'rotation', physics: { particles: true, gravity: 0.15, wind: 0.08, collision: true } },
        { type: 'conversion', animationStyle: 'fade', physics: { particles: false, gravity: 0, wind: 0, collision: false } }
      ]
    },
    elegant: {
      name: 'Eleganza Fluida',
      description: 'Movimenti soft, transizioni delicate',
      scenes: [
        { type: 'hero', animationStyle: 'fade', physics: { particles: false, gravity: 0.05, wind: 0.02, collision: false } },
        { type: 'benefit', animationStyle: 'parallax', physics: { particles: true, gravity: 0.03, wind: 0.01, collision: false } },
        { type: 'proof', animationStyle: 'zoom', physics: { particles: false, gravity: 0, wind: 0, collision: false } },
        { type: 'demo', animationStyle: 'slide', physics: { particles: true, gravity: 0.05, wind: 0.02, collision: false } },
        { type: 'conversion', animationStyle: 'fade', physics: { particles: false, gravity: 0, wind: 0, collision: false } }
      ]
    },
    technical: {
      name: 'Tecnico Preciso',
      description: 'Animazioni geometriche, effetti digitali',
      scenes: [
        { type: 'hero', animationStyle: 'rotation', physics: { particles: true, gravity: 0, wind: 0, collision: true } },
        { type: 'benefit', animationStyle: 'zoom', physics: { particles: false, gravity: 0, wind: 0, collision: false } },
        { type: 'proof', animationStyle: 'slide', physics: { particles: true, gravity: 0.1, wind: 0, collision: true } },
        { type: 'demo', animationStyle: 'parallax', physics: { particles: true, gravity: 0.05, wind: 0, collision: false } },
        { type: 'conversion', animationStyle: 'fade', physics: { particles: false, gravity: 0, wind: 0, collision: false } }
      ]
    },
    emotional: {
      name: 'Emotivo Coinvolgente',
      description: 'Focus sul storytelling, atmosfera immersiva',
      scenes: [
        { type: 'hero', animationStyle: 'parallax', physics: { particles: true, gravity: 0.08, wind: 0.03, collision: false } },
        { type: 'benefit', animationStyle: 'fade', physics: { particles: true, gravity: 0.05, wind: 0.02, collision: false } },
        { type: 'proof', animationStyle: 'zoom', physics: { particles: false, gravity: 0, wind: 0, collision: false } },
        { type: 'demo', animationStyle: 'slide', physics: { particles: true, gravity: 0.1, wind: 0.04, collision: false } },
        { type: 'conversion', animationStyle: 'fade', physics: { particles: false, gravity: 0, wind: 0, collision: false } }
      ]
    }
  };

  const generateAdvancedScenes = async () => {
    setIsGenerating(true);
    setGenerationProgress(0);

    try {
      // Simulated advanced scene generation
      const template = sceneTemplates[selectedTemplate];
      const generatedScenes: AdvancedScene[] = [];

      for (let i = 0; i < template.scenes.length; i++) {
        const sceneTemplate = template.scenes[i];
        setGenerationProgress((i / template.scenes.length) * 50);

        const scene: AdvancedScene = {
          id: `scene-${i}-${Date.now()}`,
          type: sceneTemplate.type as any,
          title: generateSceneTitle(sceneTemplate.type as any, productName),
          subtitle: generateSceneSubtitle(sceneTemplate.type as any, productName),
          content: generateSceneContent(sceneTemplate.type as any, productName, productDescription),
          imagePrompt: generateImagePrompt(sceneTemplate.type as any, productName, productDescription, industry),
          animationStyle: sceneTemplate.animationStyle as any,
          duration: 3000 + Math.random() * 2000,
          physics: sceneTemplate.physics,
          cinematography: {
            camera: i % 2 === 0 ? 'pan' : 'zoom',
            lighting: selectedTemplate === 'elegant' ? 'soft' : 'dramatic',
            mood: selectedTemplate === 'emotional' ? 'inspiring' : 'energetic'
          },
          customization: {
            colorScheme: generateColorScheme(selectedTemplate),
            fontWeight: selectedTemplate === 'elegant' ? 'light' : 'bold',
            textShadow: true,
            backgroundOverlay: true
          }
        };

        generatedScenes.push(scene);
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      setGenerationProgress(75);

      // Generate images for each scene
      for (let i = 0; i < generatedScenes.length; i++) {
        setGenerationProgress(75 + (i / generatedScenes.length) * 25);
        
        try {
          // Placeholder for actual image generation
          const imageUrl = `https://images.unsplash.com/photo-${1500000000000 + i}?w=1920&h=1080&fit=crop&crop=center`;
          generatedScenes[i].generatedImageUrl = imageUrl;
        } catch (error) {
          console.warn(`Failed to generate image for scene ${i}:`, error);
        }
        
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      setScenes(generatedScenes);
      onScenesGenerated(generatedScenes);
      setGenerationProgress(100);

      toast({
        title: "🎬 Scene Avanzate Generate!",
        description: `${generatedScenes.length} scene cinematografiche create con successo`,
      });

    } catch (error) {
      console.error('Error generating advanced scenes:', error);
      toast({
        title: "❌ Errore Generazione",
        description: "Errore nella generazione delle scene avanzate",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
      setTimeout(() => setGenerationProgress(0), 1000);
    }
  };

  const generateSceneTitle = (type: string, product: string): string => {
    const titles = {
      hero: `Scopri ${product}`,
      benefit: `Vantaggi Unici di ${product}`,
      proof: `Risultati Comprovati`,
      demo: `${product} in Azione`,
      conversion: `Ottieni ${product} Ora`
    };
    return titles[type] || `${product} Experience`;
  };

  const generateSceneSubtitle = (type: string, product: string): string => {
    const subtitles = {
      hero: `L'esperienza che cambia tutto`,
      benefit: `Perché scegliere la qualità superiore`,
      proof: `La fiducia di migliaia di clienti`,
      demo: `Guarda come funziona dal vivo`,
      conversion: `Unisciti alla rivoluzione`
    };
    return subtitles[type] || `Discover ${product}`;
  };

  const generateSceneContent = (type: string, product: string, description?: string): string => {
    const baseContent = description || `${product} rappresenta l'eccellenza nel suo settore`;
    
    const contents = {
      hero: `${baseContent}. Un'esperienza che supera ogni aspettativa.`,
      benefit: `Con ${product}, ottieni prestazioni superiori, qualità garantita e risultati duraturi.`,
      proof: `Oltre 10.000 clienti soddisfatti hanno già scelto ${product}. Unisciti a loro.`,
      demo: `Guarda ${product} all'opera: velocità, precisione ed eleganza in ogni movimento.`,
      conversion: `Non aspettare oltre. Inizia la tua esperienza con ${product} oggi stesso.`
    };
    
    return contents[type] || baseContent;
  };

  const generateImagePrompt = (type: string, product: string, description?: string, industry?: string): string => {
    const context = industry || 'premium product';
    const productDesc = description || product;
    
    const prompts = {
      hero: `Cinematic hero shot of ${productDesc} in dramatic ${context} environment, dynamic lighting, action scene, ultra high resolution`,
      benefit: `Professional showcase of ${productDesc} highlighting key features, clean composition, modern ${context} setting`,
      proof: `Real customers using ${productDesc}, authentic testimonial scene, professional photography, ${context} background`,
      demo: `${productDesc} in action sequence, dynamic movement, particles and effects, ${context} environment, cinematic quality`,
      conversion: `Call-to-action scene with ${productDesc}, inviting atmosphere, premium ${context} setting, conversion optimized`
    };
    
    return prompts[type] || `High-quality image of ${productDesc} in ${context} setting`;
  };

  const generateColorScheme = (template: string): string[] => {
    const schemes = {
      action: ['#FF4500', '#FFD700', '#FF6347', '#FF1493'],
      elegant: ['#E6E6FA', '#F0F8FF', '#F5F5DC', '#FFF8DC'],
      technical: ['#00CED1', '#4169E1', '#32CD32', '#FF4500'],
      emotional: ['#FFB6C1', '#FFA07A', '#98FB98', '#87CEEB']
    };
    return schemes[template] || schemes.action;
  };

  const regenerateScene = async (sceneId: string) => {
    const sceneIndex = scenes.findIndex(s => s.id === sceneId);
    if (sceneIndex === -1) return;

    const updatedScenes = [...scenes];
    updatedScenes[sceneIndex].isGenerating = true;
    setScenes(updatedScenes);

    try {
      // Regenerate image for specific scene
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      updatedScenes[sceneIndex].generatedImageUrl = `https://images.unsplash.com/photo-${Date.now()}?w=1920&h=1080&fit=crop&crop=center`;
      updatedScenes[sceneIndex].isGenerating = false;
      
      setScenes(updatedScenes);
      onScenesGenerated(updatedScenes);

      toast({
        title: "🔄 Scena Rigenerata",
        description: "Nuova immagine generata con successo",
      });
    } catch (error) {
      updatedScenes[sceneIndex].isGenerating = false;
      setScenes(updatedScenes);
      
      toast({
        title: "❌ Errore Rigenerazione",
        description: "Impossibile rigenerare la scena",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Wand2 className="w-6 h-6" />
            <span>Generatore Scene Avanzate</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Template Selection */}
          <div className="space-y-3">
            <Label>Template Cinematografico</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.entries(sceneTemplates).map(([key, template]) => (
                <button
                  key={key}
                  onClick={() => setSelectedTemplate(key as any)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    selectedTemplate === key
                      ? 'border-primary bg-primary/10'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-sm font-medium">{template.name}</div>
                  <div className="text-xs text-gray-500 mt-1">{template.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Prompt */}
          <div className="space-y-2">
            <Label htmlFor="customPrompt">Prompt Personalizzato (Opzionale)</Label>
            <Textarea
              id="customPrompt"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Descrivi l'atmosfera o gli elementi specifici che vuoi includere..."
              rows={3}
            />
          </div>

          {/* Generate Button */}
          <Button
            onClick={generateAdvancedScenes}
            disabled={isGenerating}
            className="w-full"
            size="lg"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Generando Scene... {Math.round(generationProgress)}%
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Genera Scene Cinematografiche
              </>
            )}
          </Button>

          {/* Progress Bar */}
          {isGenerating && (
            <Progress value={generationProgress} className="w-full" />
          )}
        </CardContent>
      </Card>

      {/* Generated Scenes Preview */}
      {scenes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Camera className="w-6 h-6" />
              <span>Scene Generate ({scenes.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {scenes.map((scene) => (
                <div key={scene.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Badge variant="outline">{scene.type}</Badge>
                      <h3 className="font-medium">{scene.title}</h3>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => regenerateScene(scene.id)}
                      disabled={scene.isGenerating}
                    >
                      {scene.isGenerating ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <RefreshCw className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  
                  <p className="text-sm text-gray-600">{scene.subtitle}</p>
                  
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">{scene.animationStyle}</Badge>
                    <Badge variant="secondary">{scene.cinematography.mood}</Badge>
                    <Badge variant="secondary">{scene.physics.particles ? 'Particelle' : 'Statico'}</Badge>
                  </div>
                  
                  {scene.generatedImageUrl && (
                    <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={scene.generatedImageUrl}
                        alt={scene.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};