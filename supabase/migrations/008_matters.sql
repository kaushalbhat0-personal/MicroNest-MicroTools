-- 008_matters
-- MatterVault V1: matters, checklist_items, matter_documents, matter_notes, matter_activity + bucket + RPC

-- Enums
do $$ begin create type matter_type as enum ('civil','criminal','negotiable_instrument','rent','recovery','other'); exception when duplicate_object then null; end $$;
do $$ begin create type matter_status as enum ('open','ready','archived'); exception when duplicate_object then null; end $$;
do $$ begin create type checklist_status as enum ('pending','uploaded','verified','rejected'); exception when duplicate_object then null; end $$;

-- matters
create table if not exists public.matters (
  id uuid primary key default gen_random_uuid(),
  firm_id uuid not null references public.firms(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete restrict,
  title text not null check (char_length(trim(title)) between 1 and 200),
  matter_type matter_type not null,
  status matter_status not null default 'open',
  assigned_to uuid references public.users(id) on delete set null,
  next_action text check (next_action is null or char_length(next_action) <= 500),
  next_action_date date,
  deadline date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_matters_firm on public.matters(firm_id);
create index if not exists idx_matters_firm_status on public.matters(firm_id, status);
create index if not exists idx_matters_client on public.matters(client_id);
create index if not exists idx_matters_assigned on public.matters(assigned_to);
create index if not exists idx_matters_deadline on public.matters(deadline);
create index if not exists idx_matters_created on public.matters(created_at);

drop trigger if exists trg_matters_updated_at on public.matters;
create trigger trg_matters_updated_at before update on public.matters for each row execute function public.set_updated_at();

alter table public.matters enable row level security;

drop policy if exists "matters_member_select" on public.matters;
create policy "matters_member_select" on public.matters for select using (public.is_firm_member(firm_id));

drop policy if exists "matters_member_insert" on public.matters;
create policy "matters_member_insert" on public.matters for insert with check (public.is_firm_member(firm_id));

drop policy if exists "matters_member_update" on public.matters;
create policy "matters_member_update" on public.matters for update using (public.is_firm_member(firm_id)) with check (public.is_firm_member(firm_id));

drop policy if exists "matters_owner_admin_delete" on public.matters;
create policy "matters_owner_admin_delete" on public.matters for delete using (public.firm_role(firm_id) in ('owner','admin'));

-- matter_documents (must exist before checklist_items FK)
create table if not exists public.matter_documents (
  id uuid primary key default gen_random_uuid(),
  firm_id uuid not null references public.firms(id) on delete cascade,
  matter_id uuid not null references public.matters(id) on delete cascade,
  uploaded_by uuid not null references public.users(id) on delete restrict,
  file_name text not null check (char_length(file_name) between 1 and 255),
  storage_path text not null unique check (char_length(storage_path) between 1 and 500),
  mime_type text not null,
  file_size bigint not null check (file_size > 0 and file_size <= 10485760),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_matter_documents_firm on public.matter_documents(firm_id);
create index if not exists idx_matter_documents_matter on public.matter_documents(matter_id);
create index if not exists idx_matter_documents_uploaded on public.matter_documents(uploaded_by);

drop trigger if exists trg_matter_documents_updated_at on public.matter_documents;
create trigger trg_matter_documents_updated_at before update on public.matter_documents for each row execute function public.set_updated_at();

alter table public.matter_documents enable row level security;

drop policy if exists "matter_documents_member_select" on public.matter_documents;
create policy "matter_documents_member_select" on public.matter_documents for select using (public.is_firm_member(firm_id));

-- checklist_items
create table if not exists public.checklist_items (
  id uuid primary key default gen_random_uuid(),
  matter_id uuid not null references public.matters(id) on delete cascade,
  firm_id uuid not null references public.firms(id) on delete cascade,
  label text not null check (char_length(trim(label)) between 1 and 100),
  required boolean not null default true,
  status checklist_status not null default 'pending',
  document_id uuid references public.matter_documents(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_checklist_matter_label unique (matter_id, label)
);

create index if not exists idx_checklist_matter on public.checklist_items(matter_id);
create index if not exists idx_checklist_firm on public.checklist_items(firm_id);
create index if not exists idx_checklist_matter_status on public.checklist_items(matter_id, status);

drop trigger if exists trg_checklist_updated_at on public.checklist_items;
create trigger trg_checklist_updated_at before update on public.checklist_items for each row execute function public.set_updated_at();

alter table public.checklist_items enable row level security;

drop policy if exists "checklist_member_select" on public.checklist_items;
create policy "checklist_member_select" on public.checklist_items for select using (public.is_firm_member(firm_id));

drop policy if exists "checklist_member_insert" on public.checklist_items;
create policy "checklist_member_insert" on public.checklist_items for insert with check (public.is_firm_member(firm_id));

drop policy if exists "checklist_member_update" on public.checklist_items;
create policy "checklist_member_update" on public.checklist_items for update using (public.is_firm_member(firm_id)) with check (public.is_firm_member(firm_id));

drop policy if exists "checklist_member_delete" on public.checklist_items;
create policy "checklist_member_delete" on public.checklist_items for delete using (public.is_firm_member(firm_id));

-- matter_notes
create table if not exists public.matter_notes (
  id uuid primary key default gen_random_uuid(),
  firm_id uuid not null references public.firms(id) on delete cascade,
  matter_id uuid not null references public.matters(id) on delete cascade,
  author_id uuid not null references public.users(id) on delete restrict,
  content text not null check (char_length(content) between 1 and 5000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_matter_notes_firm on public.matter_notes(firm_id);
create index if not exists idx_matter_notes_matter on public.matter_notes(matter_id);
create index if not exists idx_matter_notes_author on public.matter_notes(author_id);

drop trigger if exists trg_matter_notes_updated_at on public.matter_notes;
create trigger trg_matter_notes_updated_at before update on public.matter_notes for each row execute function public.set_updated_at();

alter table public.matter_notes enable row level security;

drop policy if exists "matter_notes_member_select" on public.matter_notes;
create policy "matter_notes_member_select" on public.matter_notes for select using (public.is_firm_member(firm_id));

-- matter_activity
create table if not exists public.matter_activity (
  id uuid primary key default gen_random_uuid(),
  firm_id uuid not null references public.firms(id) on delete cascade,
  matter_id uuid not null references public.matters(id) on delete cascade,
  actor_id uuid not null references public.users(id) on delete restrict,
  action text not null check (action in ('matter_created','checklist_issued','document_uploaded','document_verified','note_added','matter_ready','matter_archived')),
  from_status matter_status,
  to_status matter_status,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_matter_activity_firm on public.matter_activity(firm_id);
create index if not exists idx_matter_activity_matter on public.matter_activity(matter_id);
create index if not exists idx_matter_activity_created on public.matter_activity(created_at);

alter table public.matter_activity enable row level security;

drop policy if exists "matter_activity_member_select" on public.matter_activity;
create policy "matter_activity_member_select" on public.matter_activity for select using (public.is_firm_member(firm_id));
-- No insert/update/delete policies for authenticated — append-only via service_role/RPC

-- Storage bucket private
insert into storage.buckets (id, name, public)
values ('matter-documents', 'matter-documents', false)
on conflict (id) do nothing;

-- Update bucket to ensure private if was inserted before
update storage.buckets set public = false where id = 'matter-documents';

-- RPC: verify_checklist_item_and_maybe_ready
create or replace function public.verify_checklist_item_and_maybe_ready(p_checklist_item_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid;
  v_firm_id uuid;
  v_matter_id uuid;
  v_matter_status public.matter_status;
  v_item_status public.checklist_status;
  v_role public.firm_role;
  v_all_verified boolean;
begin
  v_user_id := auth.uid();
  if v_user_id is null then raise exception 'Not authenticated'; end if;

  -- Lock checklist item
  select firm_id, matter_id, status into v_firm_id, v_matter_id, v_item_status
  from public.checklist_items where id = p_checklist_item_id for update;
  if not found then raise exception 'Checklist item not found'; end if;

  if not public.is_firm_member(v_firm_id) then raise exception 'Not in firm'; end if;

  select role into v_role from public.firm_members where firm_id = v_firm_id and user_id = v_user_id limit 1;
  if v_role is null then raise exception 'No membership'; end if;

  if v_role not in ('owner','admin') then raise exception 'Only owner/admin can verify'; end if;

  -- Validate status transition: only UPLOADED -> VERIFIED allowed via this RPC
  if v_item_status <> 'uploaded' then raise exception 'Checklist item must be uploaded to verify, got %', v_item_status; end if;

  -- Lock matter
  select status into v_matter_status from public.matters where id = v_matter_id for update;
  if not found then raise exception 'Matter not found'; end if;
  if v_matter_status = 'archived' then raise exception 'Matter is archived'; end if;

  -- Update item to verified
  update public.checklist_items set status = 'verified', updated_at = now() where id = p_checklist_item_id;

  insert into public.matter_activity (firm_id, matter_id, actor_id, action, metadata)
  values (v_firm_id, v_matter_id, v_user_id, 'document_verified', jsonb_build_object('checklist_item_id', p_checklist_item_id));

  -- Check if all required items are verified
  select not exists (
    select 1 from public.checklist_items where matter_id = v_matter_id and required = true and status <> 'verified'
  ) into v_all_verified;

  if v_all_verified and v_matter_status = 'open' then
    update public.matters set status = 'ready', updated_at = now() where id = v_matter_id;
    insert into public.matter_activity (firm_id, matter_id, actor_id, action, from_status, to_status)
    values (v_firm_id, v_matter_id, v_user_id, 'matter_ready', 'open', 'ready');
  end if;
end;
$$;

revoke all on function public.verify_checklist_item_and_maybe_ready(uuid) from public;
grant execute on function public.verify_checklist_item_and_maybe_ready(uuid) to authenticated;

-- RPC: reject_checklist_item
create or replace function public.reject_checklist_item(p_checklist_item_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid;
  v_firm_id uuid;
  v_item_status public.checklist_status;
  v_role public.firm_role;
begin
  v_user_id := auth.uid();
  if v_user_id is null then raise exception 'Not authenticated'; end if;

  select firm_id, status into v_firm_id, v_item_status from public.checklist_items where id = p_checklist_item_id for update;
  if not found then raise exception 'Checklist item not found'; end if;
  if not public.is_firm_member(v_firm_id) then raise exception 'Not in firm'; end if;
  select role into v_role from public.firm_members where firm_id = v_firm_id and user_id = v_user_id limit 1;
  if v_role not in ('owner','admin') then raise exception 'Only owner/admin can reject'; end if;
  if v_item_status <> 'uploaded' then raise exception 'Only uploaded items can be rejected, got %', v_item_status; end if;
  update public.checklist_items set status = 'rejected', updated_at = now() where id = p_checklist_item_id;
end;
$$;

revoke all on function public.reject_checklist_item(uuid) from public;
grant execute on function public.reject_checklist_item(uuid) to authenticated;

-- RPC: archive_matter
create or replace function public.archive_matter(p_matter_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid;
  v_firm_id uuid;
  v_status public.matter_status;
  v_role public.firm_role;
begin
  v_user_id := auth.uid();
  if v_user_id is null then raise exception 'Not authenticated'; end if;
  select firm_id, status into v_firm_id, v_status from public.matters where id = p_matter_id for update;
  if not found then raise exception 'Matter not found'; end if;
  if not public.is_firm_member(v_firm_id) then raise exception 'Not in firm'; end if;
  select role into v_role from public.firm_members where firm_id = v_firm_id and user_id = v_user_id limit 1;
  if v_role not in ('owner','admin') then raise exception 'Only owner/admin can archive'; end if;
  if v_status = 'archived' then raise exception 'Already archived'; end if;
  if v_status not in ('open','ready') then raise exception 'Invalid status for archive'; end if;
  update public.matters set status = 'archived', updated_at = now() where id = p_matter_id;
  insert into public.matter_activity (firm_id, matter_id, actor_id, action, from_status, to_status)
  values (v_firm_id, p_matter_id, v_user_id, 'matter_archived', v_status, 'archived');
end;
$$;

revoke all on function public.archive_matter(uuid) from public;
grant execute on function public.archive_matter(uuid) to authenticated;
