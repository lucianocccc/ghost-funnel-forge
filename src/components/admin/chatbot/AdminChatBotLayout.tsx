
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, Brain, Upload, Settings, Zap } from 'lucide-react';
import AdminChatInterface from './AdminChatInterface';
import AdminDeepThinking from './AdminDeepThinking';
import AdminFileUpload from './AdminFileUpload';
import AdminChatSettings from './AdminChatSettings';
import AdminGeneratedFunnels from './AdminGeneratedFunnels';
import { ChatMessage, ChatBotSettings } from '@/types/chatbot';

interface AdminChatBotLayoutProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  messages: ChatMessage[];
  onSendMessage: (message: string, mode?: 'normal' | 'deep') => Promise<void>;
  isLoading: boolean;
  uploadedFiles: any[];
  onFileUpload: (files: any[]) => void;
  deepThinkingResult: string;
  settings: ChatBotSettings;
  onSaveSettings: (settings: ChatBotSettings) => void;
  onDeepThinking: (query: string) => Promise<void>;
  canAccessDeepThinking: boolean;
  canAccessFileUpload: boolean;
}

const AdminChatBotLayout: React.FC<AdminChatBotLayoutProps> = ({
  activeTab,
  setActiveTab,
  messages,
  onSendMessage,
  isLoading,
  uploadedFiles,
  onFileUpload,
  deepThinkingResult,
  settings,
  onSaveSettings,
  onDeepThinking,
  canAccessDeepThinking,
  canAccessFileUpload
}) => {
  // Extract sessionId from messages or generate one
  const sessionId = React.useMemo(() => {
    // In a real implementation, this would come from the chat session
    return 'default'; // This should be passed as a prop or extracted from context
  }, []);

  return (
    <div className="flex-1 flex flex-col">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-5 bg-gray-800 border-b border-gray-700">
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Chat
          </TabsTrigger>
          <TabsTrigger 
            value="funnels" 
            className="flex items-center gap-2"
          >
            <Zap className="w-4 h-4" />
            Funnel Generati
          </TabsTrigger>
          <TabsTrigger 
            value="deep" 
            className="flex items-center gap-2"
            disabled={!canAccessDeepThinking}
          >
            <Brain className="w-4 h-4" />
            Deep Thinking
          </TabsTrigger>
          <TabsTrigger 
            value="upload" 
            className="flex items-center gap-2"
            disabled={!canAccessFileUpload}
          >
            <Upload className="w-4 h-4" />
            File Upload
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Impostazioni
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="flex-1 flex flex-col mt-0">
          <AdminChatInterface
            messages={messages}
            onSendMessage={onSendMessage}
            isLoading={isLoading}
            hasAttachments={uploadedFiles.length > 0}
          />
        </TabsContent>

        <TabsContent value="funnels" className="flex-1 overflow-auto p-6">
          <AdminGeneratedFunnels sessionId={sessionId} />
        </TabsContent>

        <TabsContent value="deep" className="flex-1 overflow-auto p-6">
          <AdminDeepThinking
            onSubmitQuery={onDeepThinking}
            deepThinkingResult={deepThinkingResult}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="upload" className="flex-1 overflow-auto p-6">
          <AdminFileUpload
            uploadedFiles={uploadedFiles}
            onFilesUploaded={onFileUpload}
          />
        </TabsContent>

        <TabsContent value="settings" className="flex-1 overflow-auto p-6">
          <AdminChatSettings
            settings={settings}
            onSaveSettings={onSaveSettings}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminChatBotLayout;
