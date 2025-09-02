import React, { useState } from 'react';
import { useIntelligentFunnelGenerator, IntelligentFunnelRequest } from '@/hooks/useIntelligentFunnelGenerator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Brain, Zap, Target, TrendingUp, Users, Globe, Sparkles } from 'lucide-react';
import SmartFunnelResults from '@/components/smart-funnel/SmartFunnelResults';

const IntelligentFunnelGenerator: React.FC = () => {
  const {
    isGenerating,
    generatedExperience,
    analysisResults,
    metadata,
    generateIntelligentFunnel,
    clearResults
  } = useIntelligentFunnelGenerator();

  const [formData, setFormData] = useState<IntelligentFunnelRequest>({
    userPrompt: '',
    productName: '',
    productDescription: '',
    category: '',
    industry: '',
    targetAudience: '',
    analysisDepth: 'comprehensive',
    personalizationLevel: 'maximum',
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
                  Funnel Intelligente Generato
                </CardTitle>
                <CardDescription>
                  Sistema Dual-AI per funnel ad alta conversione
                </CardDescription>
              </div>
              <Button onClick={clearResults} variant="outline">
                Nuovo Funnel
              </Button>
            </div>
          </CardHeader>
        </Card>
        
        <SmartFunnelResults 
          generatedExperience={generatedExperience}
          analysisResults={analysisResults}
          metadata={metadata}
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <Brain className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">Generatore di Funnel Intelligenti</h1>
        </div>
        <p className="text-lg text-muted-foreground">
          Sistema Dual-AI per creare funnel HTML ad alta conversione
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
            <span>Neuro-Copy</span>
          </div>
          <div className="flex items-center gap-1">
            <Target className="w-4 h-4" />
            <span>Landing Page HTML</span>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configura il tuo Funnel</CardTitle>
          <CardDescription>
            Fornisci i dettagli del tuo prodotto e lascia che l'AI crei un funnel HTML completo
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
                placeholder="Descrivi cosa vuoi ottenere con questo funnel. Esempio: 'Voglio un funnel che converta professionisti del marketing che cercano di aumentare le vendite online...'"
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
                  Generando Funnel Dual-AI...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Genera Funnel HTML Completo
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