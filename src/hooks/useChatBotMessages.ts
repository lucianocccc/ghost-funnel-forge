
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ChatMessage, ChatBotSettings } from '@/types/chatbot';

interface UseChatBotMessagesProps {
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  sessionId: string;
  setSessionId: React.Dispatch<React.SetStateAction<string>>;
  subscription: any;
  settings: ChatBotSettings;
  uploadedFiles: any[];
  setUploadedFiles: React.Dispatch<React.SetStateAction<any[]>>;
  setDeepThinkingResult: React.Dispatch<React.SetStateAction<string>>;
  setActiveTab: React.Dispatch<React.SetStateAction<string>>;
}

export const useChatBotMessages = ({
  messages,
  setMessages,
  sessionId,
  setSessionId,
  subscription,
  settings,
  uploadedFiles,
  setUploadedFiles,
  setDeepThinkingResult,
  setActiveTab
}: UseChatBotMessagesProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (message: string, mode: 'normal' | 'deep' = 'normal') => {
    if (!subscription?.subscribed || subscription?.subscription_tier === 'free') {
      toast({
        title: "Piano Premium richiesto",
        description: "Aggiorna il tuo abbonamento per utilizzare il chatbot AI.",
        variant: "destructive",
      });
      return;
    }

    // Create a user message
    const userMessage: ChatMessage = {
      role: 'user',
      content: message,
      timestamp: new Date(),
      attachments: uploadedFiles.length > 0 ? uploadedFiles : undefined
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();

      const functionName = mode === 'deep' ? 'chatbot-deep-thinking' : 'chatbot-ai';
      
      const { data, error } = await supabase.functions.invoke(functionName, {
        body: { 
          messages: [{ role: 'user', content: message }],
          sessionId: sessionId,
          settings: settings,
          attachments: uploadedFiles.length > 0 ? uploadedFiles : undefined
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
        
        setMessages(prev => [...prev, aiMessage]);
        
        // Clear uploaded files after sending
        setUploadedFiles([]);
        
        // Update deep thinking result if in deep thinking mode
        if (mode === 'deep' && data.analysis) {
          setDeepThinkingResult(data.analysis);
          // Switch to deep thinking tab to show the result
          setActiveTab('deep');
        }
        
        // Update session ID if needed
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
