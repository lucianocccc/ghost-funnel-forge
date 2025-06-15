
-- Crea un enum per i ruoli degli utenti
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Aggiungi la colonna role alla tabella profiles
ALTER TABLE public.profiles ADD COLUMN role app_role NOT NULL DEFAULT 'user';

-- Crea un enum per lo stato dei lead
CREATE TYPE public.lead_status AS ENUM ('nuovo', 'contattato', 'in_trattativa', 'chiuso_vinto', 'chiuso_perso');

-- Aggiungi la colonna status alla tabella leads
ALTER TABLE public.leads ADD COLUMN status lead_status NOT NULL DEFAULT 'nuovo';

-- Crea una funzione per verificare se un utente ha un ruolo specifico
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = _user_id
      AND role = _role
  )
$$;

-- Abilita RLS sulla tabella profiles se non già abilitata
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Crea policy per permettere agli utenti di vedere il proprio profilo
CREATE POLICY "Users can view own profile" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = id);

-- Crea policy per permettere agli admin di vedere tutti i profili
CREATE POLICY "Admins can view all profiles" 
  ON public.profiles 
  FOR SELECT 
  USING (public.has_role(auth.uid(), 'admin'));

-- Abilita RLS sulla tabella leads se non già abilitata
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Crea policy per permettere agli admin di vedere tutti i lead
CREATE POLICY "Admins can view all leads" 
  ON public.leads 
  FOR ALL 
  USING (public.has_role(auth.uid(), 'admin'));

-- Crea policy per permettere agli admin di modificare tutti i lead
CREATE POLICY "Admins can update all leads" 
  ON public.leads 
  FOR UPDATE 
  USING (public.has_role(auth.uid(), 'admin'));
