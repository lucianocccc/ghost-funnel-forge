
import React from 'react';
import { useAIFunnelInterview } from '@/hooks/useAIFunnelInterview';
import { useChatBotFunnels } from '@/hooks/useChatBotFunnels';
import AIFunnelWelcomeScreen from './AIFunnelWelcomeScreen';
import AIFunnelChatInterface from './AIFunnelChatInterface';
import AIFunnelGeneratedList from './AIFunnelGeneratedList';

const AIFunnelCreator: React.FC = () => {
  const {
    messages,
    inputMessage,
    setInputMessage,
    isLoading,
    sessionId,
    showTemplateChoice,
    hasStarted,
    startAIInterview,
    sendMessage,
    handleTemplateSelect
  } = useAIFunnelInterview();

  const { generatedFunnels } = useChatBotFunnels(sessionId);

  if (!hasStarted) {
    return <AIFunnelWelcomeScreen onStart={startAIInterview} />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <AIFunnelChatInterface
        messages={messages}
        isLoading={isLoading}
        sessionId={sessionId}
        showTemplateChoice={showTemplateChoice}
        inputMessage={inputMessage}
        setInputMessage={setInputMessage}
        onSendMessage={sendMessage}
        onTemplateSelect={handleTemplateSelect}
      />

      <AIFunnelGeneratedList generatedFunnels={generatedFunnels} />
    </div>
  );
};

export default AIFunnelCreator;
