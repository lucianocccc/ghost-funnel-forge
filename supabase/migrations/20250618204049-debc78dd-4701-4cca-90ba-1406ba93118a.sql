
-- Add sharing functionality to interactive funnels
ALTER TABLE interactive_funnels 
ADD COLUMN share_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
ADD COLUMN is_public BOOLEAN DEFAULT false,
ADD COLUMN views_count INTEGER DEFAULT 0,
ADD COLUMN submissions_count INTEGER DEFAULT 0;

-- Create index for share tokens
CREATE INDEX idx_interactive_funnels_share_token ON interactive_funnels(share_token);

-- Add analytics fields to funnel submissions
ALTER TABLE funnel_submissions 
ADD COLUMN source TEXT DEFAULT 'direct',
ADD COLUMN referrer_url TEXT,
ADD COLUMN session_id TEXT,
ADD COLUMN completion_time INTEGER; -- time in seconds to complete

-- Create lead analysis table for AI-generated insights
CREATE TABLE lead_analysis_interactive (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES funnel_submissions(id) ON DELETE CASCADE,
  funnel_id UUID NOT NULL REFERENCES interactive_funnels(id) ON DELETE CASCADE,
  analysis_data JSONB NOT NULL DEFAULT '{}',
  lead_score INTEGER DEFAULT 0,
  priority_level TEXT DEFAULT 'medium' CHECK (priority_level IN ('low', 'medium', 'high')),
  insights JSONB DEFAULT '[]',
  recommendations JSONB DEFAULT '[]',
  personalized_strategy TEXT,
  analyzed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create RLS policies for new table
ALTER TABLE lead_analysis_interactive ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view analysis for their funnels" ON lead_analysis_interactive
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM interactive_funnels 
      WHERE id = funnel_id AND created_by = auth.uid()
    )
  );

CREATE POLICY "Users can manage analysis for their funnels" ON lead_analysis_interactive
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM interactive_funnels 
      WHERE id = funnel_id AND created_by = auth.uid()
    )
  );

-- Update RLS policies for public access to shared funnels
CREATE POLICY "Public can view shared funnels" ON interactive_funnels
  FOR SELECT USING (is_public = true);

CREATE POLICY "Public can view steps for shared funnels" ON interactive_funnel_steps
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM interactive_funnels 
      WHERE id = funnel_id AND is_public = true
    )
  );

-- Allow public submissions to shared funnels
CREATE POLICY "Public can submit to shared funnels" ON funnel_submissions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM interactive_funnels 
      WHERE id = funnel_id AND is_public = true
    )
  );

-- Create triggers for analytics
CREATE OR REPLACE FUNCTION increment_funnel_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF TG_TABLE_NAME = 'funnel_submissions' THEN
      UPDATE interactive_funnels 
      SET submissions_count = submissions_count + 1
      WHERE id = NEW.funnel_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_increment_submissions
  AFTER INSERT ON funnel_submissions
  FOR EACH ROW EXECUTE FUNCTION increment_funnel_stats();

-- Function to increment view count
CREATE OR REPLACE FUNCTION increment_interactive_funnel_views(share_token_param text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE interactive_funnels 
  SET views_count = views_count + 1
  WHERE share_token = share_token_param;
END;
$$;
