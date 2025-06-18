
-- Create the base interactive funnel system tables

-- 1. Create main interactive_funnels table
CREATE TABLE interactive_funnels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  ai_funnel_id UUID, -- Will be linked later to ai_generated_funnels
  created_by UUID NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create interactive_funnel_steps table
CREATE TABLE interactive_funnel_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  funnel_id UUID NOT NULL REFERENCES interactive_funnels(id) ON DELETE CASCADE,
  step_order INTEGER NOT NULL,
  step_type TEXT NOT NULL CHECK (step_type IN ('form', 'info', 'survey', 'contact')),
  title TEXT NOT NULL,
  description TEXT,
  fields_config JSONB DEFAULT '{}',
  settings JSONB DEFAULT '{}',
  is_required BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Create funnel_submissions table
CREATE TABLE funnel_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  funnel_id UUID NOT NULL REFERENCES interactive_funnels(id) ON DELETE CASCADE,
  step_id UUID NOT NULL REFERENCES interactive_funnel_steps(id) ON DELETE CASCADE,
  submission_data JSONB NOT NULL DEFAULT '{}',
  user_email TEXT,
  user_name TEXT,
  ip_address INET,
  user_agent TEXT,
  gpt_analysis JSONB,
  analysis_score INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Create indexes for performance
CREATE INDEX idx_interactive_funnels_created_by ON interactive_funnels(created_by);
CREATE INDEX idx_interactive_funnels_status ON interactive_funnels(status);
CREATE INDEX idx_interactive_funnel_steps_funnel ON interactive_funnel_steps(funnel_id, step_order);
CREATE INDEX idx_funnel_submissions_funnel ON funnel_submissions(funnel_id);
CREATE INDEX idx_funnel_submissions_email ON funnel_submissions(user_email);

-- 5. Create RLS policies
ALTER TABLE interactive_funnels ENABLE ROW LEVEL SECURITY;
ALTER TABLE interactive_funnel_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE funnel_submissions ENABLE ROW LEVEL SECURITY;

-- Policies for interactive_funnels
CREATE POLICY "Users can view their own funnels" ON interactive_funnels
  FOR SELECT USING (created_by = auth.uid());

CREATE POLICY "Users can manage their own funnels" ON interactive_funnels
  FOR ALL USING (created_by = auth.uid());

-- Policies for interactive_funnel_steps
CREATE POLICY "Users can view steps for their funnels" ON interactive_funnel_steps
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM interactive_funnels 
      WHERE id = funnel_id AND created_by = auth.uid()
    )
  );

CREATE POLICY "Users can manage steps for their funnels" ON interactive_funnel_steps
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM interactive_funnels 
      WHERE id = funnel_id AND created_by = auth.uid()
    )
  );

-- Policies for funnel_submissions
CREATE POLICY "Users can view submissions for their funnels" ON funnel_submissions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM interactive_funnels 
      WHERE id = funnel_id AND created_by = auth.uid()
    )
  );

CREATE POLICY "Users can manage submissions for their funnels" ON funnel_submissions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM interactive_funnels 
      WHERE id = funnel_id AND created_by = auth.uid()
    )
  );

-- 6. Create triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_interactive_funnels_updated_at BEFORE UPDATE ON interactive_funnels 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_interactive_funnel_steps_updated_at BEFORE UPDATE ON interactive_funnel_steps 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_funnel_submissions_updated_at BEFORE UPDATE ON funnel_submissions 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
