-- Add AI Funnel Generation tables to GhostFunnel

-- Table per memorizzare i funnel generati dall'AI
CREATE TABLE ai_generated_funnels (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
    name varchar NOT NULL,
    description text,
    
    -- Business context utilizzato per la generazione
    business_name varchar NOT NULL,
    industry varchar NOT NULL,
    target_audience text NOT NULL,
    main_product varchar NOT NULL,
    unique_value_proposition text NOT NULL,
    budget integer,
    business_location varchar DEFAULT 'Italia',
    competitors text[], -- Array di competitor
    brand_personality varchar,
    
    -- Dati di generazione
    funnel_structure jsonb NOT NULL, -- Struttura completa del funnel
    market_research_data jsonb, -- Dati ricerca di mercato da Perplexity
    storytelling_data jsonb, -- Contenuti storytelling da Claude
    
    -- Metadati AI
    generation_duration_ms integer NOT NULL,
    ai_models_used text[] NOT NULL, -- ['GPT-5', 'Claude-4', 'Perplexity-Large']
    uniqueness_score integer CHECK (uniqueness_score >= 0 AND uniqueness_score <= 100),
    estimated_setup_time varchar,
    recommended_budget varchar,
    
    -- Timestamp
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    
    -- Status
    status varchar DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed', 'archived'))
);

-- Table per le varianti di funnel (A/B testing)
CREATE TABLE funnel_variants (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_funnel_id uuid REFERENCES ai_generated_funnels(id) ON DELETE CASCADE,
    variant_name varchar NOT NULL, -- 'Variant A', 'Variant B', etc.
    
    -- Stessi campi del funnel principale ma per la variante
    funnel_structure jsonb NOT NULL,
    storytelling_data jsonb,
    uniqueness_score integer CHECK (uniqueness_score >= 0 AND uniqueness_score <= 100),
    estimated_setup_time varchar,
    
    -- Performance tracking
    impressions integer DEFAULT 0,
    conversions integer DEFAULT 0,
    conversion_rate decimal(5,2) DEFAULT 0.00,
    
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    
    status varchar DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'winner', 'archived'))
);

-- Table per tracking dei singoli step del funnel
CREATE TABLE funnel_steps (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    funnel_id uuid REFERENCES ai_generated_funnels(id) ON DELETE CASCADE,
    variant_id uuid REFERENCES funnel_variants(id) ON DELETE CASCADE NULL, -- NULL se step del funnel principale
    
    step_id varchar NOT NULL, -- ID dello step nel JSON
    step_type varchar NOT NULL,
    step_name varchar NOT NULL,
    step_description text,
    step_content jsonb, -- Contenuto completo dello step
    position integer NOT NULL,
    next_step_id varchar,
    
    -- Performance per step
    views integer DEFAULT 0,
    completions integer DEFAULT 0,
    completion_rate decimal(5,2) DEFAULT 0.00,
    avg_time_spent integer DEFAULT 0, -- in secondi
    
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Table per analytics dettagliati dei funnel
CREATE TABLE funnel_analytics (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    funnel_id uuid REFERENCES ai_generated_funnels(id) ON DELETE CASCADE,
    variant_id uuid REFERENCES funnel_variants(id) ON DELETE CASCADE NULL,
    
    -- Metriche generali
    date_recorded date NOT NULL DEFAULT CURRENT_DATE,
    total_visitors integer DEFAULT 0,
    total_leads integer DEFAULT 0,
    total_conversions integer DEFAULT 0,
    revenue decimal(10,2) DEFAULT 0.00,
    
    -- Metriche avanzate
    bounce_rate decimal(5,2) DEFAULT 0.00,
    avg_session_duration integer DEFAULT 0, -- in secondi
    pages_per_session decimal(4,2) DEFAULT 0.00,
    
    -- Sorgenti traffico
    traffic_sources jsonb, -- {'organic': 45, 'paid': 30, 'direct': 25}
    device_breakdown jsonb, -- {'desktop': 60, 'mobile': 35, 'tablet': 5}
    
    created_at timestamp with time zone DEFAULT now()
);

-- Table per le generazioni di funnel in corso (con progress)
CREATE TABLE funnel_generation_jobs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Richiesta originale
    generation_request jsonb NOT NULL,
    
    -- Progress tracking
    current_stage varchar NOT NULL DEFAULT 'market_research', -- 'market_research', 'storytelling', 'orchestration', 'variants', 'complete'
    progress_percentage integer DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    current_message text,
    
    -- Risultati parziali
    partial_results jsonb,
    
    -- Risultato finale
    final_funnel_id uuid REFERENCES ai_generated_funnels(id) ON DELETE SET NULL,
    
    -- Status
    status varchar DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed', 'cancelled')),
    error_message text,
    
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    completed_at timestamp with time zone
);

-- Indici per performance
CREATE INDEX idx_ai_funnels_user_id ON ai_generated_funnels(user_id);
CREATE INDEX idx_ai_funnels_status ON ai_generated_funnels(status);
CREATE INDEX idx_ai_funnels_industry ON ai_generated_funnels(industry);
CREATE INDEX idx_ai_funnels_created_at ON ai_generated_funnels(created_at);

CREATE INDEX idx_variants_parent_funnel ON funnel_variants(parent_funnel_id);
CREATE INDEX idx_variants_status ON funnel_variants(status);

CREATE INDEX idx_steps_funnel_id ON funnel_steps(funnel_id);
CREATE INDEX idx_steps_variant_id ON funnel_steps(variant_id);
CREATE INDEX idx_steps_position ON funnel_steps(position);

CREATE INDEX idx_analytics_funnel_id ON funnel_analytics(funnel_id);
CREATE INDEX idx_analytics_date ON funnel_analytics(date_recorded);

CREATE INDEX idx_jobs_user_id ON funnel_generation_jobs(user_id);
CREATE INDEX idx_jobs_status ON funnel_generation_jobs(status);

-- Trigger per auto-update timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_ai_funnels_updated_at 
    BEFORE UPDATE ON ai_generated_funnels 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_variants_updated_at 
    BEFORE UPDATE ON funnel_variants 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_jobs_updated_at 
    BEFORE UPDATE ON funnel_generation_jobs 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Funzioni utili per analytics
CREATE OR REPLACE FUNCTION calculate_funnel_conversion_rate(funnel_uuid uuid)
RETURNS decimal(5,2) AS $$
DECLARE
    total_visitors integer;
    total_conversions integer;
BEGIN
    SELECT COALESCE(SUM(total_visitors), 0), COALESCE(SUM(total_conversions), 0)
    INTO total_visitors, total_conversions
    FROM funnel_analytics
    WHERE funnel_id = funnel_uuid;
    
    IF total_visitors = 0 THEN
        RETURN 0.00;
    END IF;
    
    RETURN ROUND((total_conversions::decimal / total_visitors::decimal) * 100, 2);
END;
$$ LANGUAGE plpgsql;

-- Commenti per documentazione
COMMENT ON TABLE ai_generated_funnels IS 'Funnel marketing generati dall AI con tutti i metadati';
COMMENT ON TABLE funnel_variants IS 'Varianti dei funnel per A/B testing';
COMMENT ON TABLE funnel_steps IS 'Singoli step dei funnel con tracking performance';
COMMENT ON TABLE funnel_analytics IS 'Analytics dettagliati per ogni funnel';
COMMENT ON TABLE funnel_generation_jobs IS 'Job di generazione funnel con progress tracking';