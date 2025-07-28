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
import { revolutionFunnelIntegrator, CustomerProfileData } from '@/services/revolutionFunnelIntegrator';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
}

interface ConversationState {
  phase: 'gathering' | 'generating' | 'complete';
  collectedData: Record<string, any>;
  dataCategories: {
    business: Record<string, any>;
    audience: Record<string, any>;
    goals: Record<string, any>;
    resources: Record<string, any>;
    constraints: Record<string, any>;
  };
  nextQuestions: string[];
  completeness: number;
  confidenceScores: Record<string, number>;
  timestamp: string;
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
      // Get current session for authentication
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('Autenticazione richiesta');
      }

      const { data, error } = await supabase.functions.invoke('revolution-funnel-engine', {
        body: {
          action: 'conversational_flow',
          message: userMessage.content,
          conversationState: conversationState,
          userId: user?.id
        },
        headers: {
          'Authorization': `Bearer ${session.access_token}`
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

      // If conversation is complete, generate personalized funnel
      if (data.conversationState.phase === 'complete') {
        setConversationState(prev => ({ ...prev, phase: 'generating' }));
        
        // Extract customer profile from collected data
        const allResponses: Record<string, string> = {};
        
        // Safely extract all responses from collected data
        Object.values(data.conversationState.collectedData || {}).forEach((categoryData: any) => {
          if (categoryData && typeof categoryData === 'object') {
            Object.entries(categoryData).forEach(([key, value]) => {
              if (typeof value === 'string') {
                allResponses[key] = value;
              }
            });
          }
        });
        
        const customerProfile = revolutionFunnelIntegrator.extractCustomerProfile(
          data.conversationState.dataCategories || {},
          allResponses
        );
        
        // Generate personalized funnel prompt
        const funnelPrompt = `Crea un funnel personalizzato per il cliente con le seguenti caratteristiche:
        - Business: ${customerProfile.businessInfo?.name || 'Cliente'}
        - Settore: ${customerProfile.businessInfo?.industry || 'Non specificato'}
        - Target: ${customerProfile.businessInfo?.targetAudience || 'Professionisti'}
        - Pain points: ${customerProfile.psychographics?.painPoints.join(', ') || 'Nessuno specificato'}
        - Obiettivo: ${customerProfile.conversionStrategy?.primaryGoal || 'Generare lead'}`;
        
        try {
          const funnelResult = await revolutionFunnelIntegrator.generatePersonalizedFunnel({
            prompt: funnelPrompt,
            userId: user?.id || '',
            customerProfile,
            saveToLibrary: true
          });
          
          if (funnelResult.success && funnelResult.funnel) {
            onFunnelGenerated(funnelResult.funnel);
            
            const completionMessage: ChatMessage = {
              role: 'assistant',
              content: '🎉 Perfetto! Ho creato il tuo funnel personalizzato utilizzando tutte le informazioni che mi hai fornito. Il funnel è ottimizzato per il tuo business e il tuo target di riferimento. Puoi visualizzarlo e modificarlo dalla dashboard.',
              timestamp: new Date()
            };
            setMessages(prev => [...prev, completionMessage]);
          }
        } catch (funnelError) {
          console.error('Error generating personalized funnel:', funnelError);
          
          const fallbackMessage: ChatMessage = {
            role: 'assistant',
            content: 'Mi dispiace, c\'è stato un problema nella generazione del funnel personalizzato. Tuttavia, ho raccolto tutte le tue informazioni e puoi creare manualmente il funnel utilizzando i nostri template.',
            timestamp: new Date()
          };
          setMessages(prev => [...prev, fallbackMessage]);
        }
      }

    } catch (error) {
      removeTypingIndicator();
      console.error('Error in conversation:', error);
      
      // Determine error type and provide specific feedback
      let errorResponse = 'Mi dispiace, ho riscontrato un errore tecnico. ';
      let shouldRetry = true;
      
      if (error instanceof Error) {
        if (error.message.includes('Autenticazione') || error.message.includes('Authentication')) {
          errorResponse = 'Sembra che ci sia un problema con l\'autenticazione. Prova a ricaricare la pagina e accedere nuovamente.';
          shouldRetry = false;
        } else if (error.message.includes('OpenAI')) {
          errorResponse = 'Il servizio AI è temporaneamente non disponibile. Riprova tra qualche minuto.';
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          errorResponse = 'Problema di connessione. Controlla la tua connessione internet e riprova.';
        } else {
          errorResponse += 'Puoi riprovare o riformulare la tua domanda in modo diverso.';
        }
      }
      
      if (shouldRetry) {
        errorResponse += '\n\nSe il problema persiste, prova a:\n• Riformulare la tua richiesta\n• Fornire informazioni più specifiche\n• Ricaricare la pagina';
      }
      
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: errorResponse,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
      
      // More specific toast based on error type
      const toastTitle = error instanceof Error && error.message.includes('Autenticazione') 
        ? "Problema di autenticazione" 
        : "Errore di comunicazione";
      
      const toastDescription = error instanceof Error && error.message.includes('Autenticazione')
        ? "Prova a ricaricare la pagina e accedere nuovamente"
        : "L'AI è temporaneamente non disponibile, riprova tra poco";
      
      toast({
        title: toastTitle,
        description: toastDescription,
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