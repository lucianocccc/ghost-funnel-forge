
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
      console.error('Missing prompt or user:', { prompt: !!prompt.trim(), user: !!user });
      toast({
        title: "Errore",
        description: "Prompt e autenticazione richiesti",
        variant: "destructive",
      });
      return null;
    }

    console.log('Starting funnel generation with:', { prompt, userId: user.id });

    setIsGenerating(true);
    try {
      console.log('Getting session...');
      const { data: { session } } = await supabase.auth.getSession();
      console.log('Session obtained:', !!session);
      
      console.log('Invoking edge function with payload:', { 
        prompt: prompt.trim(), 
        userId: user.id 
      });

      const { data, error } = await supabase.functions.invoke('generate-interactive-funnel-ai', {
        body: { 
          prompt: prompt.trim(),
          userId: user.id 
        },
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        }
      });

      console.log('Edge function response:', { data, error });

      if (error) {
        console.error('Edge function error:', error);
        throw error;
      }

      if (data && data.success) {
        console.log('Funnel generated successfully:', data.funnel);
        setGeneratedFunnel(data.funnel);
        
        toast({
          title: "Successo!",
          description: "Funnel generato con successo",
        });
        
        return data.funnel;
      } else {
        console.error('Edge function returned error:', data);
        throw new Error(data?.error || 'Errore nella generazione del funnel');
      }
    } catch (error) {
      console.error('Error generating funnel:', error);
      
      // Log più dettagliato dell'errore
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      
      // Messaggio di errore più specifico
      let errorMessage = "Si è verificato un errore nella generazione del funnel";
      if (error?.message?.includes('Failed to fetch')) {
        errorMessage = "Errore di connessione. Verifica la tua connessione internet.";
      } else if (error?.message?.includes('timeout')) {
        errorMessage = "Timeout durante la generazione. Riprova con una descrizione più breve.";
      } else if (error?.details) {
        errorMessage = error.details;
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
