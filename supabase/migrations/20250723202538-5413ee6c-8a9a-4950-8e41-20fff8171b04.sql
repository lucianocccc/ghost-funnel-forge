
-- Drop existing tables if they have conflicts and recreate them properly
DROP TABLE IF EXISTS public.market_intelligence CASCADE;
DROP TABLE IF EXISTS public.ai_credits CASCADE;
DROP TABLE IF EXISTS public.premium_templates CASCADE;

-- Create market_intelligence table
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

-- Create premium_templates table
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
  created_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.market_intelligence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.premium_templates ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for market_intelligence
CREATE POLICY "Anyone can view non-expired market intelligence" 
  ON public.market_intelligence 
  FOR SELECT 
  USING (expires_at > now());

-- Create RLS policies for ai_credits
CREATE POLICY "Users can manage their own AI credits" 
  ON public.ai_credits 
  FOR ALL 
  USING (auth.uid() = user_id);

-- Create RLS policies for premium_templates
CREATE POLICY "Anyone can view approved premium templates" 
  ON public.premium_templates 
  FOR SELECT 
  USING (approved_at IS NOT NULL);

CREATE POLICY "Users can manage their own templates" 
  ON public.premium_templates 
  FOR ALL 
  USING (auth.uid() = created_by);

-- Add indexes for performance
CREATE INDEX idx_market_intelligence_industry ON public.market_intelligence(industry);
CREATE INDEX idx_market_intelligence_expires ON public.market_intelligence(expires_at);
CREATE INDEX idx_ai_credits_user_id ON public.ai_credits(user_id);
CREATE INDEX idx_premium_templates_approved ON public.premium_templates(approved_at);
CREATE INDEX idx_premium_templates_category ON public.premium_templates(category);

-- Insert sample market intelligence data
INSERT INTO public.market_intelligence (industry, competitive_data, market_trends, pricing_insights, opportunity_analysis, confidence_score) VALUES
('Technology', 
 '{"top_competitors": ["Company A", "Company B"], "market_share": {"Company A": 35, "Company B": 25}}',
 '{"growth_rate": 15.2, "key_trends": ["AI adoption", "Cloud migration"]}',
 '{"avg_price": 299, "price_range": {"min": 99, "max": 999}}',
 '{"opportunities": ["SMB market", "International expansion"]}',
 0.85),
('Healthcare', 
 '{"top_competitors": ["MedTech Corp", "HealthSoft"], "market_share": {"MedTech Corp": 40, "HealthSoft": 30}}',
 '{"growth_rate": 12.8, "key_trends": ["Telemedicine", "Digital health"]}',
 '{"avg_price": 599, "price_range": {"min": 199, "max": 1999}}',
 '{"opportunities": ["Remote monitoring", "AI diagnostics"]}',
 0.78),
('E-commerce',
 '{"competitors": ["Shopify", "WooCommerce", "BigCommerce"], "market_share": {"shopify": 45, "woocommerce": 30, "bigcommerce": 15}}',
 '{"growth_rate": 12, "key_trends": ["Headless commerce", "Social selling", "Sustainability"]}',
 '{"avg_monthly_fee": 29, "transaction_fees": 2.9, "pricing_models": ["subscription", "transaction_based"]}',
 '{"opportunities": ["B2B e-commerce", "Mobile commerce", "International expansion"]}',
 0.82);

-- Insert sample premium templates
INSERT INTO public.premium_templates (name, description, category, industry, price, template_data, performance_metrics, sales_count, rating, approved_at) VALUES
('High-Converting SaaS Landing Page', 'Proven template that converts at 15%+ for SaaS products', 'Landing Pages', 'Technology', 49.99, '{"sections": ["hero", "features", "pricing", "testimonials"]}', '{"conversion_rate": 0.152, "avg_revenue": 2500}', 127, 4.8, now()),
('E-commerce Product Funnel', 'Complete funnel for product launches with upsells', 'E-commerce', 'E-commerce', 79.99, '{"steps": ["product_page", "cart", "upsell", "checkout"]}', '{"conversion_rate": 0.089, "avg_order_value": 156}', 89, 4.6, now()),
('Lead Magnet Capture Page', 'Highly effective lead capture with 25%+ opt-in rates', 'Lead Generation', 'Marketing', 29.99, '{"elements": ["headline", "form", "social_proof"]}', '{"opt_in_rate": 0.267, "cost_per_lead": 3.2}', 203, 4.9, now()),
('Webinar Registration Funnel', 'Complete webinar funnel with automated follow-up', 'Webinars', 'Education', 59.99, '{"pages": ["registration", "confirmation", "replay"]}', '{"show_up_rate": 0.42, "conversion_rate": 0.18}', 156, 4.7, now());

-- Create function to initialize AI credits for new users
CREATE OR REPLACE FUNCTION public.initialize_ai_credits_for_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.ai_credits (user_id, credits_available)
  VALUES (NEW.id, 10)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Create trigger to auto-initialize AI credits when a user signs up
CREATE TRIGGER on_auth_user_created_ai_credits
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.initialize_ai_credits_for_user();
