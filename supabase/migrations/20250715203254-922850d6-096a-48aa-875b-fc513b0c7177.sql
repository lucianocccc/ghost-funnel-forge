
-- Update the increment_interactive_funnel_views function to work without authentication
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

-- Grant execute permission to anonymous users for this function
GRANT EXECUTE ON FUNCTION public.increment_interactive_funnel_views(text) TO anon;

-- Create a policy that allows anonymous users to read public funnels
DROP POLICY IF EXISTS "Public funnels are viewable by everyone" ON public.interactive_funnels;
CREATE POLICY "Public funnels are viewable by everyone" 
ON public.interactive_funnels 
FOR SELECT 
TO anon, authenticated
USING (is_public = true);

-- Create a policy that allows anonymous users to read steps of public funnels
DROP POLICY IF EXISTS "Public funnel steps are viewable by everyone" ON public.interactive_funnel_steps;
CREATE POLICY "Public funnel steps are viewable by everyone" 
ON public.interactive_funnel_steps 
FOR SELECT 
TO anon, authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM public.interactive_funnels 
    WHERE id = interactive_funnel_steps.funnel_id 
    AND is_public = true
  )
);
