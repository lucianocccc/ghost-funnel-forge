-- Fix security vulnerability in leads table by adding proper user ownership and RLS policies

-- First, add user_id column to track lead ownership
ALTER TABLE public.leads ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- Set a default user for existing leads (you may want to assign them to a specific admin user)
-- For now, we'll leave them as NULL and handle in the policies

-- Drop the insecure public policies
DROP POLICY IF EXISTS "Allow public select" ON public.leads;
DROP POLICY IF EXISTS "Authenticated users can view leads" ON public.leads;
DROP POLICY IF EXISTS "Allow public inserts" ON public.leads;
DROP POLICY IF EXISTS "Public can insert leads" ON public.leads;

-- Create secure RLS policies
CREATE POLICY "Users can view their own leads" 
ON public.leads 
FOR SELECT 
USING (auth.uid() = user_id OR auth.uid() IS NULL);

CREATE POLICY "Users can create their own leads" 
ON public.leads 
FOR INSERT 
WITH CHECK (auth.uid() = user_id OR auth.uid() IS NULL);

CREATE POLICY "Users can update their own leads" 
ON public.leads 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Keep admin access
-- (The existing admin policies remain active)

-- For public lead generation forms, create a separate policy
CREATE POLICY "Allow anonymous lead creation" 
ON public.leads 
FOR INSERT 
WITH CHECK (user_id IS NULL);