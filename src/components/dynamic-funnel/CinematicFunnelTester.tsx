import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, CheckCircle, Eye, Sparkles } from 'lucide-react';

interface CinematicScene {
  id: string;
  type: 'hero' | 'benefit' | 'proof' | 'demo' | 'conversion';
  title: string;
  subtitle: string;
  content: string;
  imagePrompt: string;
  fallbackImage?: string;
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

export const CinematicFunnelTester: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [scenes, setScenes] = useState<CinematicScene[]>([]);
  const [formData, setFormData] = useState({
    productName: 'Smartwatch Pro',
    productDescription: 'Smartwatch avanzato con monitoraggio salute e fitness',
    targetAudience: 'Professionisti (30-45)',
    industry: 'Technology'
  });

  const handleGenerate = async () => {
    setLoading(true);
    setScenes([]);
    
    try {
      console.log('🎬 Testing cinematic funnel generation...');
      
      const { data, error } = await supabase.functions.invoke('generate-dynamic-product-funnel', {
        body: {
          ...formData,
          funnelType: 'cinematic',
          generateImages: false
        }
      });

      if (error) {
        console.error('❌ Error:', error);
        throw new Error(error.message || 'Errore nella generazione');
      }

      if (data?.success) {
        console.log('✅ Success:', data);
        setScenes(data.cinematicScenes || []);
        
        toast({
          title: "🎬 Funnel generato con successo!",
          description: `${data.cinematicScenes?.length || 0} scene create`,
        });
      } else {
        throw new Error(data?.error || 'Risposta non valida');
      }
    } catch (error: any) {
      console.error('❌ Generation error:', error);
      
      toast({
        title: "⚠️ Errore",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getSceneTypeColor = (type: string) => {
    const colors = {
      hero: 'bg-purple-100 text-purple-800',
      benefit: 'bg-blue-100 text-blue-800',
      proof: 'bg-green-100 text-green-800',
      demo: 'bg-yellow-100 text-yellow-800',
      conversion: 'bg-red-100 text-red-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Test Generazione Funnel Cinematico
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="productName">Nome Prodotto</Label>
              <Input
                id="productName"
                value={formData.productName}
                onChange={(e) => setFormData(prev => ({ ...prev, productName: e.target.value }))}
                placeholder="Es. Smartwatch Pro"
              />
            </div>
            
            <div>
              <Label htmlFor="productDescription">Descrizione</Label>
              <Input
                id="productDescription"
                value={formData.productDescription}
                onChange={(e) => setFormData(prev => ({ ...prev, productDescription: e.target.value }))}
                placeholder="Breve descrizione del prodotto"
              />
            </div>
            
            <div>
              <Label htmlFor="targetAudience">Target Audience</Label>
              <Select value={formData.targetAudience} onValueChange={(value) => setFormData(prev => ({ ...prev, targetAudience: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona audience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Giovani adulti (18-30)">Giovani adulti (18-30)</SelectItem>
                  <SelectItem value="Professionisti (30-45)">Professionisti (30-45)</SelectItem>
                  <SelectItem value="Famiglie con bambini">Famiglie con bambini</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="industry">Industria</Label>
              <Select value={formData.industry} onValueChange={(value) => setFormData(prev => ({ ...prev, industry: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona industria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Technology">Technology</SelectItem>
                  <SelectItem value="Food & Beverage">Food & Beverage</SelectItem>
                  <SelectItem value="Health & Wellness">Health & Wellness</SelectItem>
                  <SelectItem value="Fashion & Beauty">Fashion & Beauty</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Button 
            onClick={handleGenerate} 
            disabled={loading || !formData.productName}
            className="w-full"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Generando...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Genera Funnel Cinematico
              </>
            )}
          </Button>
          
          {loading && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                Generando struttura cinematica...
              </div>
              <Progress value={33} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>

      {scenes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Scene Generate ({scenes.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {scenes.map((scene, index) => (
                <Card key={scene.id} className="border-l-4 border-l-primary">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge className={getSceneTypeColor(scene.type)}>
                          {scene.type}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          Scene {index + 1} • {(scene.scrollTrigger.start * 100).toFixed(0)}%-{(scene.scrollTrigger.end * 100).toFixed(0)}%
                        </span>
                      </div>
                      {scene.fallbackImage && (
                        <Badge variant="outline" className="text-xs">
                          Fallback Image
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <h3 className="font-semibold text-lg">{scene.title}</h3>
                      <p className="text-sm text-muted-foreground">{scene.subtitle}</p>
                    </div>
                    
                    <p className="text-sm">{scene.content}</p>
                    
                    {scene.cta && (
                      <div className="flex items-center gap-2 text-sm">
                        <strong>CTA:</strong> {scene.cta.text} ({scene.cta.action})
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Eye className="w-3 h-3" />
                      Parallax elements: {scene.parallaxLayers.map(p => p.element).join(', ')}
                    </div>
                    
                    <details className="text-xs">
                      <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                        Image prompt
                      </summary>
                      <p className="mt-1 p-2 bg-muted rounded text-xs">
                        {scene.imagePrompt}
                      </p>
                    </details>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {scenes.length === 0 && !loading && (
        <Card className="border-dashed">
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center space-y-2">
              <AlertCircle className="w-8 h-8 mx-auto text-muted-foreground" />
              <p className="text-muted-foreground">
                Nessuna scena generata ancora. Premi il pulsante sopra per iniziare.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};