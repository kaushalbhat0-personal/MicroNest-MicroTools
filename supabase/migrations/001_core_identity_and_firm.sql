-- 001_core_identity_and_firm
-- Phase 1A: users, firms, firm_members + helpers + RLS
-- No clients/notices/documents/activity in this phase.

-- Extensions
create extension if not exists "pgcrypto" with schema extensions;

-- Enums
do $$ begin
  create type firm_role as enum ('owner', 'admin', 'member');
exception when duplicate_object then null; end $$;

do $$ begin
  create type firm_status as enum ('active', 'suspended');
exception when duplicate_object then null; end $$;

-- 1) application users (linked to auth.users.id)
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Keep email unique where not null
create unique index if not exists uq_users_email on public.users (email);

-- 2) firms (tenant)
create table if not exists public.firms (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 200),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  owner_id uuid not null references public.users(id) on delete restrict,
  status firm_status not null default 'active',
  country char(2) not null default 'IN',
  currency char(3) not null default 'INR',
  locale text not null default 'en-IN',
  timezone text not null default 'Asia/Kolkata',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_firms_owner on public.firms(owner_id);

-- 3) firm_members
create table if not exists public.firm_members (
  id uuid primary key default gen_random_uuid(),
  firm_id uuid not null references public.firms(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  role firm_role not null,
  invited_at timestamptz,
  joined_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint uq_firm_member unique (firm_id, user_id)
);
create index if not exists idx_firm_members_firm on public.firm_members(firm_id);
create index if not exists idx_firm_members_user on public.firm_members(user_id);

-- updated_at triggers
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end; $$;

drop trigger if exists trg_users_updated_at on public.users;
create trigger trg_users_updated_at before update on public.users for each row execute function public.set_updated_at();

drop trigger if exists trg_firms_updated_at on public.firms;
create trigger trg_firms_updated_at before update on public.firms for each row execute function public.set_updated_at();

-- handle_new_user: create public.users row when auth.users inserted
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.users (id, email, name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Helpers (SECURITY DEFINER, controlled search_path, avoid recursion)
create or replace function public.is_firm_member(target_firm uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.firm_members where firm_id = target_firm and user_id = auth.uid());
$$;

create or replace function public.firm_role(target_firm uuid)
returns firm_role language sql stable security definer set search_path = '' as $$
  select role from public.firm_members where firm_id = target_firm and user_id = auth.uid() limit 1;
$$;

-- RLS enable
alter table public.users enable row level security;
alter table public.firms enable row level security;
alter table public.firm_members enable row level security;

-- Users policies
drop policy if exists "users_self_select" on public.users;
create policy "users_self_select" on public.users for select using (id = auth.uid());

drop policy if exists "users_self_update" on public.users;
create policy "users_self_update" on public.users for update using (id = auth.uid()) with check (id = auth.uid());

-- Firms policies
drop policy if exists "firms_member_select" on public.firms;
create policy "firms_member_select" on public.firms for select using (public.is_firm_member(id));

drop policy if exists "firms_authenticated_insert" on public.firms;
create policy "firms_authenticated_insert" on public.firms for insert with check (auth.uid() = owner_id);

drop policy if exists "firms_owner_admin_update" on public.firms;
create policy "firms_owner_admin_update" on public.firms for update
  using (public.firm_role(id) in ('owner','admin'))
  with check (public.firm_role(id) in ('owner','admin'));

-- No delete policy for firms — Phase 1 has no firm deletion. Service role only if ever needed.

-- Firm members policies
drop policy if exists "firm_members_member_select" on public.firm_members;
create policy "firm_members_member_select" on public.firm_members for select using (public.is_firm_member(firm_id));

drop policy if exists "firm_members_owner_admin_insert" on public.firm_members;
create policy "firm_members_owner_admin_insert" on public.firm_members for insert
  with check (
    public.firm_role(firm_id) in ('owner','admin')
    or not exists (select 1 from public.firm_members where firm_id = firm_members.firm_id) -- allow first member (owner bootstrap) when table empty for that firm
  );

drop policy if exists "firm_members_owner_admin_update" on public.firm_members;
create policy "firm_members_owner_admin_update" on public.firm_members for update
  using (public.firm_role(firm_id) in ('owner','admin'))
  with check (public.firm_role(firm_id) in ('owner','admin'));

drop policy if exists "firm_members_owner_admin_delete" on public.firm_members;
create policy "firm_members_owner_admin_delete" on public.firm_members for delete
  using (public.firm_role(firm_id) in ('owner','admin'));

-- Ensure service_role bypass is not granted to anon/authenticated beyond policies above
