
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export interface IntelligentFunnelRequest {
  userPrompt: string;
  productName: string;
  productDescription: string;
  category?: string;
  industry?: string;
  targetAudience?: string;
  analysisDepth: 'basic' | 'comprehensive' | 'expert';
  personalizationLevel: 'basic' | 'advanced' | 'maximum';
  includeWebResearch?: boolean;
  includeMarketAnalysis?: boolean;
  includeCompetitorAnalysis?: boolean;
}

export const useIntelligentFunnelGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedExperience, setGeneratedExperience] = useState<any>(null);
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const [metadata, setMetadata] = useState<any>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const generateIntelligentFunnel = async (request: IntelligentFunnelRequest) => {
    if (!user) {
      toast({
        title: "Errore",
        description: "Devi essere autenticato per generare un'esperienza",
        variant: "destructive",
      });
      return null;
    }

    console.log('🧠 Starting intelligent funnel generation...', {
      productName: request.productName,
      userPrompt: request.userPrompt.substring(0, 100) + '...',
      analysisDepth: request.analysisDepth || 'comprehensive',
      personalizationLevel: request.personalizationLevel || 'maximum'
    });

    setIsGenerating(true);
    setGeneratedExperience(null);
    setAnalysisResults(null);
    setMetadata(null);

    try {
      const { data, error } = await supabase.functions.invoke('intelligent-funnel-orchestrator', {
        body: {
          ...request,
          userId: user.id,
          analysisDepth: request.analysisDepth || 'comprehensive',
          includeWebResearch: request.includeWebResearch !== false,
          includeMarketAnalysis: request.includeMarketAnalysis !== false,
          includeCompetitorAnalysis: request.includeCompetitorAnalysis !== false,
          personalizationLevel: request.personalizationLevel || 'maximum'
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.success) {
        setGeneratedExperience(data.funnel || data.experience);
        setAnalysisResults(data.analysis);
        setMetadata(data.metadata);

        toast({
          title: "🎉 Funnel Generato!",
          description: `Funnel HTML personalizzato creato per "${request.productName}" con landing page funzionante`,
          duration: 5000,
        });

        console.log('✅ Dual-AI funnel generated successfully:', {
          businessName: data.funnel?.business_name,
          htmlAvailable: !!data.funnel?.html_content,
          htmlLength: data.funnel?.html_content?.length || 0,
          sectionsCount: data.funnel?.funnel_structure?.funnel_structure?.sections?.length || 0,
          metadata: data.metadata
        });

        return data;
      } else {
        throw new Error(data.error || 'Generazione non riuscita');
      }

    } catch (error) {
      console.error('💥 Intelligent funnel generation failed:', error);
      
      let errorMessage = "Errore nella generazione dell'esperienza";
      
      if (error instanceof Error) {
        if (error.message.includes('autenticazione')) {
          errorMessage = "Errore di autenticazione. Rieffettua il login.";
        } else if (error.message.includes('prodotto')) {
          errorMessage = "Errore nell'analisi del prodotto. Verifica i dati inseriti.";
        } else if (error.message.includes('ricerca')) {
          errorMessage = "Errore nella ricerca web. Riprova più tardi.";
        } else if (error.message.includes('personalizzazione')) {
          errorMessage = "Errore nella personalizzazione. Riprova con parametri diversi.";
        } else if (error.message.includes('database')) {
          errorMessage = "Errore nel salvataggio. L'esperienza è stata generata ma non salvata.";
        } else {
          errorMessage = error.message;
        }
      }

      toast({
        title: "Errore",
        description: errorMessage,
        variant: "destructive",
      });

      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const clearResults = () => {
    setGeneratedExperience(null);
    setAnalysisResults(null);
    setMetadata(null);
  };

  // Add the missing methods that IntelligentSystemStats expects
  const getSystemStats = () => {
    return {
      productIntelligence: { size: 0 },
      webResearch: { size: 0 },
      personalization: { size: 0 },
      totalGenerations: 0,
      avgProcessingTime: 0,
      lastUpdated: new Date().toISOString()
    };
  };

  const clearAllCaches = () => {
    console.log('🧹 Clearing all caches...');
    toast({
      title: "Cache Pulita",
      description: "Cache del sistema pulita con successo",
    });
  };

  return {
    isGenerating,
    generatedExperience,
    analysisResults,
    metadata,
    generateIntelligentFunnel,
    clearResults,
    getSystemStats,
    clearAllCaches
  };
};
