import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Bot, Zap, Target, TrendingUp, Users, DollarSign, Brain, CheckCircle, AlertCircle } from 'lucide-react';
import { useAIFunnelGeneration, type BusinessContext, type GenerationOptions, type GenerationProgress } from '@/hooks/useAIFunnelGeneration';
import { supabase } from '@/integrations/supabase/client';

// Types are now imported from the hook

const INDUSTRIES = [
  'Servizi Professionali', 'E-commerce', 'Tecnologia', 'Salute e Benessere', 
  'Istruzione', 'Real Estate', 'Ristorazione', 'Moda', 'Bellezza', 
  'Fitness', 'Consulenza', 'Marketing', 'Software', 'Finanza'
];

const BRAND_PERSONALITIES = [
  'Professionale ed Esperto', 'Amichevole e Accessibile', 'Innovativo e Visionario',
  'Premuroso e Affidabile', 'Energico e Dinamico', 'Elegante e Sofisticato',
  'Divertente e Creativo', 'Autoritativo e Sicuro'
];

export default function FunnelGenerationWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const { generateFunnel, isGenerating, progress: generationProgress, result, error, reset } = useAIFunnelGeneration();
  const [businessContext, setBusinessContext] = useState<BusinessContext>({
    businessName: '',
    industry: '',
    targetAudience: '',
    mainProduct: '',
    uniqueValueProposition: '',
    businessLocation: 'Italia',
    competitors: [],
    brandPersonality: ''
  });

  const [generationOptions, setGenerationOptions] = useState<GenerationOptions>({
    includePricingAnalysis: true,
    includeCompetitorAnalysis: true,
    generateMultipleVariants: false,
    variantCount: 2,
    focusOnEmotionalTriggers: true,
    customRequirements: []
  });

  const [competitorInput, setCompetitorInput] = useState('');
  const [requirementInput, setRequirementInput] = useState('');
  const { toast } = useToast();

  const handleAddCompetitor = () => {
    if (competitorInput.trim() && !businessContext.competitors.includes(competitorInput.trim())) {
      setBusinessContext(prev => ({
        ...prev,
        competitors: [...prev.competitors, competitorInput.trim()]
      }));
      setCompetitorInput('');
    }
  };

  const handleRemoveCompetitor = (competitor: string) => {
    setBusinessContext(prev => ({
      ...prev,
      competitors: prev.competitors.filter(c => c !== competitor)
    }));
  };

  const handleAddRequirement = () => {
    if (requirementInput.trim() && !generationOptions.customRequirements.includes(requirementInput.trim())) {
      setGenerationOptions(prev => ({
        ...prev,
        customRequirements: [...prev.customRequirements, requirementInput.trim()]
      }));
      setRequirementInput('');
    }
  };

  const handleRemoveRequirement = (requirement: string) => {
    setGenerationOptions(prev => ({
      ...prev,
      customRequirements: prev.customRequirements.filter(r => r !== requirement)
    }));
  };

  const canProceedStep1 = businessContext.businessName && businessContext.industry && 
                         businessContext.targetAudience && businessContext.mainProduct;

  const canProceedStep2 = businessContext.uniqueValueProposition;

  const handleGenerateFunnel = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const authToken = session?.access_token;

    if (!authToken) {
      toast({
        title: "Autenticazione richiesta",
        description: "Devi essere loggato per generare un funnel.",
        variant: "destructive"
      });
      return;
    }

    // Validate required fields
    if (!businessContext.businessName || !businessContext.industry || 
        !businessContext.targetAudience || !businessContext.mainProduct) {
      toast({
        title: "Campi obbligatori mancanti",
        description: "Completa tutti i campi obbligatori prima di generare il funnel.",
        variant: "destructive"
      });
      return;
    }

    // Call the generateFunnel function from the hook with actual data
    await generateFunnel(businessContext, generationOptions);
  };


  if (isGenerating && generationProgress) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Bot className="h-6 w-6 animate-pulse" />
            IA sta generando il tuo funnel...
          </CardTitle>
          <CardDescription>
            I nostri AI (GPT-5, Claude-4, Perplexity) stanno creando un funnel unico per il tuo business
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="text-6xl animate-bounce mb-4">🤖</div>
            <div className="text-lg font-medium text-blue-600 mb-2">
              {generationProgress.message}
            </div>
            <Progress value={generationProgress.progress} className="w-full" />
            <div className="text-sm text-gray-500 mt-2">
              {generationProgress.progress}% completato
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`p-4 rounded-lg border ${generationProgress.stage === 'market_research' ? 'bg-blue-50 border-blue-200' : generationProgress.progress > 30 ? 'bg-green-50 border-green-200' : 'bg-gray-50'}`}>
              <TrendingUp className="h-5 w-5 mb-2 text-blue-600" />
              <div className="font-medium">Ricerca Mercato</div>
              <div className="text-sm text-gray-600">Perplexity AI</div>
            </div>
            <div className={`p-4 rounded-lg border ${generationProgress.stage === 'storytelling' ? 'bg-blue-50 border-blue-200' : generationProgress.progress > 60 ? 'bg-green-50 border-green-200' : 'bg-gray-50'}`}>
              <Users className="h-5 w-5 mb-2 text-purple-600" />
              <div className="font-medium">Storytelling</div>
              <div className="text-sm text-gray-600">Claude-4</div>
            </div>
            <div className={`p-4 rounded-lg border ${generationProgress.stage === 'orchestration' ? 'bg-blue-50 border-blue-200' : generationProgress.progress > 85 ? 'bg-green-50 border-green-200' : 'bg-gray-50'}`}>
              <Brain className="h-5 w-5 mb-2 text-green-600" />
              <div className="font-medium">Orchestrazione</div>
              <div className="text-sm text-gray-600">GPT-5</div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (result) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            🎉 Funnel Generato con Successo!
          </h1>
          <p className="text-gray-600 text-lg">
            Le tre AI hanno creato un funnel unico per <strong>{businessContext.businessName}</strong>
          </p>
          <div className="flex justify-center gap-2">
            <Badge variant="outline" className="bg-blue-50">✅ GPT-5</Badge>
            <Badge variant="outline" className="bg-purple-50">✅ Claude-4</Badge>
            <Badge variant="outline" className="bg-green-50">✅ Perplexity</Badge>
          </div>
        </div>

        <Card className="overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              {result.name || `Funnel per ${businessContext.businessName}`}
            </CardTitle>
            <CardDescription>
              {result.description || 'Funnel marketing personalizzato generato dalle AI'}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">📊 Dettagli del Funnel</h3>
                <div className="space-y-2">
                  <p><strong>Settore:</strong> {businessContext.industry}</p>
                  <p><strong>Target:</strong> {businessContext.targetAudience}</p>
                  <p><strong>Prodotto:</strong> {businessContext.mainProduct}</p>
                  <p><strong>Steps:</strong> {result.steps?.length || 0} passaggi</p>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">🎯 Caratteristiche</h3>
                <div className="flex flex-wrap gap-2">
                  <Badge>🤖 AI-Generated</Badge>
                  <Badge>🎨 Design Moderno</Badge>
                  <Badge>📱 Mobile-First</Badge>
                  <Badge>⚡ High-Converting</Badge>
                </div>
              </div>
            </div>
            
            {result.steps && result.steps.length > 0 && (
              <div className="mt-6">
                <h3 className="font-semibold text-lg mb-4">🔄 Struttura del Funnel</h3>
                <div className="grid gap-3">
                  {result.steps.slice(0, 5).map((step, index) => (
                    <div key={step.id || index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center font-semibold text-blue-600">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{step.step_type || step.type || `Step ${index + 1}`}</div>
                        <div className="text-sm text-gray-600">
                          {step.title || step.name || 'Contenuto generato dall\'AI'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-center gap-4">
          <Button onClick={() => window.open(`/interactive-funnel/${result.id}`, '_blank')} className="bg-green-600 hover:bg-green-700">
            <Target className="h-4 w-4 mr-2" />
            Visualizza Funnel
          </Button>
          <Button onClick={reset} variant="outline">
            <Bot className="h-4 w-4 mr-2" />
            Crea Nuovo Funnel
          </Button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-red-600 flex items-center justify-center gap-2">
            <AlertCircle className="h-6 w-6" />
            Errore nella Generazione
          </CardTitle>
          <CardDescription>
            Le AI non sono riuscite a completare la generazione del funnel
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 font-medium mb-2">Dettaglio errore:</p>
            <p className="text-red-700">{error}</p>
          </div>
          
          <div className="space-y-4">
            <h3 className="font-semibold">💡 Suggerimenti per risolvere:</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                Verifica che tutti i campi obbligatori siano compilati correttamente
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                Assicurati di avere una connessione internet stabile
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                Prova a semplificare la descrizione del tuo business
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                Se il problema persiste, contatta il supporto
              </li>
            </ul>
          </div>
          
          <div className="flex justify-center gap-4">
            <Button onClick={reset} variant="default">
              <Bot className="h-4 w-4 mr-2" />
              Riprova Generazione
            </Button>
            <Button onClick={() => setCurrentStep(1)} variant="outline">
              Modifica Dati
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Generatore AI Funnel Marketing
        </h1>
        <p className="text-gray-600">
          Crea funnel unici e personalizzati utilizzando l'intelligenza artificiale avanzata
        </p>
        <div className="flex justify-center gap-2">
          <Badge variant="outline" className="bg-blue-50">GPT-5</Badge>
          <Badge variant="outline" className="bg-purple-50">Claude-4</Badge>
          <Badge variant="outline" className="bg-green-50">Perplexity</Badge>
        </div>
      </div>

      <div className="flex justify-center">
        <div className="flex items-center space-x-4">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                currentStep >= step 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {currentStep > step ? <CheckCircle className="h-5 w-5" /> : step}
              </div>
              {step < 3 && (
                <div className={`w-20 h-1 ${
                  currentStep > step ? 'bg-blue-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      <Card>
        <Tabs value={currentStep.toString()} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="1" disabled={currentStep < 1}>
              <Target className="h-4 w-4 mr-2" />
              Business Context
            </TabsTrigger>
            <TabsTrigger value="2" disabled={currentStep < 2}>
              <Zap className="h-4 w-4 mr-2" />
              Value Proposition
            </TabsTrigger>
            <TabsTrigger value="3" disabled={currentStep < 3}>
              <Bot className="h-4 w-4 mr-2" />
              AI Options
            </TabsTrigger>
          </TabsList>

          <TabsContent value="1" className="space-y-6">
            <CardHeader>
              <CardTitle>Contesto Business</CardTitle>
              <CardDescription>
                Fornisci le informazioni base sul tuo business per una generazione AI mirata
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="businessName">Nome Business *</Label>
                  <Input
                    id="businessName"
                    data-testid="input-business-name"
                    placeholder="Es: TechStart Solutions"
                    value={businessContext.businessName}
                    onChange={(e) => setBusinessContext(prev => ({ ...prev, businessName: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="industry">Settore *</Label>
                  <Select 
                    value={businessContext.industry} 
                    onValueChange={(value) => setBusinessContext(prev => ({ ...prev, industry: value }))}
                  >
                    <SelectTrigger data-testid="select-industry">
                      <SelectValue placeholder="Seleziona settore" />
                    </SelectTrigger>
                    <SelectContent>
                      {INDUSTRIES.map(industry => (
                        <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="targetAudience">Target Audience *</Label>
                <Textarea
                  id="targetAudience"
                  data-testid="textarea-target-audience"
                  placeholder="Es: PMI italiane con 10-50 dipendenti che vogliono digitalizzare i loro processi..."
                  value={businessContext.targetAudience}
                  onChange={(e) => setBusinessContext(prev => ({ ...prev, targetAudience: e.target.value }))}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="mainProduct">Prodotto/Servizio Principale *</Label>
                <Input
                  id="mainProduct"
                  data-testid="input-main-product"
                  placeholder="Es: Software gestionale cloud per PMI"
                  value={businessContext.mainProduct}
                  onChange={(e) => setBusinessContext(prev => ({ ...prev, mainProduct: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="competitors">Competitor Principali (Opzionale)</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    placeholder="Nome competitor"
                    value={competitorInput}
                    onChange={(e) => setCompetitorInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddCompetitor()}
                    data-testid="input-competitor"
                  />
                  <Button 
                    type="button" 
                    onClick={handleAddCompetitor}
                    data-testid="button-add-competitor"
                  >
                    Aggiungi
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {businessContext.competitors.map(competitor => (
                    <Badge key={competitor} variant="secondary" className="cursor-pointer" onClick={() => handleRemoveCompetitor(competitor)}>
                      {competitor} ×
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="budget">Budget Marketing Mensile (€)</Label>
                  <Input
                    id="budget"
                    type="number"
                    placeholder="5000"
                    value={businessContext.budget || ''}
                    onChange={(e) => setBusinessContext(prev => ({ ...prev, budget: parseInt(e.target.value) || undefined }))}
                    data-testid="input-budget"
                  />
                </div>
                <div>
                  <Label htmlFor="location">Mercato Target</Label>
                  <Input
                    id="location"
                    placeholder="Italia"
                    value={businessContext.businessLocation}
                    onChange={(e) => setBusinessContext(prev => ({ ...prev, businessLocation: e.target.value }))}
                    data-testid="input-location"
                  />
                </div>
              </div>
            </CardContent>

            <div className="flex justify-end p-6">
              <Button 
                onClick={() => setCurrentStep(2)} 
                disabled={!canProceedStep1}
                data-testid="button-next-step-1"
              >
                Continua
                <Target className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="2" className="space-y-6">
            <CardHeader>
              <CardTitle>Value Proposition & Brand</CardTitle>
              <CardDescription>
                Definisci ciò che rende unico il tuo business per una comunicazione efficace
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="uvp">Unique Value Proposition *</Label>
                <Textarea
                  id="uvp"
                  data-testid="textarea-uvp"
                  placeholder="Cosa ti distingue dalla concorrenza? Quale valore unico offri ai tuoi clienti?"
                  value={businessContext.uniqueValueProposition}
                  onChange={(e) => setBusinessContext(prev => ({ ...prev, uniqueValueProposition: e.target.value }))}
                  rows={4}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Questa sarà la base del tuo storytelling emotivo generato da Claude
                </p>
              </div>

              <div>
                <Label htmlFor="brandPersonality">Brand Personality</Label>
                <Select 
                  value={businessContext.brandPersonality || ''} 
                  onValueChange={(value) => setBusinessContext(prev => ({ ...prev, brandPersonality: value }))}
                >
                  <SelectTrigger data-testid="select-brand-personality">
                    <SelectValue placeholder="Seleziona personalità brand" />
                  </SelectTrigger>
                  <SelectContent>
                    {BRAND_PERSONALITIES.map(personality => (
                      <SelectItem key={personality} value={personality}>{personality}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>

            <div className="flex justify-between p-6">
              <Button 
                variant="outline" 
                onClick={() => setCurrentStep(1)}
                data-testid="button-back-step-2"
              >
                Indietro
              </Button>
              <Button 
                onClick={() => setCurrentStep(3)} 
                disabled={!canProceedStep2}
                data-testid="button-next-step-2"
              >
                Continua
                <Zap className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="3" className="space-y-6">
            <CardHeader>
              <CardTitle>Opzioni AI Avanzate</CardTitle>
              <CardDescription>
                Personalizza come l'AI genererà il tuo funnel marketing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Analisi di Mercato
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="pricingAnalysis"
                        checked={generationOptions.includePricingAnalysis}
                        onCheckedChange={(checked) => setGenerationOptions(prev => ({ ...prev, includePricingAnalysis: !!checked }))}
                        data-testid="checkbox-pricing-analysis"
                      />
                      <Label htmlFor="pricingAnalysis">Analisi prezzi di mercato</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="competitorAnalysis"
                        checked={generationOptions.includeCompetitorAnalysis}
                        onCheckedChange={(checked) => setGenerationOptions(prev => ({ ...prev, includeCompetitorAnalysis: !!checked }))}
                        data-testid="checkbox-competitor-analysis"
                      />
                      <Label htmlFor="competitorAnalysis">Analisi dettagliata competitor</Label>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    Generazione Avanzata
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="emotionalTriggers"
                        checked={generationOptions.focusOnEmotionalTriggers}
                        onCheckedChange={(checked) => setGenerationOptions(prev => ({ ...prev, focusOnEmotionalTriggers: !!checked }))}
                        data-testid="checkbox-emotional-triggers"
                      />
                      <Label htmlFor="emotionalTriggers">Focus su trigger emotivi</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="multipleVariants"
                        checked={generationOptions.generateMultipleVariants}
                        onCheckedChange={(checked) => setGenerationOptions(prev => ({ ...prev, generateMultipleVariants: !!checked }))}
                        data-testid="checkbox-multiple-variants"
                      />
                      <Label htmlFor="multipleVariants">Genera varianti per A/B testing</Label>
                    </div>
                  </div>
                </div>
              </div>

              {generationOptions.generateMultipleVariants && (
                <div>
                  <Label htmlFor="variantCount">Numero di varianti</Label>
                  <Select 
                    value={generationOptions.variantCount.toString()} 
                    onValueChange={(value) => setGenerationOptions(prev => ({ ...prev, variantCount: parseInt(value) }))}
                  >
                    <SelectTrigger className="w-32" data-testid="select-variant-count">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2">2 varianti</SelectItem>
                      <SelectItem value="3">3 varianti</SelectItem>
                      <SelectItem value="4">4 varianti</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <Label htmlFor="requirements">Requisiti Speciali</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    placeholder="Es: Include sezione testimonianze"
                    value={requirementInput}
                    onChange={(e) => setRequirementInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddRequirement()}
                    data-testid="input-requirement"
                  />
                  <Button 
                    type="button" 
                    onClick={handleAddRequirement}
                    data-testid="button-add-requirement"
                  >
                    Aggiungi
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {generationOptions.customRequirements.map(req => (
                    <Badge key={req} variant="secondary" className="cursor-pointer" onClick={() => handleRemoveRequirement(req)}>
                      {req} ×
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>

            <div className="flex justify-between p-6">
              <Button 
                variant="outline" 
                onClick={() => setCurrentStep(2)}
                data-testid="button-back-step-3"
              >
                Indietro
              </Button>
              <Button 
                onClick={handleGenerateFunnel}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                data-testid="button-generate-funnel"
              >
                <Bot className="h-4 w-4 mr-2" />
                Genera Funnel AI
                <DollarSign className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}