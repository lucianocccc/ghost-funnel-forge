
-- Add missing columns to funnel_submissions for better analytics
ALTER TABLE funnel_submissions 
ADD COLUMN IF NOT EXISTS lead_status TEXT DEFAULT 'new',
ADD COLUMN IF NOT EXISTS conversion_value NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS utm_source TEXT,
ADD COLUMN IF NOT EXISTS utm_medium TEXT,
ADD COLUMN IF NOT EXISTS utm_campaign TEXT,
ADD COLUMN IF NOT EXISTS device_type TEXT,
ADD COLUMN IF NOT EXISTS browser_info TEXT,
ADD COLUMN IF NOT EXISTS location_data JSONB DEFAULT '{}';

-- Create indexes for better performance on lead_status queries (only if they don't exist)
CREATE INDEX IF NOT EXISTS idx_funnel_submissions_lead_status ON funnel_submissions(lead_status);
CREATE INDEX IF NOT EXISTS idx_funnel_submissions_conversion_value ON funnel_submissions(conversion_value);

-- Add analytics tracking table for funnel performance (only if it doesn't exist)
CREATE TABLE IF NOT EXISTS funnel_analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  funnel_id UUID NOT NULL REFERENCES interactive_funnels(id) ON DELETE CASCADE,
  step_id UUID REFERENCES interactive_funnel_steps(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('view', 'start', 'complete', 'abandon', 'conversion')),
  session_id TEXT,
  user_id UUID,
  user_email TEXT,
  event_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS only if not already enabled
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'funnel_analytics_events'
    AND rowsecurity = true
  ) THEN
    ALTER TABLE funnel_analytics_events ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Create RLS policies (drop and recreate to avoid conflicts)
DROP POLICY IF EXISTS "Users can view analytics for their funnels" ON funnel_analytics_events;
DROP POLICY IF EXISTS "Public can create analytics events" ON funnel_analytics_events;

CREATE POLICY "Users can view analytics for their funnels" ON funnel_analytics_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM interactive_funnels 
      WHERE id = funnel_id AND created_by = auth.uid()
    )
  );

CREATE POLICY "Public can create analytics events" ON funnel_analytics_events
  FOR INSERT WITH CHECK (true);

-- Create indexes for analytics performance (only if they don't exist)
CREATE INDEX IF NOT EXISTS idx_funnel_analytics_funnel_id_new ON funnel_analytics_events(funnel_id);
CREATE INDEX IF NOT EXISTS idx_funnel_analytics_event_type_new ON funnel_analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_funnel_analytics_created_at_new ON funnel_analytics_events(created_at);
