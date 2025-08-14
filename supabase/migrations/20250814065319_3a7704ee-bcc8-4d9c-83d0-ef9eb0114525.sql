-- Fix security vulnerability in profiles table by resolving infinite recursion in RLS policies

-- Create a security definer function to safely check user roles
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS app_role AS $$
DECLARE
  user_role app_role;
BEGIN
  SELECT role INTO user_role 
  FROM public.profiles 
  WHERE id = auth.uid();
  
  RETURN COALESCE(user_role, 'user'::app_role);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Drop the problematic admin policies that cause infinite recursion
DROP POLICY IF EXISTS "Allow admin role to view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow admin role to update all profiles" ON public.profiles;

-- Create secure policies using the security definer function
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (public.get_current_user_role() = 'admin'::app_role OR auth.uid() = id);

CREATE POLICY "Admins can update all profiles" 
ON public.profiles 
FOR UPDATE 
USING (public.get_current_user_role() = 'admin'::app_role OR auth.uid() = id);

-- Remove any duplicate user policies (keep only one of each)
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

-- The remaining policies should be:
-- "Users can insert their own profile" - CORRECT
-- "Users can update their own profile" - CORRECT  
-- "Users can view their own profile" - CORRECT