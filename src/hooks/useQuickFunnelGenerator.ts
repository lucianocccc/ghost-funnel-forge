
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface GeneratedFunnel {
  id: string;
  name: string;
  description: string;
  share_token: string;
  steps: any[];
  settings: any;
}

export const useQuickFunnelGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedFunnel, setGeneratedFunnel] = useState<GeneratedFunnel | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const generateFunnel = async (prompt: string): Promise<GeneratedFunnel | null> => {
    if (!prompt.trim() || !user) {
      toast({
        title: "Errore",
        description: "Prompt e autenticazione richiesti",
        variant: "destructive",
      });
      return null;
    }

    setIsGenerating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const { data, error } = await supabase.functions.invoke('generate-interactive-funnel-ai', {
        body: { 
          prompt: prompt.trim(),
          userId: user.id 
        },
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        }
      });

      if (error) throw error;

      if (data.success) {
        setGeneratedFunnel(data.funnel);
        
        toast({
          title: "Successo!",
          description: "Funnel generato con successo",
        });
        
        return data.funnel;
      } else {
        throw new Error(data.error || 'Errore nella generazione del funnel');
      }
    } catch (error) {
      console.error('Error generating funnel:', error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore nella generazione del funnel",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const clearGeneratedFunnel = () => {
    setGeneratedFunnel(null);
  };

  return {
    isGenerating,
    generatedFunnel,
    generateFunnel,
    clearGeneratedFunnel
  };
};
