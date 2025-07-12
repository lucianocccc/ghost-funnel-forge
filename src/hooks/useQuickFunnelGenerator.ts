
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

    console.log('🚀 Starting funnel generation with:', { 
      prompt: prompt.substring(0, 100) + '...', 
      userId: user.id,
      promptLength: prompt.length,
      timestamp: new Date().toISOString()
    });

    setIsGenerating(true);
    
    // Add timeout for the entire operation
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Operation timeout')), 60000) // 60 seconds timeout
    );

    try {
      console.log('🔐 Getting session...');
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('❌ Session error:', sessionError);
        throw new Error('Errore di autenticazione');
      }
      
      if (!session?.access_token) {
        console.error('❌ No valid session token');
        throw new Error('Token di autenticazione non valido');
      }
      
      console.log('✅ Session obtained successfully:', { 
        hasToken: !!session.access_token,
        tokenLength: session.access_token.length,
        expiresAt: session.expires_at
      });
      
      const payload = { 
        prompt: prompt.trim(),
        userId: user.id 
      };
      
      console.log('📤 Invoking edge function with payload:', { 
        ...payload,
        prompt: payload.prompt.substring(0, 100) + '...',
        payloadSize: JSON.stringify(payload).length
      });

      // Race between function call and timeout
      const functionPromise = supabase.functions.invoke('generate-interactive-funnel-ai', {
        body: payload,
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await Promise.race([functionPromise, timeoutPromise]);
      const { data, error } = result as any;

      console.log('📥 Edge function raw response:', { 
        hasData: !!data, 
        hasError: !!error,
        dataKeys: data ? Object.keys(data) : null,
        errorType: error?.constructor?.name,
        errorMessage: error?.message
      });

      if (error) {
        console.error('❌ Edge function error details:', {
          error,
          name: error.name,
          message: error.message,
          stack: error.stack,
          cause: error.cause
        });
        throw error;
      }

      if (!data) {
        console.error('❌ No data received from edge function');
        throw new Error('Nessuna risposta dal server');
      }

      if (data.success && data.funnel) {
        console.log('✅ Funnel generated successfully:', {
          funnelId: data.funnel.id,
          funnelName: data.funnel.name,
          stepsCount: data.funnel.steps?.length
        });
        
        setGeneratedFunnel(data.funnel);
        
        toast({
          title: "Successo!",
          description: "Funnel generato con successo",
        });
        
        return data.funnel;
      } else {
        console.error('❌ Edge function returned error:', {
          success: data.success,
          error: data.error,
          hasDetails: !!data.details
        });
        throw new Error(data?.error || 'Errore nella generazione del funnel');
      }
    } catch (error) {
      console.error('💥 Caught error in generateFunnel:', {
        error,
        errorType: error?.constructor?.name,
        message: error?.message,
        stack: error?.stack
      });
      
      // Determine specific error message
      let errorMessage = "Si è verificato un errore nella generazione del funnel";
      
      if (error?.message === 'Operation timeout') {
        errorMessage = "Timeout durante la generazione. Riprova con una descrizione più breve.";
      } else if (error?.message?.includes('Failed to fetch') || error?.message?.includes('network')) {
        errorMessage = "Errore di connessione. Verifica la tua connessione internet.";
      } else if (error?.message?.includes('autenticazione') || error?.message?.includes('Token')) {
        errorMessage = "Errore di autenticazione. Rieffettua il login.";
      } else if (error?.details) {
        errorMessage = error.details;
      } else if (error?.message) {
        errorMessage = error.message;
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
