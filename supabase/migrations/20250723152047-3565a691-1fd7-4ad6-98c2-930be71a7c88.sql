
-- Create subscription_plans table
CREATE TABLE public.subscription_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  tier TEXT NOT NULL CHECK (tier IN ('starter', 'professional', 'enterprise', 'white_label')),
  price_monthly DECIMAL(10,2) NOT NULL,
  price_yearly DECIMAL(10,2),
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  limits JSONB NOT NULL DEFAULT '{}'::jsonb,
  ai_credits_included INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create ai_credits table
CREATE TABLE public.ai_credits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  credits_available INTEGER NOT NULL DEFAULT 0,
  credits_used INTEGER NOT NULL DEFAULT 0,
  credits_purchased INTEGER NOT NULL DEFAULT 0,
  last_purchase_at TIMESTAMP WITH TIME ZONE,
  reset_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '30 days'),
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
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  is_premium BOOLEAN NOT NULL DEFAULT false,
  template_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  performance_metrics JSONB NOT NULL DEFAULT '{}'::jsonb,
  sales_count INTEGER NOT NULL DEFAULT 0,
  rating DECIMAL(3,2) NOT NULL DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create market_intelligence table
CREATE TABLE public.market_intelligence (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  industry TEXT NOT NULL,
  competitive_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  market_trends JSONB NOT NULL DEFAULT '{}'::jsonb,
  pricing_insights JSONB NOT NULL DEFAULT '{}'::jsonb,
  opportunity_analysis JSONB NOT NULL DEFAULT '{}'::jsonb,
  confidence_score DECIMAL(3,2) NOT NULL DEFAULT 0,
  analyzed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '30 days'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create white_label_config table
CREATE TABLE public.white_label_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  brand_name TEXT NOT NULL,
  brand_logo_url TEXT,
  primary_color TEXT NOT NULL DEFAULT '#3B82F6',
  secondary_color TEXT NOT NULL DEFAULT '#1F2937',
  custom_domain TEXT,
  custom_css JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create ab_tests table
CREATE TABLE public.ab_tests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  funnel_id UUID NOT NULL,
  test_name TEXT NOT NULL,
  variant_a JSONB NOT NULL DEFAULT '{}'::jsonb,
  variant_b JSONB NOT NULL DEFAULT '{}'::jsonb,
  traffic_split INTEGER NOT NULL DEFAULT 50 CHECK (traffic_split >= 0 AND traffic_split <= 100),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'running', 'paused', 'completed')),
  winner TEXT CHECK (winner IN ('a', 'b', 'inconclusive')),
  confidence_level DECIMAL(5,2),
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE,
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

-- Enable RLS on all tables
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.premium_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_intelligence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.white_label_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ab_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_behavioral_data ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for subscription_plans (public read)
CREATE POLICY "Anyone can view active subscription plans" 
  ON public.subscription_plans 
  FOR SELECT 
  USING (is_active = true);

-- Create RLS policies for ai_credits (user-specific)
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

-- Create RLS policies for premium_templates (public read for approved)
CREATE POLICY "Anyone can view approved premium templates" 
  ON public.premium_templates 
  FOR SELECT 
  USING (approved_at IS NOT NULL);

CREATE POLICY "Users can manage their own templates" 
  ON public.premium_templates 
  FOR ALL 
  USING (auth.uid() = created_by);

-- Create RLS policies for market_intelligence (public read for valid data)
CREATE POLICY "Anyone can view current market intelligence" 
  ON public.market_intelligence 
  FOR SELECT 
  USING (expires_at > now());

-- Create RLS policies for white_label_config (user-specific)
CREATE POLICY "Users can manage their own white label config" 
  ON public.white_label_config 
  FOR ALL 
  USING (auth.uid() = user_id);

-- Create RLS policies for ab_tests (funnel owner access)
CREATE POLICY "Users can manage AB tests for their funnels" 
  ON public.ab_tests 
  FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM interactive_funnels 
    WHERE interactive_funnels.id = ab_tests.funnel_id 
    AND interactive_funnels.created_by = auth.uid()
  ));

-- Create RLS policies for user_behavioral_data (user-specific)
CREATE POLICY "Users can manage their own behavioral data" 
  ON public.user_behavioral_data 
  FOR ALL 
  USING (auth.uid() = user_id);

-- Insert some sample subscription plans
INSERT INTO public.subscription_plans (name, tier, price_monthly, price_yearly, features, limits, ai_credits_included) VALUES
('Starter', 'starter', 29.00, 290.00, 
 '["Basic funnel builder", "5 active funnels", "Basic analytics", "Email support"]'::jsonb,
 '{"max_funnels": 5, "max_submissions": 1000, "api_calls": 10000}'::jsonb,
 100),
('Professional', 'professional', 79.00, 790.00,
 '["Advanced funnel builder", "25 active funnels", "Advanced analytics", "A/B testing", "Priority support"]'::jsonb,
 '{"max_funnels": 25, "max_submissions": 10000, "api_calls": 100000}'::jsonb,
 500),
('Enterprise', 'enterprise', 199.00, 1990.00,
 '["Unlimited funnels", "Advanced analytics", "White-label options", "API access", "Dedicated support"]'::jsonb,
 '{"max_funnels": -1, "max_submissions": -1, "api_calls": -1}'::jsonb,
 2000),
('White Label', 'white_label', 499.00, 4990.00,
 '["Full white-label", "Custom branding", "Unlimited everything", "Premium support", "Custom integrations"]'::jsonb,
 '{"max_funnels": -1, "max_submissions": -1, "api_calls": -1}'::jsonb,
 10000);

-- Insert some sample market intelligence data
INSERT INTO public.market_intelligence (industry, competitive_data, market_trends, pricing_insights, opportunity_analysis, confidence_score) VALUES
('SaaS', 
 '{"competitors": ["HubSpot", "Marketo", "Pardot"], "market_share": {"hubspot": 35, "marketo": 25, "pardot": 20}}'::jsonb,
 '{"growth_rate": 15, "key_trends": ["AI integration", "No-code solutions", "Mobile-first"]}'::jsonb,
 '{"avg_price_per_user": 85, "pricing_models": ["per_user", "feature_based", "usage_based"]}'::jsonb,
 '{"opportunities": ["SMB market", "AI-powered features", "Integration marketplace"], "threats": ["Market saturation", "Economic downturn"]}'::jsonb,
 0.85),
('E-commerce',
 '{"competitors": ["Shopify", "WooCommerce", "BigCommerce"], "market_share": {"shopify": 45, "woocommerce": 30, "bigcommerce": 15}}'::jsonb,
 '{"growth_rate": 12, "key_trends": ["Headless commerce", "Social selling", "Sustainability"]}'::jsonb,
 '{"avg_monthly_fee": 29, "transaction_fees": 2.9, "pricing_models": ["subscription", "transaction_based"]}'::jsonb,
 '{"opportunities": ["B2B e-commerce", "Mobile commerce", "International expansion"], "threats": ["Platform dependency", "Rising ad costs"]}'::jsonb,
 0.78);
