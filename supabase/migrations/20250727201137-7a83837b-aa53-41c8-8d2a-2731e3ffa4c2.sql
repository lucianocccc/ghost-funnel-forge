-- Revolution Funnel Engine Database Schema

-- Customer Intelligence Profiles
CREATE TABLE public.revolution_customer_profiles (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    customer_data JSONB NOT NULL DEFAULT '{}',
    psychographic_profile JSONB NOT NULL DEFAULT '{}',
    behavioral_patterns JSONB NOT NULL DEFAULT '{}',
    pain_points JSONB NOT NULL DEFAULT '[]',
    motivations JSONB NOT NULL DEFAULT '[]',
    communication_style JSONB NOT NULL DEFAULT '{}',
    decision_making_pattern TEXT,
    trust_signals JSONB NOT NULL DEFAULT '[]',
    objection_patterns JSONB NOT NULL DEFAULT '[]',
    conversion_triggers JSONB NOT NULL DEFAULT '[]',
    intelligence_score NUMERIC DEFAULT 0.0,
    profile_completeness NUMERIC DEFAULT 0.0,
    last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Learning Memory System
CREATE TABLE public.revolution_learning_memory (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    memory_type TEXT NOT NULL, -- 'customer_insight', 'design_pattern', 'copy_performance', 'funnel_conversion'
    context_data JSONB NOT NULL DEFAULT '{}',
    learning_data JSONB NOT NULL DEFAULT '{}',
    performance_metrics JSONB NOT NULL DEFAULT '{}',
    confidence_score NUMERIC DEFAULT 0.0,
    usage_count INTEGER DEFAULT 0,
    success_rate NUMERIC DEFAULT 0.0,
    last_applied_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Advanced Funnel Templates
CREATE TABLE public.revolution_funnel_templates (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    template_name TEXT NOT NULL,
    industry TEXT,
    customer_profile_match JSONB NOT NULL DEFAULT '{}',
    funnel_structure JSONB NOT NULL DEFAULT '{}',
    copy_templates JSONB NOT NULL DEFAULT '{}',
    design_system JSONB NOT NULL DEFAULT '{}',
    conversion_strategy JSONB NOT NULL DEFAULT '{}',
    personalization_rules JSONB NOT NULL DEFAULT '[]',
    performance_score NUMERIC DEFAULT 0.0,
    usage_count INTEGER DEFAULT 0,
    avg_conversion_rate NUMERIC DEFAULT 0.0,
    is_ai_generated BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Dynamic Questions Engine
CREATE TABLE public.revolution_question_sequences (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    session_id UUID NOT NULL,
    customer_profile_id UUID REFERENCES public.revolution_customer_profiles(id),
    question_sequence JSONB NOT NULL DEFAULT '[]',
    current_question_index INTEGER DEFAULT 0,
    responses JSONB NOT NULL DEFAULT '{}',
    analysis_results JSONB NOT NULL DEFAULT '{}',
    completion_status TEXT DEFAULT 'in_progress', -- 'in_progress', 'completed', 'abandoned'
    intelligence_gathered NUMERIC DEFAULT 0.0,
    next_questions JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Performance Analytics
CREATE TABLE public.revolution_performance_analytics (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    funnel_id UUID,
    customer_profile_id UUID REFERENCES public.revolution_customer_profiles(id),
    template_id UUID REFERENCES public.revolution_funnel_templates(id),
    analytics_type TEXT NOT NULL, -- 'conversion', 'engagement', 'copy_performance', 'design_effectiveness'
    metrics_data JSONB NOT NULL DEFAULT '{}',
    insights JSONB NOT NULL DEFAULT '[]',
    recommendations JSONB NOT NULL DEFAULT '[]',
    improvement_opportunities JSONB NOT NULL DEFAULT '[]',
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.revolution_customer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revolution_learning_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revolution_funnel_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revolution_question_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revolution_performance_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage their own customer profiles" 
ON public.revolution_customer_profiles 
FOR ALL 
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own learning memory" 
ON public.revolution_learning_memory 
FOR ALL 
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own funnel templates" 
ON public.revolution_funnel_templates 
FOR ALL 
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own question sequences" 
ON public.revolution_question_sequences 
FOR ALL 
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own performance analytics" 
ON public.revolution_performance_analytics 
FOR ALL 
USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_revolution_customer_profiles_user_id ON public.revolution_customer_profiles(user_id);
CREATE INDEX idx_revolution_learning_memory_user_id ON public.revolution_learning_memory(user_id);
CREATE INDEX idx_revolution_learning_memory_type ON public.revolution_learning_memory(memory_type);
CREATE INDEX idx_revolution_funnel_templates_user_id ON public.revolution_funnel_templates(user_id);
CREATE INDEX idx_revolution_question_sequences_user_id ON public.revolution_question_sequences(user_id);
CREATE INDEX idx_revolution_question_sequences_session ON public.revolution_question_sequences(session_id);
CREATE INDEX idx_revolution_performance_analytics_user_id ON public.revolution_performance_analytics(user_id);

-- Triggers for updated_at
CREATE TRIGGER update_revolution_funnel_templates_updated_at
    BEFORE UPDATE ON public.revolution_funnel_templates
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_revolution_question_sequences_updated_at
    BEFORE UPDATE ON public.revolution_question_sequences
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();