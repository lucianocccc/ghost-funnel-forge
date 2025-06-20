
-- Update the increment function for interactive funnel submissions to match the existing pattern
CREATE OR REPLACE FUNCTION increment_interactive_funnel_submissions(funnel_id_param uuid)
RETURNS void AS $$
BEGIN
  UPDATE interactive_funnels 
  SET submissions_count = COALESCE(submissions_count, 0) + 1
  WHERE id = funnel_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
