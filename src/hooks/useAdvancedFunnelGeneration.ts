import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { optimizePromptForBrand } from '@/services/promptOptimization';
import { supabase } from '@/integrations/supabase/client';

export interface AdvancedFunnelRequest {
  prompt: string;
  brandStyle: string;
  productName: string;
  targetAudience: string;
  includeVisuals: boolean;
  optimizationLevel: 'basic' | 'advanced' | 'premium';
}

export interface GeneratedAdvancedFunnel {
  id: string;
  name: string;
  description: string;
  brandStyle: string;
  content: {
    hero: {
      title: string;
      subtitle: string;
      cta: string;
      backgroundImage?: string;
    };
    benefits: Array<{
      title: string;
      description: string;
      icon?: string;
    }>;
    emotional: {
      headline: string;
      story: string;
      urgency: string;
      image?: string;
    };
    conversion: {
      headline: string;
      benefits: string[];
      cta: string;
      urgency: string;
    };
  };
  analytics: {
    estimatedConversion: number;
    optimizationScore: number;
    improvements: string[];
  };
  shareToken: string;
}

export const useAdvancedFunnelGeneration = () => {
  const [loading, setLoading] = useState(false);
  const [generatedFunnel, setGeneratedFunnel] = useState<GeneratedAdvancedFunnel | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const generateAdvancedFunnel = async (request: AdvancedFunnelRequest): Promise<GeneratedAdvancedFunnel | null> => {
    if (!user) {
      toast({
        title: "Errore",
        description: "Devi essere autenticato per generare funnel avanzati",
        variant: "destructive",
      });
      return null;
    }

    setLoading(true);

    try {
      console.log('🚀 Generating advanced funnel:', request);

      // Ottimizza il prompt per il brand selezionato
      const optimizedPrompt = optimizePromptForBrand(
        request.prompt,
        request.brandStyle,
        request.productName,
        request.targetAudience
      );

      // Chiama la funzione edge per la generazione avanzata
      const { data, error } = await supabase.functions.invoke('generate-advanced-funnel', {
        body: {
          ...request,
          optimizedPrompt,
          userId: user.id
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data?.funnel) {
        setGeneratedFunnel(data.funnel);
        
        toast({
          title: "Successo!",
          description: `Funnel avanzato "${request.brandStyle}" generato con successo!`,
        });

        return data.funnel;
      }

      throw new Error('Nessun funnel generato');

    } catch (error) {
      console.error('💥 Error generating advanced funnel:', error);
      
      toast({
        title: "Errore",
        description: error instanceof Error ? error.message : "Errore nella generazione del funnel avanzato",
        variant: "destructive",
      });
      
      return null;
    } finally {
      setLoading(false);
    }
  };

  const optimizeFunnel = async (funnelId: string, optimizationType: string) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase.functions.invoke('optimize-funnel', {
        body: {
          funnelId,
          optimizationType,
          userId: user.id
        }
      });

      if (error) throw new Error(error.message);

      if (data?.optimizedFunnel) {
        setGeneratedFunnel(data.optimizedFunnel);
        
        toast({
          title: "Ottimizzazione completata!",
          description: "Il tuo funnel è stato ottimizzato per migliorare le conversioni.",
        });

        return data.optimizedFunnel;
      }

      return null;
    } catch (error) {
      console.error('Error optimizing funnel:', error);
      toast({
        title: "Errore",
        description: "Errore durante l'ottimizzazione del funnel",
        variant: "destructive",
      });
      return null;
    }
  };

  const generateVisuals = async (funnelId: string, section: string) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase.functions.invoke('generate-funnel-visuals', {
        body: {
          funnelId,
          section,
          userId: user.id
        }
      });

      if (error) throw new Error(error.message);

      return data?.imageUrl || null;
    } catch (error) {
      console.error('Error generating visuals:', error);
      return null;
    }
  };

  const clearGeneratedFunnel = () => {
    setGeneratedFunnel(null);
  };

  return {
    loading,
    generatedFunnel,
    generateAdvancedFunnel,
    optimizeFunnel,
    generateVisuals,
    clearGeneratedFunnel
  };
};