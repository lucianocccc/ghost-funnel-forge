
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TestTube, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AdminChatBotHeader from '@/components/admin/chatbot/AdminChatBotHeader';
import AdminChatBotLayout from '@/components/admin/chatbot/AdminChatBotLayout';
import { useChatBotSession } from '@/hooks/useChatBotSession';
import { useChatBotMessages } from '@/hooks/useChatBotMessages';
import { useSubscriptionManagement } from '@/hooks/useSubscriptionManagement';
import { ChatBotSettings } from '@/types/chatbot';

interface AdminChatBotMainProps {
  subscription: any;
}

const AdminChatBotMain: React.FC<AdminChatBotMainProps> = ({ subscription }) => {
  const { toast } = useToast();
  const { canAccessFeature, freeForAllMode } = useSubscriptionManagement();
  const [activeTab, setActiveTab] = useState('chat');
  const [deepThinkingResult, setDeepThinkingResult] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [settings, setSettings] = useState<ChatBotSettings>({
    personality: 'professional',
    responseLength: 'detailed',
    specialization: 'marketing',
    language: 'italian',
    temperature: 0.7
  });

  const { 
    messages, 
    sessionId, 
    setSessionId, 
    addMessage, 
    isLoading: sessionLoading, 
    refreshMemory,
    userContext 
  } = useChatBotSession();
  
  const { isLoading, handleSendMessage } = useChatBotMessages({
    messages,
    addMessage,
    sessionId,
    setSessionId,
    subscription,
    settings,
    uploadedFiles,
    setUploadedFiles,
    setDeepThinkingResult,
    setActiveTab,
    userContext
  });

  const handleFileUpload = (files: any[]) => {
    if (!freeForAllMode && !canAccessFeature('file_upload')) {
      toast({
        title: "Funzionalità Premium",
        description: "Il caricamento file è disponibile solo con il piano Enterprise.",
        variant: "destructive",
      });
      return;
    }

    setUploadedFiles(files);
    toast({
      title: "File caricati",
      description: `${files.length} file pronti per essere analizzati`,
    });
  };

  const handleSaveSettings = (newSettings: ChatBotSettings) => {
    setSettings(newSettings);
    toast({
      title: "Impostazioni salvate",
      description: "Le preferenze dell'assistente AI sono state aggiornate",
    });
  };

  const handleDeepThinking = async (query: string) => {
    if (!freeForAllMode && !canAccessFeature('deep_thinking')) {
      toast({
        title: "Funzionalità Premium",
        description: "Deep Thinking è disponibile solo con il piano Enterprise.",
        variant: "destructive",
      });
      return;
    }

    await handleSendMessage(query, 'deep');
  };

  const handleRefreshMemory = () => {
    refreshMemory();
    toast({
      title: "Memoria aggiornata",
      description: "La cronologia conversazionale è stata ricaricata",
    });
  };

  // Switch automatico ai funnel quando vengono generati
  React.useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.role === 'assistant' && lastMessage.content.includes('**FUNNEL 1:')) {
      setActiveTab('funnels');
    }
  }, [messages]);

  if (sessionLoading) {
    return (
      <div className="flex flex-col h-screen bg-gray-900 items-center justify-center">
        <div className="text-white text-lg mb-4">Caricamento della memoria conversazionale...</div>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-golden"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      {freeForAllMode && (
        <Alert className="m-4 bg-green-900/20 border-green-500/50">
          <TestTube className="h-4 w-4 text-green-400" />
          <AlertDescription className="text-green-300 flex items-center justify-between">
            <span>
              <strong>🚀 Modalità Test Gratuita Attiva!</strong> Tutte le funzionalità premium sono temporaneamente disponibili. 
              Memoria conversazionale persistente attiva - le tue conversazioni vengono salvate automaticamente.
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefreshMemory}
              className="ml-4 text-green-300 border-green-500 hover:bg-green-800"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Aggiorna Memoria
            </Button>
          </AlertDescription>
        </Alert>
      )}
      
      <AdminChatBotHeader />
      <AdminChatBotLayout
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        messages={messages}
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
        uploadedFiles={uploadedFiles}
        onFileUpload={handleFileUpload}
        deepThinkingResult={deepThinkingResult}
        settings={settings}
        onSaveSettings={handleSaveSettings}
        onDeepThinking={handleDeepThinking}
        canAccessDeepThinking={freeForAllMode || canAccessFeature('deep_thinking')}
        canAccessFileUpload={freeForAllMode || canAccessFeature('file_upload')}
      />
    </div>
  );
};

export default AdminChatBotMain;
