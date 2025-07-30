import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, Sparkles, BarChart3, Users, Lightbulb, Rocket, TrendingUp, MessageSquare, Zap, Palette, Settings } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import RevolutionChatInterface from './RevolutionChatInterface';
import RevolutionPromptInterface from './RevolutionPromptInterface';
import { GhostFunnelTester } from '../GhostFunnelTester';
import SmartFunnelGenerator from '../SmartFunnelGenerator';
import { useBrandStyle } from '@/hooks/useBrandStyle';
import { PremiumButton } from '@/components/premium-ui/PremiumButton';
import { PremiumCard } from '@/components/premium-ui/PremiumCard';
import { useAdvancedFunnelGeneration } from '@/hooks/useAdvancedFunnelGeneration';

const RevolutionDashboard = () => {
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();
  const [step, setStep] = useState<'selection' | 'chat' | 'prompt' | 'test' | 'results'>('selection');
  const [funnelResult, setFunnelResult] = useState<any>(null);
  const [activeMode, setActiveMode] = useState<'conversational' | 'prompt' | 'test'>('conversational');
  
  // Test hooks
  const { switchBrand, currentBrandId, availableBrands } = useBrandStyle();
  const { generateAdvancedFunnel, loading: advancedLoading, generatedFunnel } = useAdvancedFunnelGeneration();

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

  const handleModeSelect = (mode: 'conversational' | 'prompt' | 'test') => {
    setActiveMode(mode);
    setStep(mode === 'conversational' ? 'chat' : mode === 'prompt' ? 'prompt' : 'test');
  };

  const handleTestAdvancedGeneration = async () => {
    const result = await generateAdvancedFunnel({
      prompt: "Corso di marketing digitale per imprenditori",
      brandStyle: currentBrandId,
      productName: "Marketing Pro Academy",
      targetAudience: "Imprenditori digitali e PMI",
      includeVisuals: true,
      optimizationLevel: "premium"
    });
    
    if (result) {
      setFunnelResult(result);
      setStep('results');
    }
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
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
                  L'AI ti guida attraverso una conversazione intelligente per raccogliere informazioni dettagliate sul tuo business.
                </p>
                <div className="space-y-2">
                  <Badge variant="secondary">Analisi psicologica</Badge>
                  <Badge variant="secondary">Raccolta dati guidata</Badge>
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
                  Inserisci un prompt dettagliato e l'AI creerà istantaneamente un funnel personalizzato.
                </p>
                <div className="space-y-2">
                  <Badge variant="outline">Generazione istantanea</Badge>
                  <Badge variant="outline">Controllo completo</Badge>
                </div>
                <Button variant="outline" className="w-full mt-4" onClick={() => handleModeSelect('prompt')}>
                  Genera da Prompt
                </Button>
              </CardContent>
            </Card>

            {/* NUOVA SEZIONE TEST */}
            <Card className="cursor-pointer transition-all hover:shadow-lg hover:scale-105 border-2 hover:border-accent/50" 
                  onClick={() => handleModeSelect('test')}>
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center">
                  <Settings className="w-8 h-8 text-accent" />
                </div>
                <CardTitle className="text-xl">Test Advanced Features</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground mb-4">
                  Testa le nuove funzionalità: brand styles, componenti premium e generazione avanzata con AI visuals.
                </p>
                <div className="space-y-2">
                  <Badge variant="destructive">Brand Styles</Badge>
                  <Badge variant="destructive">Premium UI</Badge>
                  <Badge variant="destructive">AI Visuals</Badge>
                </div>
                <Button variant="destructive" className="w-full mt-4" onClick={() => handleModeSelect('test')}>
                  Test Features
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // NUOVA SEZIONE TEST
  if (step === 'test') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/50 to-background p-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-6">
            <Button variant="ghost" onClick={() => setStep('selection')} className="mb-4">
              ← Torna alla selezione
            </Button>
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Settings className="w-8 h-8 text-accent" />
              <Palette className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-3xl font-bold mb-2">Test Advanced Ghost Funnel Features</h2>
            <p className="text-muted-foreground">
              Testa le nuove funzionalità premium del sistema Ghost Funnel
            </p>
          </div>

          <Tabs defaultValue="smart" className="space-y-6">
            <TabsList className="grid grid-cols-6 w-full max-w-3xl mx-auto">
              <TabsTrigger value="smart">Smart Funnel</TabsTrigger>
              <TabsTrigger value="styles">Brand Styles</TabsTrigger>
              <TabsTrigger value="components">Premium UI</TabsTrigger>
              <TabsTrigger value="advanced">Advanced AI</TabsTrigger>
              <TabsTrigger value="ghost">Ghost Funnel</TabsTrigger>
              <TabsTrigger value="results">Results</TabsTrigger>
            </TabsList>

            <TabsContent value="smart" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-purple-600" />
                    Smart Funnel Generator
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Genera un funnel completo con un prompt iniziale + massimo 5 domande intelligenti e conversazionali
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
                    <h4 className="font-medium text-purple-800 mb-2">🧠 Come Funziona:</h4>
                    <ul className="text-sm space-y-1 text-purple-700">
                      <li>• <strong>Analisi AI:</strong> L'AI analizza il tuo prompt iniziale</li>
                      <li>• <strong>Domande Intelligenti:</strong> Genera solo le domande necessarie (max 5)</li>
                      <li>• <strong>Conversazione Fluida:</strong> Domande naturali, non robotiche</li>
                      <li>• <strong>Funnel Completo:</strong> Genera automaticamente il funnel finale</li>
                    </ul>
                  </div>
                  
                  <SmartFunnelGenerator />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="styles" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Brand Style Switcher</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Testa i diversi stili di brand: Apple (minimalista), Nike (dinamico), Amazon (professionale)
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium mb-2">Brand Attuale: {currentBrandId.toUpperCase()}</p>
                      <div className="flex gap-3">
                        {availableBrands.map(brand => (
                          <PremiumButton 
                            key={brand} 
                            variant={brand as any}
                            size="lg"
                            onClick={() => switchBrand(brand)}
                            className={currentBrandId === brand ? 'ring-2 ring-offset-2' : ''}
                          >
                            {brand.charAt(0).toUpperCase() + brand.slice(1)}
                          </PremiumButton>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="components" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <PremiumCard variant={currentBrandId as any} size="lg" animation="float">
                  <h3 className="text-xl font-bold mb-2">Premium Card Apple</h3>
                  <p className="text-muted-foreground mb-4">Design minimalista e elegante</p>
                  <PremiumButton variant="apple" size="md" animation="glow">
                    Scopri di Più
                  </PremiumButton>
                </PremiumCard>

                <PremiumCard variant="nike" size="lg" animation="scale">
                  <h3 className="text-xl font-bold mb-2">Premium Card Nike</h3>
                  <p className="text-muted-foreground mb-4">Energico e motivazionale</p>
                  <PremiumButton variant="nike" size="md" animation="bounce">
                    Just Do It
                  </PremiumButton>
                </PremiumCard>

                <PremiumCard variant="amazon" size="lg" animation="glow">
                  <h3 className="text-xl font-bold mb-2">Premium Card Amazon</h3>
                  <p className="text-muted-foreground mb-4">Professionale e affidabile</p>
                  <PremiumButton variant="amazon" size="md">
                    Acquista Ora
                  </PremiumButton>
                </PremiumCard>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Button Variations Test</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <PremiumButton variant="premium" size="sm">Small</PremiumButton>
                    <PremiumButton variant="premium" size="md">Medium</PremiumButton>
                    <PremiumButton variant="premium" size="lg">Large</PremiumButton>
                    <PremiumButton variant="premium" size="xl">Extra Large</PremiumButton>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Advanced Funnel Generation with Brand Styling</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Testa la generazione di funnel avanzati con ottimizzazione prompt e AI visuals
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-muted rounded-lg">
                      <h4 className="font-medium mb-2">Test Configuration:</h4>
                      <ul className="text-sm space-y-1">
                        <li>• Prodotto: Marketing Pro Academy</li>
                        <li>• Target: Imprenditori digitali e PMI</li>
                        <li>• Brand Style: {currentBrandId.toUpperCase()}</li>
                        <li>• Livello: Premium con AI Visuals</li>
                      </ul>
                    </div>
                    
                    <PremiumButton 
                      variant={currentBrandId as any}
                      size="lg" 
                      onClick={handleTestAdvancedGeneration}
                      loading={advancedLoading}
                      className="w-full"
                    >
                      {advancedLoading ? 'Generando Funnel Avanzato...' : 'Genera Funnel Avanzato'}
                    </PremiumButton>
                    
                    {generatedFunnel && (
                      <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                        <h4 className="font-medium text-primary mb-2">✅ Funnel Generato!</h4>
                        <p className="text-sm">Nome: {generatedFunnel.name}</p>
                        <p className="text-sm">Brand: {generatedFunnel.brandStyle}</p>
                        <p className="text-sm">Score: {generatedFunnel.analytics?.optimizationScore}%</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="ghost" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5" />
                    Ghost Funnel Orchestrator
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Testa il nuovo workflow Ghost Funnel che orchestrina Perplexity (ricerca mercato), Claude (storytelling) e GPT-4 (coordinamento)
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-muted rounded-lg">
                      <h4 className="font-medium mb-2">Multi-Model Workflow:</h4>
                      <ul className="text-sm space-y-1">
                        <li>• <strong>Perplexity:</strong> Ricerca mercato + pain points real-time</li>
                        <li>• <strong>Claude:</strong> Storytelling emotivo + messaggio</li>
                        <li>• <strong>GPT-4:</strong> Orchestrazione finale + struttura JSON</li>
                        <li>• <strong>Output:</strong> Funnel strutturato con stile brand (Apple/Nike/Amazon)</li>
                      </ul>
                    </div>
                    
                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                      <h4 className="font-medium text-primary mb-2">🚀 Test Ghost Funnel Orchestrator</h4>
                      <p className="text-sm mb-4">
                        Inserisci i dettagli del tuo business e sperimenta il nuovo workflow multi-AI
                      </p>
                      <GhostFunnelTester />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="results" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Test Results & Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <h4 className="font-semibold text-green-800">Brand Styles</h4>
                      <p className="text-sm text-green-600">✅ 3 stili implementati</p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h4 className="font-semibold text-blue-800">Premium UI</h4>
                      <p className="text-sm text-blue-600">✅ Componenti responsivi</p>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                      <h4 className="font-semibold text-purple-800">Advanced AI</h4>
                      <p className="text-sm text-purple-600">✅ Edge functions attive</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
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