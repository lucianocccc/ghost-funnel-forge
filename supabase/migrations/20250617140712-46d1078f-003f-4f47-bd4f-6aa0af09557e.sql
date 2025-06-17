
-- Creare una tabella per memorizzare le conversazioni del chatbot per ogni utente
CREATE TABLE public.chatbot_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  session_id UUID NOT NULL DEFAULT gen_random_uuid(),
  message_role TEXT NOT NULL CHECK (message_role IN ('user', 'assistant', 'system')),
  message_content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Creare una tabella per memorizzare il profilo e le preferenze del chatbot per ogni utente
CREATE TABLE public.chatbot_user_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  interests JSONB DEFAULT '{}',
  business_sector TEXT,
  target_audience TEXT,
  goals JSONB DEFAULT '{}',
  generated_funnels JSONB DEFAULT '[]',
  conversation_count INTEGER DEFAULT 0,
  last_interaction TIMESTAMP WITH TIME ZONE DEFAULT now(),
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Abilitare Row Level Security per garantire la privacy tra utenti
ALTER TABLE public.chatbot_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chatbot_user_profiles ENABLE ROW LEVEL SECURITY;

-- Policy per chatbot_conversations: gli utenti possono vedere solo le proprie conversazioni
CREATE POLICY "Users can only access their own conversations" 
  ON public.chatbot_conversations 
  FOR ALL 
  USING (auth.uid() = user_id);

-- Policy per chatbot_user_profiles: gli utenti possono vedere solo il proprio profilo
CREATE POLICY "Users can only access their own chatbot profile" 
  ON public.chatbot_user_profiles 
  FOR ALL 
  USING (auth.uid() = user_id);

-- Creare indici per migliorare le performance
CREATE INDEX idx_chatbot_conversations_user_id ON public.chatbot_conversations(user_id);
CREATE INDEX idx_chatbot_conversations_session_id ON public.chatbot_conversations(session_id);
CREATE INDEX idx_chatbot_user_profiles_user_id ON public.chatbot_user_profiles(user_id);

-- Trigger per aggiornare automaticamente il campo updated_at
CREATE OR REPLACE FUNCTION update_chatbot_profile_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_chatbot_user_profiles_updated_at
    BEFORE UPDATE ON public.chatbot_user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_chatbot_profile_updated_at();
