
import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import AdminChatInterface from '@/components/admin/chatbot/AdminChatInterface';
import AdminChatSettings from '@/components/admin/chatbot/AdminChatSettings';
import AdminDeepThinking from '@/components/admin/chatbot/AdminDeepThinking';
import AdminFileUpload from '@/components/admin/chatbot/AdminFileUpload';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageCircle, Settings, Brain, Upload } from 'lucide-react';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  attachments?: any[];
}

export interface ChatBotSettings {
  personality: 'professional' | 'friendly' | 'analytical' | 'creative';
  responseLength: 'concise' | 'detailed' | 'comprehensive';
  specialization: 'marketing' | 'sales' | 'general' | 'technical';
  language: 'italian' | 'english';
  temperature: number;
}

const AdminChatBot: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] =  useState<ChatMessage[]>([]);
  const [sessionId, setSessionId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
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

  // Check if user has a premium subscription
  const [subscription, setSubscription] = useState<any>(null);
  const [loadingSubscription, setLoadingSubscription] = useState(true);

  useEffect(() => {
    const checkSubscription = async () => {
      if (!user) {
        setLoadingSubscription(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('subscribers')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching subscription:', error);
        }
        
        setSubscription(data);
      } catch (error) {
        console.error('Error checking subscription:', error);
      } finally {
        setLoadingSubscription(false);
      }
    };

    checkSubscription();
    
    if (user) {
      // Initialize or load the session
      const newSessionId = sessionId || crypto.randomUUID();
      setSessionId(newSessionId);
      loadConversationHistory(newSessionId);
      
      // Add welcome message if no messages
      if (messages.length === 0) {
        const welcomeMessage: ChatMessage = {
          role: 'assistant',
          content: `Benvenuto nell'assistente AI avanzato! Sono qui per aiutarti con strategie di marketing, creazione di funnel, analisi dei lead e molto altro.
          
Puoi utilizzare diverse funzionalità:
• Chat normale per domande e risposte
• Deep Thinking per analisi approfondite
• Caricamento file per analizzare documenti o immagini
• Personalizzazione del mio comportamento nelle impostazioni

Come posso aiutarti oggi?`,
          timestamp: new Date()
        };
        setMessages([welcomeMessage]);
      }
    }
  }, [user]);

  const loadConversationHistory = async (sid: string) => {
    if (!user || !sid) return;

    try {
      const { data, error } = await supabase
        .from('chatbot_conversations')
        .select('message_role, message_content, created_at, attachments')
        .eq('user_id', user.id)
        .eq('session_id', sid)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error loading conversation history:', error);
        return;
      }

      if (data && data.length > 0) {
        const conversationMessages: ChatMessage[] = data.map(msg => ({
          role: msg.message_role as 'user' | 'assistant' | 'system',
          content: msg.message_content,
          timestamp: new Date(msg.created_at),
          attachments: msg.attachments || []
        }));
        setMessages(conversationMessages);
      }
    } catch (error) {
      console.error('Error loading conversation history:', error);
    }
  };

  const handleSendMessage = async (message: string, mode: 'normal' | 'deep' = 'normal') => {
    if (!subscription?.subscribed || subscription?.subscription_tier === 'free') {
      toast({
        title: "Piano Premium richiesto",
        description: "Aggiorna il tuo abbonamento per utilizzare il chatbot AI.",
        variant: "destructive",
      });
      return;
    }

    // Create a user message
    const userMessage: ChatMessage = {
      role: 'user',
      content: message,
      timestamp: new Date(),
      attachments: uploadedFiles.length > 0 ? uploadedFiles : undefined
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();

      const functionName = mode === 'deep' ? 'chatbot-deep-thinking' : 'chatbot-ai';
      
      const { data, error } = await supabase.functions.invoke(functionName, {
        body: { 
          messages: [{ role: 'user', content: message }],
          sessionId: sessionId,
          settings: settings,
          attachments: uploadedFiles.length > 0 ? uploadedFiles : undefined
        },
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        }
      });

      if (error) throw error;

      if (data.success) {
        const aiMessage: ChatMessage = {
          role: 'assistant',
          content: data.message,
          timestamp: new Date(),
          attachments: []
        };
        
        setMessages(prev => [...prev, aiMessage]);
        
        // Clear uploaded files after sending
        setUploadedFiles([]);
        
        // Update deep thinking result if in deep thinking mode
        if (mode === 'deep' && data.analysis) {
          setDeepThinkingResult(data.analysis);
          // Switch to deep thinking tab to show the result
          setActiveTab('deep');
        }
        
        // Update session ID if needed
        if (data.sessionId && data.sessionId !== sessionId) {
          setSessionId(data.sessionId);
        }
      } else {
        toast({
          title: "Errore",
          description: data.error || "Si è verificato un errore nella comunicazione con l'AI",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Errore durante l\'invio del messaggio:', error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante la comunicazione con il server",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

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

  // Check if user can access the chatbot
  if (loadingSubscription) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 p-4">
        <div className="animate-spin w-12 h-12 border-4 border-golden border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!subscription?.subscribed || subscription?.subscription_tier === 'free') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-6">
        <div className="text-center max-w-md">
          <h1 className="text-3xl font-bold text-golden mb-4">Piano Premium Richiesto</h1>
          <p className="text-gray-300 mb-6">
            Il chatbot AI personalizzato è disponibile solo per gli abbonamenti premium.
            Aggiorna il tuo piano per accedere a questa potente funzionalità.
          </p>
          <div className="bg-gray-800 rounded-lg p-5 mb-6">
            <h3 className="text-white font-semibold mb-3">Funzionalità Premium:</h3>
            <ul className="text-left text-gray-300 space-y-2">
              <li>• ChatBot AI personalizzato</li>
              <li>• Analisi DeepThinking</li>
              <li>• Caricamento e analisi di documenti</li>
              <li>• Personalizzazione completa dell'assistente</li>
              <li>• Memoria delle conversazioni</li>
            </ul>
          </div>
          <button 
            onClick={() => window.location.href = '/auth?subscribe=true&plan=professional'}
            className="bg-golden hover:bg-yellow-600 text-black font-semibold py-2 px-6 rounded">
            Aggiorna Piano
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      <div className="p-4 bg-gray-800 border-b border-gray-700">
        <h1 className="text-2xl font-bold text-white">ChatBot AI Premium</h1>
        <p className="text-gray-400">Il tuo assistente AI personalizzato per marketing e lead generation</p>
      </div>

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
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
              hasAttachments={uploadedFiles.length > 0}
            />
          </TabsContent>
          
          <TabsContent value="deep" className="flex-1 overflow-auto mt-0 p-4">
            <AdminDeepThinking
              onSubmitQuery={msg => handleSendMessage(msg, 'deep')}
              deepThinkingResult={deepThinkingResult}
              isLoading={isLoading}
            />
          </TabsContent>
          
          <TabsContent value="upload" className="flex-1 overflow-auto mt-0 p-4">
            <AdminFileUpload
              onFilesUploaded={handleFileUpload}
              uploadedFiles={uploadedFiles}
            />
          </TabsContent>
          
          <TabsContent value="settings" className="flex-1 overflow-auto mt-0 p-4">
            <AdminChatSettings
              settings={settings}
              onSaveSettings={handleSaveSettings}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminChatBot;
