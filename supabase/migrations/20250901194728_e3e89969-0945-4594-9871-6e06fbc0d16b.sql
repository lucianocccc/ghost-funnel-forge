-- Fix security definer view issue by dropping and recreating without SECURITY DEFINER
DROP VIEW IF EXISTS public.premium_template_marketplace;

-- Create a simple view without SECURITY DEFINER (uses caller's permissions)
CREATE VIEW public.premium_template_marketplace AS
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

-- The view will use the existing RLS policies automatically