-- SECURITY FIX: Clean and secure the funnel_types table
-- Remove existing policies first
DROP POLICY IF EXISTS "Admins can manage funnel types" ON public.funnel_types;
DROP POLICY IF EXISTS "Authenticated users can view basic funnel types" ON public.funnel_types;

-- Enable RLS if not already enabled
ALTER TABLE public.funnel_types ENABLE ROW LEVEL SECURITY;

-- Create secure policies
-- Only authenticated users can view funnel types (no anonymous access)
CREATE POLICY "Authenticated users can view funnel types"
ON public.funnel_types
FOR SELECT
TO authenticated
USING (is_active = true);

-- Only admins can manage funnel types  
CREATE POLICY "Admins can manage funnel types"
ON public.funnel_types
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'::app_role
  )
);

-- Create a security definer function for public access that excludes sensitive data
CREATE OR REPLACE FUNCTION public.get_safe_funnel_types()
RETURNS TABLE(
  id uuid,
  name text,
  description text,
  category text,
  industry text,
  target_audience text,
  complexity_level text,
  is_active boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only return non-sensitive fields, excluding ai_prompts, template_steps, conversion_optimization
  RETURN QUERY
  SELECT 
    ft.id,
    ft.name,
    ft.description,
    ft.category,
    ft.industry,
    ft.target_audience,
    ft.complexity_level,
    ft.is_active
  FROM public.funnel_types ft
  WHERE ft.is_active = true;
END;
$$;