-- Aloiz: doplnění databáze pro úpravy z prvního testování.
-- Spusťte celé v Supabase > SQL Editor > New query > Run. Jde spustit i opakovaně.
--
-- Co přidá:
--  * tabulku "sources" (zdroje): původní text, e-mail, fotky a PDF, ze kterých položky vznikly
--  * úložiště souborů "sources" pro fotky a PDF (každý vidí jen svoje)
--  * u položky odkaz na zdroj (source_id) a na událost, ke které patří (parent_id)
--  * v profilu nastavení, co se ukládá rovnou bez kontroly (auto_types)

create table if not exists public.sources (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  kind text not null default '',          -- 'foto', 'pdf', 'text', 'hlas', 'email'
  label text not null default '',         -- např. "Z fotky" nebo "E-mail: Besídka"
  note text not null default '',          -- poznámka rodiče k souborům
  body text not null default '',          -- text zprávy nebo e-mailu
  files jsonb not null default '[]',      -- [{path, type, name}] v úložišti "sources"
  created_at timestamptz not null default now()
);
create index if not exists sources_user_idx on public.sources (user_id);
alter table public.sources enable row level security;
drop policy if exists "own sources" on public.sources;
create policy "own sources" on public.sources for all using (user_id = auth.uid()) with check (user_id = auth.uid());

alter table public.items add column if not exists parent_id text not null default '';
alter table public.items add column if not exists source_id uuid references public.sources on delete set null;
alter table public.inbox add column if not exists source_id uuid references public.sources on delete set null;
alter table public.profiles add column if not exists auto_types text[] not null default '{}';

grant select, insert, update, delete on public.sources to authenticated;
grant all on public.sources to service_role;

-- Úložiště pro fotky a PDF. Soubory leží ve složce s id uživatele, nikdo jiný k nim nemá přístup.
insert into storage.buckets (id, name, public, file_size_limit)
values ('sources', 'sources', false, 10485760)
on conflict (id) do nothing;

drop policy if exists "aloiz own files read" on storage.objects;
create policy "aloiz own files read" on storage.objects for select to authenticated
  using (bucket_id = 'sources' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "aloiz own files add" on storage.objects;
create policy "aloiz own files add" on storage.objects for insert to authenticated
  with check (bucket_id = 'sources' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "aloiz own files delete" on storage.objects;
create policy "aloiz own files delete" on storage.objects for delete to authenticated
  using (bucket_id = 'sources' and (storage.foldername(name))[1] = auth.uid()::text);

-- Ať Data API hned ví o nových sloupcích
notify pgrst, 'reload schema';
