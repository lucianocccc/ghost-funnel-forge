
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageCircle, Settings, Brain, Upload } from 'lucide-react';
import AdminChatInterface from '@/components/admin/chatbot/AdminChatInterface';
import AdminDeepThinking from '@/components/admin/chatbot/AdminDeepThinking';
import AdminFileUpload from '@/components/admin/chatbot/AdminFileUpload';
import AdminChatSettings from '@/components/admin/chatbot/AdminChatSettings';
import { ChatMessage, ChatBotSettings } from '@/types/chatbot';

interface AdminChatBotLayoutProps {
  activeTab: string;
  setActiveTab: React.Dispatch<React.SetStateAction<string>>;
  messages: ChatMessage[];
  onSendMessage: (message: string, mode?: 'normal' | 'deep') => Promise<void>;
  isLoading: boolean;
  uploadedFiles: any[];
  onFileUpload: (files: any[]) => void;
  deepThinkingResult: string;
  settings: ChatBotSettings;
  onSaveSettings: (settings: ChatBotSettings) => void;
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
  onSaveSettings
}) => {
  return (
    <div className="flex-1 overflow-hidden">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
        <TabsList className="mx-4 mt-4 grid w-auto grid-cols-4 bg-gray-800">
          <TabsTrigger value="chat" className="flex items-center justify-center gap-2">
            <MessageCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Chat</span>
          </TabsTrigger>
          <TabsTrigger value="deep" className="flex items-center justify-center gap-2">
            <Brain className="w-4 h-4" />
            <span className="hidden sm:inline">Deep Thinking</span>
          </TabsTrigger>
          <TabsTrigger value="upload" className="flex items-center justify-center gap-2">
            <Upload className="w-4 h-4" />
            <span className="hidden sm:inline">Carica Files</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center justify-center gap-2">
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">Impostazioni</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="chat" className="flex-1 overflow-hidden mt-0 pb-0">
          <AdminChatInterface 
            messages={messages} 
            onSendMessage={onSendMessage}
            isLoading={isLoading}
            hasAttachments={uploadedFiles.length > 0}
          />
        </TabsContent>
        
        <TabsContent value="deep" className="flex-1 overflow-auto mt-0 p-4">
          <AdminDeepThinking
            onSubmitQuery={msg => onSendMessage(msg, 'deep')}
            deepThinkingResult={deepThinkingResult}
            isLoading={isLoading}
          />
        </TabsContent>
        
        <TabsContent value="upload" className="flex-1 overflow-auto mt-0 p-4">
          <AdminFileUpload
            onFilesUploaded={onFileUpload}
            uploadedFiles={uploadedFiles}
          />
        </TabsContent>
        
        <TabsContent value="settings" className="flex-1 overflow-auto mt-0 p-4">
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
