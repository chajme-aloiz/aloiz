-- Aloiz: jazyk aplikace. Spusťte celé v Supabase > SQL Editor > New query > Run.
-- Dá se spustit opakovaně, nic nesmaže. Podle jazyka se píšou upozornění, kalendář a položky z přeposlaných e-mailů.
alter table public.profiles add column if not exists lang text not null default '';
