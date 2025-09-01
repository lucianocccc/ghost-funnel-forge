-- SECURITY FIX: Protect funnel submissions from data theft and abuse
-- Issues: Public insertions without validation, potential for spam and data injection

-- Create a more secure submission policy with additional validation
DROP POLICY IF EXISTS "Allow submissions to public funnels" ON funnel_submissions;

-- Create a stricter policy that validates submission integrity
CREATE POLICY "Allow validated submissions to public active funnels"
ON funnel_submissions 
FOR INSERT 
WITH CHECK (
  -- Ensure funnel exists, is public AND active
  funnel_id IN (
    SELECT id 
    FROM interactive_funnels 
    WHERE is_public = true 
    AND status = 'active'
  )
  -- Ensure step belongs to the funnel
  AND step_id IN (
    SELECT id 
    FROM interactive_funnel_steps 
    WHERE funnel_id = funnel_submissions.funnel_id
  )
  -- Basic data validation
  AND submission_data IS NOT NULL
  AND jsonb_typeof(submission_data) = 'object'
  -- Prevent empty or suspicious submissions
  AND char_length(COALESCE(user_agent, '')) BETWEEN 10 AND 500
  AND (user_email IS NULL OR user_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
  AND (user_name IS NULL OR char_length(user_name) BETWEEN 1 AND 100)
);

-- Create a function to sanitize submission data (removes potential harmful content)
CREATE OR REPLACE FUNCTION public.sanitize_submission_data(input_data jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  cleaned_data jsonb := '{}';
  key text;
  value text;
BEGIN
  -- Iterate through all keys in the JSON object
  FOR key, value IN SELECT * FROM jsonb_each_text(input_data)
  LOOP
    -- Skip keys that might contain sensitive system data
    IF key NOT IN ('__proto__', 'constructor', 'prototype') THEN
      -- Clean the value: remove script tags, limit length, trim whitespace
      value := trim(value);
      value := regexp_replace(value, '<script[^>]*>.*?</script>', '', 'gi');
      value := regexp_replace(value, '<[^>]*>', '', 'g');
      value := left(value, 1000); -- Limit field length
      
      -- Only add non-empty values
      IF length(value) > 0 THEN
        cleaned_data := jsonb_set(cleaned_data, array[key], to_jsonb(value));
      END IF;
    END IF;
  END LOOP;
  
  RETURN cleaned_data;
END;
$$;

-- Create a trigger to automatically sanitize submission data on insert
CREATE OR REPLACE FUNCTION public.sanitize_funnel_submission()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Sanitize the submission data
  NEW.submission_data := public.sanitize_submission_data(NEW.submission_data);
  
  -- Sanitize user fields
  IF NEW.user_name IS NOT NULL THEN
    NEW.user_name := trim(regexp_replace(NEW.user_name, '<[^>]*>', '', 'g'));
    NEW.user_name := left(NEW.user_name, 100);
  END IF;
  
  IF NEW.user_email IS NOT NULL THEN
    NEW.user_email := lower(trim(NEW.user_email));
    -- Additional email validation
    IF NEW.user_email !~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
      NEW.user_email := NULL;
    END IF;
  END IF;
  
  -- Set reasonable defaults for security tracking
  NEW.created_at := COALESCE(NEW.created_at, now());
  NEW.ip_address := COALESCE(NEW.ip_address, inet(split_part(current_setting('request.headers', true)::json->>'x-forwarded-for', ',', 1)));
  
  RETURN NEW;
END;
$$;

-- Create the trigger
DROP TRIGGER IF EXISTS sanitize_submission_trigger ON funnel_submissions;
CREATE TRIGGER sanitize_submission_trigger
  BEFORE INSERT ON funnel_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.sanitize_funnel_submission();

-- Add rate limiting table for submission protection
CREATE TABLE IF NOT EXISTS public.submission_rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address inet NOT NULL,
  funnel_id uuid NOT NULL,
  submission_count integer DEFAULT 1,
  window_start timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on rate limits table
ALTER TABLE public.submission_rate_limits ENABLE ROW LEVEL SECURITY;

-- Policy for rate limiting (system use only)
CREATE POLICY "System can manage rate limits"
ON public.submission_rate_limits
FOR ALL
USING (true);

-- Create function to check and enforce rate limits
CREATE OR REPLACE FUNCTION public.check_submission_rate_limit(
  p_ip_address inet,
  p_funnel_id uuid,
  max_submissions_per_hour integer DEFAULT 10
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_count integer;
  window_start_time timestamp with time zone;
BEGIN
  window_start_time := now() - interval '1 hour';
  
  -- Count submissions from this IP for this funnel in the last hour
  SELECT COALESCE(SUM(submission_count), 0)
  INTO current_count
  FROM submission_rate_limits
  WHERE ip_address = p_ip_address
    AND funnel_id = p_funnel_id
    AND window_start >= window_start_time;
  
  -- If under limit, update/insert rate limit record
  IF current_count < max_submissions_per_hour THEN
    INSERT INTO submission_rate_limits (ip_address, funnel_id, submission_count)
    VALUES (p_ip_address, p_funnel_id, 1)
    ON CONFLICT (ip_address, funnel_id) 
    DO UPDATE SET 
      submission_count = submission_rate_limits.submission_count + 1,
      window_start = CASE 
        WHEN submission_rate_limits.window_start < window_start_time 
        THEN now() 
        ELSE submission_rate_limits.window_start 
      END;
    
    RETURN true;
  ELSE
    RETURN false;
  END IF;
END;
$$;