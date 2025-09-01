-- Add unique constraint to rate limiting table
ALTER TABLE public.submission_rate_limits 
ADD CONSTRAINT submission_rate_limits_ip_funnel_unique 
UNIQUE (ip_address, funnel_id);