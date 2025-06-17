
import React, { useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Bot } from 'lucide-react';
import AIFunnelChatMessages from './AIFunnelChatMessages';
import AIFunnelTemplateSelection from './AIFunnelTemplateSelection';
import AIFunnelChatInput from './AIFunnelChatInput';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIFunnelChatInterfaceProps {
  messages: ChatMessage[];
  isLoading: boolean;
  sessionId: string;
  showTemplateChoice: boolean;
  inputMessage: string;
  setInputMessage: (value: string) => void;
  onSendMessage: () => void;
  onTemplateSelect: (templateId: string, templateName: string) => void;
}

const AIFunnelChatInterface: React.FC<AIFunnelChatInterfaceProps> = ({
  messages,
  isLoading,
  sessionId,
  showTemplateChoice,
  inputMessage,
  setInputMessage,
  onSendMessage,
  onTemplateSelect
}) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  return (
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
            <AIFunnelChatMessages 
              messages={messages} 
              isLoading={isLoading} 
            />
            {/* Elemento invisibile per forzare lo scroll */}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {showTemplateChoice && (
          <AIFunnelTemplateSelection onTemplateSelect={onTemplateSelect} />
        )}

        <AIFunnelChatInput
          inputMessage={inputMessage}
          setInputMessage={setInputMessage}
          onSendMessage={onSendMessage}
          isLoading={isLoading}
        />
      </CardContent>
    </Card>
  );
};

export default AIFunnelChatInterface;
