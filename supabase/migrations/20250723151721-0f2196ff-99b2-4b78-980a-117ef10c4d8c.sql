
-- Million Dollar Product Strategic Implementation
-- Phase 1: Advanced Analytics & AI Foundation

-- Enhanced behavioral tracking for AI insights
CREATE TABLE user_behavioral_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  session_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}',
  engagement_score INTEGER DEFAULT 0,
  conversion_intent_score INTEGER DEFAULT 0,
  page_path TEXT,
  referrer TEXT,
  device_info JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Market intelligence for competitive analysis
CREATE TABLE market_intelligence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  industry TEXT NOT NULL,
  competitive_data JSONB DEFAULT '{}',
  market_trends JSONB DEFAULT '{}',
  pricing_insights JSONB DEFAULT '{}',
  opportunity_analysis JSONB DEFAULT '{}',
  confidence_score NUMERIC(3,2) DEFAULT 0.00,
  analyzed_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT (now() + interval '30 days'),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Subscription tiers for SaaS scaling
CREATE TYPE subscription_tier AS ENUM ('starter', 'professional', 'enterprise', 'white_label');

CREATE TABLE subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  tier subscription_tier NOT NULL,
  price_monthly NUMERIC(10,2) NOT NULL,
  price_yearly NUMERIC(10,2),
  features JSONB DEFAULT '[]',
  limits JSONB DEFAULT '{}',
  ai_credits_included INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- AI credits system for monetization
CREATE TABLE ai_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  credits_available INTEGER DEFAULT 0,
  credits_used INTEGER DEFAULT 0,
  credits_purchased INTEGER DEFAULT 0,
  last_purchase_at TIMESTAMPTZ,
  reset_date TIMESTAMPTZ DEFAULT (date_trunc('month', now()) + interval '1 month'),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Premium marketplace for templates
CREATE TABLE premium_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  industry TEXT,
  price NUMERIC(10,2) DEFAULT 0.00,
  is_premium BOOLEAN DEFAULT false,
  template_data JSONB NOT NULL DEFAULT '{}',
  performance_metrics JSONB DEFAULT '{}',
  sales_count INTEGER DEFAULT 0,
  rating NUMERIC(2,1) DEFAULT 0.0,
  created_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- White label configurations
CREATE TABLE white_label_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  brand_name TEXT NOT NULL,
  brand_logo_url TEXT,
  primary_color TEXT DEFAULT '#3B82F6',
  secondary_color TEXT DEFAULT '#10B981',
  custom_domain TEXT,
  custom_css JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- API usage tracking for enterprise features
CREATE TABLE api_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  request_count INTEGER DEFAULT 1,
  response_time_ms INTEGER,
  status_code INTEGER,
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Webhook configurations for integrations
CREATE TABLE webhook_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  events TEXT[] DEFAULT '{}',
  secret_key TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  last_triggered_at TIMESTAMPTZ,
  failure_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- A/B testing framework
CREATE TABLE ab_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  funnel_id UUID REFERENCES interactive_funnels(id) NOT NULL,
  test_name TEXT NOT NULL,
  variant_a JSONB NOT NULL,
  variant_b JSONB NOT NULL,
  traffic_split NUMERIC(3,2) DEFAULT 0.50,
  status TEXT DEFAULT 'running' CHECK (status IN ('draft', 'running', 'paused', 'completed')),
  winner TEXT CHECK (winner IN ('a', 'b', 'inconclusive')),
  confidence_level NUMERIC(3,2),
  started_at TIMESTAMPTZ DEFAULT now(),
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- A/B test results tracking
CREATE TABLE ab_test_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID REFERENCES ab_tests(id) NOT NULL,
  variant TEXT NOT NULL CHECK (variant IN ('a', 'b')),
  conversions INTEGER DEFAULT 0,
  visitors INTEGER DEFAULT 0,
  conversion_rate NUMERIC(5,4) DEFAULT 0.0000,
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Revenue tracking for business metrics
CREATE TABLE revenue_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('subscription', 'template', 'credits', 'white_label')),
  amount NUMERIC(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  stripe_payment_id TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_user_behavioral_data_user_session ON user_behavioral_data(user_id, session_id);
CREATE INDEX idx_user_behavioral_data_created_at ON user_behavioral_data(created_at);
CREATE INDEX idx_market_intelligence_industry ON market_intelligence(industry);
CREATE INDEX idx_market_intelligence_expires_at ON market_intelligence(expires_at);
CREATE INDEX idx_ai_credits_user_id ON ai_credits(user_id);
CREATE INDEX idx_premium_templates_category ON premium_templates(category);
CREATE INDEX idx_premium_templates_industry ON premium_templates(industry);
CREATE INDEX idx_api_usage_user_date ON api_usage(user_id, date);
CREATE INDEX idx_ab_tests_funnel_id ON ab_tests(funnel_id);
CREATE INDEX idx_ab_test_results_test_variant ON ab_test_results(test_id, variant);
CREATE INDEX idx_revenue_tracking_user_created ON revenue_tracking(user_id, created_at);

-- RLS Policies
ALTER TABLE user_behavioral_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_intelligence ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE premium_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE white_label_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ab_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE ab_test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenue_tracking ENABLE ROW LEVEL SECURITY;

-- User behavioral data policies
CREATE POLICY "Users can manage their behavioral data" ON user_behavioral_data
  FOR ALL USING (auth.uid() = user_id);

-- Market intelligence policies
CREATE POLICY "Authenticated users can view market intelligence" ON market_intelligence
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage market intelligence" ON market_intelligence
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Subscription plans policies
CREATE POLICY "Anyone can view active subscription plans" ON subscription_plans
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage subscription plans" ON subscription_plans
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- AI credits policies
CREATE POLICY "Users can manage their AI credits" ON ai_credits
  FOR ALL USING (auth.uid() = user_id);

-- Premium templates policies
CREATE POLICY "Anyone can view approved premium templates" ON premium_templates
  FOR SELECT USING (approved_at IS NOT NULL);

CREATE POLICY "Users can manage their premium templates" ON premium_templates
  FOR ALL USING (auth.uid() = created_by);

-- White label configs policies
CREATE POLICY "Users can manage their white label configs" ON white_label_configs
  FOR ALL USING (auth.uid() = user_id);

-- API usage policies
CREATE POLICY "Users can view their API usage" ON api_usage
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert API usage" ON api_usage
  FOR INSERT WITH CHECK (true);

-- Webhook configs policies
CREATE POLICY "Users can manage their webhook configs" ON webhook_configs
  FOR ALL USING (auth.uid() = user_id);

-- A/B tests policies
CREATE POLICY "Users can manage A/B tests for their funnels" ON ab_tests
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM interactive_funnels 
      WHERE id = ab_tests.funnel_id AND created_by = auth.uid()
    )
  );

-- A/B test results policies
CREATE POLICY "Users can view A/B test results for their tests" ON ab_test_results
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM ab_tests ab
      JOIN interactive_funnels f ON ab.funnel_id = f.id
      WHERE ab.id = ab_test_results.test_id AND f.created_by = auth.uid()
    )
  );

CREATE POLICY "System can insert A/B test results" ON ab_test_results
  FOR INSERT WITH CHECK (true);

-- Revenue tracking policies
CREATE POLICY "Users can view their revenue data" ON revenue_tracking
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert revenue data" ON revenue_tracking
  FOR INSERT WITH CHECK (true);

-- Insert default subscription plans
INSERT INTO subscription_plans (name, tier, price_monthly, price_yearly, features, limits, ai_credits_included) VALUES
('Starter', 'starter', 29.00, 290.00, 
 '["Basic Funnels", "5 Active Funnels", "Standard Templates", "Email Support"]',
 '{"max_funnels": 5, "max_submissions": 1000, "api_calls": 1000}',
 100),
('Professional', 'professional', 79.00, 790.00,
 '["Advanced Funnels", "25 Active Funnels", "Premium Templates", "A/B Testing", "Analytics Dashboard", "Priority Support"]',
 '{"max_funnels": 25, "max_submissions": 10000, "api_calls": 10000}',
 500),
('Enterprise', 'enterprise', 199.00, 1990.00,
 '["Unlimited Funnels", "Advanced Analytics", "White Label", "API Access", "Webhooks", "Custom Integrations", "Dedicated Support"]',
 '{"max_funnels": -1, "max_submissions": -1, "api_calls": 100000}',
 2000),
('White Label', 'white_label', 499.00, 4990.00,
 '["Full White Label", "Custom Domain", "Advanced Branding", "Multi-tenant Dashboard", "Reseller Program", "24/7 Support"]',
 '{"max_funnels": -1, "max_submissions": -1, "api_calls": -1}',
 10000);

-- Create trigger for AI credits reset
CREATE OR REPLACE FUNCTION reset_monthly_ai_credits()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE ai_credits 
  SET credits_available = (
    SELECT COALESCE(sp.ai_credits_included, 0)
    FROM user_subscriptions us
    JOIN subscription_plans sp ON us.plan_id = sp.id
    WHERE us.user_id = ai_credits.user_id
    AND us.status = 'active'
    LIMIT 1
  ),
  reset_date = (date_trunc('month', now()) + interval '1 month')
  WHERE reset_date <= now();
END;
$$;
