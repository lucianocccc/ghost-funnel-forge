-- Update the step_type constraint to include all existing and AI-generated step types
ALTER TABLE interactive_funnel_steps 
DROP CONSTRAINT IF EXISTS interactive_funnel_steps_step_type_check;

-- Add updated constraint with all valid step types
ALTER TABLE interactive_funnel_steps 
ADD CONSTRAINT interactive_funnel_steps_step_type_check 
CHECK (step_type IN (
  -- Existing step types from the database
  'form', 'qualification', 'lead_capture', 'conversion', 'education', 
  'info', 'follow_up', 'thank_you', 'discovery', 'survey',
  -- New AI-generated step types
  'content', 'cta', 'redirect', 'video', 'image', 'text', 
  'presentation', 'story', 'testimonial', 'social_proof', 'contact',
  'landing', 'opt_in', 'sales', 'upsell', 'downsell'
));