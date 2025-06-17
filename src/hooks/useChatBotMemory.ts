
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { ChatMessage } from '@/types/chatbot';

interface ConversationMemory {
  messages: ChatMessage[];
  sessionId: string;
  lastUpdated: Date;
  userContext: {
    preferences: any;
    conversationCount: number;
    lastTopics: string[];
  };
}

export const useChatBotMemory = () => {
  const { user } = useAuth();
  const [memory, setMemory] = useState<ConversationMemory | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Carica la memoria dell'utente all'avvio
  const loadUserMemory = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Carica il profilo utente con le sue preferenze
      const { data: profile } = await supabase
        .from('chatbot_user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // Carica l'ultima sessione attiva o crea una nuova
      const { data: lastSession } = await supabase
        .from('chatbot_conversations')
        .select('session_id, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      const sessionId = lastSession?.session_id || crypto.randomUUID();

      // Carica gli ultimi 50 messaggi della sessione
      const { data: messages } = await supabase
        .from('chatbot_conversations')
        .select('message_role, message_content, created_at, metadata')
        .eq('user_id', user.id)
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true })
        .limit(50);

      const conversationMessages: ChatMessage[] = (messages || []).map(msg => ({
        role: msg.message_role as 'user' | 'assistant' | 'system',
        content: msg.message_content,
        timestamp: new Date(msg.created_at),
        attachments: msg.metadata?.attachments || []
      }));

      setMemory({
        messages: conversationMessages,
        sessionId,
        lastUpdated: new Date(),
        userContext: {
          preferences: profile?.preferences || {},
          conversationCount: profile?.conversation_count || 0,
          lastTopics: profile?.interests?.topics || []
        }
      });

    } catch (error) {
      console.error('Error loading user memory:', error);
      // Crea una nuova memoria se il caricamento fallisce
      setMemory({
        messages: [],
        sessionId: crypto.randomUUID(),
        lastUpdated: new Date(),
        userContext: {
          preferences: {},
          conversationCount: 0,
          lastTopics: []
        }
      });
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Salva un messaggio nella memoria
  const saveMessage = useCallback(async (message: ChatMessage) => {
    if (!user || !memory) return;

    try {
      // Salva nel database
      await supabase
        .from('chatbot_conversations')
        .insert({
          user_id: user.id,
          session_id: memory.sessionId,
          message_role: message.role,
          message_content: message.content,
          metadata: {
            attachments: message.attachments || [],
            timestamp: message.timestamp.toISOString()
          }
        });

      // Aggiorna la memoria locale
      setMemory(prev => prev ? {
        ...prev,
        messages: [...prev.messages, message],
        lastUpdated: new Date()
      } : null);

      // Aggiorna il contatore delle conversazioni se è un messaggio dell'utente
      if (message.role === 'user') {
        await supabase
          .from('chatbot_user_profiles')
          .upsert({
            user_id: user.id,
            conversation_count: memory.userContext.conversationCount + 1,
            last_interaction: new Date().toISOString()
          }, {
            onConflict: 'user_id'
          });
      }

    } catch (error) {
      console.error('Error saving message:', error);
    }
  }, [user, memory]);

  // Crea una nuova sessione mantenendo il contesto
  const startNewSession = useCallback(() => {
    if (!memory) return;

    const newSessionId = crypto.randomUUID();
    setMemory(prev => prev ? {
      ...prev,
      messages: [],
      sessionId: newSessionId,
      lastUpdated: new Date()
    } : null);
  }, [memory]);

  // Recupera automaticamente la memoria ogni 30 secondi
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      if (memory && new Date().getTime() - memory.lastUpdated.getTime() > 60000) {
        loadUserMemory();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [user, memory, loadUserMemory]);

  // Carica la memoria all'inizializzazione
  useEffect(() => {
    loadUserMemory();
  }, [loadUserMemory]);

  return {
    memory,
    isLoading,
    saveMessage,
    startNewSession,
    refreshMemory: loadUserMemory
  };
};
