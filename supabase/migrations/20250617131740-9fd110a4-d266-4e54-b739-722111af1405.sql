
-- Tabella per le interviste ai clienti
CREATE TABLE public.client_interviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  business_name TEXT,
  business_description TEXT,
  target_audience TEXT,
  current_challenges TEXT,
  goals TEXT,
  budget_range TEXT,
  timeline TEXT,
  interview_data JSONB NOT NULL DEFAULT '{}',
  gpt_analysis JSONB,
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'analyzed')),
  analyzed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabella per i funnel generati dall'AI per i clienti
CREATE TABLE public.ai_generated_funnels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  interview_id UUID NOT NULL REFERENCES public.client_interviews(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  funnel_data JSONB NOT NULL DEFAULT '{}',
  share_token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'base64url'),
  is_active BOOLEAN NOT NULL DEFAULT true,
  views_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabella per i feedback sui funnel condivisi
CREATE TABLE public.funnel_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  funnel_id UUID NOT NULL REFERENCES public.ai_generated_funnels(id) ON DELETE CASCADE,
  contact_name TEXT,
  contact_email TEXT,
  feedback_text TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  interested BOOLEAN,
  contact_info JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Abilitare RLS per tutte le tabelle
ALTER TABLE public.client_interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_generated_funnels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.funnel_feedback ENABLE ROW LEVEL SECURITY;

-- Politiche RLS per client_interviews
CREATE POLICY "Users can view their own interviews" 
  ON public.client_interviews 
  FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own interviews" 
  ON public.client_interviews 
  FOR INSERT 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own interviews" 
  ON public.client_interviews 
  FOR UPDATE 
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own interviews" 
  ON public.client_interviews 
  FOR DELETE 
  USING (user_id = auth.uid());

-- Politiche RLS per ai_generated_funnels
CREATE POLICY "Users can view their own AI funnels" 
  ON public.ai_generated_funnels 
  FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own AI funnels" 
  ON public.ai_generated_funnels 
  FOR INSERT 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own AI funnels" 
  ON public.ai_generated_funnels 
  FOR UPDATE 
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own AI funnels" 
  ON public.ai_generated_funnels 
  FOR DELETE 
  USING (user_id = auth.uid());

-- Politiche RLS per funnel_feedback (pubblico per la lettura tramite share_token)
CREATE POLICY "Users can view feedback for their funnels" 
  ON public.funnel_feedback 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.ai_generated_funnels 
      WHERE id = funnel_feedback.funnel_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can create feedback" 
  ON public.funnel_feedback 
  FOR INSERT 
  WITH CHECK (true);

-- Indici per migliorare le performance
CREATE INDEX idx_client_interviews_user_id ON public.client_interviews(user_id);
CREATE INDEX idx_client_interviews_status ON public.client_interviews(status);
CREATE INDEX idx_ai_generated_funnels_user_id ON public.ai_generated_funnels(user_id);
CREATE INDEX idx_ai_generated_funnels_share_token ON public.ai_generated_funnels(share_token);
CREATE INDEX idx_funnel_feedback_funnel_id ON public.funnel_feedback(funnel_id);
