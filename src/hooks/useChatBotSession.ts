
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { ChatMessage } from '@/types/chatbot';
import { useChatBotMemory } from './useChatBotMemory';

export const useChatBotSession = () => {
  const { user } = useAuth();
  const { memory, isLoading: memoryLoading, saveMessage, refreshMemory } = useChatBotMemory();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessionId, setSessionId] = useState<string>('');

  // Sincronizza i messaggi con la memoria
  useEffect(() => {
    if (memory) {
      setMessages(memory.messages);
      setSessionId(memory.sessionId);
      
      // Aggiungi messaggio di benvenuto se la conversazione è vuota
      if (memory.messages.length === 0 && user) {
        const welcomeMessage: ChatMessage = {
          role: 'assistant',
          content: `Ciao ${user.email?.split('@')[0]}! Sono di nuovo qui per aiutarti. 
          
${memory.userContext.conversationCount > 0 
  ? `Vedo che abbiamo già parlato ${memory.userContext.conversationCount} volte. Posso accedere al nostro storico per continuare da dove avevamo lasciato.` 
  : 'È la prima volta che ci sentiamo! Sono il tuo assistente AI per marketing e funnel.'
}

Come posso aiutarti oggi?`,
          timestamp: new Date(),
          attachments: []
        };
        
        setMessages([welcomeMessage]);
        saveMessage(welcomeMessage);
      }
    }
  }, [memory, user, saveMessage]);

  // Funzione per aggiungere messaggi che si sincronizza automaticamente
  const addMessage = (message: ChatMessage) => {
    setMessages(prev => [...prev, message]);
    saveMessage(message);
  };

  return {
    messages,
    setMessages: setMessages,
    sessionId,
    setSessionId,
    addMessage,
    isLoading: memoryLoading,
    refreshMemory,
    userContext: memory?.userContext
  };
};
