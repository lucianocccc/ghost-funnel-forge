-- Create modular funnel configurations table
CREATE TABLE public.modular_funnel_configs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  config_name TEXT NOT NULL,
  industry TEXT,
  target_audience TEXT,
  funnel_objective TEXT,
  sections_config JSONB NOT NULL DEFAULT '[]'::jsonb,
  global_settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_template BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  performance_metrics JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create funnel section library table
CREATE TABLE public.funnel_section_library (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  section_name TEXT NOT NULL,
  section_type TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  content_template JSONB NOT NULL DEFAULT '{}'::jsonb,
  configuration_options JSONB NOT NULL DEFAULT '{}'::jsonb,
  industry_tags TEXT[] DEFAULT '{}',
  use_case_tags TEXT[] DEFAULT '{}',
  conversion_impact_score NUMERIC DEFAULT 0.0,
  complexity_level TEXT DEFAULT 'beginner',
  is_premium BOOLEAN NOT NULL DEFAULT false,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create modular funnel generations table
CREATE TABLE public.modular_funnel_generations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  config_id UUID REFERENCES public.modular_funnel_configs(id) ON DELETE CASCADE,
  generated_funnel_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  ai_optimization_suggestions JSONB DEFAULT '[]'::jsonb,
  performance_predictions JSONB DEFAULT '{}'::jsonb,
  generation_status TEXT NOT NULL DEFAULT 'pending',
  interactive_funnel_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.modular_funnel_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.funnel_section_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modular_funnel_generations ENABLE ROW LEVEL SECURITY;

-- RLS policies for modular_funnel_configs
CREATE POLICY "Users can manage their own funnel configs"
ON public.modular_funnel_configs
FOR ALL
USING (auth.uid() = user_id);

-- RLS policies for funnel_section_library
CREATE POLICY "Anyone can view section library"
ON public.funnel_section_library
FOR SELECT
USING (true);

CREATE POLICY "Creators can manage their sections"
ON public.funnel_section_library
FOR ALL
USING (auth.uid() = created_by OR created_by IS NULL);

-- RLS policies for modular_funnel_generations
CREATE POLICY "Users can manage their own generations"
ON public.modular_funnel_generations
FOR ALL
USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_modular_funnel_configs_user_id ON public.modular_funnel_configs(user_id);
CREATE INDEX idx_modular_funnel_configs_industry ON public.modular_funnel_configs(industry);
CREATE INDEX idx_funnel_section_library_category ON public.funnel_section_library(category);
CREATE INDEX idx_funnel_section_library_section_type ON public.funnel_section_library(section_type);
CREATE INDEX idx_modular_funnel_generations_user_id ON public.modular_funnel_generations(user_id);
CREATE INDEX idx_modular_funnel_generations_config_id ON public.modular_funnel_generations(config_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_modular_funnel_configs_updated_at
  BEFORE UPDATE ON public.modular_funnel_configs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_funnel_section_library_updated_at
  BEFORE UPDATE ON public.funnel_section_library
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_modular_funnel_generations_updated_at
  BEFORE UPDATE ON public.modular_funnel_generations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();