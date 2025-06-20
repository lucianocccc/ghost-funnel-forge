
-- Function to increment views count for interactive funnels
CREATE OR REPLACE FUNCTION increment_interactive_funnel_views(share_token_param text)
RETURNS void AS $$
BEGIN
  UPDATE interactive_funnels 
  SET views_count = COALESCE(views_count, 0) + 1
  WHERE share_token = share_token_param;
END;
$$ LANGUAGE plpgsql;

-- Function to increment submissions count for interactive funnels
CREATE OR REPLACE FUNCTION increment_interactive_funnel_submissions(funnel_id_param uuid)
RETURNS void AS $$
BEGIN
  UPDATE interactive_funnels 
  SET submissions_count = COALESCE(submissions_count, 0) + 1
  WHERE id = funnel_id_param;
END;
$$ LANGUAGE plpgsql;
