-- Aloiz: ranní souhrn a upozornění. Spusťte celé v Supabase > SQL Editor > New query > Run.
-- Dá se spustit opakovaně, nic nesmaže.

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
