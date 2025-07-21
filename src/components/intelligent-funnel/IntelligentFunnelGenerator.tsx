import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useIntelligentFunnelGenerator } from '@/hooks/useIntelligentFunnelGenerator';
import { Brain, Zap, Target, TrendingUp, Users, Globe, Sparkles } from 'lucide-react';

const IntelligentFunnelGenerator: React.FC = () => {
  const {
    isGenerating,
    generatedExperience,
    analysisResults,
    metadata,
    generateIntelligentFunnel,
    clearResults
  } = useIntelligentFunnelGenerator();

  const [formData, setFormData] = useState({
    userPrompt: '',
    productName: '',
    productDescription: '',
    category: '',
    industry: '',
    targetAudience: '',
    analysisDepth: 'comprehensive' as const,
    personalizationLevel: 'maximum' as const,
    includeWebResearch: true,
    includeMarketAnalysis: true,
    includeCompetitorAnalysis: true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.userPrompt.trim() || !formData.productName.trim()) {
      return;
    }

    await generateIntelligentFunnel(formData);
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (generatedExperience) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Esperienza Generata
                </CardTitle>
                <CardDescription>
                  {generatedExperience.name}
                </CardDescription>
              </div>
              <Button onClick={clearResults} variant="outline">
                Nuova Esperienza
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {generatedExperience.personalizationScore}%
                </div>
                <div className="text-sm text-muted-foreground">
                  Personalizzazione
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {generatedExperience.uniquenessScore}%
                </div>
                <div className="text-sm text-muted-foreground">
                  Unicità
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {metadata?.confidenceScore}%
                </div>
                <div className="text-sm text-muted-foreground">
                  Confidenza
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Descrizione</h3>
                <p className="text-muted-foreground">
                  {generatedExperience.description}
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Tema e Stile</h3>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">
                    {generatedExperience.theme?.style || 'modern'}
                  </Badge>
                  <Badge variant="outline">
                    {generatedExperience.steps.length} Step
                  </Badge>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Narrative Journey</h3>
                <p className="text-sm text-muted-foreground">
                  {generatedExperience.narrative?.storyline || 'Storyline personalizzata'}
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Step Personalizzati</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {generatedExperience.steps.map((step: any, index: number) => (
                    <Card key={index} className="p-3">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold text-sm">
                          {step.stepOrder}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm">
                            {step.title}
                          </h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            {step.description}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">
                              {step.stepType}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {step.personalizedContent?.benefits?.length || 0} Benefici
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {analysisResults && (
                <div>
                  <h3 className="font-semibold mb-2">Analisi del Prodotto</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="p-3">
                      <h4 className="font-semibold text-sm mb-2">Valore Principale</h4>
                      <p className="text-sm text-muted-foreground">
                        {analysisResults.productIntelligence?.productProfile?.coreValue || 'Valore identificato'}
                      </p>
                    </Card>
                    <Card className="p-3">
                      <h4 className="font-semibold text-sm mb-2">Strategia di Posizionamento</h4>
                      <p className="text-sm text-muted-foreground">
                        {analysisResults.productIntelligence?.strategicRecommendations?.positioningStrategy || 'Strategia personalizzata'}
                      </p>
                    </Card>
                  </div>
                </div>
              )}

              {metadata && (
                <div className="text-center pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    Generato in {metadata.processingTime}ms • 
                    Qualità: {metadata.qualityScore}% • 
                    Fiducia: {metadata.confidenceScore}%
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <Brain className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">Generatore di Esperienze Intelligenti</h1>
        </div>
        <p className="text-lg text-muted-foreground">
          Sistema di nuova generazione per creare esperienze 100% personalizzate
        </p>
        <div className="flex justify-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Globe className="w-4 h-4" />
            <span>Ricerca Web</span>
          </div>
          <div className="flex items-center gap-1">
            <TrendingUp className="w-4 h-4" />
            <span>Analisi Mercato</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>Profilazione Utenti</span>
          </div>
          <div className="flex items-center gap-1">
            <Target className="w-4 h-4" />
            <span>Personalizzazione AI</span>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configura la tua Esperienza</CardTitle>
          <CardDescription>
            Fornisci i dettagli del tuo prodotto e lascia che l'AI crei un'esperienza unica
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="productName">Nome Prodotto *</Label>
                <Input
                  id="productName"
                  placeholder="es. Corso di Marketing Digitale"
                  value={formData.productName}
                  onChange={(e) => handleInputChange('productName', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="corso">Corso</SelectItem>
                    <SelectItem value="servizio">Servizio</SelectItem>
                    <SelectItem value="prodotto">Prodotto</SelectItem>
                    <SelectItem value="consulenza">Consulenza</SelectItem>
                    <SelectItem value="software">Software</SelectItem>
                    <SelectItem value="altro">Altro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="productDescription">Descrizione Prodotto</Label>
              <Textarea
                id="productDescription"
                placeholder="Descrivi il tuo prodotto, i suoi benefici e caratteristiche principali..."
                value={formData.productDescription}
                onChange={(e) => handleInputChange('productDescription', e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="userPrompt">Richiesta Specifica *</Label>
              <Textarea
                id="userPrompt"
                placeholder="Descrivi cosa vuoi ottenere con questa esperienza. Esempio: 'Voglio un'esperienza che converta professionisti del marketing che cercano di aumentare le vendite online...'"
                value={formData.userPrompt}
                onChange={(e) => handleInputChange('userPrompt', e.target.value)}
                rows={4}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="industry">Settore</Label>
                <Input
                  id="industry"
                  placeholder="es. Marketing, Tecnologia, Salute"
                  value={formData.industry}
                  onChange={(e) => handleInputChange('industry', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetAudience">Pubblico Target</Label>
                <Input
                  id="targetAudience"
                  placeholder="es. Imprenditori, Professionisti, Studenti"
                  value={formData.targetAudience}
                  onChange={(e) => handleInputChange('targetAudience', e.target.value)}
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="font-semibold">Configurazione Avanzata</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Profondità di Analisi</Label>
                  <Select value={formData.analysisDepth} onValueChange={(value: any) => handleInputChange('analysisDepth', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Base</SelectItem>
                      <SelectItem value="comprehensive">Completo</SelectItem>
                      <SelectItem value="expert">Esperto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Livello di Personalizzazione</Label>
                  <Select value={formData.personalizationLevel} onValueChange={(value: any) => handleInputChange('personalizationLevel', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Base</SelectItem>
                      <SelectItem value="advanced">Avanzato</SelectItem>
                      <SelectItem value="maximum">Massimo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Ricerca Web</Label>
                    <p className="text-sm text-muted-foreground">
                      Includi ricerca web per informazioni aggiornate
                    </p>
                  </div>
                  <Switch
                    checked={formData.includeWebResearch}
                    onCheckedChange={(checked) => handleInputChange('includeWebResearch', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Analisi Mercato</Label>
                    <p className="text-sm text-muted-foreground">
                      Analizza trend di mercato e opportunità
                    </p>
                  </div>
                  <Switch
                    checked={formData.includeMarketAnalysis}
                    onCheckedChange={(checked) => handleInputChange('includeMarketAnalysis', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Analisi Competitor</Label>
                    <p className="text-sm text-muted-foreground">
                      Studia i competitor per differenziarti
                    </p>
                  </div>
                  <Switch
                    checked={formData.includeCompetitorAnalysis}
                    onCheckedChange={(checked) => handleInputChange('includeCompetitorAnalysis', checked)}
                  />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isGenerating || !formData.userPrompt.trim() || !formData.productName.trim()}
            >
              {isGenerating ? (
                <>
                  <Zap className="w-4 h-4 mr-2 animate-spin" />
                  Generando Esperienza Intelligente...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Genera Esperienza Personalizzata
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default IntelligentFunnelGenerator;
