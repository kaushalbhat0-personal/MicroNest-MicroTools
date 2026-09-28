-- 004_notices
-- Phase 2B: notice foundation — no workflow, no activity, no documents

do $$ begin create type notice_authority as enum ('income_tax','gst','tds','other'); exception when duplicate_object then null; end $$;
do $$ begin create type notice_type as enum ('scrutiny','intimation','demand','show_cause','other'); exception when duplicate_object then null; end $$;
do $$ begin create type notice_priority as enum ('low','medium','high','urgent'); exception when duplicate_object then null; end $$;
do $$ begin create type notice_status as enum ('received','review','assigned','awaiting_client','drafting','internal_review','ready_to_submit','submitted','follow_up','closed'); exception when duplicate_object then null; end $$;

create table if not exists public.notices (
  id uuid primary key default gen_random_uuid(),
  firm_id uuid not null references public.firms(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete restrict,
  reference_number text,
  authority notice_authority not null,
  notice_type notice_type not null,
  received_date date,
  response_deadline date not null,
  priority notice_priority not null default 'medium',
  assigned_to uuid references public.users(id) on delete set null,
  status notice_status not null default 'received',
  next_action text,
  next_action_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (response_deadline >= received_date or received_date is null),
  check (char_length(reference_number) <= 200),
  check (char_length(next_action) <= 500)
);

create index if not exists idx_notices_firm on public.notices(firm_id);
create index if not exists idx_notices_firm_status on public.notices(firm_id, status);
create index if not exists idx_notices_deadline on public.notices(response_deadline);
create index if not exists idx_notices_client on public.notices(client_id);
create index if not exists idx_notices_assigned on public.notices(assigned_to);

drop trigger if exists trg_notices_updated_at on public.notices;
create trigger trg_notices_updated_at before update on public.notices for each row execute function public.set_updated_at();

alter table public.notices enable row level security;

-- Read: any firm member may view own firm's notices
drop policy if exists "notices_member_select" on public.notices;
create policy "notices_member_select" on public.notices for select
  using (public.is_firm_member(firm_id));

-- Mutations: owner/admin/member may create/edit where firm_role check passes
-- But assignment is further restricted in service layer; RLS allows member to create
drop policy if exists "notices_member_insert" on public.notices;
create policy "notices_member_insert" on public.notices for insert
  with check (public.is_firm_member(firm_id));

drop policy if exists "notices_member_update" on public.notices;
create policy "notices_member_update" on public.notices for update
  using (public.is_firm_member(firm_id))
  with check (public.is_firm_member(firm_id));

drop policy if exists "notices_owner_admin_delete" on public.notices;
create policy "notices_owner_admin_delete" on public.notices for delete
  using (public.firm_role(firm_id) in ('owner','admin'));
