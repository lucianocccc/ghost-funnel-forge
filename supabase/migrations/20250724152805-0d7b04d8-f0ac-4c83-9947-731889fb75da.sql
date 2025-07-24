-- Fix the recursive RLS policy issue on profiles table
-- Drop the problematic admin policy that causes infinite recursion
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Drop the admin update policy as well if it exists
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

-- Create a simple admin view policy without recursion
-- We can check the role directly in the same table since we know the structure
CREATE POLICY "Allow admin role to view all profiles" 
ON public.profiles 
FOR SELECT 
USING (
  role = 'admin'::app_role OR 
  auth.uid() = id
);

-- Create a simple admin update policy
CREATE POLICY "Allow admin role to update all profiles" 
ON public.profiles 
FOR UPDATE 
USING (
  role = 'admin'::app_role OR 
  auth.uid() = id
);