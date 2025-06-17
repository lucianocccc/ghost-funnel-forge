
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import ChatBotHeader from './ChatBotHeader';
import LoginRequiredState from './LoginRequiredState';
import PremiumRequiredState from './PremiumRequiredState';
import LoadingState from './LoadingState';
import WelcomeState from './WelcomeState';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';
import { ChatMessage } from '../hooks/useChatBot';

interface ChatWindowProps {
  isMinimized: boolean;
  canAccessChatbot: boolean;
  isSubscriptionLoading: boolean;
  user: any;
  hasStarted: boolean;
  messages: ChatMessage[];
  isLoading: boolean;
  scrollAreaRef: React.RefObject<HTMLDivElement>;
  inputMessage: string;
  setInputMessage: (message: string) => void;
  onMinimize: () => void;
  onClose: () => void;
  onStartConversation: () => void;
  onSendMessage: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({
  isMinimized,
  canAccessChatbot,
  isSubscriptionLoading,
  user,
  hasStarted,
  messages,
  isLoading,
  scrollAreaRef,
  inputMessage,
  setInputMessage,
  onMinimize,
  onClose,
  onStartConversation,
  onSendMessage,
  onKeyPress
}) => {
  return (
    <Card className={`w-96 ${isMinimized ? 'h-16' : 'h-[500px]'} bg-white shadow-2xl transition-all duration-300`}>
      <CardHeader className="p-0">
        <ChatBotHeader
          canAccessChatbot={canAccessChatbot}
          onMinimize={onMinimize}
          onClose={onClose}
        />
      </CardHeader>

      {!isMinimized && (
        <CardContent className="p-0 flex flex-col h-[436px]">
          {!user ? (
            <LoginRequiredState />
          ) : !canAccessChatbot && !isSubscriptionLoading ? (
            <PremiumRequiredState />
          ) : isSubscriptionLoading ? (
            <LoadingState />
          ) : !hasStarted ? (
            <WelcomeState onStartConversation={onStartConversation} />
          ) : (
            <>
              <ChatMessages
                messages={messages}
                isLoading={isLoading}
                scrollAreaRef={scrollAreaRef}
              />
              <ChatInput
                inputMessage={inputMessage}
                setInputMessage={setInputMessage}
                onSendMessage={onSendMessage}
                onKeyPress={onKeyPress}
                isLoading={isLoading}
              />
            </>
          )}
        </CardContent>
      )}
    </Card>
  );
};

export default ChatWindow;
