
import { useState, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

// MODALITÀ TEST: Se true, il chatbot è disponibile per tutti
const FREE_FOR_ALL_MODE = true;

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const useChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const [subscription, setSubscription] = useState<any>(null);
  const [loadingSubscription, setLoadingSubscription] = useState(true);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Check subscription status
  useEffect(() => {
    const checkSubscription = async () => {
      if (!user) {
        setLoadingSubscription(false);
        return;
      }

      if (FREE_FOR_ALL_MODE) {
        // In modalità test, simula un abbonamento premium
        setSubscription({
          user_id: user.id,
          email: user.email,
          subscribed: true,
          subscription_tier: 'enterprise'
        });
        setLoadingSubscription(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('subscribers')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching subscription:', error);
        }
        
        setSubscription(data);
      } catch (error) {
        console.error('Error checking subscription:', error);
      } finally {
        setLoadingSubscription(false);
      }
    };

    checkSubscription();
  }, [user]);

  // Load conversation history when chatbot opens
  useEffect(() => {
    if (isOpen && user && hasStarted && sessionId) {
      loadConversationHistory();
    }
  }, [isOpen, user, hasStarted, sessionId]);

  const loadConversationHistory = async () => {
    if (!user || !sessionId) return;

    try {
      const { data, error } = await supabase
        .from('chatbot_conversations')
        .select('message_role, message_content, created_at')
        .eq('user_id', user.id)
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error loading conversation history:', error);
        return;
      }

      if (data && data.length > 0) {
        const conversationMessages: ChatMessage[] = data.map(msg => ({
          role: msg.message_role as 'user' | 'assistant',
          content: msg.message_content,
          timestamp: new Date(msg.created_at)
        }));
        setMessages(conversationMessages);
      }
    } catch (error) {
      console.error('Error loading conversation history:', error);
    }
  };

  const startConversation = async () => {
    if (!user) {
      toast({
        title: "Accesso richiesto",
        description: "Devi effettuare l'accesso per utilizzare il chatbot AI.",
        variant: "destructive",
      });
      return;
    }

    setHasStarted(true);
    const newSessionId = crypto.randomUUID();
    setSessionId(newSessionId);
    
    const testModeNote = FREE_FOR_ALL_MODE ? 
      "\n\n🎯 **Modalità Test Gratuita Attiva!** Tutte le funzionalità premium sono tempor aneamente disponibili per tutti. Approfitta per testare tutte le capacità del nostro assistente AI!" : "";

    const welcomeMessage: ChatMessage = {
      role: 'assistant',
      content: `Ciao ${user.email?.split('@')[0]}! Sono il tuo assistente AI personale per la creazione di funnel. Sono qui per aiutarti a scoprire i tuoi interessi e creare strategie di marketing su misura per te.${testModeNote}

Per iniziare, dimmi: qual è il tuo settore di interesse o in che campo vorresti sviluppare il tuo business?`,
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading || !user) return;

    // In modalità test, bypassa i controlli di abbonamento
    if (!FREE_FOR_ALL_MODE && (!subscription?.subscribed || subscription.subscription_tier === 'free')) {
      toast({
        title: "Piano Premium richiesto",
        description: "Aggiorna il tuo abbonamento per continuare a utilizzare il chatbot AI.",
        variant: "destructive",
      });
      return;
    }

    const userMessage: ChatMessage = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const { data, error } = await supabase.functions.invoke('chatbot-ai', {
        body: { 
          messages: [{ role: 'user', content: userMessage.content }],
          sessionId: sessionId 
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
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMessage]);
        
        if (data.sessionId && data.sessionId !== sessionId) {
          setSessionId(data.sessionId);
        }

        // Mostra un toast se siamo in modalità test
        if (data.testMode) {
          console.log('🎯 Modalità test attiva - Tutte le funzionalità disponibili gratuitamente');
        }
      } else if (data.requiresUpgrade) {
        toast({
          title: "Piano Premium richiesto",
          description: data.error,
          variant: "destructive",
        });
      } else {
        throw new Error(data.error || 'Errore nella risposta del chatbot');
      }
    } catch (error) {
      console.error('Errore nel chatbot:', error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore nella comunicazione con l'AI. Riprova.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // In modalità test, il chatbot è sempre accessibile per utenti loggati
  const canAccessChatbot = FREE_FOR_ALL_MODE ? 
    !!user : 
    (user && subscription?.subscribed && subscription.subscription_tier !== 'free');
  
  const isSubscriptionLoading = user && loadingSubscription;

  return {
    isOpen,
    setIsOpen,
    isMinimized,
    setIsMinimized,
    messages,
    inputMessage,
    setInputMessage,
    isLoading,
    hasStarted,
    subscription,
    loadingSubscription,
    scrollAreaRef,
    user,
    startConversation,
    sendMessage,
    handleKeyPress,
    canAccessChatbot,
    isSubscriptionLoading,
    freeForAllMode: FREE_FOR_ALL_MODE
  };
};
