
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';

interface AIFunnelChatInputProps {
  inputMessage: string;
  setInputMessage: (value: string) => void;
  onSendMessage: () => void;
  isLoading: boolean;
}

const AIFunnelChatInput: React.FC<AIFunnelChatInputProps> = ({
  inputMessage,
  setInputMessage,
  onSendMessage,
  isLoading
}) => {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  };

  return (
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
          onClick={onSendMessage}
          disabled={isLoading || !inputMessage.trim()}
          className="bg-golden hover:bg-yellow-600 text-black"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default AIFunnelChatInput;
