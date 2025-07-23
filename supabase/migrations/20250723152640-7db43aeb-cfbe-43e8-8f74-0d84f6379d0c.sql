
-- Create ai_credits table
CREATE TABLE public.ai_credits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  credits_available INTEGER NOT NULL DEFAULT 10,
  credits_used INTEGER NOT NULL DEFAULT 0,
  credits_purchased INTEGER NOT NULL DEFAULT 0,
  last_purchase_at TIMESTAMP WITH TIME ZONE,
  reset_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (date_trunc('month', now()) + interval '1 month'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create subscription_plans table
CREATE TABLE public.subscription_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  tier TEXT NOT NULL CHECK (tier IN ('starter', 'professional', 'enterprise', 'white_label')),
  price_monthly NUMERIC(10,2) NOT NULL,
  price_yearly NUMERIC(10,2),
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  limits JSONB NOT NULL DEFAULT '{"max_funnels": 0, "max_submissions": 0, "api_calls": 0}'::jsonb,
  ai_credits_included INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create premium_templates table
CREATE TABLE public.premium_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  industry TEXT,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  is_premium BOOLEAN NOT NULL DEFAULT false,
  template_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  performance_metrics JSONB NOT NULL DEFAULT '{}'::jsonb,
  sales_count INTEGER NOT NULL DEFAULT 0,
  rating NUMERIC(3,2) NOT NULL DEFAULT 0,
  created_by UUID,
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_behavioral_data table
CREATE TABLE public.user_behavioral_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  event_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  page_path TEXT,
  referrer TEXT,
  device_info JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create market_intelligence table
CREATE TABLE public.market_intelligence (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  industry TEXT NOT NULL,
  competitive_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  market_trends JSONB NOT NULL DEFAULT '{}'::jsonb,
  pricing_insights JSONB NOT NULL DEFAULT '{}'::jsonb,
  opportunity_analysis JSONB NOT NULL DEFAULT '{}'::jsonb,
  confidence_score NUMERIC(5,2) NOT NULL DEFAULT 0,
  analyzed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '30 days'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.ai_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.premium_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_behavioral_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_intelligence ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for ai_credits
CREATE POLICY "Users can manage their own AI credits" 
  ON public.ai_credits 
  FOR ALL 
  USING (auth.uid() = user_id);

-- Create RLS policies for subscription_plans
CREATE POLICY "Anyone can view active subscription plans" 
  ON public.subscription_plans 
  FOR SELECT 
  USING (is_active = true);

-- Create RLS policies for premium_templates
CREATE POLICY "Anyone can view approved premium templates" 
  ON public.premium_templates 
  FOR SELECT 
  USING (approved_at IS NOT NULL);

CREATE POLICY "Template creators can manage their templates" 
  ON public.premium_templates 
  FOR ALL 
  USING (auth.uid() = created_by);

-- Create RLS policies for user_behavioral_data
CREATE POLICY "Users can manage their own behavioral data" 
  ON public.user_behavioral_data 
  FOR ALL 
  USING (auth.uid() = user_id);

-- Create RLS policies for market_intelligence
CREATE POLICY "Anyone can view current market intelligence" 
  ON public.market_intelligence 
  FOR SELECT 
  USING (expires_at > now());

-- Add indexes for performance
CREATE INDEX idx_ai_credits_user_id ON public.ai_credits(user_id);
CREATE INDEX idx_subscription_plans_active ON public.subscription_plans(is_active);
CREATE INDEX idx_premium_templates_approved ON public.premium_templates(approved_at);
CREATE INDEX idx_user_behavioral_data_user_id ON public.user_behavioral_data(user_id);
CREATE INDEX idx_market_intelligence_expires ON public.market_intelligence(expires_at);
CREATE INDEX idx_market_intelligence_industry ON public.market_intelligence(industry);
