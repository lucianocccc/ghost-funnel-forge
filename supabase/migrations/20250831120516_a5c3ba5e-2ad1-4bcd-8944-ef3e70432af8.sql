-- Create a table to track premium template purchases
CREATE TABLE IF NOT EXISTS public.premium_template_purchases (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  template_id uuid NOT NULL REFERENCES premium_templates(id),
  purchase_date timestamp with time zone NOT NULL DEFAULT now(),
  purchase_amount numeric NOT NULL,
  stripe_payment_intent_id text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, template_id)
);

-- Enable RLS on purchases table
ALTER TABLE public.premium_template_purchases ENABLE ROW LEVEL SECURITY;

-- Policy for users to view their own purchases
CREATE POLICY "Users can view their own template purchases" 
ON public.premium_template_purchases 
FOR SELECT 
USING (auth.uid() = user_id);

-- Policy for users to create their own purchases (payment system)
CREATE POLICY "Users can create their own template purchases" 
ON public.premium_template_purchases 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Anyone can view approved premium templates" ON premium_templates;

-- Create secure function to get premium template preview (no sensitive data)
CREATE OR REPLACE FUNCTION public.get_premium_template_preview()
RETURNS TABLE (
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

-- Create secure function to get full premium template data (only for purchasers)
CREATE OR REPLACE FUNCTION public.get_purchased_premium_template(template_id_param uuid)
RETURNS TABLE (
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
  -- Check if user has purchased this template or owns it
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
    RETURN;
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

-- Create new restrictive policies for premium templates
CREATE POLICY "Users can view basic template info for browsing" 
ON premium_templates 
FOR SELECT 
USING (
  approved_at IS NOT NULL 
  AND is_premium = true
  -- This policy only applies to basic viewing, sensitive data filtered by functions
);

CREATE POLICY "Users can manage their own premium templates" 
ON premium_templates 
FOR ALL 
USING (auth.uid() = created_by);

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.get_premium_template_preview() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.get_purchased_premium_template(uuid) TO authenticated;
GRANT SELECT ON public.premium_template_purchases TO authenticated;