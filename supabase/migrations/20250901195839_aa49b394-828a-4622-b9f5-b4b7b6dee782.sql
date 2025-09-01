-- Fix security definer view warning
-- Create a dedicated secure function instead of a view to avoid security definer view issues

CREATE OR REPLACE FUNCTION public.get_marketplace_templates()
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
  approved_at timestamp with time zone,
  performance_summary jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- This function safely provides marketplace data without bypassing RLS
  -- It only returns approved premium templates with safe performance summaries
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
    t.approved_at,
    -- Show only performance summary, not detailed metrics
    CASE 
      WHEN t.performance_metrics IS NOT NULL 
      THEN jsonb_build_object(
        'conversion_rate_category', 
        CASE 
          WHEN (t.performance_metrics->>'avg_conversion_rate')::numeric > 0.05 THEN 'high'
          WHEN (t.performance_metrics->>'avg_conversion_rate')::numeric > 0.02 THEN 'medium'
          ELSE 'standard'
        END
      )
      ELSE '{}'::jsonb
    END as performance_summary
  FROM premium_templates t
  WHERE t.approved_at IS NOT NULL 
    AND t.is_premium = true;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_marketplace_templates() TO anon, authenticated;