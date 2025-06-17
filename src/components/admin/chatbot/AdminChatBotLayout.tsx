
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, Brain, Upload, Settings, Lock } from 'lucide-react';
import AdminChatInterface from './AdminChatInterface';
import AdminDeepThinking from './AdminDeepThinking';
import AdminFileUpload from './AdminFileUpload';
import AdminChatSettings from './AdminChatSettings';
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
  onDeepThinking?: (query: string) => Promise<void>;
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
  return (
    <div className="flex-1 flex flex-col bg-gray-900">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <div className="border-b border-gray-700 px-6">
          <TabsList className="grid w-full grid-cols-4 bg-gray-800">
            <TabsTrigger value="chat" className="text-white data-[state=active]:bg-golden data-[state=active]:text-black">
              <MessageSquare className="w-4 h-4 mr-2" />
              Chat
            </TabsTrigger>
            <TabsTrigger 
              value="deep" 
              className="text-white data-[state=active]:bg-golden data-[state=active]:text-black relative"
              disabled={!canAccessDeepThinking}
            >
              <Brain className="w-4 h-4 mr-2" />
              Deep Thinking
              {!canAccessDeepThinking && <Lock className="w-3 h-3 ml-1" />}
            </TabsTrigger>
            <TabsTrigger 
              value="upload" 
              className="text-white data-[state=active]:bg-golden data-[state=active]:text-black relative"
              disabled={!canAccessFileUpload}
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload
              {!canAccessFileUpload && <Lock className="w-3 h-3 ml-1" />}
            </TabsTrigger>
            <TabsTrigger value="settings" className="text-white data-[state=active]:bg-golden data-[state=active]:text-black">
              <Settings className="w-4 h-4 mr-2" />
              Impostazioni
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 overflow-hidden">
          <TabsContent value="chat" className="h-full">
            <AdminChatInterface
              messages={messages}
              onSendMessage={onSendMessage}
              isLoading={isLoading}
            />
          </TabsContent>

          <TabsContent value="deep" className="h-full p-6">
            {canAccessDeepThinking ? (
              <AdminDeepThinking
                onSubmitQuery={onDeepThinking || onSendMessage}
                deepThinkingResult={deepThinkingResult}
                isLoading={isLoading}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <Lock className="w-16 h-16 text-gray-500 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Funzionalità Premium</h3>
                <p className="text-gray-400">
                  Deep Thinking è disponibile solo con il piano Enterprise.
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="upload" className="h-full p-6">
            {canAccessFileUpload ? (
              <AdminFileUpload
                uploadedFiles={uploadedFiles}
                onFileUpload={onFileUpload}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <Lock className="w-16 h-16 text-gray-500 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Funzionalità Premium</h3>
                <p className="text-gray-400">
                  Il caricamento file è disponibile solo con il piano Enterprise.
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="settings" className="h-full p-6">
            <AdminChatSettings
              settings={settings}
              onSave={onSaveSettings}
            />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default AdminChatBotLayout;
