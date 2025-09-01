-- Definitively remove the view that's causing the security definer warning
-- The linter is detecting this view as problematic

DROP VIEW IF EXISTS public.premium_template_marketplace CASCADE;

-- Verify no views remain
SELECT schemaname, viewname FROM pg_views WHERE schemaname = 'public';