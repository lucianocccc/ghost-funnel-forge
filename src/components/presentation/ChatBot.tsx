
import React from 'react';
import { useChatBot } from './hooks/useChatBot';
import ChatBotButton from './components/ChatBotButton';
import ChatWindow from './components/ChatWindow';

const ChatBot: React.FC = () => {
  const {
    isOpen,
    setIsOpen,
    isMinimized,
    setIsMinimized,
    messages,
    inputMessage,
    setInputMessage,
    isLoading,
    hasStarted,
    scrollAreaRef,
    user,
    startConversation,
    sendMessage,
    handleKeyPress,
    canAccessChatbot,
    isSubscriptionLoading
  } = useChatBot();

  if (!isOpen) {
    return (
      <ChatBotButton
        onClick={() => setIsOpen(true)}
        canAccessChatbot={canAccessChatbot}
        isSubscriptionLoading={isSubscriptionLoading}
      />
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <ChatWindow
        isMinimized={isMinimized}
        canAccessChatbot={canAccessChatbot}
        isSubscriptionLoading={isSubscriptionLoading}
        user={user}
        hasStarted={hasStarted}
        messages={messages}
        isLoading={isLoading}
        scrollAreaRef={scrollAreaRef}
        inputMessage={inputMessage}
        setInputMessage={setInputMessage}
        onMinimize={() => setIsMinimized(!isMinimized)}
        onClose={() => setIsOpen(false)}
        onStartConversation={startConversation}
        onSendMessage={sendMessage}
        onKeyPress={handleKeyPress}
      />
    </div>
  );
};

export default ChatBot;
