
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
