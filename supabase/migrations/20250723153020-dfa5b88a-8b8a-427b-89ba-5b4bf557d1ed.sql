
-- Create the premium_templates table
CREATE TABLE public.premium_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  industry TEXT,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  is_premium BOOLEAN NOT NULL DEFAULT true,
  template_data JSONB NOT NULL DEFAULT '{}',
  performance_metrics JSONB NOT NULL DEFAULT '{}',
  sales_count INTEGER NOT NULL DEFAULT 0,
  rating DECIMAL(3,2) NOT NULL DEFAULT 0,
  created_by UUID,
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create the ai_credits table
CREATE TABLE public.ai_credits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  credits_available INTEGER NOT NULL DEFAULT 0,
  credits_used INTEGER NOT NULL DEFAULT 0,
  credits_purchased INTEGER NOT NULL DEFAULT 0,
  last_purchase_at TIMESTAMP WITH TIME ZONE,
  reset_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '1 month'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create the subscription_plans table
CREATE TABLE public.subscription_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  tier TEXT NOT NULL CHECK (tier IN ('starter', 'professional', 'enterprise', 'white_label')),
  price_monthly DECIMAL(10,2) NOT NULL,
  price_yearly DECIMAL(10,2),
  features JSONB NOT NULL DEFAULT '[]',
  limits JSONB NOT NULL DEFAULT '{}',
  ai_credits_included INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create the market_intelligence table
CREATE TABLE public.market_intelligence (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  industry TEXT NOT NULL,
  competitive_data JSONB NOT NULL DEFAULT '{}',
  market_trends JSONB NOT NULL DEFAULT '{}',
  pricing_insights JSONB NOT NULL DEFAULT '{}',
  opportunity_analysis JSONB NOT NULL DEFAULT '{}',
  confidence_score DECIMAL(5,4) NOT NULL DEFAULT 0,
  analyzed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '30 days'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create the user_behavioral_data table
CREATE TABLE public.user_behavioral_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  session_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  event_data JSONB NOT NULL DEFAULT '{}',
  page_path TEXT,
  referrer TEXT,
  device_info JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.premium_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_intelligence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_behavioral_data ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for premium_templates
CREATE POLICY "Anyone can view approved premium templates" 
  ON public.premium_templates 
  FOR SELECT 
  USING (approved_at IS NOT NULL);

CREATE POLICY "Users can manage their own templates" 
  ON public.premium_templates 
  FOR ALL 
  USING (auth.uid() = created_by);

-- Create RLS policies for ai_credits
CREATE POLICY "Users can view their own AI credits" 
  ON public.ai_credits 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own AI credits" 
  ON public.ai_credits 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own AI credits" 
  ON public.ai_credits 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create RLS policies for subscription_plans
CREATE POLICY "Anyone can view active subscription plans" 
  ON public.subscription_plans 
  FOR SELECT 
  USING (is_active = true);

-- Create RLS policies for market_intelligence
CREATE POLICY "Anyone can view non-expired market intelligence" 
  ON public.market_intelligence 
  FOR SELECT 
  USING (expires_at > now());

-- Create RLS policies for user_behavioral_data
CREATE POLICY "Users can insert their own behavioral data" 
  ON public.user_behavioral_data 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own behavioral data" 
  ON public.user_behavioral_data 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Add some sample data for subscription plans
INSERT INTO public.subscription_plans (name, tier, price_monthly, features, limits, ai_credits_included) VALUES
('Starter', 'starter', 29.00, '["Basic templates", "Email support", "Standard analytics"]', '{"max_funnels": 5, "max_submissions": 1000, "api_calls": 10000}', 100),
('Professional', 'professional', 99.00, '["Premium templates", "Priority support", "Advanced analytics", "A/B testing"]', '{"max_funnels": 25, "max_submissions": 10000, "api_calls": 50000}', 500),
('Enterprise', 'enterprise', 299.00, '["All templates", "24/7 support", "Custom integrations", "White label"]', '{"max_funnels": -1, "max_submissions": -1, "api_calls": -1}', 2000);

-- Add some sample market intelligence data
INSERT INTO public.market_intelligence (industry, competitive_data, market_trends, pricing_insights, opportunity_analysis, confidence_score) VALUES
('Technology', '{"top_competitors": ["Company A", "Company B"], "market_share": {"Company A": 35, "Company B": 25}}', '{"growth_rate": 15.2, "key_trends": ["AI adoption", "Cloud migration"]}', '{"avg_price": 299, "price_range": {"min": 99, "max": 999}}', '{"opportunities": ["SMB market", "International expansion"]}', 0.85),
('Healthcare', '{"top_competitors": ["MedTech Corp", "HealthSoft"], "market_share": {"MedTech Corp": 40, "HealthSoft": 30}}', '{"growth_rate": 12.8, "key_trends": ["Telemedicine", "Digital health"]}', '{"avg_price": 599, "price_range": {"min": 199, "max": 1999}}', '{"opportunities": ["Remote monitoring", "AI diagnostics"]}', 0.78);
