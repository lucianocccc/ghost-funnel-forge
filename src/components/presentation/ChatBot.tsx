
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle, Send, Bot, User, X, Minimize2, Lock, Crown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const ChatBot: React.FC = () => {
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

  // Verificare lo stato dell'abbonamento dell'utente
  useEffect(() => {
    const checkSubscription = async () => {
      if (!user) {
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

  // Caricare la cronologia delle conversazioni quando si apre il chatbot
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

    if (!subscription?.subscribed || subscription.subscription_tier === 'free') {
      toast({
        title: "Piano Premium richiesto",
        description: "Il chatbot AI è disponibile solo per gli abbonamenti premium. Aggiorna il tuo piano per accedere a questa funzionalità.",
        variant: "destructive",
      });
      return;
    }

    setHasStarted(true);
    const newSessionId = crypto.randomUUID();
    setSessionId(newSessionId);
    
    const welcomeMessage: ChatMessage = {
      role: 'assistant',
      content: `Ciao ${user.email?.split('@')[0]}! Sono il tuo assistente AI personale per la creazione di funnel. Sono qui per aiutarti a scoprire i tuoi interessi e creare strategie di marketing su misura per te. 

Posso vedere che hai accesso al piano premium, quindi possiamo iniziare subito!

Per iniziare, dimmi: qual è il tuo settore di interesse o in che campo vorresti sviluppare il tuo business?`,
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading || !user) return;

    if (!subscription?.subscribed || subscription.subscription_tier === 'free') {
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
        
        // Aggiornare il sessionId se è stato creato un nuovo
        if (data.sessionId && data.sessionId !== sessionId) {
          setSessionId(data.sessionId);
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

  // Determinare se l'utente può accedere al chatbot
  const canAccessChatbot = user && subscription?.subscribed && subscription.subscription_tier !== 'free';
  const isSubscriptionLoading = user && loadingSubscription;

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className={`h-16 w-16 rounded-full shadow-lg relative ${
            canAccessChatbot 
              ? 'bg-golden hover:bg-yellow-600 text-black' 
              : 'bg-gray-600 hover:bg-gray-700 text-white'
          }`}
          disabled={isSubscriptionLoading}
        >
          <MessageCircle className="w-8 h-8" />
          {!canAccessChatbot && !isSubscriptionLoading && (
            <Lock className="w-4 h-4 absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5" />
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Card className={`w-96 ${isMinimized ? 'h-16' : 'h-[500px]'} bg-white shadow-2xl transition-all duration-300`}>
        <CardHeader className={`p-4 ${canAccessChatbot ? 'bg-golden' : 'bg-gray-600'}`}>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-black text-lg">
              <Bot className="w-5 h-5" />
              AI Funnel Assistant
              {canAccessChatbot && <Crown className="w-4 h-4 text-yellow-600" />}
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(!isMinimized)}
                className="text-black hover:bg-yellow-600 p-1 h-8 w-8"
              >
                <Minimize2 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="text-black hover:bg-yellow-600 p-1 h-8 w-8"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {!isMinimized && (
          <CardContent className="p-0 flex flex-col h-[436px]">
            {!user ? (
              <div className="flex-1 flex items-center justify-center p-6">
                <div className="text-center">
                  <Lock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Accesso Richiesto</h3>
                  <p className="text-gray-600 mb-4 text-sm">
                    Devi effettuare l'accesso per utilizzare il chatbot AI personalizzato.
                  </p>
                  <Button 
                    onClick={() => window.location.href = '/auth'} 
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    Accedi
                  </Button>
                </div>
              </div>
            ) : !canAccessChatbot && !isSubscriptionLoading ? (
              <div className="flex-1 flex items-center justify-center p-6">
                <div className="text-center">
                  <Crown className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Piano Premium Richiesto</h3>
                  <p className="text-gray-600 mb-4 text-sm">
                    Il chatbot AI personalizzato è disponibile solo per gli abbonamenti premium. 
                    Aggiorna il tuo piano per accedere a funzionalità avanzate come:
                  </p>
                  <ul className="text-sm text-gray-600 mb-4 text-left space-y-1">
                    <li>• Conversazioni personalizzate</li>
                    <li>• Cronologia conservata</li>
                    <li>• Suggerimenti di funnel su misura</li>
                    <li>• Supporto AI 24/7</li>
                  </ul>
                  <Button 
                    onClick={() => window.location.href = '/auth?subscribe=true&plan=professional'} 
                    className="bg-golden hover:bg-yellow-600 text-black"
                  >
                    Aggiorna Piano
                  </Button>
                </div>
              </div>
            ) : isSubscriptionLoading ? (
              <div className="flex-1 flex items-center justify-center p-6">
                <div className="text-center">
                  <div className="animate-spin w-8 h-8 border-4 border-golden border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-gray-600">Caricamento...</p>
                </div>
              </div>
            ) : !hasStarted ? (
              <div className="flex-1 flex items-center justify-center p-6">
                <div className="text-center">
                  <Bot className="w-16 h-16 text-golden mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Il Tuo Assistente AI Personale</h3>
                  <p className="text-gray-600 mb-4 text-sm">
                    Benvenuto nel tuo chatbot AI personalizzato! Sono qui per aiutarti a creare funnel su misura per il tuo business.
                  </p>
                  <div className="bg-golden/10 p-3 rounded-lg mb-4">
                    <p className="text-xs text-gray-700">
                      ✨ Le tue conversazioni sono private e personalizzate<br/>
                      🧠 Ricordo le nostre conversazioni precedenti<br/>
                      🎯 Creo suggerimenti basati sui tuoi obiettivi
                    </p>
                  </div>
                  <Button onClick={startConversation} className="bg-golden hover:bg-yellow-600 text-black">
                    Inizia la Conversazione
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
                  <div className="space-y-4">
                    {messages.map((message, index) => (
                      <div
                        key={index}
                        className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`flex gap-2 max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                            message.role === 'user' ? 'bg-blue-500' : 'bg-golden'
                          }`}>
                            {message.role === 'user' ? (
                              <User className="w-4 h-4 text-white" />
                            ) : (
                              <Bot className="w-4 h-4 text-black" />
                            )}
                          </div>
                          <div className={`rounded-lg p-3 ${
                            message.role === 'user' 
                              ? 'bg-blue-500 text-white' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex gap-3 justify-start">
                        <div className="flex gap-2">
                          <div className="w-8 h-8 rounded-full bg-golden flex items-center justify-center">
                            <Bot className="w-4 h-4 text-black" />
                          </div>
                          <div className="bg-gray-100 rounded-lg p-3">
                            <div className="flex gap-1">
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>

                <div className="p-4 border-t">
                  <div className="flex gap-2">
                    <Input
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Scrivi il tuo messaggio..."
                      disabled={isLoading}
                      className="flex-1"
                    />
                    <Button
                      onClick={sendMessage}
                      disabled={isLoading || !inputMessage.trim()}
                      className="bg-golden hover:bg-yellow-600 text-black"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default ChatBot;
