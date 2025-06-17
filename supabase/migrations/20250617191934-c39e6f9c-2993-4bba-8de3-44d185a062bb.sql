
-- Tabella per le interviste AI del chatbot
CREATE TABLE public.chatbot_interviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  session_id UUID NOT NULL,
  interview_data JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabella per i funnel generati dall'AI nel chatbot
CREATE TABLE public.chatbot_generated_funnels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  interview_id UUID NOT NULL REFERENCES public.chatbot_interviews(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  funnel_data JSONB NOT NULL DEFAULT '{}',
  funnel_name TEXT NOT NULL,
  funnel_description TEXT,
  target_audience TEXT,
  industry TEXT,
  is_saved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Abilitare RLS per entrambe le tabelle
ALTER TABLE public.chatbot_interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chatbot_generated_funnels ENABLE ROW LEVEL SECURITY;

-- Politiche RLS per chatbot_interviews
CREATE POLICY "Users can view their own chatbot interviews" 
  ON public.chatbot_interviews 
  FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own chatbot interviews" 
  ON public.chatbot_interviews 
  FOR INSERT 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own chatbot interviews" 
  ON public.chatbot_interviews 
  FOR UPDATE 
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own chatbot interviews" 
  ON public.chatbot_interviews 
  FOR DELETE 
  USING (user_id = auth.uid());

-- Politiche RLS per chatbot_generated_funnels
CREATE POLICY "Users can view their own chatbot generated funnels" 
  ON public.chatbot_generated_funnels 
  FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own chatbot generated funnels" 
  ON public.chatbot_generated_funnels 
  FOR INSERT 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own chatbot generated funnels" 
  ON public.chatbot_generated_funnels 
  FOR UPDATE 
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own chatbot generated funnels" 
  ON public.chatbot_generated_funnels 
  FOR DELETE 
  USING (user_id = auth.uid());

-- Indici per migliorare le performance
CREATE INDEX idx_chatbot_interviews_user_id ON public.chatbot_interviews(user_id);
CREATE INDEX idx_chatbot_interviews_session_id ON public.chatbot_interviews(session_id);
CREATE INDEX idx_chatbot_generated_funnels_user_id ON public.chatbot_generated_funnels(user_id);
CREATE INDEX idx_chatbot_generated_funnels_interview_id ON public.chatbot_generated_funnels(interview_id);

-- Trigger per aggiornare automaticamente il campo updated_at
CREATE OR REPLACE FUNCTION update_chatbot_interviews_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_chatbot_interviews_updated_at
    BEFORE UPDATE ON public.chatbot_interviews
    FOR EACH ROW
    EXECUTE FUNCTION update_chatbot_interviews_updated_at();

CREATE OR REPLACE FUNCTION update_chatbot_generated_funnels_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_chatbot_generated_funnels_updated_at
    BEFORE UPDATE ON public.chatbot_generated_funnels
    FOR EACH ROW
    EXECUTE FUNCTION update_chatbot_generated_funnels_updated_at();
