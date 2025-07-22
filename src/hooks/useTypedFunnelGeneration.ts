
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { FunnelType } from '@/services/funnelTypesService';
import { funnelGenerationService, GeneratedFunnel } from '@/services/funnelGenerationService';

export const useTypedFunnelGeneration = () => {
  const [loading, setLoading] = useState(false);
  const [generatedFunnel, setGeneratedFunnel] = useState<GeneratedFunnel | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const generateFunnel = async (
    prompt: string, 
    funnelType?: FunnelType, 
    saveToLibrary = true
  ): Promise<GeneratedFunnel | null> => {
    if (!user) {
      console.error('❌ User not authenticated');
      toast({
        title: "Errore",
        description: "Devi essere autenticato per generare funnel",
        variant: "destructive",
      });
      return null;
    }

    setLoading(true);
    
    try {
      console.log('🚀 Starting funnel generation via service:', {
        prompt: prompt.substring(0, 100) + '...',
        funnelType: funnelType?.name || 'custom',
        saveToLibrary
      });

      const funnel = await funnelGenerationService.generateFunnel({
        prompt,
        userId: user.id,
        funnelType,
        saveToLibrary,
        timeout: 45000, // 45 seconds timeout
        retries: 2
      });

      if (funnel) {
        setGeneratedFunnel(funnel);

        toast({
          title: "Successo!",
          description: funnelType 
            ? `Funnel "${funnelType.name}" generato con successo!`
            : "Funnel personalizzato generato con successo!",
        });

        console.log('✅ Funnel generated successfully:', funnel.name);
        return funnel;
      }

      return null;

    } catch (error) {
      console.error('💥 Error generating funnel:', error);
      
      toast({
        title: "Errore",
        description: error instanceof Error ? error.message : "Errore nella generazione del funnel",
        variant: "destructive",
      });
      
      return null;
    } finally {
      setLoading(false);
    }
  };

  const generateCustomFunnel = async (prompt: string, saveToLibrary = true) => {
    return generateFunnel(prompt, undefined, saveToLibrary);
  };

  const generateTypedFunnel = async (prompt: string, funnelType: FunnelType, saveToLibrary = true) => {
    return generateFunnel(prompt, funnelType, saveToLibrary);
  };

  const clearGeneratedFunnel = () => {
    setGeneratedFunnel(null);
  };

  return {
    loading,
    generatedFunnel,
    generateCustomFunnel,
    generateTypedFunnel,
    clearGeneratedFunnel
  };
};
