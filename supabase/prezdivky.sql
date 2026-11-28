-- Aloiz: přezdívky u členů rodiny (např. "Alži, Bětka"), aby je AI poznala ve zprávách ze školy.
-- Spusťte v Supabase > SQL Editor > New query > Run. Jde spustit i opakovaně.

alter table public.children add column if not exists nicks text not null default '';

-- Ať Data API hned ví o novém sloupci
notify pgrst, 'reload schema';
