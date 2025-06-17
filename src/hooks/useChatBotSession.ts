
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { ChatMessage } from '@/types/chatbot';

export const useChatBotSession = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessionId, setSessionId] = useState<string>('');

  useEffect(() => {
    if (user) {
      // Initialize or load the session
      const newSessionId = sessionId || crypto.randomUUID();
      setSessionId(newSessionId);
      loadConversationHistory(newSessionId);
      
      // Add welcome message if no messages
      if (messages.length === 0) {
        const welcomeMessage: ChatMessage = {
          role: 'assistant',
          content: `Benvenuto nell'assistente AI avanzato! Sono qui per aiutarti con strategie di marketing, creazione di funnel, analisi dei lead e molto altro.
          
Puoi utilizzare diverse funzionalità:
• Chat normale per domande e risposte
• Deep Thinking per analisi approfondite
• Caricamento file per analizzare documenti o immagini
• Personalizzazione del mio comportamento nelle impostazioni

Come posso aiutarti oggi?`,
          timestamp: new Date()
        };
        setMessages([welcomeMessage]);
      }
    }
  }, [user]);

  const loadConversationHistory = async (sid: string) => {
    if (!user || !sid) return;

    try {
      const { data, error } = await supabase
        .from('chatbot_conversations')
        .select('message_role, message_content, created_at')
        .eq('user_id', user.id)
        .eq('session_id', sid)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error loading conversation history:', error);
        return;
      }

      if (data && data.length > 0) {
        const conversationMessages: ChatMessage[] = data.map(msg => ({
          role: msg.message_role as 'user' | 'assistant' | 'system',
          content: msg.message_content,
          timestamp: new Date(msg.created_at),
          attachments: []
        }));
        setMessages(conversationMessages);
      }
    } catch (error) {
      console.error('Error loading conversation history:', error);
    }
  };

  return {
    messages,
    setMessages,
    sessionId,
    setSessionId
  };
};
