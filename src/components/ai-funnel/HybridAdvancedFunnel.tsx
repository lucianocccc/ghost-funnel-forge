
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { InteractivePersonalizedFunnel } from './InteractivePersonalizedFunnel';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

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

  // Stato per completamento informazioni
  const [showCompletionForm, setShowCompletionForm] = useState(!hasPersonalizedData);
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

      setShowCompletionForm(false);
      
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

  if (showCompletionForm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-6">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="text-6xl mb-6">🎯</div>
            <h2 className="text-3xl font-bold text-white mb-4">
              Completa le Informazioni del Prodotto
            </h2>
            <p className="text-white/80 text-lg">
              Per creare un funnel davvero personalizzato, abbiamo bisogno di qualche dettaglio in più sul tuo prodotto.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <form onSubmit={handleCompletionSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white font-medium mb-2">
                    Nome del Prodotto *
                  </label>
                  <Input
                    required
                    placeholder="Es: App Mobile per Fitness"
                    value={completionData.productName}
                    onChange={(e) => setCompletionData(prev => ({ ...prev, productName: e.target.value }))}
                    className="bg-white/10 border-white/30 text-white placeholder:text-white/60"
                  />
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">
                    Target Audience *
                  </label>
                  <Input
                    required
                    placeholder="Es: Professionisti 25-45 anni"
                    value={completionData.targetAudience}
                    onChange={(e) => setCompletionData(prev => ({ ...prev, targetAudience: e.target.value }))}
                    className="bg-white/10 border-white/30 text-white placeholder:text-white/60"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white font-medium mb-2">
                  Descrizione del Prodotto *
                </label>
                <Textarea
                  required
                  placeholder="Descrivi brevemente cosa fa il tuo prodotto e come aiuta i clienti..."
                  value={completionData.description}
                  onChange={(e) => setCompletionData(prev => ({ ...prev, description: e.target.value }))}
                  className="bg-white/10 border-white/30 text-white placeholder:text-white/60"
                  rows={3}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white font-medium mb-2">
                    Settore/Industria
                  </label>
                  <Input
                    placeholder="Es: Tecnologia, Salute, Finanza"
                    value={completionData.industry}
                    onChange={(e) => setCompletionData(prev => ({ ...prev, industry: e.target.value }))}
                    className="bg-white/10 border-white/30 text-white placeholder:text-white/60"
                  />
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">
                    Valore Unico *
                  </label>
                  <Input
                    required
                    placeholder="Cosa ti rende diverso dai competitor?"
                    value={completionData.uniqueValue}
                    onChange={(e) => setCompletionData(prev => ({ ...prev, uniqueValue: e.target.value }))}
                    className="bg-white/10 border-white/30 text-white placeholder:text-white/60"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white font-medium mb-2">
                  Benefici Principali *
                </label>
                <Input
                  required
                  placeholder="Es: Risparmio tempo, Migliore salute, Maggiore produttività (separa con virgole)"
                  value={completionData.keyBenefits}
                  onChange={(e) => setCompletionData(prev => ({ ...prev, keyBenefits: e.target.value }))}
                  className="bg-white/10 border-white/30 text-white placeholder:text-white/60"
                />
                <p className="text-white/60 text-sm mt-1">Separa i benefici con virgole</p>
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={isCompleting}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 text-lg font-semibold"
                >
                  {isCompleting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Generando Funnel...
                    </>
                  ) : (
                    '🚀 Genera Funnel Personalizzato'
                  )}
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => window.history.back()}
                  className="border-white/30 text-white hover:bg-white/10"
                >
                  Torna Indietro
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <InteractivePersonalizedFunnel
      funnel={funnel}
      onLeadCapture={handleLeadCapture}
    />
  );
};
