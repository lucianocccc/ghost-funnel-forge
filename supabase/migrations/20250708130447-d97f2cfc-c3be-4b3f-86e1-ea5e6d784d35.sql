-- Ghost Funnel Revolution: Advanced AI Document Analysis & Behavioral Intelligence System

-- 1. Document Analysis System
CREATE TABLE document_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  document_name TEXT NOT NULL,
  document_type TEXT NOT NULL CHECK (document_type IN ('pdf', 'docx', 'txt', 'image', 'url')),
  original_content TEXT,
  extracted_text TEXT,
  ai_analysis JSONB DEFAULT '{}',
  insights JSONB DEFAULT '[]',
  actionable_recommendations JSONB DEFAULT '[]',
  business_opportunities JSONB DEFAULT '[]',
  target_audience_insights JSONB DEFAULT '{}',
  competitive_analysis JSONB DEFAULT '{}',
  market_positioning JSONB DEFAULT '{}',
  confidence_score NUMERIC(3,2) DEFAULT 0.00,
  processing_status TEXT DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Behavioral Intelligence System
CREATE TABLE user_behavioral_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  session_id TEXT NOT NULL,
  page_path TEXT,
  action_type TEXT NOT NULL,
  action_data JSONB DEFAULT '{}',
  timestamp TIMESTAMPTZ DEFAULT now(),
  user_agent TEXT,
  ip_address INET,
  device_type TEXT,
  engagement_score INTEGER DEFAULT 0,
  conversion_intent_score NUMERIC(3,2) DEFAULT 0.00
);

-- 3. Advanced Funnel Templates with AI
CREATE TABLE ai_funnel_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  industry TEXT,
  use_case TEXT,
  ai_generated BOOLEAN DEFAULT false,
  template_data JSONB NOT NULL DEFAULT '{}',
  conversion_rate NUMERIC(5,2) DEFAULT 0.00,
  performance_metrics JSONB DEFAULT '{}',
  ai_optimization_suggestions JSONB DEFAULT '[]',
  is_premium BOOLEAN DEFAULT false,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Real-time AI Recommendations
CREATE TABLE ai_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  recommendation_type TEXT NOT NULL CHECK (recommendation_type IN ('funnel_optimization', 'lead_nurturing', 'content_strategy', 'audience_targeting', 'conversion_improvement')),
  priority_level TEXT DEFAULT 'medium' CHECK (priority_level IN ('low', 'medium', 'high', 'critical')),
  title TEXT NOT NULL,
  description TEXT,
  action_items JSONB DEFAULT '[]',
  expected_impact JSONB DEFAULT '{}',
  implementation_difficulty TEXT DEFAULT 'medium' CHECK (implementation_difficulty IN ('easy', 'medium', 'hard')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'viewed', 'implemented', 'dismissed')),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Advanced Analytics & Reporting
CREATE TABLE funnel_performance_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  funnel_id UUID NOT NULL,
  date DATE DEFAULT CURRENT_DATE,
  unique_visitors INTEGER DEFAULT 0,
  page_views INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  conversion_rate NUMERIC(5,2) DEFAULT 0.00,
  bounce_rate NUMERIC(5,2) DEFAULT 0.00,
  average_time_on_page INTEGER DEFAULT 0,
  traffic_sources JSONB DEFAULT '{}',
  device_breakdown JSONB DEFAULT '{}',
  geographic_data JSONB DEFAULT '{}',
  ai_insights JSONB DEFAULT '[]',
  optimization_opportunities JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Competitive Intelligence
CREATE TABLE market_intelligence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  industry TEXT,
  competitor_analysis JSONB DEFAULT '{}',
  market_trends JSONB DEFAULT '[]',
  opportunity_scores JSONB DEFAULT '{}',
  positioning_recommendations JSONB DEFAULT '[]',
  pricing_insights JSONB DEFAULT '{}',
  feature_gap_analysis JSONB DEFAULT '{}',
  analysis_date DATE DEFAULT CURRENT_DATE,
  confidence_level NUMERIC(3,2) DEFAULT 0.00,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Lead Scoring Evolution
CREATE TABLE advanced_lead_scoring_v2 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consolidated_lead_id UUID NOT NULL,
  demographic_score INTEGER DEFAULT 0,
  behavioral_score INTEGER DEFAULT 0,
  engagement_score INTEGER DEFAULT 0,
  intent_score INTEGER DEFAULT 0,
  timing_score INTEGER DEFAULT 0,
  contextual_score INTEGER DEFAULT 0,
  ai_predicted_score INTEGER DEFAULT 0,
  total_score INTEGER DEFAULT 0,
  score_breakdown JSONB DEFAULT '{}',
  improvement_actions JSONB DEFAULT '[]',
  next_best_action TEXT,
  optimal_contact_time TIMESTAMPTZ,
  personalization_data JSONB DEFAULT '{}',
  calculated_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT (now() + INTERVAL '7 days')
);

-- Create indexes for performance
CREATE INDEX idx_document_analysis_user_id ON document_analysis(user_id);
CREATE INDEX idx_document_analysis_status ON document_analysis(processing_status);
CREATE INDEX idx_behavioral_data_user_session ON user_behavioral_data(user_id, session_id);
CREATE INDEX idx_behavioral_data_timestamp ON user_behavioral_data(timestamp DESC);
CREATE INDEX idx_ai_recommendations_user_priority ON ai_recommendations(user_id, priority_level);
CREATE INDEX idx_ai_recommendations_status ON ai_recommendations(status);
CREATE INDEX idx_funnel_analytics_funnel_date ON funnel_performance_analytics(funnel_id, date DESC);
CREATE INDEX idx_market_intelligence_user_date ON market_intelligence(user_id, analysis_date DESC);
CREATE INDEX idx_advanced_scoring_lead_id ON advanced_lead_scoring_v2(consolidated_lead_id);

-- Enable RLS on all new tables
ALTER TABLE document_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_behavioral_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_funnel_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE funnel_performance_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_intelligence ENABLE ROW LEVEL SECURITY;
ALTER TABLE advanced_lead_scoring_v2 ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage their own documents" ON document_analysis
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access their behavioral data" ON user_behavioral_data
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view funnel templates" ON ai_funnel_templates
  FOR SELECT USING (true);

CREATE POLICY "Creators can manage their templates" ON ai_funnel_templates
  FOR ALL USING (auth.uid() = created_by OR created_by IS NULL);

CREATE POLICY "Users can access their recommendations" ON ai_recommendations
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access their funnel analytics" ON funnel_performance_analytics
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM interactive_funnels 
      WHERE id = funnel_performance_analytics.funnel_id 
      AND created_by = auth.uid()
    )
  );

CREATE POLICY "Users can access their market intelligence" ON market_intelligence
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access advanced scoring for their leads" ON advanced_lead_scoring_v2
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM consolidated_leads cl
      WHERE cl.id = advanced_lead_scoring_v2.consolidated_lead_id 
      AND (cl.user_id = auth.uid() OR cl.source_funnel_id IN (
        SELECT id FROM interactive_funnels WHERE created_by = auth.uid()
      ))
    )
  );

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_document_analysis_updated_at BEFORE UPDATE ON document_analysis 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_funnel_templates_updated_at BEFORE UPDATE ON ai_funnel_templates 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_recommendations_updated_at BEFORE UPDATE ON ai_recommendations 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_market_intelligence_updated_at BEFORE UPDATE ON market_intelligence 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();