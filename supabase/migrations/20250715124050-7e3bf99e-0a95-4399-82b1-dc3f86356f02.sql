
-- Update the increment_interactive_funnel_views function to allow public access
CREATE OR REPLACE FUNCTION public.increment_interactive_funnel_views(share_token_param text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update view count for public funnels without authentication requirement
  UPDATE public.interactive_funnels 
  SET views_count = COALESCE(views_count, 0) + 1
  WHERE share_token = share_token_param 
  AND is_public = true;
END;
$$;

-- Grant execute permission to anonymous users
GRANT EXECUTE ON FUNCTION public.increment_interactive_funnel_views(text) TO anon;
GRANT EXECUTE ON FUNCTION public.increment_interactive_funnel_views(text) TO authenticated;
