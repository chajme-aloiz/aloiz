-- Aloiz: databáze. Spusťte celé v Supabase > SQL Editor > New query > Run.

create extension if not exists pgcrypto;

-- Profil rodiče: e-mail, další adresy pro přeposílání, tajný odkaz na kalendář
create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  email text,
  sender_emails text[] not null default '{}',
  feed_token text not null unique default encode(gen_random_bytes(18), 'hex'),
  created_at timestamptz not null default now()
);

create table if not exists public.children (
  id text primary key,
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  name text not null,
  cls text not null default '',
  school text not null default '',
  color text not null default '#E39A6B',
  created_at timestamptz not null default now()
);

create table if not exists public.items (
  id text primary key,
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  child_id text references public.children on delete cascade,
  type text not null default 'udalost' check (type in ('udalost','ukol','donest')),
  title text not null,
  due_date text not null default '',      -- YYYY-MM-DD nebo prázdné
  due_time text not null default '',      -- HH:MM nebo prázdné
  place text not null default '',
  note text not null default '',
  done boolean not null default false,
  source text not null default '',
  repeat_rule text not null default '',   -- '' nebo 'weekly'
  repeat_until text not null default '',
  skip_dates text[] not null default '{}',
  created_ms bigint not null default (extract(epoch from now()) * 1000)::bigint
);

-- Návrhy z přeposlaných e-mailů, čekají na kontrolu rodičem
create table if not exists public.inbox (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  source text not null default '',
  items jsonb not null default '[]',
  created_at timestamptz not null default now()
);

create index if not exists items_user_idx on public.items (user_id);
create index if not exists children_user_idx on public.children (user_id);
create index if not exists inbox_user_idx on public.inbox (user_id);
create index if not exists profiles_email_idx on public.profiles (lower(email));

alter table public.profiles enable row level security;
alter table public.children enable row level security;
alter table public.items enable row level security;
alter table public.inbox enable row level security;

-- Každý vidí a mění jen svoje data
drop policy if exists "own profile" on public.profiles;
create policy "own profile" on public.profiles for all using (id = auth.uid()) with check (id = auth.uid());
drop policy if exists "own children" on public.children;
create policy "own children" on public.children for all using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "own items" on public.items;
create policy "own items" on public.items for all using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "own inbox" on public.inbox;
create policy "own inbox" on public.inbox for select using (user_id = auth.uid());
drop policy if exists "delete own inbox" on public.inbox;
create policy "delete own inbox" on public.inbox for delete using (user_id = auth.uid());

-- Po registraci založit profil automaticky
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email) values (new.id, lower(new.email))
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Oprávnění pro Data API. Nové projekty Supabase je už nedávají automaticky,
-- bez nich končí čtení i ukládání chybou 403 (permission denied).
-- Které řádky kdo uvidí, dál hlídají pravidla RLS výše.
grant usage on schema public to anon, authenticated, service_role;
grant select, insert, update, delete on public.profiles, public.children, public.items to authenticated;
grant select, delete on public.inbox to authenticated;
grant all on public.profiles, public.children, public.items, public.inbox to service_role;

-- ---------- Ranní souhrn a upozornění ----------

-- Nastavení upozornění u každého rodiče
alter table public.profiles add column if not exists morning_on boolean not null default true;
alter table public.profiles add column if not exists morning_time text not null default '07:00';
alter table public.profiles add column if not exists evening_on boolean not null default false;
alter table public.profiles add column if not exists evening_time text not null default '19:00';
alter table public.profiles add column if not exists event_lead integer not null default 60;  -- minut před akcí s časem, 0 = nepřipomínat
alter table public.profiles add column if not exists tz text not null default 'Europe/Prague';

-- Upozornění u jedné položky: '' = podle nastavení, 'off' = žádné, číslo = minut před začátkem
-- (u celodenních se počítá od půlnoci, záporné číslo = až v ten den, např. -420 = v 7:00)
alter table public.items add column if not exists remind text not null default '';

-- Zařízení, na která se posílají upozornění (telefon, počítač)
create table if not exists public.push_subs (
  endpoint text primary key,
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  p256dh text not null,
  auth text not null,
  device text not null default '',
  created_at timestamptz not null default now()
);
create index if not exists push_subs_user_idx on public.push_subs (user_id);
alter table public.push_subs enable row level security;
drop policy if exists "own push" on public.push_subs;
create policy "own push" on public.push_subs for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Co už bylo odesláno, aby nic nepřišlo dvakrát
create table if not exists public.notify_log (
  user_id uuid not null references auth.users on delete cascade,
  key text not null,
  sent_at timestamptz not null default now(),
  primary key (user_id, key)
);
alter table public.notify_log enable row level security;

grant select, insert, update, delete on public.push_subs to authenticated;
grant all on public.push_subs, public.notify_log to service_role;
