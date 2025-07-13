
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { MessageCircle, Send, Brain, Loader2 } from 'lucide-react';

interface Message {
  role: 'assistant' | 'user';
  content: string;
  timestamp: Date;
  metadata?: any;
}

interface AIInterviewChatProps {
  onComplete: (data: any) => void;
  isProcessing?: boolean;
}

const AIInterviewChat: React.FC<AIInterviewChatProps> = ({
  onComplete,
  isProcessing
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => crypto.randomUUID());
  const [interviewProgress, setInterviewProgress] = useState(0);
  const [detectedInsights, setDetectedInsights] = useState<string[]>([]);
  
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Messaggio di benvenuto
    const welcomeMessage: Message = {
      role: 'assistant',
      content: `🎯 **Ciao! Sono il tuo AI Product Discovery Assistant.**

Sono qui per scoprire tutto sul tuo prodotto e creare un funnel cinematico che converte davvero.

**Ti farò alcune domande intelligenti per capire:**
• Il tuo prodotto e i suoi benefici unici
• Il tuo target audience e le loro necessità
• I tuoi obiettivi di business e conversione
• Come posizionarti contro la concorrenza

**Per iniziare, dimmi:** Qual è il prodotto o servizio per cui vuoi creare un funnel?`,
      timestamp: new Date()
    };
    
    setMessages([welcomeMessage]);
  }, []);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-product-interview', {
        body: {
          message: userMessage.content,
          sessionId,
          userId: user?.id,
          conversationHistory: messages
        }
      });

      if (error) throw error;

      const aiMessage: Message = {
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
        metadata: data.analysis
      };

      setMessages(prev => [...prev, aiMessage]);
      
      // Aggiorna il progresso e insights
      if (data.progress) {
        setInterviewProgress(data.progress);
      }
      
      if (data.insights) {
        setDetectedInsights(prev => [...prev, ...data.insights]);
      }

      // Se l'intervista è completata
      if (data.isComplete) {
        setTimeout(() => {
          onComplete({
            sessionId,
            messages: [...messages, userMessage, aiMessage],
            productData: data.productData,
            insights: data.insights,
            analysis: data.analysis
          });
        }, 2000);
      }

    } catch (error) {
      console.error('Error in AI interview:', error);
      toast({
        title: "Errore",
        description: "Errore nella comunicazione con l'AI. Riprova.",
        variant: "destructive"
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

  return (
    <div className="space-y-4">
      {/* Interview Progress */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              Progresso Intervista
            </span>
            <span>{Math.round(interviewProgress)}% completa</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
              style={{ width: `${interviewProgress}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Detected Insights */}
      {detectedInsights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">🧠 Insights Rilevati</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-wrap gap-2">
              {detectedInsights.map((insight, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {insight}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Chat Interface */}
      <Card className="h-[500px] flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            AI Product Discovery Chat
          </CardTitle>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col p-0">
          <ScrollArea className="flex-1 p-6" ref={scrollAreaRef}>
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-4 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{message.content}</div>
                    <div className="text-xs opacity-70 mt-2">
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted p-4 rounded-lg flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>L'AI sta analizzando la tua risposta...</span>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
          
          <div className="p-6 border-t">
            <div className="flex gap-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Scrivi la tua risposta..."
                disabled={isLoading || isProcessing}
                className="flex-1"
              />
              <Button
                onClick={sendMessage}
                disabled={isLoading || isProcessing || !inputMessage.trim()}
                size="icon"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIInterviewChat;
