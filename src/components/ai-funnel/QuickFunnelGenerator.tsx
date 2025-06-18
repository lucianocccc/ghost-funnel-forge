
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Zap, Sparkles, ArrowRight, Eye, Settings } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface GeneratedFunnel {
  id: string;
  name: string;
  description: string;
  share_token: string;
  steps: any[];
  settings: any;
}

interface QuickFunnelGeneratorProps {
  onFunnelGenerated?: (funnel: GeneratedFunnel) => void;
}

const QuickFunnelGenerator: React.FC<QuickFunnelGeneratorProps> = ({ onFunnelGenerated }) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedFunnel, setGeneratedFunnel] = useState<GeneratedFunnel | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const promptSuggestions = [
    "Genera un funnel per raccogliere lead per un corso di digital marketing",
    "Crea un quiz interattivo per scoprire il tipo di personalità dell'utente",
    "Funnel di qualificazione per un servizio di consulenza business",
    "Lead magnet per un ebook gratuito sul fitness",
    "Sondaggio di soddisfazione per un e-commerce"
  ];

  const handleGenerate = async () => {
    if (!prompt.trim() || !user) {
      toast({
        title: "Errore",
        description: "Inserisci un prompt valido",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const { data, error } = await supabase.functions.invoke('generate-interactive-funnel-ai', {
        body: { 
          prompt: prompt.trim(),
          userId: user.id 
        },
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        }
      });

      if (error) throw error;

      if (data.success) {
        setGeneratedFunnel(data.funnel);
        onFunnelGenerated?.(data.funnel);
        
        toast({
          title: "Successo!",
          description: "Funnel generato con successo",
        });
      } else {
        throw new Error(data.error || 'Errore nella generazione del funnel');
      }
    } catch (error) {
      console.error('Error generating funnel:', error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore nella generazione del funnel",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePromptSuggestion = (suggestion: string) => {
    setPrompt(suggestion);
  };

  const openPreview = () => {
    if (generatedFunnel) {
      const shareUrl = `${window.location.origin}/shared-funnel/${generatedFunnel.share_token}`;
      window.open(shareUrl, '_blank');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Zap className="w-8 h-8 text-golden" />
          <h2 className="text-2xl font-bold text-white">Generatore Funnel Rapido</h2>
        </div>
        <p className="text-gray-300">
          Descrivi il tuo funnel ideale e l'AI lo creerà istantaneamente
        </p>
      </div>

      {/* Generator Form */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-golden flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Descrivi il tuo funnel
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Prompt Input */}
          <div>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Es. Crea un funnel per raccogliere email di potenziali clienti interessati ai miei servizi di web design..."
              rows={4}
              className="bg-gray-900 border-gray-600 text-white placeholder-gray-400"
            />
          </div>

          {/* Prompt Suggestions */}
          <div>
            <p className="text-sm text-gray-400 mb-2">Oppure usa uno di questi esempi:</p>
            <div className="flex flex-wrap gap-2">
              {promptSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handlePromptSuggestion(suggestion)}
                  className="text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 px-3 py-1 rounded-full transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={!prompt.trim() || isGenerating}
            className="w-full bg-golden hover:bg-yellow-600 text-black"
            size="lg"
          >
            {isGenerating ? (
              <>Generazione in corso...</>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Genera Funnel Interattivo
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Generated Funnel Preview */}
      {generatedFunnel && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-golden flex items-center gap-2">
              <ArrowRight className="w-5 h-5" />
              Funnel Generato
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">
                {generatedFunnel.name}
              </h3>
              <p className="text-gray-300 mb-4">
                {generatedFunnel.description}
              </p>
              
              <div className="flex items-center gap-2 mb-4">
                <Badge className="bg-golden text-black">
                  {generatedFunnel.steps.length} passi
                </Badge>
                <Badge variant="outline">
                  Bozza
                </Badge>
              </div>

              {/* Steps Preview */}
              <div className="space-y-2 mb-4">
                <p className="text-sm font-medium text-gray-300">Anteprima passi:</p>
                {generatedFunnel.steps.slice(0, 3).map((step, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-gray-400">
                    <div className="w-6 h-6 bg-golden rounded-full flex items-center justify-center text-black font-bold text-xs">
                      {index + 1}
                    </div>
                    <span>{step.title}</span>
                  </div>
                ))}
                {generatedFunnel.steps.length > 3 && (
                  <p className="text-sm text-gray-500 ml-8">
                    ...e altri {generatedFunnel.steps.length - 3} passi
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  onClick={openPreview}
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Anteprima
                </Button>
                <Button
                  onClick={() => window.location.href = '/funnels?tab=interactive'}
                  className="bg-golden hover:bg-yellow-600 text-black"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Personalizza
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default QuickFunnelGenerator;
