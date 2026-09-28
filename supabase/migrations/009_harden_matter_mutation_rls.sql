-- 009_harden_matter_mutation_rls
-- Harden MatterVault RLS: deny direct authenticated mutations, keep tenant SELECT, mutations via service-role/RPC only.

-- matters: drop direct authenticated mutation policies (INSERT/UPDATE/DELETE), retain SELECT only
drop policy if exists "matters_member_insert" on public.matters;
drop policy if exists "matters_member_update" on public.matters;
drop policy if exists "matters_owner_admin_delete" on public.matters;

-- Ensure SELECT remains
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='matters' and policyname='matters_member_select'
  ) then
    create policy "matters_member_select" on public.matters for select using (public.is_firm_member(firm_id));
  end if;
end $$;

-- checklist_items: drop all direct authenticated mutation policies, retain SELECT only
drop policy if exists "checklist_member_insert" on public.checklist_items;
drop policy if exists "checklist_member_update" on public.checklist_items;
drop policy if exists "checklist_member_delete" on public.checklist_items;

do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='checklist_items' and policyname='checklist_member_select'
  ) then
    create policy "checklist_member_select" on public.checklist_items for select using (public.is_firm_member(firm_id));
  end if;
end $$;

-- matter_documents: ensure only SELECT for authenticated (already correct), drop any accidental mutation policies if present
drop policy if exists "matter_documents_member_insert" on public.matter_documents;
drop policy if exists "matter_documents_member_update" on public.matter_documents;
drop policy if exists "matter_documents_member_delete" on public.matter_documents;
drop policy if exists "matter_documents_owner_admin_insert" on public.matter_documents;
drop policy if exists "matter_documents_owner_admin_update" on public.matter_documents;
drop policy if exists "matter_documents_owner_admin_delete" on public.matter_documents;

-- matter_notes: ensure only SELECT (already correct), drop any mutation policies if added
drop policy if exists "matter_notes_member_insert" on public.matter_notes;
drop policy if exists "matter_notes_member_update" on public.matter_notes;
drop policy if exists "matter_notes_member_delete" on public.matter_notes;
drop policy if exists "matter_notes_owner_admin_insert" on public.matter_notes;
drop policy if exists "matter_notes_owner_admin_update" on public.matter_notes;
drop policy if exists "matter_notes_owner_admin_delete" on public.matter_notes;

-- matter_activity: ensure only SELECT (already correct), drop any mutation policies if added
drop policy if exists "matter_activity_member_insert" on public.matter_activity;
drop policy if exists "matter_activity_member_update" on public.matter_activity;
drop policy if exists "matter_activity_member_delete" on public.matter_activity;
drop policy if exists "matter_activity_authenticated_insert" on public.matter_activity;

-- Confirm RLS still enabled (idempotent)
alter table public.matters enable row level security;
alter table public.checklist_items enable row level security;
alter table public.matter_documents enable row level security;
alter table public.matter_notes enable row level security;
alter table public.matter_activity enable row level security;
