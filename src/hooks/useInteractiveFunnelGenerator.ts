import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export interface InteractiveFunnelRequest {
  prompt: string;
  userId?: string;
  saveToLibrary?: boolean;
  funnelTypeId?: string;
  customerProfile?: {
    businessInfo?: {
      name: string;
      industry: string;
      targetAudience: string;
      keyBenefits: string[];
    };
    psychographics?: {
      painPoints: string[];
      motivations: string[];
      preferredTone: string;
      communicationStyle: string;
    };
    behavioralData?: {
      engagementLevel: number;
      conversionIntent: number;
      informationGatheringStyle: string;
    };
    conversionStrategy?: {
      primaryGoal: string;
      secondaryGoals: string[];
      keyMessages: string[];
    };
  };
}

export interface InteractiveFunnelResponse {
  success: boolean;
  mode: 'interactive';
  component: {
    tsx: string;
    metadata: {
      marketAnalysis: any;
      designStrategy: any;
      generatedAt: string;
    };
  };
  funnel: {
    name: string;
    description: string;
    mode: string;
    component_code: string;
  };
}

export const useInteractiveFunnelGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedFunnel, setGeneratedFunnel] = useState<InteractiveFunnelResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const generateInteractiveFunnel = async (request: InteractiveFunnelRequest): Promise<InteractiveFunnelResponse | null> => {
    if (!user) {
      toast({
        title: "Errore",
        description: "Devi essere autenticato per generare un funnel interattivo",
        variant: "destructive",
      });
      return null;
    }

    if (!request.prompt.trim()) {
      toast({
        title: "Errore", 
        description: "Inserisci una descrizione per il tuo funnel",
        variant: "destructive",
      });
      return null;
    }

    console.log('🎨 Starting Interactive Funnel Generation with Multi-AI Orchestration:', {
      promptLength: request.prompt.length,
      userId: user.id,
      mode: 'interactive'
    });

    setIsGenerating(true);
    setError(null);
    setGeneratedFunnel(null);

    try {
      const { data, error: functionError } = await supabase.functions.invoke('generate-interactive-funnel-ai', {
        body: {
          ...request,
          userId: user.id,
          mode: 'interactive',  // Force interactive mode for multi-AI orchestration
          saveToLibrary: request.saveToLibrary !== false
        }
      });

      if (functionError) {
        throw new Error(functionError.message);
      }

      if (data.success && data.mode === 'interactive') {
        const result = data as InteractiveFunnelResponse;
        setGeneratedFunnel(result);

        toast({
          title: "🎉 Funnel Interattivo Generato!",
          description: `Componente TSX generato con orchestrazione AI multi-modello per "${result.funnel.name}"`,
          duration: 5000,
        });

        console.log('✅ Interactive TSX funnel generated successfully:', {
          funnelName: result.funnel.name,
          tsxLength: result.component.tsx.length,
          hasMarketAnalysis: !!result.component.metadata.marketAnalysis,
          hasDesignStrategy: !!result.component.metadata.designStrategy,
          generatedAt: result.component.metadata.generatedAt
        });

        return result;
      } else if (data.success && data.mode !== 'interactive') {
        // Fallback to standard mode if interactive failed
        toast({
          title: "⚠️ Fallback alla modalità standard",
          description: "Generazione interattiva non disponibile, utilizzata modalità standard",
          variant: "default",
        });

        console.log('⚠️ Fell back to standard mode');
        return null;
      } else {
        throw new Error(data.error || 'Generazione fallita');
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Errore sconosciuto';
      console.error('💥 Error generating interactive funnel:', error);
      
      setError(errorMessage);
      toast({
        title: "Errore nella generazione",
        description: errorMessage,
        variant: "destructive",
      });
      
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const clearGeneratedFunnel = () => {
    setGeneratedFunnel(null);
    setError(null);
  };

  const regenerateFunnel = async (request: InteractiveFunnelRequest): Promise<InteractiveFunnelResponse | null> => {
    clearGeneratedFunnel();
    return await generateInteractiveFunnel(request);
  };

  const checkRequirements = (): boolean => {
    // Check if all required API keys are available (this is just client-side indication)
    // The actual check is done server-side in the edge function
    return true; // We can't check API keys from client-side for security reasons
  };

  const getGenerationStats = () => {
    if (!generatedFunnel) return null;

    return {
      tsxSize: generatedFunnel.component.tsx.length,
      hasMarketAnalysis: !!generatedFunnel.component.metadata.marketAnalysis,
      hasDesignStrategy: !!generatedFunnel.component.metadata.designStrategy,
      generatedAt: generatedFunnel.component.metadata.generatedAt,
      mode: generatedFunnel.mode
    };
  };

  return {
    isGenerating,
    generatedFunnel,
    error,
    generateInteractiveFunnel,
    clearGeneratedFunnel,
    regenerateFunnel,
    checkRequirements,
    getGenerationStats
  };
};