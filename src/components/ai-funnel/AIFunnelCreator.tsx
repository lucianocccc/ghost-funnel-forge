import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Bot, User, Send, Zap, FileText, Sparkles, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useChatBotFunnels } from '@/hooks/useChatBotFunnels';
import { useFunnels } from '@/hooks/useFunnels';
import { supabase } from '@/integrations/supabase/client';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const AIFunnelCreator: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const [showTemplateChoice, setShowTemplateChoice] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const { templates } = useFunnels();
  const { generatedFunnels, loading: funnelsLoading } = useChatBotFunnels(sessionId);

  const scrollToBottom = () => {
    // Primo metodo: scroll usando il ref diretto
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end'
      });
    }
    
    // Secondo metodo: fallback per il ScrollArea
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        setTimeout(() => {
          scrollContainer.scrollTop = scrollContainer.scrollHeight;
        }, 100);
      }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const startAIInterview = async () => {
    if (!user) {
      toast({
        title: "Accesso richiesto",
        description: "Devi essere autenticato per creare funnel con l'AI.",
        variant: "destructive",
      });
      return;
    }

    setHasStarted(true);
    const newSessionId = crypto.randomUUID();
    setSessionId(newSessionId);

    const welcomeMessage: ChatMessage = {
      role: 'assistant',
      content: `Ciao ${user.email?.split('@')[0]}! Sono il tuo assistente AI per la creazione di funnel personalizzati. 

Prima di iniziare, dimmi: preferisci che ti consigli uno dei nostri funnel preconfezionati ottimizzati per diversi settori, oppure vuoi che creiamo insieme un funnel completamente personalizzato per le tue specifiche esigenze?

Rispondi con:
- **"Template"** se vuoi scegliere tra funnel preconfezionati
- **"Personalizzato"** se vuoi un funnel creato appositamente per te

Oppure dimmi direttamente qual è il tuo settore di business se vuoi iniziare subito!`,
      timestamp: new Date()
    };

    setMessages([welcomeMessage]);
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading || !user) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputMessage;
    setInputMessage('');
    setIsLoading(true);

    // Check if user wants templates
    if (currentInput.toLowerCase().includes('template') || currentInput.toLowerCase().includes('preconfezionato')) {
      setShowTemplateChoice(true);
      const templateMessage: ChatMessage = {
        role: 'assistant',
        content: `Perfetto! Ecco i nostri funnel template disponibili. Scegli quello che meglio si adatta al tuo business, poi potremo personalizzarlo insieme per le tue specifiche esigenze.

Clicca su uno dei template qui sotto per iniziare.`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, templateMessage]);
      setIsLoading(false);
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      // Enhanced prompt for funnel creation
      const enhancedPrompt = `${currentInput}

CONTESTO: L'utente sta creando un funnel di marketing. Se hai raccolto abbastanza informazioni (settore, target, obiettivi), genera 3 funnel specifici usando il formato richiesto.

ISTRUZIONI SPECIALI:
- Se l'utente ha scelto "personalizzato", conduci un'intervista per scoprire: settore, target audience, obiettivi, budget, tempistiche
- Fai UNA domanda alla volta per mantenere la conversazione naturale
- Quando hai abbastanza informazioni, genera ESATTAMENTE 3 funnel usando questo formato:

**FUNNEL 1: [Nome del Funnel]**
Descrizione: [Descrizione dettagliata 2-3 frasi]
Target: [Target audience specifico]
Industria: [Settore/industria]

Step del funnel:
1. [Nome Step] - [Descrizione dettagliata dello step]
2. [Nome Step] - [Descrizione dettagliata dello step]
3. [Nome Step] - [Descrizione dettagliata dello step]
4. [Nome Step] - [Descrizione dettagliata dello step]
5. [Nome Step] - [Descrizione dettagliata dello step]

Strategia: [Strategia di distribuzione e implementazione]

---

[Ripeti per FUNNEL 2 e FUNNEL 3]

Concludi sempre con: "Quale di questi funnel ti interessa di più? Posso personalizzarlo ulteriormente!"`;

      const { data, error } = await supabase.functions.invoke('chatbot-ai', {
        body: { 
          messages: [{ role: 'user', content: enhancedPrompt }],
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
      } else {
        throw new Error(data.error || 'Errore nella comunicazione con l\'AI');
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

  const handleTemplateSelect = async (templateId: string, templateName: string) => {
    setShowTemplateChoice(false);
    setIsLoading(true);

    const templateMessage: ChatMessage = {
      role: 'assistant',
      content: `Ottima scelta! Hai selezionato il template "${templateName}". 

Ora aiutami a personalizzarlo per te. Dimmi:

1. Qual è il tuo settore di business specifico?
2. Chi è il tuo target audience ideale?
3. Qual è il tuo obiettivo principale con questo funnel?

Inizia con il primo punto - raccontami del tuo business!`,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, templateMessage]);
    setIsLoading(false);
  };

  const formatMessageContent = (content: string) => {
    const parts = content.split(/\*\*(.*?)\*\*/g);
    
    return parts.map((part, index) => {
      if (index % 2 === 1) {
        return <strong key={index} className="text-golden">{part}</strong>;
      }
      
      const textWithBreaks = part.split('\n').map((line, i) => (
        <React.Fragment key={i}>
          {line}
          {i < part.split('\n').length - 1 && <br />}
        </React.Fragment>
      ));
      
      return <span key={index}>{textWithBreaks}</span>;
    });
  };

  if (!hasStarted) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-golden rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-black" />
          </div>
          <CardTitle className="text-2xl text-golden">
            AI Funnel Creator
          </CardTitle>
          <p className="text-gray-300 mt-2">
            Lascia che l'intelligenza artificiale ti guidi nella creazione del funnel perfetto per il tuo business. 
            Scegli tra template preconfezionati o crea un funnel completamente personalizzato.
          </p>
        </CardHeader>
        <CardContent className="text-center">
          <Button 
            onClick={startAIInterview}
            className="bg-golden hover:bg-yellow-600 text-black text-lg px-8 py-3"
          >
            <Zap className="w-5 h-5 mr-2" />
            Inizia Creazione AI
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Chat Interface */}
      <Card className="h-[600px] flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-golden">
            <Bot className="w-5 h-5" />
            AI Funnel Assistant
            {sessionId && (
              <Badge variant="outline" className="ml-auto">
                Sessione attiva
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col p-0">
          <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-2 max-w-[85%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
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
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-800 text-white'
                    }`}>
                      <div className="text-sm whitespace-pre-wrap">
                        {formatMessageContent(message.content)}
                      </div>
                      <div className="mt-1 text-xs opacity-70">
                        {message.timestamp.toLocaleTimeString()}
                      </div>
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
                    <div className="bg-gray-800 rounded-lg p-3">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Elemento invisibile per forzare lo scroll */}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Template Selection */}
          {showTemplateChoice && templates.length > 0 && (
            <div className="border-t border-gray-700 p-4">
              <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-golden" />
                Scegli un Template:
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {templates.slice(0, 4).map((template) => (
                  <Button
                    key={template.id}
                    variant="outline"
                    className="text-left h-auto p-3 border-gray-600 hover:border-golden"
                    onClick={() => handleTemplateSelect(template.id, template.name)}
                  >
                    <div className="w-full">
                      <div className="font-medium text-golden">{template.name}</div>
                      <div className="text-xs text-gray-400 mt-1">{template.description}</div>
                      <div className="flex items-center justify-between mt-2">
                        <Badge variant="secondary" className="text-xs">
                          {template.category}
                        </Badge>
                        <ArrowRight className="w-3 h-3 text-golden" />
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="border-t border-gray-700 p-4">
            <div className="flex gap-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Scrivi la tua risposta..."
                disabled={isLoading}
                className="flex-1 bg-gray-800 border-gray-600 text-white"
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
        </CardContent>
      </Card>

      {/* Generated Funnels Display */}
      {generatedFunnels.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-golden">Funnel Generati dall'AI</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {generatedFunnels.map((funnel, index) => (
                <div key={funnel.id} className="border border-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-white">{funnel.name}</h4>
                    <Badge variant={funnel.is_active ? 'default' : 'secondary'}>
                      {funnel.is_active ? 'Attivo' : 'Bozza'}
                    </Badge>
                  </div>
                  <p className="text-gray-300 text-sm mb-3">{funnel.description}</p>
                  <div className="flex gap-2">
                    <Button size="sm" className="bg-golden hover:bg-yellow-600 text-black">
                      Visualizza Dettagli
                    </Button>
                    <Button size="sm" variant="outline">
                      Condividi
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AIFunnelCreator;
