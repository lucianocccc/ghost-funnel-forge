
-- Prima verifichiamo e aggiorniamo la struttura della tabella profiles
-- Assicuriamoci che la colonna role esista e sia configurata correttamente
DO $$ 
BEGIN
    -- Controlla se la colonna role esiste già
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'role'
        AND table_schema = 'public'
    ) THEN
        -- Se non esiste, aggiungila
        ALTER TABLE public.profiles ADD COLUMN role app_role NOT NULL DEFAULT 'user';
    END IF;
END $$;

-- Ora aggiorniamo il primo utente nella tabella profiles per renderlo admin
-- Questo prenderà il primo utente trovato e lo renderà admin
UPDATE public.profiles 
SET role = 'admin' 
WHERE id = (
    SELECT id 
    FROM public.profiles 
    ORDER BY created_at ASC 
    LIMIT 1
);

-- Se non ci sono profili, creiamo uno per l'utente attualmente autenticato
-- (questo funzionerà solo se eseguito mentre sei loggato)
INSERT INTO public.profiles (id, email, role)
SELECT 
    auth.uid(),
    (SELECT email FROM auth.users WHERE id = auth.uid()),
    'admin'::app_role
WHERE auth.uid() IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid());
