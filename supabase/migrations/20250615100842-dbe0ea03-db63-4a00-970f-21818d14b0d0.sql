
-- Create enum for funnel status
CREATE TYPE public.funnel_status AS ENUM ('draft', 'active', 'archived');

-- Create enum for step types
CREATE TYPE public.step_type AS ENUM ('landing_page', 'opt_in', 'sales_page', 'checkout', 'thank_you', 'upsell', 'downsell', 'email_sequence', 'webinar', 'survey');

-- Create funnels table
CREATE TABLE public.funnels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status funnel_status NOT NULL DEFAULT 'draft',
  template_id UUID, -- Self-reference for templates
  is_template BOOLEAN NOT NULL DEFAULT false,
  industry TEXT,
  target_audience TEXT,
  estimated_conversion_rate DECIMAL(5,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create funnel_steps table
CREATE TABLE public.funnel_steps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  funnel_id UUID REFERENCES public.funnels(id) ON DELETE CASCADE NOT NULL,
  step_number INTEGER NOT NULL,
  step_type step_type NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  content JSONB, -- Will store step configuration, copy, etc.
  is_active BOOLEAN NOT NULL DEFAULT true,
  conversion_rate DECIMAL(5,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(funnel_id, step_number)
);

-- Create funnel_templates table for pre-built templates
CREATE TABLE public.funnel_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  industry TEXT,
  category TEXT, -- e.g., 'lead_generation', 'product_launch', 'webinar'
  preview_image_url TEXT,
  is_premium BOOLEAN NOT NULL DEFAULT false,
  usage_count INTEGER NOT NULL DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create template_steps table for template step definitions
CREATE TABLE public.template_steps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID REFERENCES public.funnel_templates(id) ON DELETE CASCADE NOT NULL,
  step_number INTEGER NOT NULL,
  step_type step_type NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  default_content JSONB,
  is_required BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(template_id, step_number)
);

-- Create funnel_analytics table for tracking performance
CREATE TABLE public.funnel_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  funnel_id UUID REFERENCES public.funnels(id) ON DELETE CASCADE NOT NULL,
  step_id UUID REFERENCES public.funnel_steps(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  visitors INTEGER NOT NULL DEFAULT 0,
  conversions INTEGER NOT NULL DEFAULT 0,
  revenue DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(funnel_id, step_id, date)
);

-- Enable RLS on all tables
ALTER TABLE public.funnels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.funnel_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.funnel_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.template_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.funnel_analytics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for funnels
CREATE POLICY "Users can view funnels they created or are assigned to" 
  ON public.funnels 
  FOR SELECT 
  USING (
    created_by = auth.uid() OR 
    public.has_role(auth.uid(), 'admin') OR
    lead_id IN (SELECT id FROM public.leads WHERE public.has_role(auth.uid(), 'admin'))
  );

CREATE POLICY "Users can create funnels" 
  ON public.funnels 
  FOR INSERT 
  WITH CHECK (created_by = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can update their own funnels or admins can update all" 
  ON public.funnels 
  FOR UPDATE 
  USING (
    created_by = auth.uid() OR 
    public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Users can delete their own funnels or admins can delete all" 
  ON public.funnels 
  FOR DELETE 
  USING (
    created_by = auth.uid() OR 
    public.has_role(auth.uid(), 'admin')
  );

-- Create RLS policies for funnel_steps
CREATE POLICY "Users can view steps of accessible funnels" 
  ON public.funnel_steps 
  FOR SELECT 
  USING (
    funnel_id IN (
      SELECT id FROM public.funnels 
      WHERE created_by = auth.uid() OR 
            public.has_role(auth.uid(), 'admin') OR
            lead_id IN (SELECT id FROM public.leads WHERE public.has_role(auth.uid(), 'admin'))
    )
  );

CREATE POLICY "Users can manage steps of their funnels" 
  ON public.funnel_steps 
  FOR ALL 
  USING (
    funnel_id IN (
      SELECT id FROM public.funnels 
      WHERE created_by = auth.uid() OR public.has_role(auth.uid(), 'admin')
    )
  );

-- Create RLS policies for templates (publicly readable, admin manageable)
CREATE POLICY "Anyone can view templates" 
  ON public.funnel_templates 
  FOR SELECT 
  USING (true);

CREATE POLICY "Admins can manage templates" 
  ON public.funnel_templates 
  FOR ALL 
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can view template steps" 
  ON public.template_steps 
  FOR SELECT 
  USING (true);

CREATE POLICY "Admins can manage template steps" 
  ON public.template_steps 
  FOR ALL 
  USING (public.has_role(auth.uid(), 'admin'));

-- Create RLS policies for analytics
CREATE POLICY "Users can view analytics of accessible funnels" 
  ON public.funnel_analytics 
  FOR SELECT 
  USING (
    funnel_id IN (
      SELECT id FROM public.funnels 
      WHERE created_by = auth.uid() OR 
            public.has_role(auth.uid(), 'admin') OR
            lead_id IN (SELECT id FROM public.leads WHERE public.has_role(auth.uid(), 'admin'))
    )
  );

CREATE POLICY "Users can manage analytics of their funnels" 
  ON public.funnel_analytics 
  FOR ALL 
  USING (
    funnel_id IN (
      SELECT id FROM public.funnels 
      WHERE created_by = auth.uid() OR public.has_role(auth.uid(), 'admin')
    )
  );

-- Create indexes for better performance
CREATE INDEX idx_funnels_created_by ON public.funnels(created_by);
CREATE INDEX idx_funnels_lead_id ON public.funnels(lead_id);
CREATE INDEX idx_funnels_status ON public.funnels(status);
CREATE INDEX idx_funnel_steps_funnel_id ON public.funnel_steps(funnel_id);
CREATE INDEX idx_funnel_steps_step_number ON public.funnel_steps(funnel_id, step_number);
CREATE INDEX idx_template_steps_template_id ON public.template_steps(template_id);
CREATE INDEX idx_funnel_analytics_funnel_id ON public.funnel_analytics(funnel_id);
CREATE INDEX idx_funnel_analytics_date ON public.funnel_analytics(date);

-- Insert some default funnel templates
INSERT INTO public.funnel_templates (name, description, industry, category, is_premium) VALUES
('Lead Magnet Funnel', 'Simple lead generation funnel with opt-in and thank you page', 'General', 'lead_generation', false),
('Product Launch Funnel', 'Complete product launch sequence with pre-launch, launch, and post-launch phases', 'E-commerce', 'product_launch', true),
('Webinar Funnel', 'Registration to webinar attendance and conversion funnel', 'Education', 'webinar', false),
('Tripwire Funnel', 'Low-cost offer to convert leads into paying customers', 'E-commerce', 'conversion', true),
('High-Ticket Sales Funnel', 'Application and consultation-based funnel for high-value services', 'Coaching', 'high_ticket', true);

-- Insert default steps for Lead Magnet Funnel template
INSERT INTO public.template_steps (template_id, step_number, step_type, title, description, default_content, is_required) VALUES
((SELECT id FROM public.funnel_templates WHERE name = 'Lead Magnet Funnel'), 1, 'landing_page', 'Lead Magnet Landing Page', 'Main landing page to capture leads', '{"headline": "Get Your Free [Lead Magnet]", "subheadline": "Enter your email to download instantly", "cta": "Download Now"}', true),
((SELECT id FROM public.funnel_templates WHERE name = 'Lead Magnet Funnel'), 2, 'opt_in', 'Email Opt-in Form', 'Email capture form', '{"fields": ["email", "first_name"], "redirect_url": "/thank-you"}', true),
((SELECT id FROM public.funnel_templates WHERE name = 'Lead Magnet Funnel'), 3, 'thank_you', 'Thank You Page', 'Confirmation and delivery page', '{"message": "Check your email for the download link", "next_steps": "Follow us on social media"}', true),
((SELECT id FROM public.funnel_templates WHERE name = 'Lead Magnet Funnel'), 4, 'email_sequence', 'Welcome Email Series', 'Automated email sequence for new subscribers', '{"emails": [{"subject": "Welcome! Here is your free download", "delay_hours": 0}, {"subject": "Did you get a chance to read it?", "delay_hours": 24}]}', false);
