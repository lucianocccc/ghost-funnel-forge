
// Hook per il nuovo sistema di generazione intelligente
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { IntelligentFunnelOrchestrator, IntelligentFunnelRequest, IntelligentFunnelResponse } from '@/services/intelligentFunnelOrchestrator';

export const useIntelligentFunnelGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedExperience, setGeneratedExperience] = useState<any>(null);
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const [metadata, setMetadata] = useState<any>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const generateIntelligentFunnel = async (request: Omit<IntelligentFunnelRequest, 'userId' | 'saveToDatabase'>): Promise<IntelligentFunnelResponse | null> => {
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
      const orchestrator = IntelligentFunnelOrchestrator.getInstance();
      
      const fullRequest: IntelligentFunnelRequest = {
        ...request,
        userId: user.id,
        saveToDatabase: true,
        analysisDepth: request.analysisDepth || 'comprehensive',
        includeWebResearch: request.includeWebResearch !== false,
        includeMarketAnalysis: request.includeMarketAnalysis !== false,
        includeCompetitorAnalysis: request.includeCompetitorAnalysis !== false,
        personalizationLevel: request.personalizationLevel || 'maximum'
      };

      const response = await orchestrator.generateIntelligentFunnel(fullRequest);

      if (response.success) {
        setGeneratedExperience(response.experience);
        setAnalysisResults(response.analysis);
        setMetadata(response.metadata);

        toast({
          title: "🎉 Esperienza Generata!",
          description: `Esperienza personalizzata creata per "${request.productName}" con ${response.experience.steps.length} step unici`,
          duration: 5000,
        });

        // Log dei risultati per debugging
        console.log('✅ Intelligent funnel generated successfully:', {
          name: response.experience.name,
          steps: response.experience.steps.length,
          personalizationScore: response.experience.personalizationScore,
          uniquenessScore: response.experience.uniquenessScore,
          confidenceScore: response.metadata.confidenceScore,
          qualityScore: response.metadata.qualityScore,
          processingTime: response.metadata.processingTime
        });

        return response;
      } else {
        throw new Error('Generazione non riuscita');
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

  const getSystemStats = () => {
    try {
      const orchestrator = IntelligentFunnelOrchestrator.getInstance();
      return orchestrator.getSystemStats();
    } catch (error) {
      console.error('Error getting system stats:', error);
      return null;
    }
  };

  const clearAllCaches = () => {
    try {
      const orchestrator = IntelligentFunnelOrchestrator.getInstance();
      orchestrator.clearAllCaches();
      toast({
        title: "Cache Pulita",
        description: "Tutte le cache del sistema sono state pulite",
      });
    } catch (error) {
      console.error('Error clearing caches:', error);
      toast({
        title: "Errore",
        description: "Errore nella pulizia delle cache",
        variant: "destructive",
      });
    }
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
