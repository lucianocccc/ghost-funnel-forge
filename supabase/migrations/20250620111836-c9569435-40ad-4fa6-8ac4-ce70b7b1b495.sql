
-- Update the check constraint for interactive_funnel_steps.step_type to accept AI-generated values
ALTER TABLE interactive_funnel_steps 
DROP CONSTRAINT interactive_funnel_steps_step_type_check;

ALTER TABLE interactive_funnel_steps 
ADD CONSTRAINT interactive_funnel_steps_step_type_check 
CHECK (step_type IN ('lead_capture', 'qualification', 'education', 'conversion', 'follow_up', 'form', 'info', 'survey', 'contact'));
