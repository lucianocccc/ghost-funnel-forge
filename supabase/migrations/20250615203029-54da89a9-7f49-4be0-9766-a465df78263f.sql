
-- 1. Companies Table (società/aziende)
CREATE TABLE public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  owner_id UUID REFERENCES auth.users NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Membership Table (collega utenti a società)
CREATE TABLE public.company_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  role TEXT DEFAULT 'member',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(company_id, user_id)
);

-- 3. Subscribers Table (abbonamenti utenti, come da Stripe guide)
CREATE TABLE IF NOT EXISTS public.subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  stripe_customer_id TEXT,
  subscribed BOOLEAN NOT NULL DEFAULT false,
  subscription_tier TEXT,
  subscription_end TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. RLS per tutte le tabelle

-- Per companies: Si può vedere solo se owner o membro
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Company owner or member can select"
  ON public.companies
  FOR SELECT
  USING (
    owner_id = auth.uid() OR 
    id IN (SELECT company_id FROM public.company_memberships WHERE user_id = auth.uid())
  );

CREATE POLICY "Company owner can insert" ON public.companies
  FOR INSERT WITH CHECK (owner_id = auth.uid());

-- Aggiornamenti permessi solo all'owner:
CREATE POLICY "Company owner can update" ON public.companies
  FOR UPDATE USING (owner_id = auth.uid());

-- Membri possono vedere solo le membership delle società dove sono membri
ALTER TABLE public.company_memberships ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Memberships per user" ON public.company_memberships
  FOR SELECT
  USING (user_id = auth.uid() OR
         company_id IN (SELECT company_id FROM public.company_memberships WHERE user_id = auth.uid()));

CREATE POLICY "User can join company" ON public.company_memberships
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Subscribers RLS
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can see/update their own subscription"
  ON public.subscribers
  FOR SELECT USING (user_id = auth.uid() OR email = auth.email());
CREATE POLICY "User can update their own subscription"
  ON public.subscribers FOR UPDATE USING (user_id = auth.uid());

-- NB: Per le funzioni Edge di Stripe (abbonamento) servirà la Service Role Key. Non restringere troppo.

