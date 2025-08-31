-- Create a security definer function to safely fetch shared funnel data
-- This function only returns non-sensitive data needed for sharing
CREATE OR REPLACE FUNCTION public.get_shared_funnel_safe(share_token_param text)
RETURNS TABLE (
  id uuid,
  name text,
  description text,
  status text,
  is_public boolean,
  share_token text,
  views_count integer,
  submissions_count integer,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    f.id,
    f.name,
    f.description,
    f.status,
    f.is_public,
    f.share_token,
    f.views_count,
    f.submissions_count,
    f.created_at,
    f.updated_at
  FROM interactive_funnels f
  WHERE f.share_token = share_token_param 
    AND f.is_public = true;
END;
$$;

-- Drop the existing overly permissive policies
DROP POLICY IF EXISTS "Public can view shared funnels" ON interactive_funnels;
DROP POLICY IF EXISTS "Public funnels are viewable by everyone" ON interactive_funnels;

-- Grant execute permission on the function to authenticated and anonymous users
GRANT EXECUTE ON FUNCTION public.get_shared_funnel_safe(text) TO authenticated, anon;

-- Create a view for shared funnel steps that also restricts sensitive data
CREATE OR REPLACE VIEW public.shared_funnel_steps_safe AS
SELECT 
  s.id,
  s.funnel_id,
  s.title,
  s.description,
  s.step_type,
  s.step_order,
  s.fields_config,
  s.is_required,
  s.created_at,
  s.updated_at,
  -- Only include basic settings, not sensitive configuration
  CASE 
    WHEN f.is_public = true THEN 
      jsonb_build_object(
        'showProgressBar', COALESCE(s.settings->>'showProgressBar', 'true'),
        'allowBack', COALESCE(s.settings->>'allowBack', 'true'),
        'submitButtonText', COALESCE(s.settings->>'submitButtonText', 'Next'),
        'backgroundColor', COALESCE(s.settings->>'backgroundColor', '#ffffff'),
        'textColor', COALESCE(s.settings->>'textColor', '#000000')
      )
    ELSE NULL
  END as settings
FROM interactive_funnel_steps s
JOIN interactive_funnels f ON s.funnel_id = f.id
WHERE f.is_public = true;

-- Grant access to the view
GRANT SELECT ON public.shared_funnel_steps_safe TO authenticated, anon;