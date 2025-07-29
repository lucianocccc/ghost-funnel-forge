-- Update the step_type constraint to include AI-generated step types
ALTER TABLE interactive_funnel_steps 
DROP CONSTRAINT IF EXISTS interactive_funnel_steps_step_type_check;

-- Add updated constraint with all valid step types including AI-generated ones
ALTER TABLE interactive_funnel_steps 
ADD CONSTRAINT interactive_funnel_steps_step_type_check 
CHECK (step_type IN (
  'form', 'content', 'cta', 'redirect', 'video', 'image', 'text', 
  'presentation', 'story', 'testimonial', 'social_proof', 'contact',
  'landing', 'opt_in', 'thank_you', 'sales', 'upsell', 'downsell'
));