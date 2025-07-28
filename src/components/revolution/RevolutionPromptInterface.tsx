import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Lightbulb, Loader2, Send, Sparkles, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';
import { instantFunnelGenerator } from '@/services/instantFunnelGenerator';

interface RevolutionPromptInterfaceProps {
  onFunnelGenerated: (funnel: any) => void;
}

const RevolutionPromptInterface: React.FC<RevolutionPromptInterfaceProps> = ({
  onFunnelGenerated
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [customerPreview, setCustomerPreview] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);

  const promptSuggestions = [
    {
      title: "E-commerce Fashion",
      content: "Sono il proprietario di un brand di moda sostenibile rivolto a donne di 25-40 anni, attente all'ambiente e disposte a spendere di più per capi etici. Il mio target sono professioniste che valorizzano la qualità, hanno uno stile minimalista e sofisticato. Il principale pain point è la difficoltà nel trovare vestiti professionali che siano allo stesso tempo eleganti e sostenibili. Obiettivo: aumentare le vendite online del 40%."
    },
    {
      title: "Coaching Business",
      content: "Sono un business coach specializzato nell'aiutare imprenditori a scalare le loro startup. Il mio target sono fondatori di aziende tech in fase di crescita (1-5 milioni di fatturato), che lottano con la gestione del team e la strategia di crescita. Sono persone ambiziose, orientate ai risultati, ma spesso stressate e sovraccariche. Pain point: mancanza di tempo e difficoltà nella delega. Obiettivo: generare 50 nuovi clienti premium nei prossimi 6 mesi."
    },
    {
      title: "Software SaaS",
      content: "La mia startup ha creato un software di gestione progetti per team remoti. Target: aziende di 10-200 dipendenti che hanno adottato il lavoro ibrido e faticano a mantenere la produttività. I decision makers sono CTO e Project Managers, persone tecniche e orientate ai dati, che valorizzano l'efficienza e la semplicità. Pain point: dispersione delle informazioni e difficoltà nel coordinare team distribuiti. Obiettivo: convertire trial gratuiti in abbonamenti paganti."
    }
  ];

  const handleGenerateFunnel = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Prompt richiesto",
        description: "Inserisci un prompt dettagliato per generare il funnel.",
        variant: "destructive"
      });
      return;
    }

    if (!user?.id) {
      toast({
        title: "Autenticazione richiesta",
        description: "Effettua il login per generare il funnel.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);

    try {
      console.log('🚀 Starting instant funnel generation with prompt:', prompt);
      
      const result = await instantFunnelGenerator.generateInstantFunnel({
        prompt: prompt.trim(),
        userId: user.id,
        includeCustomerPreview: true
      });

      if (result.success && result.funnel) {
        console.log('✅ Instant funnel generated successfully');
        
        // Set customer preview if available
        if (result.customerProfile) {
          setCustomerPreview(result.customerProfile);
          setShowPreview(true);
        }

        // Generate funnel after a short delay to show preview
        setTimeout(() => {
          onFunnelGenerated(result.funnel);
          
          toast({
            title: "Funnel generato istantaneamente!",
            description: "Il tuo funnel personalizzato è stato creato dal prompt.",
          });
        }, 2000);

      } else {
        throw new Error(result.error || 'Errore nella generazione del funnel');
      }

    } catch (error) {
      console.error('❌ Error generating instant funnel:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Errore sconosciuto';
      
      toast({
        title: "Errore nella generazione",
        description: errorMessage,
        variant: "destructive"
      });
      
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUseSuggestion = (suggestion: string) => {
    setPrompt(suggestion);
  };

  const validatePrompt = (text: string) => {
    const minLength = 100;
    const hasBusinessInfo = /business|azienda|startup|brand|servizio/i.test(text);
    const hasTarget = /target|clienti|audience|utenti/i.test(text);
    const hasGoal = /obiettivo|goal|vendite|conversioni|lead/i.test(text);
    
    return {
      length: text.length >= minLength,
      businessInfo: hasBusinessInfo,
      target: hasTarget,
      goal: hasGoal,
      score: [text.length >= minLength, hasBusinessInfo, hasTarget, hasGoal].filter(Boolean).length
    };
  };

  const validation = validatePrompt(prompt);
  const isPromptGood = validation.score >= 3;

  return (
    <div className="space-y-6">
      {/* Customer Profile Preview */}
      {showPreview && customerPreview && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Profilo Cliente Analizzato
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Business</h4>
                <p className="text-sm text-muted-foreground">
                  {customerPreview.businessInfo?.name || 'Non specificato'} - {customerPreview.businessInfo?.industry || 'Settore generale'}
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Target Audience</h4>
                <p className="text-sm text-muted-foreground">
                  {customerPreview.businessInfo?.targetAudience || 'Professionisti'}
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Pain Points</h4>
                <div className="flex flex-wrap gap-1">
                  {customerPreview.psychographics?.painPoints?.slice(0, 2).map((pain: string, index: number) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {pain}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Obiettivo</h4>
                <p className="text-sm text-muted-foreground">
                  {customerPreview.conversionStrategy?.primaryGoal || 'Generare lead'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Prompt Interface */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="w-5 h-5" />
                Inserisci il Tuo Prompt
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Descrivi in dettaglio il tuo business, il target di riferimento, i principali pain points dei tuoi clienti e l'obiettivo che vuoi raggiungere con il funnel. Più dettagli fornisci, più personalizzato sarà il risultato..."
                  className="min-h-[200px] resize-none"
                  disabled={isGenerating}
                />
                <div className="flex justify-between items-center text-sm text-muted-foreground">
                  <span>{prompt.length} caratteri</span>
                  <span>Minimo consigliato: 100 caratteri</span>
                </div>
              </div>

              {/* Prompt Quality Indicators */}
              {prompt.length > 10 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Qualità del Prompt</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div className={`flex items-center gap-2 text-xs ${validation.length ? 'text-green-600' : 'text-orange-500'}`}>
                      <div className={`w-2 h-2 rounded-full ${validation.length ? 'bg-green-500' : 'bg-orange-400'}`} />
                      Lunghezza sufficiente
                    </div>
                    <div className={`flex items-center gap-2 text-xs ${validation.businessInfo ? 'text-green-600' : 'text-orange-500'}`}>
                      <div className={`w-2 h-2 rounded-full ${validation.businessInfo ? 'bg-green-500' : 'bg-orange-400'}`} />
                      Info business
                    </div>
                    <div className={`flex items-center gap-2 text-xs ${validation.target ? 'text-green-600' : 'text-orange-500'}`}>
                      <div className={`w-2 h-2 rounded-full ${validation.target ? 'bg-green-500' : 'bg-orange-400'}`} />
                      Target definito
                    </div>
                    <div className={`flex items-center gap-2 text-xs ${validation.goal ? 'text-green-600' : 'text-orange-500'}`}>
                      <div className={`w-2 h-2 rounded-full ${validation.goal ? 'bg-green-500' : 'bg-orange-400'}`} />
                      Obiettivo chiaro
                    </div>
                  </div>
                </div>
              )}

              <Button
                onClick={handleGenerateFunnel}
                disabled={isGenerating || prompt.length < 10}
                className="w-full"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generando funnel intelligente...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Genera Funnel Istantaneo
                  </>
                )}
              </Button>

              {!isPromptGood && prompt.length > 10 && (
                <div className="flex items-start gap-2 p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
                  <AlertCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-orange-700 dark:text-orange-300">
                    <p className="font-medium mb-1">Suggerimento per migliorare il prompt:</p>
                    <p>Includi più dettagli su business, target audience e obiettivi per un funnel più personalizzato.</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Suggestions Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Lightbulb className="w-5 h-5" />
                Esempi di Prompt
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[400px]">
                <div className="p-4 space-y-4">
                  {promptSuggestions.map((suggestion, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-sm">{suggestion.title}</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleUseSuggestion(suggestion.content)}
                          className="text-xs"
                        >
                          Usa
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-4">
                        {suggestion.content}
                      </p>
                      <hr className="border-muted" />
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Consigli</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="text-sm">
                  <strong>Includi sempre:</strong>
                  <ul className="text-xs text-muted-foreground mt-1 space-y-1">
                    <li>• Tipo di business/prodotto</li>
                    <li>• Target audience dettagliato</li>
                    <li>• Pain points principali</li>
                    <li>• Obiettivo specifico</li>
                  </ul>
                </div>
                <div className="text-sm">
                  <strong>Opzionale ma utile:</strong>
                  <ul className="text-xs text-muted-foreground mt-1 space-y-1">
                    <li>• Tono di comunicazione</li>
                    <li>• Budget o fascia di prezzo</li>
                    <li>• Competitor o ispirazione</li>
                    <li>• Timeline o urgenza</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RevolutionPromptInterface;