
import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle, Lock } from 'lucide-react';

interface ChatBotButtonProps {
  onClick: () => void;
  canAccessChatbot: boolean;
  isSubscriptionLoading: boolean;
}

const ChatBotButton: React.FC<ChatBotButtonProps> = ({
  onClick,
  canAccessChatbot,
  isSubscriptionLoading
}) => {
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Button
        onClick={onClick}
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
};

export default ChatBotButton;
