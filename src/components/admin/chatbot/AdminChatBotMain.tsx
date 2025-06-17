
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TestTube } from 'lucide-react';
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

  const { messages, setMessages, sessionId, setSessionId } = useChatBotSession();
  
  const { isLoading, handleSendMessage } = useChatBotMessages({
    messages,
    setMessages,
    sessionId,
    setSessionId,
    subscription,
    settings,
    uploadedFiles,
    setUploadedFiles,
    setDeepThinkingResult,
    setActiveTab
  });

  const handleFileUpload = (files: any[]) => {
    // In modalità test, permetti sempre il caricamento file
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
    // In modalità test, permetti sempre deep thinking
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

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      {freeForAllMode && (
        <Alert className="m-4 bg-green-900/20 border-green-500/50">
          <TestTube className="h-4 w-4 text-green-400" />
          <AlertDescription className="text-green-300">
            <strong>🚀 Modalità Test Gratuita Attiva!</strong> Tutte le funzionalità premium sono temporaneamente disponibili per test e miglioramenti. 
            Approfittane per esplorare tutte le capacità del nostro assistente AI!
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
