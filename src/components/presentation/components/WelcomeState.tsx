
import React from 'react';
import { Button } from '@/components/ui/button';
import { Bot } from 'lucide-react';

interface WelcomeStateProps {
  onStartConversation: () => void;
}

const WelcomeState: React.FC<WelcomeStateProps> = ({ onStartConversation }) => {
  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="text-center">
        <Bot className="w-16 h-16 text-golden mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Il Tuo Assistente AI Personale</h3>
        <p className="text-gray-600 mb-4 text-sm">
          Benvenuto nel tuo chatbot AI personalizzato! Sono qui per aiutarti a creare funnel su misura per il tuo business.
        </p>
        <div className="bg-golden/10 p-3 rounded-lg mb-4">
          <p className="text-xs text-gray-700">
            ✨ Le tue conversazioni sono private e personalizzate<br/>
            🧠 Ricordo le nostre conversazioni precedenti<br/>
            🎯 Creo suggerimenti basati sui tuoi obiettivi
          </p>
        </div>
        <Button onClick={onStartConversation} className="bg-golden hover:bg-yellow-600 text-black">
          Inizia la Conversazione
        </Button>
      </div>
    </div>
  );
};

export default WelcomeState;
