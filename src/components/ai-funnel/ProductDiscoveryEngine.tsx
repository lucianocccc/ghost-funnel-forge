import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Wand2, Target, Building, Lightbulb, Zap, Sparkles } from 'lucide-react';

interface ProductData {
  originalPrompt: string;
  productName: string;
  description: string;
  targetAudience: {
    primary: string;
    industry: string;
  };
  uniqueValue: string;
  keyBenefits: string[];
  priceRange: string;
  businessGoals: string[];
  currentChallenges: string[];
}

const ProductDiscoveryEngine: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [productData, setProductData] = useState<ProductData>({
    originalPrompt: '',
    productName: '',
    description: '',
    targetAudience: {
      primary: '',
      industry: ''
    },
    uniqueValue: '',
    keyBenefits: [''],
    priceRange: '',
    businessGoals: [''],
    currentChallenges: ['']
  });

  const addArrayField = (field: 'keyBenefits' | 'businessGoals' | 'currentChallenges') => {
    setProductData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayField = (field: 'keyBenefits' | 'businessGoals' | 'currentChallenges', index: number) => {
    setProductData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const updateArrayField = (field: 'keyBenefits' | 'businessGoals' | 'currentChallenges', index: number, value: string) => {
    setProductData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const generateInteractiveFunnel = async () => {
    if (!user) {
      toast({
        title: "Errore",
        description: "Devi essere autenticato per generare un funnel",
        variant: "destructive",
      });
      return;
    }

    if (!productData.originalPrompt || !productData.productName || !productData.description) {
      toast({
        title: "Campi mancanti",
        description: "Compila almeno la richiesta originale, nome prodotto e descrizione",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      console.log('Generating product-specific interactive funnel with original prompt:', productData.originalPrompt);

      const { data, error } = await supabase.functions.invoke('generate-cinematic-product-funnel', {
        body: {
          productData,
          userId: user.id,
          generateVisuals: true,
          optimizeForConversion: true,
          focusOnProduct: true
        }
      });

      if (error) {
        console.error('Error generating funnel:', error);
        throw error;
      }

      if (data.success) {
        toast({
          title: "Funnel Prodotto-Specifico Creato!",
          description: `Funnel personalizzato per "${productData.productName}" creato con successo`,
        });

        // Reset form
        setProductData({
          originalPrompt: '',
          productName: '',
          description: '',
          targetAudience: { primary: '', industry: '' },
          uniqueValue: '',
          keyBenefits: [''],
          priceRange: '',
          businessGoals: [''],
          currentChallenges: ['']
        });
      } else {
        throw new Error(data.error || 'Errore nella generazione del funnel');
      }

    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Errore",
        description: error instanceof Error ? error.message : "Errore nella generazione del funnel",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Wand2 className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <CardTitle className="text-2xl text-gray-900">
                Generatore Funnel Prodotto-Specifico
              </CardTitle>
              <p className="text-gray-600 mt-1">
                Crea funnel personalizzati che si concentrano sul TUO prodotto specifico
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Richiesta Originale e Prodotto */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              La Tua Richiesta Originale
            </CardTitle>
            <p className="text-sm text-gray-600">
              Questo è il punto di partenza più importante - descrivi esattamente cosa vuoi!
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="originalPrompt">Descrivi cosa vuoi creare *</Label>
              <Textarea
                id="originalPrompt"
                value={productData.originalPrompt}
                onChange={(e) => setProductData(prev => ({ ...prev, originalPrompt: e.target.value }))}
                placeholder="Es. Voglio un funnel per la mia lavanderia che catturi clienti interessati al servizio di lavaggio e stiratura..."
                rows={3}
                className="border-purple-200 focus:border-purple-400"
              />
              <p className="text-xs text-gray-500 mt-1">
                Sii specifico! Più dettagli fornisci, più il funnel sarà personalizzato per il tuo prodotto.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Informazioni Prodotto */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-600" />
              Dettagli Prodotto/Servizio
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="productName">Nome Prodotto/Servizio *</Label>
              <Input
                id="productName"
                value={productData.productName}
                onChange={(e) => setProductData(prev => ({ ...prev, productName: e.target.value }))}
                placeholder="Es. Lavanderia Express Premium"
              />
            </div>

            <div>
              <Label htmlFor="description">Cosa fa esattamente? *</Label>
              <Textarea
                id="description"
                value={productData.description}
                onChange={(e) => setProductData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descrivi cosa fa il tuo prodotto/servizio in modo specifico..."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="uniqueValue">Cosa lo rende speciale?</Label>
              <Textarea
                id="uniqueValue"
                value={productData.uniqueValue}
                onChange={(e) => setProductData(prev => ({ ...prev, uniqueValue: e.target.value }))}
                placeholder="Es. Servizio in 24h, prodotti eco-friendly, ritiro a domicilio..."
                rows={2}
              />
            </div>

            <div>
              <Label>Benefici Specifici del Prodotto</Label>
              {productData.keyBenefits.map((benefit, index) => (
                <div key={index} className="flex gap-2 mt-2">
                  <Input
                    value={benefit}
                    onChange={(e) => updateArrayField('keyBenefits', index, e.target.value)}
                    placeholder="Es. Vestiti sempre perfetti, risparmio di tempo..."
                  />
                  {productData.keyBenefits.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeArrayField('keyBenefits', index)}
                    >
                      ×
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addArrayField('keyBenefits')}
                className="mt-2"
              >
                + Aggiungi Beneficio
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Target e Mercato */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="w-5 h-5 text-green-600" />
              Chi sono i tuoi clienti?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="primaryTarget">Chi userebbe questo prodotto? *</Label>
              <Input
                id="primaryTarget"
                value={productData.targetAudience.primary}
                onChange={(e) => setProductData(prev => ({
                  ...prev,
                  targetAudience: { ...prev.targetAudience, primary: e.target.value }
                }))}
                placeholder="Es. Professionisti busy, famiglie numerose..."
              />
            </div>

            <div>
              <Label htmlFor="industry">Settore</Label>
              <Select
                value={productData.targetAudience.industry}
                onValueChange={(value) => setProductData(prev => ({
                  ...prev,
                  targetAudience: { ...prev.targetAudience, industry: value }
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona settore" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="servizi-locali">Servizi Locali</SelectItem>
                  <SelectItem value="e-commerce">E-commerce</SelectItem>
                  <SelectItem value="consulenza">Consulenza</SelectItem>
                  <SelectItem value="formazione">Formazione</SelectItem>
                  <SelectItem value="salute-benessere">Salute e Benessere</SelectItem>
                  <SelectItem value="casa-giardino">Casa e Giardino</SelectItem>
                  <SelectItem value="tecnologia">Tecnologia</SelectItem>
                  <SelectItem value="altro">Altro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="priceRange">Fascia di Prezzo</Label>
              <Select
                value={productData.priceRange}
                onValueChange={(value) => setProductData(prev => ({ ...prev, priceRange: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona fascia" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0-50">€0 - €50</SelectItem>
                  <SelectItem value="50-200">€50 - €200</SelectItem>
                  <SelectItem value="200-500">€200 - €500</SelectItem>
                  <SelectItem value="500-2000">€500 - €2.000</SelectItem>
                  <SelectItem value="2000+">€2.000+</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Obiettivi Prodotto-Specifici */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-600" />
              Obiettivi per questo Prodotto
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Cosa vuoi ottenere con questo funnel?</Label>
              {productData.businessGoals.map((goal, index) => (
                <div key={index} className="flex gap-2 mt-2">
                  <Input
                    value={goal}
                    onChange={(e) => updateArrayField('businessGoals', index, e.target.value)}
                    placeholder="Es. 50 nuovi clienti al mese, aumentare prenotazioni..."
                  />
                  {productData.businessGoals.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeArrayField('businessGoals', index)}
                    >
                      ×
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addArrayField('businessGoals')}
                className="mt-2"
              >
                + Aggiungi Obiettivo
              </Button>
            </div>

            <div>
              <Label>Quali problemi risolve il tuo prodotto?</Label>
              {productData.currentChallenges.map((challenge, index) => (
                <div key={index} className="flex gap-2 mt-2">
                  <Input
                    value={challenge}
                    onChange={(e) => updateArrayField('currentChallenges', index, e.target.value)}
                    placeholder="Es. Non ho tempo per stirare, vestiti sempre stropicciati..."
                  />
                  {productData.currentChallenges.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeArrayField('currentChallenges', index)}
                    >
                      ×
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addArrayField('currentChallenges')}
                className="mt-2"
              >
                + Aggiungi Problema
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* CTA Generazione */}
        <Card className="lg:col-span-2">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <Badge variant="secondary" className="px-4 py-2 text-sm bg-purple-100 text-purple-800">
                  <Zap className="w-4 h-4 mr-2" />
                  Funnel Specifico per il Tuo Prodotto
                </Badge>
              </div>
              
              <Button
                onClick={generateInteractiveFunnel}
                disabled={isGenerating}
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3"
              >
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Generazione funnel specifico...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-5 h-5 mr-2" />
                    Genera Funnel Prodotto-Specifico
                  </>
                )}
              </Button>
              
              <p className="text-sm text-gray-600 max-w-2xl mx-auto">
                Il funnel sarà completamente personalizzato per il TUO prodotto specifico, 
                con domande, contenuti e call-to-action mirati.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProductDiscoveryEngine;
