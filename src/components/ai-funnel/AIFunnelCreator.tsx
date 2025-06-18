
import React, { useState } from 'react';
import { useAIFunnelInterview } from '@/hooks/useAIFunnelInterview';
import { useChatBotFunnels } from '@/hooks/useChatBotFunnels';
import AIFunnelModeToggle from './AIFunnelModeToggle';
import QuickFunnelGenerator from './QuickFunnelGenerator';
import AIFunnelWelcomeScreen from './AIFunnelWelcomeScreen';
import AIFunnelChatInterface from './AIFunnelChatInterface';
import AIFunnelGeneratedList from './AIFunnelGeneratedList';

const AIFunnelCreator: React.FC = () => {
  const [mode, setMode] = useState<'quick' | 'conversation'>('quick');
  const [showModeSelector, setShowModeSelector] = useState(true);

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

  const handleModeChange = (newMode: 'quick' | 'conversation') => {
    setMode(newMode);
    setShowModeSelector(false);
    
    if (newMode === 'conversation') {
      startAIInterview();
    }
  };

  const handleQuickFunnelGenerated = () => {
    // Refresh the generated funnels list if needed
    // This could trigger a refetch or update
  };

  // Show mode selector initially
  if (showModeSelector) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <AIFunnelModeToggle mode={mode} onModeChange={handleModeChange} />
      </div>
    );
  }

  // Quick mode
  if (mode === 'quick') {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <QuickFunnelGenerator onFunnelGenerated={handleQuickFunnelGenerated} />
        
        {/* Show generated funnels if any exist */}
        {generatedFunnels.length > 0 && (
          <AIFunnelGeneratedList 
            generatedFunnels={generatedFunnels} 
            sessionId={sessionId}
          />
        )}

        {/* Mode switch option */}
        <div className="text-center">
          <button
            onClick={() => setShowModeSelector(true)}
            className="text-sm text-gray-400 hover:text-golden transition-colors"
          >
            Preferisci la modalità conversazione? Cambia modalità
          </button>
        </div>
      </div>
    );
  }

  // Conversation mode
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

      <AIFunnelGeneratedList 
        generatedFunnels={generatedFunnels} 
        sessionId={sessionId}
      />

      {/* Mode switch option */}
      <div className="text-center">
        <button
          onClick={() => setShowModeSelector(true)}
          className="text-sm text-gray-400 hover:text-golden transition-colors"
        >
          Preferisci la generazione rapida? Cambia modalità
        </button>
      </div>
    </div>
  );
};

export default AIFunnelCreator;
