
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { InteractivePersonalizedFunnel } from './InteractivePersonalizedFunnel';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Settings } from 'lucide-react';

interface GeneratedFunnel {
  id: string;
  name: string;
  description: string;
  share_token: string;
  steps: any[];
  settings: any;
  advanced_funnel_data?: any;
  customer_facing?: any;
  target_audience?: any;
  industry?: string;
  product_name?: string;
  created_by?: string;
}

interface HybridAdvancedFunnelProps {
  funnel: GeneratedFunnel;
  onLeadCapture?: (data: any) => void;
}

export const HybridAdvancedFunnel: React.FC<HybridAdvancedFunnelProps> = ({
  funnel,
  onLeadCapture
}) => {
  const { toast } = useToast();

  useEffect(() => {
    // Track funnel view
    console.log('📊 Viewing personalized funnel:', funnel.name);
    
    // Apply custom theme if available
    if (funnel.advanced_funnel_data?.visualTheme) {
      const theme = funnel.advanced_funnel_data.visualTheme;
      const root = document.documentElement;
      
      if (theme.primaryColor) root.style.setProperty('--funnel-primary', theme.primaryColor);
      if (theme.secondaryColor) root.style.setProperty('--funnel-secondary', theme.secondaryColor);
      if (theme.accentColor) root.style.setProperty('--funnel-accent', theme.accentColor);
    }
  }, [funnel]);

  const handleLeadCapture = async (leadData: any) => {
    try {
      const enhancedLeadData = {
        ...leadData,
        funnelType: 'personalized_cinematic',
        productSpecific: true,
        visualTheme: funnel.advanced_funnel_data?.visualTheme,
        personalizedContent: true,
        generatedAt: new Date().toISOString()
      };

      // Call parent handler
      onLeadCapture?.(enhancedLeadData);

      // Show success message
      toast({
        title: "🎯 Lead Personalizzato Acquisito!",
        description: `Richiesta per ${funnel.product_name || funnel.name} registrata con successo`,
      });

      console.log('✅ Personalized lead captured:', enhancedLeadData);
      
    } catch (error) {
      console.error('❌ Error capturing personalized lead:', error);
      toast({
        title: "Errore",
        description: "Errore nella registrazione della richiesta",
        variant: "destructive"
      });
    }
  };

  // Verifica se il funnel ha dati personalizzati
  const hasPersonalizedData = funnel.advanced_funnel_data && 
    Object.keys(funnel.advanced_funnel_data).length > 0 &&
    funnel.product_name;

  // Stato per mostrare il pannello di configurazione
  const [showConfigPanel, setShowConfigPanel] = useState(false);
  const [completionData, setCompletionData] = useState({
    productName: funnel.product_name || '',
    description: '',
    targetAudience: funnel.target_audience || '',
    industry: funnel.industry || '',
    uniqueValue: '',
    keyBenefits: ''
  });
  const [isCompleting, setIsCompleting] = useState(false);

  const handleCompletionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCompleting(true);

    try {
      // Genera il funnel con le informazioni completate
      const { data, error } = await supabase.functions.invoke('generate-cinematic-product-funnel', {
        body: {
          productData: {
            productName: completionData.productName,
            description: completionData.description,
            targetAudience: {
              primary: completionData.targetAudience,
              industry: completionData.industry
            },
            uniqueValue: completionData.uniqueValue,
            keyBenefits: completionData.keyBenefits.split(',').map(b => b.trim())
          },
          funnelId: funnel.id,
          userId: funnel.created_by || 'anonymous'
        }
      });

      if (error) throw error;

      // Aggiorna il funnel con i nuovi dati
      if (data.funnelData) {
        funnel.advanced_funnel_data = data.funnelData.advanced_funnel_data;
        funnel.product_name = completionData.productName;
        funnel.target_audience = completionData.targetAudience;
        funnel.industry = completionData.industry;
      }

      setShowConfigPanel(false);
      
      toast({
        title: "✅ Funnel Personalizzato Generato!",
        description: `Il tuo funnel per ${completionData.productName} è ora pronto`,
      });

    } catch (error) {
      console.error('❌ Error completing funnel:', error);
      toast({
        title: "Errore",
        description: "Errore nella generazione del funnel personalizzato",
        variant: "destructive"
      });
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <div className="relative">
      {/* Pannello di configurazione (opzionale) */}
      {showConfigPanel && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Completa le Informazioni del Prodotto
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Per ottimizzare il funnel, aggiungi dettagli specifici sul tuo prodotto.
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCompletionSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Nome del Prodotto *
                    </label>
                    <Input
                      required
                      placeholder="Es: App Mobile per Fitness"
                      value={completionData.productName}
                      onChange={(e) => setCompletionData(prev => ({ ...prev, productName: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Target Audience *
                    </label>
                    <Input
                      required
                      placeholder="Es: Professionisti 25-45 anni"
                      value={completionData.targetAudience}
                      onChange={(e) => setCompletionData(prev => ({ ...prev, targetAudience: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Descrizione del Prodotto *
                  </label>
                  <Textarea
                    required
                    placeholder="Descrivi brevemente cosa fa il tuo prodotto..."
                    value={completionData.description}
                    onChange={(e) => setCompletionData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Settore/Industria
                    </label>
                    <Input
                      placeholder="Es: Tecnologia, Salute, Finanza"
                      value={completionData.industry}
                      onChange={(e) => setCompletionData(prev => ({ ...prev, industry: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Valore Unico *
                    </label>
                    <Input
                      required
                      placeholder="Cosa ti rende diverso?"
                      value={completionData.uniqueValue}
                      onChange={(e) => setCompletionData(prev => ({ ...prev, uniqueValue: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Benefici Principali *
                  </label>
                  <Input
                    required
                    placeholder="Separa con virgole (es: Risparmio tempo, Migliore salute)"
                    value={completionData.keyBenefits}
                    onChange={(e) => setCompletionData(prev => ({ ...prev, keyBenefits: e.target.value }))}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="submit"
                    disabled={isCompleting}
                    className="flex-1"
                  >
                    {isCompleting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Generando...
                      </>
                    ) : (
                      '🚀 Genera Funnel Personalizzato'
                    )}
                  </Button>
                  
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowConfigPanel(false)}
                  >
                    Annulla
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Notifica per dati mancanti */}
      {!hasPersonalizedData && (
        <div className="mb-4">
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-orange-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-orange-900">
                    Funnel con dati generici
                  </p>
                  <p className="text-sm text-orange-700">
                    Questo funnel sta usando dati generici. Per una migliore personalizzazione, completa le informazioni del prodotto.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowConfigPanel(true)}
                  className="border-orange-300 text-orange-700 hover:bg-orange-100"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Personalizza
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Funnel Preview - Sempre visibile */}
      <InteractivePersonalizedFunnel
        funnel={funnel}
        onLeadCapture={handleLeadCapture}
      />
    </div>
  );
};
