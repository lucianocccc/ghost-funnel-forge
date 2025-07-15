
-- First, let's see what step types are being used and update the constraint
-- Check the current constraint
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conname = 'interactive_funnel_steps_step_type_check';

-- Update the step_type constraint to include the missing types
ALTER TABLE interactive_funnel_steps 
DROP CONSTRAINT IF EXISTS interactive_funnel_steps_step_type_check;

ALTER TABLE interactive_funnel_steps 
ADD CONSTRAINT interactive_funnel_steps_step_type_check 
CHECK (step_type IN (
  'lead_capture', 
  'qualification', 
  'education', 
  'conversion', 
  'follow_up',
  'quiz',
  'product_showcase', 
  'demo_request',
  'trial_signup',
  'discovery_form',
  'assessment',
  'social_proof',
  'calendar_booking'
));

-- Also, let's make sure the share_token is properly indexed for performance
CREATE INDEX IF NOT EXISTS idx_interactive_funnels_share_token 
ON interactive_funnels(share_token) 
WHERE is_public = true;

-- Ensure the increment function works properly
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
  
  -- Log the update for debugging
  RAISE NOTICE 'Updated views for token: %, rows affected: %', share_token_param, ROW_COUNT;
END;
$$;
