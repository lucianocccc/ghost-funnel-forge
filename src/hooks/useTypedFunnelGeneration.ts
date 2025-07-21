
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { FunnelType } from '@/services/funnelTypesService';

interface GeneratedFunnel {
  id: string;
  name: string;
  description: string;
  share_token: string;
  steps: any[];
  settings: any;
  funnel_type?: FunnelType;
  advanced_funnel_data: any;
}

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
      toast({
        title: "Errore",
        description: "Devi essere autenticato per generare funnel",
        variant: "destructive",
      });
      return null;
    }

    setLoading(true);
    
    try {
      console.log('🚀 Starting funnel generation:', {
        prompt: prompt.substring(0, 100) + '...',
        funnelType: funnelType?.name || 'custom',
        saveToLibrary
      });

      const response = await fetch('/api/generate-interactive-funnel-ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.id}`,
        },
        body: JSON.stringify({
          prompt,
          userId: user.id,
          saveToLibrary,
          funnelTypeId: funnelType?.id || null
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Network error' }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Errore nella generazione del funnel');
      }

      const funnel = data.funnel;
      setGeneratedFunnel(funnel);

      toast({
        title: "Successo!",
        description: funnelType 
          ? `Funnel "${funnelType.name}" generato con successo!`
          : "Funnel personalizzato generato con successo!",
      });

      console.log('✅ Funnel generated successfully:', funnel.name);
      return funnel;

    } catch (error) {
      console.error('❌ Error generating funnel:', error);
      
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
