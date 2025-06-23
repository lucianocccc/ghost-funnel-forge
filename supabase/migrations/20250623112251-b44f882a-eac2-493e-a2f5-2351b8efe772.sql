
-- Add settings column to interactive_funnels table
ALTER TABLE public.interactive_funnels 
ADD COLUMN settings jsonb DEFAULT '{}'::jsonb;

-- Add a comment to describe what this column stores
COMMENT ON COLUMN public.interactive_funnels.settings IS 'Customer-facing settings including hero content, brand colors, and other customization options';
