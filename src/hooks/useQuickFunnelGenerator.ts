
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
      
      console.log('✅ Session obtained successfully');
      
      // Creo un payload sicuro e validato
      const payload = { 
        prompt: prompt.trim(),
        userId: user.id 
      };
      
      // Valido il payload prima di inviarlo
      const payloadString = JSON.stringify(payload);
      console.log('📤 Payload validation:', {
        isValidJSON: true,
        payloadSize: payloadString.length,
        hasPrompt: !!payload.prompt,
        hasUserId: !!payload.userId,
        payloadPreview: payloadString.substring(0, 200) + '...'
      });

      // Verifico che il JSON sia parsabile
      try {
        JSON.parse(payloadString);
        console.log('✅ Payload JSON validation successful');
      } catch (jsonError) {
        console.error('❌ Payload JSON validation failed:', jsonError);
        throw new Error('Errore nella preparazione dei dati');
      }

      console.log('📡 Invoking edge function...');
      const { data, error } = await supabase.functions.invoke('generate-interactive-funnel-ai', {
        body: payload
      });

      console.log('📥 Edge function response:', { 
        hasData: !!data, 
        hasError: !!error,
        dataKeys: data ? Object.keys(data) : null,
        errorDetails: error ? {
          name: error.name,
          message: error.message,
          context: error.context
        } : null
      });

      if (error) {
        console.error('❌ Edge function error:', error);
        
        // Gestione specifica degli errori
        if (error.message?.includes('Invalid JSON') || error.message?.includes('JSON input')) {
          throw new Error('Errore nella comunicazione con il server. La richiesta non è stata formattata correttamente.');
        } else if (error.name === 'FunctionsHttpError') {
          if (error.message?.includes('400')) {
            throw new Error('Richiesta non valida. Verifica i dati inseriti e riprova.');
          } else {
            throw new Error('Il server ha riscontrato un problema durante la generazione. Riprova.');
          }
        } else if (error.name === 'FunctionsFetchError') {
          throw new Error('Problema di connessione con il server. Verifica la tua connessione internet.');
        } else {
          throw new Error(error.message || 'Errore sconosciuto durante la generazione');
        }
      }

      if (!data) {
        console.error('❌ No data received from edge function');
        throw new Error('Nessuna risposta dal server');
      }

      console.log('🔍 Analyzing response data:', {
        success: data.success,
        hasFunnel: !!data.funnel,
        hasError: !!data.error,
        dataStructure: Object.keys(data)
      });

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
          details: data.details
        });
        
        const errorMessage = data.details || data.error || 'Errore nella generazione del funnel';
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('💥 Caught error in generateFunnel:', {
        error,
        errorType: error?.constructor?.name,
        message: error?.message,
        stack: error?.stack
      });
      
      // Determina il messaggio di errore specifico
      let errorMessage = "Si è verificato un errore nella generazione del funnel";
      
      if (error?.message?.includes('autenticazione') || error?.message?.includes('Token')) {
        errorMessage = "Errore di autenticazione. Rieffettua il login.";
      } else if (error?.message?.includes('connessione') || error?.message?.includes('network')) {
        errorMessage = "Errore di connessione. Verifica la tua connessione internet.";
      } else if (error?.message?.includes('JSON') || error?.message?.includes('formattata')) {
        errorMessage = "Errore tecnico nella richiesta. Riprova tra qualche minuto.";
      } else if (error?.message?.includes('server') || error?.message?.includes('problema')) {
        errorMessage = "Il server ha riscontrato un problema. Riprova tra qualche minuto.";
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
