import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRevolutionMemory, RevolutionChatMessage, RevolutionConversationState } from './useRevolutionMemory';

export const useRevolutionSession = () => {
  const { user } = useAuth();
  const { 
    memory, 
    isLoading: memoryLoading, 
    hasUnsavedChanges,
    saveMessage, 
    updateConversationState,
    clearMemory,
    refreshMemory 
  } = useRevolutionMemory();
  
  const [messages, setMessages] = useState<RevolutionChatMessage[]>([]);
  const [conversationState, setConversationState] = useState<RevolutionConversationState>({
    phase: 'gathering',
    collectedData: {},
    dataCategories: {
      business: {},
      audience: {},
      goals: {},
      resources: {},
      constraints: {}
    },
    nextQuestions: [],
    completeness: 0,
    confidenceScores: {},
    timestamp: new Date().toISOString()
  });
  const [sessionId, setSessionId] = useState<string>('');

  // Sync messages and state with memory
  useEffect(() => {
    if (memory) {
      setMessages(memory.messages);
      setConversationState(memory.conversationState);
      setSessionId(memory.sessionId);
      
      // Add welcome message if conversation is empty
      if (memory.messages.length === 0 && user) {
        const welcomeMessage: RevolutionChatMessage = {
          role: 'assistant',
          content: `Ciao! Sono il tuo assistente AI per la creazione di funnel personalizzati. 

Ti aiuterò a creare un funnel rivoluzionario perfettamente calibrato per il tuo business.

Iniziamo: descrivimi il tuo business e cosa vorresti ottenere con il funnel. Per esempio:
- Che tipo di attività hai?
- Chi è il tuo cliente ideale?
- Qual è l'obiettivo principale del funnel?

Più dettagli mi dai, più preciso sarà il funnel che creeremo insieme!`,
          timestamp: new Date()
        };
        
        setMessages([welcomeMessage]);
        saveMessage(welcomeMessage);
      }
    }
  }, [memory, user, saveMessage]);

  // Add message function that syncs automatically
  const addMessage = useCallback((message: RevolutionChatMessage) => {
    setMessages(prev => [...prev.filter(m => !m.isTyping), message]);
    saveMessage(message);
  }, [saveMessage]);

  // Update conversation state function that syncs automatically
  const updateState = useCallback((newState: RevolutionConversationState) => {
    setConversationState(newState);
    updateConversationState(newState);
  }, [updateConversationState]);

  // Add typing indicator
  const addTypingIndicator = useCallback(() => {
    const typingMessage: RevolutionChatMessage = {
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isTyping: true
    };
    setMessages(prev => [...prev.filter(m => !m.isTyping), typingMessage]);
  }, []);

  // Remove typing indicator
  const removeTypingIndicator = useCallback(() => {
    setMessages(prev => prev.filter(msg => !msg.isTyping));
  }, []);

  // Check if there are unsaved changes before leaving
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = 'Hai dei dati non salvati. Sei sicuro di voler uscire?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  return {
    messages,
    setMessages,
    conversationState,
    setConversationState: updateState,
    sessionId,
    setSessionId,
    addMessage,
    addTypingIndicator,
    removeTypingIndicator,
    isLoading: memoryLoading,
    hasUnsavedChanges,
    clearSession: clearMemory,
    refreshSession: refreshMemory
  };
};