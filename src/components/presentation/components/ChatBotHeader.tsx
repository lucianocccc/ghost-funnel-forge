
import React from 'react';
import { Button } from '@/components/ui/button';
import { CardTitle } from '@/components/ui/card';
import { Bot, X, Minimize2, Crown } from 'lucide-react';

interface ChatBotHeaderProps {
  canAccessChatbot: boolean;
  onMinimize: () => void;
  onClose: () => void;
}

const ChatBotHeader: React.FC<ChatBotHeaderProps> = ({
  canAccessChatbot,
  onMinimize,
  onClose
}) => {
  return (
    <div className={`p-4 ${canAccessChatbot ? 'bg-golden' : 'bg-gray-600'}`}>
      <div className="flex items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-black text-lg">
          <Bot className="w-5 h-5" />
          AI Funnel Assistant
          {canAccessChatbot && <Crown className="w-4 h-4 text-yellow-600" />}
        </CardTitle>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMinimize}
            className="text-black hover:bg-yellow-600 p-1 h-8 w-8"
          >
            <Minimize2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-black hover:bg-yellow-600 p-1 h-8 w-8"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatBotHeader;
