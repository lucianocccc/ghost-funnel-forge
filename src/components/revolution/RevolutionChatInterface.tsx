import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Send, Loader2, Sparkles } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
}

interface ConversationState {
  phase: 'gathering' | 'generating' | 'complete';
  collectedData: Record<string, any>;
  nextQuestions: string[];
  completeness: number;
}

interface RevolutionChatInterfaceProps {
  onFunnelGenerated: (funnel: any) => void;
}

const RevolutionChatInterface: React.FC<RevolutionChatInterfaceProps> = ({
  onFunnelGenerated
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationState, setConversationState] = useState<ConversationState>({
    phase: 'gathering',
    collectedData: {},
    nextQuestions: [],
    completeness: 0
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Initial welcome message
    setMessages([{
      role: 'assistant',
      content: `Ciao! Sono il tuo assistente AI per la creazione di funnel personalizzati. 

Ti aiuterò a creare un funnel rivoluzionario perfettamente calibrato per il tuo business.

Iniziamo: descrivimi il tuo business e cosa vorresti ottenere con il funnel. Per esempio:
- Che tipo di attività hai?
- Chi è il tuo cliente ideale?
- Qual è l'obiettivo principale del funnel?

Più dettagli mi dai, più preciso sarà il funnel che creeremo insieme!`,
      timestamp: new Date()
    }]);
  }, []);

  const addTypingIndicator = () => {
    setMessages(prev => [...prev, {
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isTyping: true
    }]);
  };

  const removeTypingIndicator = () => {
    setMessages(prev => prev.filter(msg => !msg.isTyping));
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    addTypingIndicator();

    try {
      const { data, error } = await supabase.functions.invoke('revolution-funnel-engine', {
        body: {
          action: 'conversational_flow',
          message: userMessage.content,
          conversationState: conversationState,
          userId: user?.id
        }
      });

      removeTypingIndicator();

      if (error) {
        throw error;
      }

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: data.response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      setConversationState(data.conversationState);

      // If funnel is complete, trigger the generation
      if (data.conversationState.phase === 'complete' && data.funnel) {
        onFunnelGenerated(data.funnel);
      }

    } catch (error) {
      removeTypingIndicator();
      console.error('Error in conversation:', error);
      
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: 'Mi dispiace, ho riscontrato un errore. Puoi riprovare?',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante la conversazione",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getPhaseLabel = () => {
    switch (conversationState.phase) {
      case 'gathering':
        return 'Raccogliendo informazioni';
      case 'generating':
        return 'Generando funnel';
      case 'complete':
        return 'Funnel completato';
      default:
        return 'In conversazione';
    }
  };

  return (
    <Card className="h-[600px] flex flex-col">
      {/* Header */}
      <div className="border-b p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Revolution Funnel AI</h3>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {getPhaseLabel()}
            </Badge>
            {conversationState.phase === 'gathering' && (
              <Badge variant="outline">
                {Math.round(conversationState.completeness * 100)}% completo
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                {message.isTyping ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">L'AI sta scrivendo...</span>
                  </div>
                ) : (
                  <div className="whitespace-pre-wrap">{message.content}</div>
                )}
                {!message.isTyping && (
                  <div className="text-xs opacity-70 mt-2">
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="border-t p-4">
        <div className="flex gap-2">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Scrivi la tua risposta..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            disabled={isLoading || !inputMessage.trim()}
            size="icon"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default RevolutionChatInterface;