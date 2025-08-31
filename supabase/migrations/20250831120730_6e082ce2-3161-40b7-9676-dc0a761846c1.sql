-- Fix Security Definer View issue by removing the problematic view
-- and extending our secure function to include steps data

-- Drop the problematic view that has RLS enabled
DROP VIEW IF EXISTS public.shared_funnel_steps_safe;

-- Update the existing secure function to include steps data in a single call
-- This eliminates the need for the separate view
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
  updated_at timestamp with time zone,
  steps jsonb
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
    f.updated_at,
    -- Include steps data as JSONB array with only safe fields
    COALESCE(
      (
        SELECT jsonb_agg(
          jsonb_build_object(
            'id', s.id,
            'funnel_id', s.funnel_id,
            'title', s.title,
            'description', s.description,
            'step_type', s.step_type,
            'step_order', s.step_order,
            'fields_config', s.fields_config,
            'is_required', s.is_required,
            'created_at', s.created_at,
            'updated_at', s.updated_at,
            -- Only include basic settings, not sensitive configuration
            'settings', jsonb_build_object(
              'showProgressBar', COALESCE(s.settings->>'showProgressBar', 'true'),
              'allowBack', COALESCE(s.settings->>'allowBack', 'true'),
              'submitButtonText', COALESCE(s.settings->>'submitButtonText', 'Next'),
              'backgroundColor', COALESCE(s.settings->>'backgroundColor', '#ffffff'),
              'textColor', COALESCE(s.settings->>'textColor', '#000000')
            )
          )
          ORDER BY s.step_order
        )
        FROM interactive_funnel_steps s
        WHERE s.funnel_id = f.id
      ),
      '[]'::jsonb
    ) as steps
  FROM interactive_funnels f
  WHERE f.share_token = share_token_param 
    AND f.is_public = true;
END;
$$;

-- Grant execute permission on the updated function
GRANT EXECUTE ON FUNCTION public.get_shared_funnel_safe(text) TO authenticated, anon;