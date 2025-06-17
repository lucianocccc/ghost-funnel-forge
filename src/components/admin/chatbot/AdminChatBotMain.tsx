
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import AdminChatBotHeader from '@/components/admin/chatbot/AdminChatBotHeader';
import AdminChatBotLayout from '@/components/admin/chatbot/AdminChatBotLayout';
import { useChatBotSession } from '@/hooks/useChatBotSession';
import { useChatBotMessages } from '@/hooks/useChatBotMessages';
import { ChatBotSettings } from '@/types/chatbot';

interface AdminChatBotMainProps {
  subscription: any;
}

const AdminChatBotMain: React.FC<AdminChatBotMainProps> = ({ subscription }) => {
  const { toast } = useToast();
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
      />
    </div>
  );
};

export default AdminChatBotMain;
