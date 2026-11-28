-- Aloiz: posílání zpráv přes WhatsApp (fotka, screenshot, PDF, text → událost nebo úkol).
-- Spusťte v Supabase > SQL Editor > New query > Run. Jde spustit i opakovaně.

-- Propojené číslo (jen číslice, např. 420777123456) a jednorázový kód pro propojení
alter table public.profiles add column if not exists wa_phone text;
alter table public.profiles add column if not exists wa_code text;
alter table public.profiles add column if not exists wa_code_at timestamptz;
create unique index if not exists profiles_wa_phone_idx on public.profiles (wa_phone) where wa_phone is not null;
create index if not exists profiles_wa_code_idx on public.profiles (wa_code) where wa_code is not null;

-- Číslo smí zapsat jen server po ověření kódem z WhatsAppu. Aplikace ho umí jen odpojit (smazat).
create or replace function public.guard_wa_phone() returns trigger language plpgsql as $$
begin
  if current_user not in ('service_role', 'postgres', 'supabase_admin') and new.wa_phone is not null
     and (tg_op = 'INSERT' or new.wa_phone is distinct from old.wa_phone) then
    raise exception 'wa_phone can only be set by the server';
  end if;
  return new;
end $$;
drop trigger if exists guard_wa_phone on public.profiles;
create trigger guard_wa_phone before insert or update on public.profiles
  for each row execute function public.guard_wa_phone();

-- Už zpracované zprávy, aby se nic neuložilo dvakrát, když WhatsApp zprávu pošle znovu
create table if not exists public.wa_seen (
  id text primary key,
  at timestamptz not null default now()
);
alter table public.wa_seen enable row level security;
grant all on public.wa_seen to service_role;

notify pgrst, 'reload schema';
