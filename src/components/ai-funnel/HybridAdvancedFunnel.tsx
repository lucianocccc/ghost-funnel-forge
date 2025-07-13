
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { InteractivePersonalizedFunnel } from './InteractivePersonalizedFunnel';

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

  if (!hasPersonalizedData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center p-6">
        <div className="max-w-md mx-auto text-center">
          <div className="text-6xl mb-6">⚠️</div>
          <h2 className="text-2xl font-bold text-white mb-4">
            Funnel Non Personalizzato
          </h2>
          <p className="text-white/70 mb-6">
            Questo funnel non contiene dati personalizzati. Torna al generatore per creare un funnel specifico per il tuo prodotto.
          </p>
          <button 
            onClick={() => window.history.back()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
          >
            Torna Indietro
          </button>
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
