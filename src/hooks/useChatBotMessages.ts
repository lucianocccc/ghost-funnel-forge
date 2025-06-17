
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ChatMessage, ChatBotSettings } from '@/types/chatbot';

interface UseChatBotMessagesProps {
  messages: ChatMessage[];
  addMessage: (message: ChatMessage) => void;
  sessionId: string;
  setSessionId: React.Dispatch<React.SetStateAction<string>>;
  subscription: any;
  settings: ChatBotSettings;
  uploadedFiles: any[];
  setUploadedFiles: React.Dispatch<React.SetStateAction<any[]>>;
  setDeepThinkingResult: React.Dispatch<React.SetStateAction<string>>;
  setActiveTab: React.Dispatch<React.SetStateAction<string>>;
  userContext?: {
    preferences: any;
    conversationCount: number;
    lastTopics: string[];
  };
}

export const useChatBotMessages = ({
  messages,
  addMessage,
  sessionId,
  setSessionId,
  subscription,
  settings,
  uploadedFiles,
  setUploadedFiles,
  setDeepThinkingResult,
  setActiveTab,
  userContext
}: UseChatBotMessagesProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (message: string, mode: 'normal' | 'deep' = 'normal'): Promise<void> => {
    if (!subscription?.subscribed || subscription?.subscription_tier === 'free') {
      toast({
        title: "Piano Premium richiesto",
        description: "Aggiorna il tuo abbonamento per utilizzare il chatbot AI.",
        variant: "destructive",
      });
      return;
    }

    // Crea il messaggio dell'utente
    const userMessage: ChatMessage = {
      role: 'user',
      content: message,
      timestamp: new Date(),
      attachments: uploadedFiles.length > 0 ? uploadedFiles : undefined
    };

    // Aggiungi il messaggio alla cronologia
    addMessage(userMessage);
    setIsLoading(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();

      const functionName = mode === 'deep' ? 'chatbot-deep-thinking' : 'chatbot-ai';
      
      // Includi il contesto della conversazione negli ultimi 10 messaggi
      const recentMessages = messages.slice(-10).map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const { data, error } = await supabase.functions.invoke(functionName, {
        body: { 
          messages: [...recentMessages, { role: 'user', content: message }],
          sessionId: sessionId,
          settings: settings,
          attachments: uploadedFiles.length > 0 ? uploadedFiles : undefined,
          userContext: userContext
        },
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        }
      });

      if (error) throw error;

      if (data.success) {
        const aiMessage: ChatMessage = {
          role: 'assistant',
          content: data.message,
          timestamp: new Date(),
          attachments: []
        };
        
        // Aggiungi la risposta dell'AI
        addMessage(aiMessage);
        
        // Pulisci i file caricati
        setUploadedFiles([]);
        
        // Gestisci il deep thinking
        if (mode === 'deep' && data.analysis) {
          setDeepThinkingResult(data.analysis);
          setActiveTab('deep');
        }
        
        // Aggiorna session ID se necessario
        if (data.sessionId && data.sessionId !== sessionId) {
          setSessionId(data.sessionId);
        }
      } else {
        toast({
          title: "Errore",
          description: data.error || "Si è verificato un errore nella comunicazione con l'AI",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Errore durante l\'invio del messaggio:', error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante la comunicazione con il server",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    handleSendMessage
  };
};
