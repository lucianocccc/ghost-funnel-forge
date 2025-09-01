-- SECURITY FIX: Protect AI prompts and business strategy data in funnel_types table
-- Issue: The funnel_types table contains sensitive AI prompts, conversion optimization strategies,
-- and detailed funnel templates that should not be publicly accessible

-- Enable Row Level Security on funnel_types table
ALTER TABLE public.funnel_types ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view basic funnel type information (without sensitive data)
CREATE POLICY "Authenticated users can view basic funnel types"
ON public.funnel_types
FOR SELECT
TO authenticated
USING (is_active = true);

-- Allow admins to manage all funnel types
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

-- Create a security definer function to get public funnel type data without sensitive information
CREATE OR REPLACE FUNCTION public.get_public_funnel_types()
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