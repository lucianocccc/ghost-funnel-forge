
-- Create enhanced lead analysis table for more detailed AI insights
CREATE TABLE IF NOT EXISTS public.enhanced_lead_analysis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  consolidated_lead_id UUID NOT NULL REFERENCES public.consolidated_leads(id) ON DELETE CASCADE,
  funnel_context JSONB NOT NULL DEFAULT '{}',
  behavioral_analysis JSONB NOT NULL DEFAULT '{}',
  engagement_patterns JSONB NOT NULL DEFAULT '{}',
  predictive_insights JSONB NOT NULL DEFAULT '{}',
  personalized_strategy JSONB NOT NULL DEFAULT '{}',
  optimal_contact_timing JSONB NOT NULL DEFAULT '{}',
  conversion_probability DECIMAL(5,4) DEFAULT 0.0000,
  lead_temperature TEXT DEFAULT 'cold' CHECK (lead_temperature IN ('hot', 'warm', 'cold')),
  engagement_score INTEGER DEFAULT 0,
  personalization_level TEXT DEFAULT 'basic' CHECK (personalization_level IN ('basic', 'intermediate', 'advanced')),
  next_action_recommendation TEXT,
  confidence_score DECIMAL(5,4) DEFAULT 0.0000,
  analyzed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create advanced scoring system table
CREATE TABLE IF NOT EXISTS public.advanced_lead_scoring (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  consolidated_lead_id UUID NOT NULL REFERENCES public.consolidated_leads(id) ON DELETE CASCADE,
  demographic_score INTEGER DEFAULT 0,
  behavioral_score INTEGER DEFAULT 0,
  engagement_score INTEGER DEFAULT 0,
  timing_score INTEGER DEFAULT 0,
  context_score INTEGER DEFAULT 0,
  total_score INTEGER DEFAULT 0,
  score_breakdown JSONB NOT NULL DEFAULT '{}',
  scoring_factors JSONB NOT NULL DEFAULT '{}',
  improvement_suggestions JSONB NOT NULL DEFAULT '[]',
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(consolidated_lead_id)
);

-- Create predictive analytics table
CREATE TABLE IF NOT EXISTS public.predictive_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  consolidated_lead_id UUID NOT NULL REFERENCES public.consolidated_leads(id) ON DELETE CASCADE,
  conversion_probability DECIMAL(5,4) DEFAULT 0.0000,
  optimal_contact_window JSONB DEFAULT '{}',
  predicted_lifetime_value DECIMAL(10,2) DEFAULT 0.00,
  churn_risk_score DECIMAL(5,4) DEFAULT 0.0000,
  engagement_forecast JSONB DEFAULT '{}',
  market_trends_impact JSONB DEFAULT '{}',
  seasonal_patterns JSONB DEFAULT '{}',
  competitive_analysis JSONB DEFAULT '{}',
  predicted_actions JSONB DEFAULT '[]',
  confidence_intervals JSONB DEFAULT '{}',
  model_version TEXT DEFAULT '1.0',
  prediction_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + INTERVAL '30 days'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(consolidated_lead_id)
);

-- Add RLS policies for enhanced_lead_analysis
ALTER TABLE public.enhanced_lead_analysis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage analysis for their leads" ON public.enhanced_lead_analysis
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.consolidated_leads cl 
      WHERE cl.id = enhanced_lead_analysis.consolidated_lead_id 
      AND (cl.user_id = auth.uid() OR cl.source_funnel_id IN (
        SELECT id FROM public.interactive_funnels 
        WHERE created_by = auth.uid()
      ))
    )
  );

-- Add RLS policies for advanced_lead_scoring
ALTER TABLE public.advanced_lead_scoring ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage scoring for their leads" ON public.advanced_lead_scoring
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.consolidated_leads cl 
      WHERE cl.id = advanced_lead_scoring.consolidated_lead_id 
      AND (cl.user_id = auth.uid() OR cl.source_funnel_id IN (
        SELECT id FROM public.interactive_funnels 
        WHERE created_by = auth.uid()
      ))
    )
  );

-- Add RLS policies for predictive_analytics
ALTER TABLE public.predictive_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage predictions for their leads" ON public.predictive_analytics
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.consolidated_leads cl 
      WHERE cl.id = predictive_analytics.consolidated_lead_id 
      AND (cl.user_id = auth.uid() OR cl.source_funnel_id IN (
        SELECT id FROM public.interactive_funnels 
        WHERE created_by = auth.uid()
      ))
    )
  );

-- Add triggers for updated_at
CREATE OR REPLACE FUNCTION public.update_enhanced_analysis_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

CREATE TRIGGER update_enhanced_lead_analysis_updated_at
    BEFORE UPDATE ON public.enhanced_lead_analysis
    FOR EACH ROW
    EXECUTE FUNCTION public.update_enhanced_analysis_updated_at();

CREATE TRIGGER update_advanced_lead_scoring_updated_at
    BEFORE UPDATE ON public.advanced_lead_scoring
    FOR EACH ROW
    EXECUTE FUNCTION public.update_enhanced_analysis_updated_at();

CREATE TRIGGER update_predictive_analytics_updated_at
    BEFORE UPDATE ON public.predictive_analytics
    FOR EACH ROW
    EXECUTE FUNCTION public.update_enhanced_analysis_updated_at();

-- Update the consolidation trigger to be more intelligent about lead deduplication
CREATE OR REPLACE FUNCTION public.consolidate_funnel_submission()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
DECLARE
    existing_lead_id UUID;
    business_area_id_var UUID;
    lead_name TEXT;
    lead_email TEXT;
    lead_phone TEXT;
    lead_company TEXT;
    funnel_owner_id UUID;
    funnel_context JSONB;
BEGIN
    -- Extract information from submission_data
    lead_email := NEW.submission_data->>'email';
    lead_name := COALESCE(NEW.submission_data->>'name', NEW.submission_data->>'nome', NEW.user_name);
    lead_phone := COALESCE(NEW.submission_data->>'phone', NEW.submission_data->>'telefono');
    lead_company := COALESCE(NEW.submission_data->>'company', NEW.submission_data->>'azienda');

    -- If we don't have email, we can't consolidate
    IF lead_email IS NULL THEN
        RETURN NEW;
    END IF;

    -- Get the funnel owner's user_id and funnel context
    SELECT created_by, 
           jsonb_build_object(
               'funnel_name', name,
               'funnel_description', description,
               'funnel_type', 'interactive',
               'submission_step', NEW.step_id
           )
    INTO funnel_owner_id, funnel_context
    FROM public.interactive_funnels 
    WHERE id = NEW.funnel_id 
    LIMIT 1;

    -- Look for existing lead with same email for the same funnel owner (person-based, not step-based)
    SELECT id INTO existing_lead_id 
    FROM public.consolidated_leads 
    WHERE email = lead_email 
    AND (user_id = funnel_owner_id OR source_funnel_id IN (
        SELECT id FROM public.interactive_funnels WHERE created_by = funnel_owner_id
    ))
    LIMIT 1;

    -- If doesn't exist, create new consolidated lead
    IF existing_lead_id IS NULL THEN
        -- Determine business area
        SELECT id INTO business_area_id_var 
        FROM public.business_areas 
        WHERE name = 'Altro' 
        LIMIT 1;

        INSERT INTO public.consolidated_leads (
            user_id,
            name,
            email,
            phone,
            company,
            business_area_id,
            source_funnel_id,
            status,
            last_interaction_at
        ) VALUES (
            funnel_owner_id,
            lead_name,
            lead_email,
            lead_phone,
            lead_company,
            business_area_id_var,
            NEW.funnel_id,
            'new',
            NEW.created_at
        ) RETURNING id INTO existing_lead_id;
    ELSE
        -- Update existing lead with new information (merge data)
        UPDATE public.consolidated_leads 
        SET 
            name = COALESCE(lead_name, name),
            phone = COALESCE(lead_phone, phone),
            company = COALESCE(lead_company, company),
            last_interaction_at = NEW.created_at,
            updated_at = now()
        WHERE id = existing_lead_id;
    END IF;

    -- Create the mapping between submission and consolidated lead
    INSERT INTO public.lead_submissions_mapping (
        consolidated_lead_id,
        submission_id,
        submission_data
    ) VALUES (
        existing_lead_id,
        NEW.id,
        jsonb_build_object(
            'original_data', NEW.submission_data,
            'funnel_context', funnel_context,
            'submission_timestamp', NEW.created_at,
            'step_id', NEW.step_id
        )
    ) ON CONFLICT (consolidated_lead_id, submission_id) DO NOTHING;

    RETURN NEW;
END;
$function$;
