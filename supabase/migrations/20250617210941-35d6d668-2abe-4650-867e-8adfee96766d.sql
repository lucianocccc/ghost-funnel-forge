
-- Create a function to increment funnel views count
CREATE OR REPLACE FUNCTION public.increment_funnel_views(share_token_param text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.ai_generated_funnels 
  SET views_count = views_count + 1
  WHERE share_token = share_token_param;
END;
$$;
