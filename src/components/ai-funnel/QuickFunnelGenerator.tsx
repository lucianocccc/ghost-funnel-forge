
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useQuickFunnelGenerator } from '@/hooks/useQuickFunnelGenerator';
import { HybridAdvancedFunnel } from './HybridAdvancedFunnel';
import { Zap, Loader2, ExternalLink, Edit, BarChart3, Users, Eye, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const QuickFunnelGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [targetAudience, setTargetAudience] = useState('');
  const [industry, setIndustry] = useState('');
  const { isGenerating, generatedFunnel, generateFunnel, clearGeneratedFunnel } = useQuickFunnelGenerator();
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Errore",
        description: "Inserisci una descrizione per il tuo funnel",
        variant: "destructive",
      });
      return;
    }

    let enhancedPrompt = prompt;
    if (targetAudience) {
      enhancedPrompt += ` Target audience: ${targetAudience}.`;
    }
    if (industry) {
      enhancedPrompt += ` Industry: ${industry}.`;
    }

    await generateFunnel(enhancedPrompt);
  };

  const handleClearFunnel = () => {
    clearGeneratedFunnel();
    setPrompt('');
    setTargetAudience('');
    setIndustry('');
  };

  const copyShareLink = () => {
    if (generatedFunnel?.share_token) {
      const shareUrl = `${window.location.origin}/shared-interactive-funnel/${generatedFunnel.share_token}`;
      navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Link copiato!",
        description: "Il link di condivisione è stato copiato negli appunti",
      });
    }
  };

  const openFunnelEditor = () => {
    if (generatedFunnel?.id) {
      window.open(`/funnels?edit=${generatedFunnel.id}`, '_blank');
    }
  };

  const viewAnalytics = () => {
    if (generatedFunnel?.id) {
      window.open(`/funnels?analytics=${generatedFunnel.id}`, '_blank');
    }
  };

  const handleLeadCapture = (leadData: any) => {
    console.log('Lead captured from cinematic funnel:', leadData);
    toast({
      title: "🎉 Lead Acquisito!",
      description: `Lead catturato per il funnel: ${generatedFunnel?.name}`,
    });
  };

  const resetToGenerator = () => {
    clearGeneratedFunnel();
    setPrompt('');
    setTargetAudience('');
    setIndustry('');
  };

  // Se il funnel è stato generato, mostra il funnel cinematico
  if (generatedFunnel) {
    return (
      <div className="space-y-6">
        <div className="p-4 bg-gradient-to-r from-golden/10 to-yellow-50 rounded-lg border border-golden/20">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg text-gray-900">
                Funnel Cinematico: {generatedFunnel.name}
              </h3>
              <p className="text-sm text-muted-foreground">
                {generatedFunnel.description}
              </p>
              {targetAudience && (
                <Badge variant="outline" className="mt-2 mr-2">
                  Target: {targetAudience}
                </Badge>
              )}
              {industry && (
                <Badge variant="outline" className="mt-2">
                  Settore: {industry}
                </Badge>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                onClick={copyShareLink}
                variant="outline"
                size="sm"
              >
                <ExternalLink className="w-4 h-4 mr-1" />
                Condividi
              </Button>
              <Button
                onClick={() => window.open('/funnels', '_blank')}
                variant="default"
                size="sm"
                className="bg-golden hover:bg-yellow-600"
              >
                <BarChart3 className="w-4 h-4 mr-1" />
                I Miei Funnel
              </Button>
              <Button
                onClick={resetToGenerator}
                variant="outline"
                size="sm"
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                Nuovo Funnel
              </Button>
            </div>
          </div>
        </div>

        <HybridAdvancedFunnel
          funnel={generatedFunnel}
          onLeadCapture={handleLeadCapture}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-golden/10 to-yellow-50 border-golden/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-golden" />
            Generatore Rapido di Funnel Interattivi
          </CardTitle>
          <p className="text-gray-600 text-sm">
            Crea funnel interattivi completi in pochi secondi. Descrivi quello che vuoi e l'AI creerà
            un funnel personalizzato con tutti i passaggi, campi e impostazioni necessarie.
          </p>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {!generatedFunnel ? (
            <>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Descrivi il tuo funnel *
                  </label>
                  <Textarea
                    placeholder="Es: Sondaggio di soddisfazione per un e-commerce, Lead generation per consulenza aziendale, Raccolta feedback per un corso online..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="min-h-[100px]"
                    disabled={isGenerating}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="text-golden border-golden hover:bg-golden/10"
                  >
                    {showAdvanced ? 'Nascondi' : 'Mostra'} Opzioni Avanzate
                  </Button>
                </div>

                {showAdvanced && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <label className="text-sm font-medium mb-1 block">
                        Target Audience (opzionale)
                      </label>
                      <Input
                        placeholder="Es: Imprenditori 30-50 anni"
                        value={targetAudience}
                        onChange={(e) => setTargetAudience(e.target.value)}
                        disabled={isGenerating}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">
                        Settore (opzionale)
                      </label>
                      <Input
                        placeholder="Es: E-commerce, Consulenza, SaaS"
                        value={industry}
                        onChange={(e) => setIndustry(e.target.value)}
                        disabled={isGenerating}
                      />
                    </div>
                  </div>
                )}
              </div>

              <Button 
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim()}
                className="w-full bg-golden hover:bg-yellow-600 text-black font-semibold"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generazione in corso...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Genera Funnel Interattivo
                  </>
                )}
              </Button>

              <div className="text-xs text-gray-500 text-center">
                ⚡ Il funnel sarà immediatamente interattivo e condivisibile
              </div>
            </>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
};

export default QuickFunnelGenerator;
