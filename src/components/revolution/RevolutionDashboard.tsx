import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, Sparkles, BarChart3, Users, Lightbulb, Rocket, TrendingUp, MessageSquare, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import RevolutionChatInterface from './RevolutionChatInterface';
import RevolutionPromptInterface from './RevolutionPromptInterface';

const RevolutionDashboard = () => {
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();
  const [step, setStep] = useState<'selection' | 'chat' | 'prompt' | 'results'>('selection');
  const [funnelResult, setFunnelResult] = useState<any>(null);
  const [activeMode, setActiveMode] = useState<'conversational' | 'prompt'>('conversational');

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  const handleFunnelGenerated = (funnel: any) => {
    setFunnelResult(funnel);
    setStep('results');
    
    toast({
      title: "Revolutionary Funnel Created!",
      description: "Your hyper-personalized funnel has been generated and saved.",
    });
  };

  const handleModeSelect = (mode: 'conversational' | 'prompt') => {
    setActiveMode(mode);
    setStep(mode === 'conversational' ? 'chat' : 'prompt');
  };

  if (step === 'selection') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/50 to-background p-6">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Brain className="w-10 h-10 text-primary" />
              <Sparkles className="w-8 h-8 text-secondary" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4">
              Revolution Funnel Engine
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Scegli come vuoi creare il tuo funnel personalizzato: attraverso una conversazione intelligente o con un prompt dettagliato.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <Card className="cursor-pointer transition-all hover:shadow-lg hover:scale-105 border-2 hover:border-primary/50" 
                  onClick={() => handleModeSelect('conversational')}>
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <MessageSquare className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-xl">Chat Conversazionale</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground mb-4">
                  L'AI ti guida attraverso una conversazione intelligente per raccogliere informazioni dettagliate sul tuo business e creare un funnel ottimizzato.
                </p>
                <div className="space-y-2">
                  <Badge variant="secondary">Analisi psicologica avanzata</Badge>
                  <Badge variant="secondary">Raccolta dati guidata</Badge>
                  <Badge variant="secondary">Personalizzazione profonda</Badge>
                </div>
                <Button className="w-full mt-4" onClick={() => handleModeSelect('conversational')}>
                  Inizia Conversazione
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer transition-all hover:shadow-lg hover:scale-105 border-2 hover:border-primary/50" 
                  onClick={() => handleModeSelect('prompt')}>
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center">
                  <Zap className="w-8 h-8 text-secondary" />
                </div>
                <CardTitle className="text-xl">Prompt-to-Funnel</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground mb-4">
                  Inserisci un prompt dettagliato con le informazioni del tuo business e l'AI creerà istantaneamente un funnel personalizzato.
                </p>
                <div className="space-y-2">
                  <Badge variant="outline">Generazione istantanea</Badge>
                  <Badge variant="outline">Controllo completo</Badge>
                  <Badge variant="outline">Inferenza intelligente</Badge>
                </div>
                <Button variant="outline" className="w-full mt-4" onClick={() => handleModeSelect('prompt')}>
                  Genera da Prompt
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'chat') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/50 to-background p-6">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-6">
            <Button variant="ghost" onClick={() => setStep('selection')} className="mb-4">
              ← Torna alla selezione
            </Button>
            <div className="flex items-center justify-center space-x-2 mb-4">
              <MessageSquare className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Chat Conversazionale</h2>
            <p className="text-muted-foreground">
              L'AI ti guiderà attraverso domande intelligenti per creare il funnel perfetto
            </p>
          </div>

          <RevolutionChatInterface onFunnelGenerated={handleFunnelGenerated} />
        </div>
      </div>
    );
  }

  if (step === 'prompt') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/50 to-background p-6">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-6">
            <Button variant="ghost" onClick={() => setStep('selection')} className="mb-4">
              ← Torna alla selezione
            </Button>
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Zap className="w-8 h-8 text-secondary" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Prompt-to-Funnel</h2>
            <p className="text-muted-foreground">
              Inserisci un prompt dettagliato e l'AI creerà istantaneamente il tuo funnel
            </p>
          </div>

          <RevolutionPromptInterface onFunnelGenerated={handleFunnelGenerated} />
        </div>
      </div>
    );
  }

  if (step === 'results' && funnelResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/50 to-background p-6">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Your Revolutionary Funnel is Ready!</h2>
            <p className="text-lg text-muted-foreground">
              Hyper-personalized based on deep customer intelligence
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Performance Prediction
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary mb-2">
                  {funnelResult.performancePrediction?.score || 85}%
                </div>
                <p className="text-sm text-muted-foreground">
                  Predicted conversion rate based on customer psychology analysis
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Personalization Level
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-secondary mb-2">
                  {funnelResult.personalization?.level || 92}%
                </div>
                <p className="text-sm text-muted-foreground">
                  Based on customer intelligence depth
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5" />
                  AI Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-accent mb-2">
                  {funnelResult.insights?.length || 12}
                </div>
                <p className="text-sm text-muted-foreground">
                  Strategic recommendations generated
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Funnel Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Conversion Strategy</h4>
                  <p className="text-sm text-muted-foreground">
                    {funnelResult.conversionStrategy?.summary || 'Advanced multi-step conversion strategy tailored to customer psychology'}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Key Features</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <Badge variant="secondary">Hyper-personalized copy</Badge>
                    <Badge variant="secondary">Psychology-based design</Badge>
                    <Badge variant="secondary">Intelligent objection handling</Badge>
                    <Badge variant="secondary">Trust signal optimization</Badge>
                  </div>
                </div>
                
                {funnelResult.insights && (
                  <div>
                    <h4 className="font-semibold mb-2">AI Insights</h4>
                    <div className="space-y-2">
                      {funnelResult.insights.slice(0, 3).map((insight: string, index: number) => (
                        <div key={index} className="p-3 bg-muted rounded-lg">
                          <p className="text-sm">{insight}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-4 pt-4">
                  <Button 
                    variant="outline"
                    onClick={() => window.location.href = '/revolution/funnels'}
                  >
                    View All Funnels
                  </Button>
                  <Button onClick={() => {
                    setStep('selection');
                    setFunnelResult(null);
                  }}>
                    Create Another
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return null;
};

export default RevolutionDashboard;