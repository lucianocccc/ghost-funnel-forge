
-- First, let's see what step types are currently allowed
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conname LIKE '%step_type%' AND conrelid = 'interactive_funnel_steps'::regclass;

-- If there's a restrictive check constraint, let's remove it and create a more permissive one
ALTER TABLE interactive_funnel_steps DROP CONSTRAINT IF EXISTS interactive_funnel_steps_step_type_check;

-- Add a new constraint that allows the step types the AI is trying to use
ALTER TABLE interactive_funnel_steps ADD CONSTRAINT interactive_funnel_steps_step_type_check 
CHECK (step_type IN (
  'quiz', 'assessment', 'calculator', 'demo_request', 'trial_signup', 
  'calendar_booking', 'social_proof', 'product_showcase', 'contact_form',
  'lead_magnet', 'survey', 'consultation', 'pricing', 'testimonials',
  'about_us', 'features', 'benefits', 'comparison', 'faq', 'cta'
));
