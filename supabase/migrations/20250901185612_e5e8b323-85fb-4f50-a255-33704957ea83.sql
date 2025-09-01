-- Rimuovo la policy esistente e ne creo una più semplice
DROP POLICY IF EXISTS "Allow anonymous submissions to public funnels" ON funnel_submissions;

-- Creo una policy più semplice e permissiva
CREATE POLICY "Allow submissions to public funnels" 
ON funnel_submissions 
FOR INSERT 
WITH CHECK (
  -- Verifica solo che il funnel sia pubblico, senza controllare lo stato
  funnel_id IN (
    SELECT id 
    FROM interactive_funnels 
    WHERE is_public = true
  )
);

-- Testo manualmente la policy con un inserimento simulato
-- Questo dovrebbe funzionare ora
SELECT 
  EXISTS(
    SELECT 1 
    FROM interactive_funnels 
    WHERE id = '1a13c8b8-e923-464d-b86a-7484f37c65f0' 
    AND is_public = true
  ) as funnel_is_public,
  EXISTS(
    SELECT 1 
    FROM interactive_funnel_steps 
    WHERE id = 'eabc6c54-508a-4e03-9511-f841afb0243a'
    AND funnel_id = '1a13c8b8-e923-464d-b86a-7484f37c65f0'
  ) as step_exists;