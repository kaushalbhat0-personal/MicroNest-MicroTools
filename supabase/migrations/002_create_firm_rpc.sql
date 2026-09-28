-- 002_create_firm_rpc
-- Atomic firm + OWNER membership via RPC
-- No future tables

create or replace function public.create_firm_for_current_user(p_name text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid;
  v_slug text;
  v_base text;
  v_firm_id uuid;
  v_suffix text;
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  if p_name is null or char_length(trim(p_name)) < 2 or char_length(p_name) > 200 then
    raise exception 'Invalid firm name';
  end if;

  -- V1 single-firm rule: user may not already be a member of any firm
  if exists (select 1 from public.firm_members where user_id = v_user_id) then
    raise exception 'Firm already exists for this account';
  end if;

  -- Generate slug server-side (no client control)
  v_base := lower(trim(p_name));
  v_base := regexp_replace(v_base, '[^a-z0-9]+', '-', 'g');
  v_base := regexp_replace(v_base, '(^-+|-+$)', '', 'g');
  if v_base is null or v_base = '' then
    v_base := 'firm';
  end if;
  v_suffix := substring(extensions.gen_random_uuid()::text from 1 for 4);
  v_suffix := replace(lower(v_suffix), '-', 'x');
  v_slug := substring(v_base || '-' || v_suffix from 1 for 60);

  -- Ensure slug uniqueness (retry once on collision is handled by caller; unique violation will rollback)
  insert into public.firms (name, slug, owner_id)
  values (trim(p_name), v_slug, v_user_id)
  returning id into v_firm_id;

  insert into public.firm_members (firm_id, user_id, role)
  values (v_firm_id, v_user_id, 'owner'::public.firm_role);

  return v_firm_id;
exception when others then
  raise;
end;
$$;

-- Lock down: only authenticated may execute; no anon, no public
revoke all on function public.create_firm_for_current_user(text) from public;
grant execute on function public.create_firm_for_current_user(text) to authenticated;

-- Harden firm_members insert: remove bootstrap backdoor (RPC is now the only owner-creation path)
drop policy if exists "firm_members_owner_admin_insert" on public.firm_members;
create policy "firm_members_owner_admin_insert" on public.firm_members for insert
  with check (public.firm_role(firm_id) in ('owner','admin'));

-- Ensure helper search_path already locked in 001 remains
