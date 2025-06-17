
import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Bot, User, Paperclip } from 'lucide-react';
import { ChatMessage } from '@/types/chatbot';

interface AdminChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => Promise<void>;
  isLoading: boolean;
  hasAttachments?: boolean;
}

const AdminChatInterface: React.FC<AdminChatInterfaceProps> = ({ 
  messages, 
  onSendMessage, 
  isLoading,
  hasAttachments = false
}) => {
  const [inputMessage, setInputMessage] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
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

  const handleSend = async () => {
    if (inputMessage.trim() && !isLoading) {
      await onSendMessage(inputMessage);
      setInputMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Function to render code blocks and other formatted text
  const formatMessageContent = (content: string) => {
    // Split by code blocks
    const parts = content.split(/```([^`]+)```/);
    
    return parts.map((part, index) => {
      if (index % 2 === 1) {
        // This is a code block
        return (
          <pre key={index} className="bg-gray-800 p-3 rounded my-2 overflow-x-auto">
            <code>{part}</code>
          </pre>
        );
      } else {
        // Regular text - convert line breaks
        const textWithBreaks = part.split('\n').map((line, i) => (
          <React.Fragment key={i}>
            {line}
            {i < part.split('\n').length - 1 && <br />}
          </React.Fragment>
        ));
        
        return <p key={index}>{textWithBreaks}</p>;
      }
    });
  };

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex gap-2 max-w-[90%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.role === 'user' ? 'bg-blue-500' : 'bg-golden'
                }`}>
                  {message.role === 'user' ? (
                    <User className="w-5 h-5 text-white" />
                  ) : (
                    <Bot className="w-5 h-5 text-black" />
                  )}
                </div>

                <div className={`rounded-lg p-4 ${
                  message.role === 'user' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-800 text-white'
                }`}>
                  <div className="text-sm whitespace-pre-wrap">
                    {formatMessageContent(message.content)}
                  </div>
                  
                  {/* Display attachments if any */}
                  {message.attachments && message.attachments.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-gray-700">
                      <p className="text-xs text-gray-400 mb-1">Allegati:</p>
                      <div className="flex flex-wrap gap-2">
                        {message.attachments.map((attachment, i) => (
                          <div key={i} className="flex items-center bg-gray-700 rounded px-2 py-1 text-xs">
                            <Paperclip className="w-3 h-3 mr-1" />
                            {attachment.name || `File ${i+1}`}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-1 text-xs opacity-70">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="flex gap-2">
                <div className="w-10 h-10 rounded-full bg-golden flex items-center justify-center">
                  <Bot className="w-5 h-5 text-black" />
                </div>
                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-gray-700 bg-gray-800">
        <div className="flex gap-2 items-center">
          {hasAttachments && (
            <div className="flex items-center bg-blue-600 text-white text-xs px-2 py-1 rounded">
              <Paperclip className="w-3 h-3 mr-1" />
              <span>File pronti</span>
            </div>
          )}
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Scrivi un messaggio..."
            disabled={isLoading}
            className="flex-1 bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
          />
          <Button
            onClick={handleSend}
            disabled={isLoading || !inputMessage.trim()}
            className="bg-golden hover:bg-yellow-600 text-black"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminChatInterface;
