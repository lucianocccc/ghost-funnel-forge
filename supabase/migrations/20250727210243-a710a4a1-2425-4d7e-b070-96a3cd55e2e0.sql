-- Add interactive_funnel_id to link revolution templates to interactive funnels
ALTER TABLE public.revolution_funnel_templates 
ADD COLUMN interactive_funnel_id UUID NULL,
ADD CONSTRAINT fk_revolution_templates_interactive_funnel 
  FOREIGN KEY (interactive_funnel_id) 
  REFERENCES public.interactive_funnels(id) 
  ON DELETE CASCADE;

-- Create index for better performance
CREATE INDEX idx_revolution_templates_interactive_funnel 
  ON public.revolution_funnel_templates(interactive_funnel_id);

-- Update the createRevolutionFunnel function to also create an interactive funnel
-- This will be handled in the edge function code