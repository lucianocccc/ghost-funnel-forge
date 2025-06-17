
-- Prima controlliamo se esiste già un record per il tuo utente nella tabella subscribers
-- e aggiorniamo o inseriamo i dati per darti accesso premium

-- Aggiorniamo o inseriamo il record nella tabella subscribers per darti accesso premium
INSERT INTO public.subscribers (user_id, email, subscribed, subscription_tier, subscription_end)
SELECT 
    auth.uid(),
    (SELECT email FROM auth.users WHERE id = auth.uid()),
    true,
    'enterprise',
    now() + interval '1 year'  -- Abbonamento valido per 1 anno
WHERE auth.uid() IS NOT NULL
ON CONFLICT (email) 
DO UPDATE SET 
    subscribed = true,
    subscription_tier = 'enterprise',
    subscription_end = now() + interval '1 year',
    updated_at = now();

-- Assicuriamoci che il tuo profilo abbia il ruolo admin (se non ce l'hai già)
UPDATE public.profiles 
SET role = 'admin'
WHERE id = auth.uid() AND auth.uid() IS NOT NULL;
