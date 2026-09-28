-- 003_clients
-- Phase 2A: client foundation — minimal supporting data for notices

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  firm_id uuid not null references public.firms(id) on delete cascade,
  name text not null check (char_length(trim(name)) between 1 and 200),
  email text check (email is null or email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  phone text check (phone is null or char_length(phone) between 7 and 30),
  address jsonb,
  is_archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_clients_firm on public.clients(firm_id);
create index if not exists idx_clients_firm_archived on public.clients(firm_id, is_archived);
create index if not exists idx_clients_name on public.clients using gin (to_tsvector('simple', name));

-- updated_at
drop trigger if exists trg_clients_updated_at on public.clients;
create trigger trg_clients_updated_at before update on public.clients for each row execute function public.set_updated_at();

-- RLS
alter table public.clients enable row level security;

-- View: any firm member may read own firm's clients
drop policy if exists "clients_member_select" on public.clients;
create policy "clients_member_select" on public.clients for select
  using (public.is_firm_member(firm_id));

-- Mutations: only owner/admin may create/update/delete (member view-only) — narrowest
drop policy if exists "clients_owner_admin_insert" on public.clients;
create policy "clients_owner_admin_insert" on public.clients for insert
  with check (public.firm_role(firm_id) in ('owner','admin'));

drop policy if exists "clients_owner_admin_update" on public.clients;
create policy "clients_owner_admin_update" on public.clients for update
  using (public.firm_role(firm_id) in ('owner','admin'))
  with check (public.firm_role(firm_id) in ('owner','admin'));

drop policy if exists "clients_owner_admin_delete" on public.clients;
create policy "clients_owner_admin_delete" on public.clients for delete
  using (public.firm_role(firm_id) in ('owner','admin'));
