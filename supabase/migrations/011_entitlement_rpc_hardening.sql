-- 011_entitlement_rpc_hardening
-- P1: enforce microtool subscriptions in SECURITY DEFINER RPCs.
-- Service-layer requireEntitlement is primary; RPC adds defense-in-depth for direct rpc calls.
-- Preserves existing is_firm_member/role checks, SECURITY DEFINER, search_path.

-- transition_notice: NoticeFlow
create or replace function public.transition_notice(
  p_notice_id uuid,
  p_target_status notice_status,
  p_target_assigned_to uuid
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid;
  v_firm_id uuid;
  v_current_status public.notice_status;
  v_current_assigned uuid;
  v_role public.firm_role;
  v_valid boolean := false;
begin
  v_user_id := auth.uid();
  if v_user_id is null then raise exception 'Not authenticated'; end if;

  select firm_id, status, assigned_to into v_firm_id, v_current_status, v_current_assigned
  from public.notices where id = p_notice_id for update;
  if not found then raise exception 'Notice not found'; end if;

  if not public.is_firm_member(v_firm_id) then raise exception 'Not in firm'; end if;

  if not public.is_firm_subscribed(v_firm_id, 'noticeflow'::public.microtool_product) then
    raise exception 'Not subscribed to noticeflow';
  end if;

  select role into v_role from public.firm_members where firm_id = v_firm_id and user_id = v_user_id limit 1;
  if v_role is null then raise exception 'No membership'; end if;

  if p_target_assigned_to is not null then
    if not exists (select 1 from public.firm_members where firm_id = v_firm_id and user_id = p_target_assigned_to) then
      raise exception 'Assigned user must belong to firm';
    end if;
  end if;

  case
    when v_current_status = 'received' and p_target_status = 'review' then v_valid := true;
    when v_current_status = 'review' and p_target_status = 'assigned' then
      if p_target_assigned_to is null then raise exception 'assigned_to required'; end if;
      v_valid := true;
    when v_current_status = 'review' and p_target_status = 'drafting' then v_valid := true;
    when v_current_status = 'assigned' and p_target_status = 'awaiting_client' then v_valid := true;
    when v_current_status = 'assigned' and p_target_status = 'drafting' then v_valid := true;
    when v_current_status = 'awaiting_client' and p_target_status = 'drafting' then v_valid := true;
    when v_current_status = 'drafting' and p_target_status = 'internal_review' then v_valid := true;
    when v_current_status = 'internal_review' and p_target_status = 'drafting' then v_valid := true;
    when v_current_status = 'internal_review' and p_target_status = 'ready_to_submit' then v_valid := true;
    when v_current_status = 'ready_to_submit' and p_target_status = 'submitted' then v_valid := true;
    when v_current_status = 'submitted' and p_target_status = 'follow_up' then v_valid := true;
    when v_current_status = 'follow_up' and p_target_status = 'closed' then v_valid := true;
    when v_current_status = 'closed' and p_target_status = 'review' then v_valid := true;
    else v_valid := false;
  end case;

  if not v_valid then raise exception 'Invalid transition % -> %', v_current_status, p_target_status; end if;

  if v_role = 'member' then
    if v_current_assigned is distinct from v_user_id then
      raise exception 'Member may only transition own assigned notice';
    end if;
    if p_target_status in ('ready_to_submit','submitted','follow_up','closed') then
      raise exception 'Member not allowed for %', p_target_status;
    end if;
    if v_current_status = 'closed' and p_target_status = 'review' then
      raise exception 'Member cannot reopen';
    end if;
    if p_target_assigned_to is not null and p_target_assigned_to <> v_user_id then
      raise exception 'Member cannot assign to another';
    end if;
    if v_current_status = 'review' and p_target_status = 'assigned' then
      raise exception 'Member cannot assign';
    end if;
  end if;

  if p_target_status in ('ready_to_submit','submitted','follow_up','closed') and v_role not in ('owner','admin') then
    raise exception 'Only owner/admin for %', p_target_status;
  end if;
  if v_current_status = 'closed' and p_target_status = 'review' and v_role not in ('owner','admin') then
    raise exception 'Only owner/admin can reopen';
  end if;

  update public.notices
  set status = p_target_status,
      assigned_to = coalesce(p_target_assigned_to, assigned_to),
      updated_at = now()
  where id = p_notice_id;

  insert into public.activity_log (firm_id, notice_id, actor_id, action, from_status, to_status, metadata)
  values (v_firm_id, p_notice_id, v_user_id, 'status_changed', v_current_status, p_target_status, null);
end;
$$;

revoke all on function public.transition_notice(uuid, notice_status, uuid) from public;
grant execute on function public.transition_notice(uuid, notice_status, uuid) to authenticated;

-- verify_checklist_item_and_maybe_ready: MatterVault
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

  select firm_id, matter_id, status into v_firm_id, v_matter_id, v_item_status
  from public.checklist_items where id = p_checklist_item_id for update;
  if not found then raise exception 'Checklist item not found'; end if;

  if not public.is_firm_member(v_firm_id) then raise exception 'Not in firm'; end if;

  if not public.is_firm_subscribed(v_firm_id, 'mattervault'::public.microtool_product) then
    raise exception 'Not subscribed to mattervault';
  end if;

  select role into v_role from public.firm_members where firm_id = v_firm_id and user_id = v_user_id limit 1;
  if v_role is null then raise exception 'No membership'; end if;

  if v_role not in ('owner','admin') then raise exception 'Only owner/admin can verify'; end if;

  if v_item_status <> 'uploaded' then raise exception 'Checklist item must be uploaded to verify, got %', v_item_status; end if;

  select status into v_matter_status from public.matters where id = v_matter_id for update;
  if not found then raise exception 'Matter not found'; end if;
  if v_matter_status = 'archived' then raise exception 'Matter is archived'; end if;

  update public.checklist_items set status = 'verified', updated_at = now() where id = p_checklist_item_id;

  insert into public.matter_activity (firm_id, matter_id, actor_id, action, metadata)
  values (v_firm_id, v_matter_id, v_user_id, 'document_verified', jsonb_build_object('checklist_item_id', p_checklist_item_id));

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

-- reject_checklist_item: MatterVault
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
  if not public.is_firm_subscribed(v_firm_id, 'mattervault'::public.microtool_product) then
    raise exception 'Not subscribed to mattervault';
  end if;
  select role into v_role from public.firm_members where firm_id = v_firm_id and user_id = v_user_id limit 1;
  if v_role not in ('owner','admin') then raise exception 'Only owner/admin can reject'; end if;
  if v_item_status <> 'uploaded' then raise exception 'Only uploaded items can be rejected, got %', v_item_status; end if;
  update public.checklist_items set status = 'rejected', updated_at = now() where id = p_checklist_item_id;
end;
$$;

revoke all on function public.reject_checklist_item(uuid) from public;
grant execute on function public.reject_checklist_item(uuid) to authenticated;

-- archive_matter: MatterVault
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
  if not public.is_firm_subscribed(v_firm_id, 'mattervault'::public.microtool_product) then
    raise exception 'Not subscribed to mattervault';
  end if;
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
