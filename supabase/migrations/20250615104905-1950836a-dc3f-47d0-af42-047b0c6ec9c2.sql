
-- Tabella per le regole di scoring
CREATE TABLE public.lead_scoring_rules (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  rule_type text NOT NULL CHECK (rule_type IN ('response_time', 'message_length', 'source', 'tone')),
  condition_operator text NOT NULL CHECK (condition_operator IN ('less_than', 'greater_than', 'equals', 'contains')),
  condition_value text NOT NULL,
  points integer NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Tabella per memorizzare i punteggi calcolati dei lead
CREATE TABLE public.lead_scores (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id uuid NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  total_score integer NOT NULL DEFAULT 0,
  score_breakdown jsonb NOT NULL DEFAULT '{}',
  motivation text,
  tone_analysis jsonb,
  calculated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(lead_id)
);

-- Tabella per email templates
CREATE TABLE public.email_templates (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  subject text NOT NULL,
  content text NOT NULL,
  variables jsonb DEFAULT '[]',
  category text DEFAULT 'general',
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid REFERENCES auth.users,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Tabella per email inviate
CREATE TABLE public.sent_emails (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id uuid NOT NULL REFERENCES public.leads(id),
  template_id uuid REFERENCES public.email_templates(id),
  to_email text NOT NULL,
  subject text NOT NULL,
  content text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'delivered', 'opened')),
  sent_at timestamp with time zone,
  error_message text,
  resend_id text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Tabella per funnel definitions
CREATE TABLE public.funnel_definitions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  flow_data jsonb NOT NULL DEFAULT '{}',
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid REFERENCES auth.users,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Tabella per tracking esecuzione funnel
CREATE TABLE public.funnel_executions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  funnel_id uuid NOT NULL REFERENCES public.funnel_definitions(id),
  lead_id uuid NOT NULL REFERENCES public.leads(id),
  current_step text,
  status text NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed', 'paused')),
  execution_log jsonb DEFAULT '[]',
  started_at timestamp with time zone NOT NULL DEFAULT now(),
  completed_at timestamp with time zone
);

-- Aggiungere RLS policies
ALTER TABLE public.lead_scoring_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sent_emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.funnel_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.funnel_executions ENABLE ROW LEVEL SECURITY;

-- Policies per lead_scoring_rules (solo admin)
CREATE POLICY "Admins can manage scoring rules" ON public.lead_scoring_rules
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policies per lead_scores (solo admin)
CREATE POLICY "Admins can view lead scores" ON public.lead_scores
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policies per email_templates (solo admin)
CREATE POLICY "Admins can manage email templates" ON public.email_templates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policies per sent_emails (solo admin)
CREATE POLICY "Admins can view sent emails" ON public.sent_emails
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policies per funnel_definitions (solo admin)
CREATE POLICY "Admins can manage funnels" ON public.funnel_definitions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policies per funnel_executions (solo admin)
CREATE POLICY "Admins can view funnel executions" ON public.funnel_executions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Aggiungere colonne ai lead per supportare il scoring
ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS response_time_minutes integer,
ADD COLUMN IF NOT EXISTS message_length integer,
ADD COLUMN IF NOT EXISTS source text DEFAULT 'website',
ADD COLUMN IF NOT EXISTS last_score_calculation timestamp with time zone;
