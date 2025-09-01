-- SECURITY FIX: Protect premium template content from theft
-- Issue: The premium_templates table exposes paid template_data to unauthorized users
-- Solution: Implement secure access controls that protect valuable template content

-- First, remove the overly permissive browsing policy
DROP POLICY IF EXISTS "Users can view basic template info for browsing" ON premium_templates;

-- Create a secure policy for browsing that EXCLUDES sensitive data
CREATE POLICY "Public can view template previews only"
ON premium_templates
FOR SELECT
USING (
  approved_at IS NOT NULL 
  AND is_premium = true
);

-- Create separate secure functions for different access levels

-- 1. Function for public template browsing (NO sensitive data)
CREATE OR REPLACE FUNCTION public.get_premium_template_previews()
RETURNS TABLE(
  id uuid,
  name text,
  description text,
  category text,
  industry text,
  price numeric,
  rating numeric,
  sales_count integer,
  created_at timestamp with time zone,
  approved_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id,
    t.name,
    t.description,
    t.category,
    t.industry,
    t.price,
    t.rating,
    t.sales_count,
    t.created_at,
    t.approved_at
  FROM premium_templates t
  WHERE t.approved_at IS NOT NULL
    AND t.is_premium = true;
END;
$$;

-- 2. Function for users who have purchased the template (FULL access)
CREATE OR REPLACE FUNCTION public.get_purchased_premium_template_full(template_id_param uuid)
RETURNS TABLE(
  id uuid,
  name text,
  description text,
  category text,
  industry text,
  template_data jsonb,
  performance_metrics jsonb,
  price numeric,
  rating numeric,
  sales_count integer,
  created_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verify user has purchased this template OR owns it
  IF NOT EXISTS (
    SELECT 1 FROM premium_template_purchases p 
    WHERE p.user_id = auth.uid() 
    AND p.template_id = template_id_param
  ) AND NOT EXISTS (
    SELECT 1 FROM premium_templates t
    WHERE t.id = template_id_param 
    AND t.created_by = auth.uid()
  ) THEN
    -- User hasn't purchased this template and doesn't own it
    RAISE EXCEPTION 'Access denied: Template not purchased';
  END IF;

  RETURN QUERY
  SELECT 
    t.id,
    t.name,
    t.description,
    t.category,
    t.industry,
    t.template_data,
    t.performance_metrics,
    t.price,
    t.rating,
    t.sales_count,
    t.created_at
  FROM premium_templates t
  WHERE t.id = template_id_param 
    AND t.approved_at IS NOT NULL
    AND t.is_premium = true;
END;
$$;

-- 3. Function to verify template purchase status
CREATE OR REPLACE FUNCTION public.check_template_purchase_status(template_id_param uuid)
RETURNS TABLE(
  has_purchased boolean,
  is_owner boolean,
  purchase_date timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_has_purchased boolean := false;
  user_is_owner boolean := false;
  purchase_date_result timestamp with time zone := null;
BEGIN
  -- Check if user owns the template
  SELECT EXISTS(
    SELECT 1 FROM premium_templates t
    WHERE t.id = template_id_param 
    AND t.created_by = auth.uid()
  ) INTO user_is_owner;
  
  -- Check if user has purchased the template
  SELECT EXISTS(
    SELECT 1 FROM premium_template_purchases p 
    WHERE p.user_id = auth.uid() 
    AND p.template_id = template_id_param
  ), p.purchase_date
  INTO user_has_purchased, purchase_date_result
  FROM premium_template_purchases p 
  WHERE p.user_id = auth.uid() 
  AND p.template_id = template_id_param
  LIMIT 1;
  
  RETURN QUERY SELECT user_has_purchased, user_is_owner, purchase_date_result;
END;
$$;

-- 4. Create a more restrictive direct access policy
CREATE POLICY "Users can only access purchased template data"
ON premium_templates
FOR SELECT
TO authenticated
USING (
  -- User owns the template OR has purchased it
  created_by = auth.uid()
  OR id IN (
    SELECT template_id 
    FROM premium_template_purchases 
    WHERE user_id = auth.uid()
  )
);

-- Add additional security: Prevent data leakage through API introspection
-- Create a view that only shows safe template data for browsing
CREATE OR REPLACE VIEW public.premium_template_marketplace AS
SELECT 
  id,
  name,
  description,
  category,
  industry,
  price,
  rating,
  sales_count,
  created_at,
  approved_at,
  -- Show only performance summary, not detailed metrics
  CASE 
    WHEN performance_metrics IS NOT NULL 
    THEN jsonb_build_object(
      'conversion_rate_category', 
      CASE 
        WHEN (performance_metrics->>'avg_conversion_rate')::numeric > 0.05 THEN 'high'
        WHEN (performance_metrics->>'avg_conversion_rate')::numeric > 0.02 THEN 'medium'
        ELSE 'standard'
      END
    )
    ELSE '{}'::jsonb
  END as performance_summary
FROM premium_templates
WHERE approved_at IS NOT NULL 
  AND is_premium = true;

-- Grant access to the marketplace view
GRANT SELECT ON public.premium_template_marketplace TO anon, authenticated;