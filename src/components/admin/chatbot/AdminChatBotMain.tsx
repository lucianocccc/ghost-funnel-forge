
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
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
  const { canAccessFeature } = useSubscriptionManagement();
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
    // Controlla se l'utente può caricare file
    if (!canAccessFeature('file_upload')) {
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
    if (!canAccessFeature('deep_thinking')) {
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
        canAccessDeepThinking={canAccessFeature('deep_thinking')}
        canAccessFileUpload={canAccessFeature('file_upload')}
      />
    </div>
  );
};

export default AdminChatBotMain;
