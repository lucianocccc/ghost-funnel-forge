
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
import { Wand2, Target, Building, Lightbulb, Zap } from 'lucide-react';

interface ProductData {
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

    if (!productData.productName || !productData.description || !productData.targetAudience.primary) {
      toast({
        title: "Campi mancanti",
        description: "Compila almeno nome prodotto, descrizione e target principale",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      console.log('Generating intelligent interactive funnel with data:', productData);

      const { data, error } = await supabase.functions.invoke('generate-cinematic-product-funnel', {
        body: {
          productData,
          userId: user.id,
          generateVisuals: true,
          optimizeForConversion: true
        }
      });

      if (error) {
        console.error('Error generating funnel:', error);
        throw error;
      }

      if (data.success) {
        toast({
          title: "Funnel Creato!",
          description: `Funnel interattivo "${productData.productName}" creato con successo`,
        });

        // Reset form
        setProductData({
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
                Generatore Funnel Intelligente
              </CardTitle>
              <p className="text-gray-600 mt-1">
                Crea funnel personalizzati con raccolta dati avanzata e analisi dei lead
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Informazioni Prodotto */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-600" />
              Informazioni Prodotto
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="productName">Nome Prodotto *</Label>
              <Input
                id="productName"
                value={productData.productName}
                onChange={(e) => setProductData(prev => ({ ...prev, productName: e.target.value }))}
                placeholder="Es. Software CRM Avanzato"
              />
            </div>

            <div>
              <Label htmlFor="description">Descrizione *</Label>
              <Textarea
                id="description"
                value={productData.description}
                onChange={(e) => setProductData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descrivi il tuo prodotto/servizio e cosa fa..."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="uniqueValue">Valore Unico</Label>
              <Textarea
                id="uniqueValue"
                value={productData.uniqueValue}
                onChange={(e) => setProductData(prev => ({ ...prev, uniqueValue: e.target.value }))}
                placeholder="Cosa rende unico il tuo prodotto rispetto alla concorrenza?"
                rows={2}
              />
            </div>

            <div>
              <Label>Benefici Chiave</Label>
              {productData.keyBenefits.map((benefit, index) => (
                <div key={index} className="flex gap-2 mt-2">
                  <Input
                    value={benefit}
                    onChange={(e) => updateArrayField('keyBenefits', index, e.target.value)}
                    placeholder="Es. Aumenta produttività del 50%"
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
              Target e Mercato
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="primaryTarget">Target Principale *</Label>
              <Input
                id="primaryTarget"
                value={productData.targetAudience.primary}
                onChange={(e) => setProductData(prev => ({
                  ...prev,
                  targetAudience: { ...prev.targetAudience, primary: e.target.value }
                }))}
                placeholder="Es. PMI del settore manifatturiero"
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
                  <SelectItem value="tecnologia">Tecnologia</SelectItem>
                  <SelectItem value="manifatturiero">Manifatturiero</SelectItem>
                  <SelectItem value="servizi">Servizi</SelectItem>
                  <SelectItem value="retail">Retail</SelectItem>
                  <SelectItem value="sanita">Sanità</SelectItem>
                  <SelectItem value="finanza">Finanza</SelectItem>
                  <SelectItem value="immobiliare">Immobiliare</SelectItem>
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
                  <SelectItem value="0-500">€0 - €500</SelectItem>
                  <SelectItem value="500-2000">€500 - €2.000</SelectItem>
                  <SelectItem value="2000-10000">€2.000 - €10.000</SelectItem>
                  <SelectItem value="10000-50000">€10.000 - €50.000</SelectItem>
                  <SelectItem value="50000+">€50.000+</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Obiettivi Business */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-600" />
              Obiettivi Business
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Obiettivi Principali</Label>
              {productData.businessGoals.map((goal, index) => (
                <div key={index} className="flex gap-2 mt-2">
                  <Input
                    value={goal}
                    onChange={(e) => updateArrayField('businessGoals', index, e.target.value)}
                    placeholder="Es. Generare 100 lead qualificati/mese"
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
              <Label>Sfide Attuali</Label>
              {productData.currentChallenges.map((challenge, index) => (
                <div key={index} className="flex gap-2 mt-2">
                  <Input
                    value={challenge}
                    onChange={(e) => updateArrayField('currentChallenges', index, e.target.value)}
                    placeholder="Es. Difficoltà a raggiungere decision maker"
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
                + Aggiungi Sfida
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* CTA Generazione */}
        <Card className="lg:col-span-2">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <Badge variant="secondary" className="px-4 py-2 text-sm">
                  <Zap className="w-4 h-4 mr-2" />
                  Funnel con Raccolta Dati Avanzata
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
                    Generazione in corso...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-5 h-5 mr-2" />
                    Genera Funnel Interattivo
                  </>
                )}
              </Button>
              
              <p className="text-sm text-gray-600 max-w-2xl mx-auto">
                Il funnel includerà step personalizzati per la raccolta dati, 
                qualificazione dei lead e conversione ottimizzata per il tuo prodotto.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProductDiscoveryEngine;
