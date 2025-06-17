
import React from 'react';
import { Bot, User } from 'lucide-react';
import { formatMessageContent } from '@/utils/messageFormatter';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIFunnelChatMessagesProps {
  messages: ChatMessage[];
  isLoading: boolean;
}

const AIFunnelChatMessages: React.FC<AIFunnelChatMessagesProps> = ({ 
  messages, 
  isLoading 
}) => {
  return (
    <>
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
    </>
  );
};

export default AIFunnelChatMessages;
