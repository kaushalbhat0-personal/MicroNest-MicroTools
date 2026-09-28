-- 006_activity_log
-- Phase 2C: activity log + atomic transition RPC

create table if not exists public.activity_log (
  id uuid primary key default gen_random_uuid(),
  firm_id uuid not null references public.firms(id) on delete cascade,
  notice_id uuid not null references public.notices(id) on delete cascade,
  actor_id uuid not null references public.users(id) on delete restrict,
  action text not null check (action = 'status_changed'),
  from_status notice_status not null,
  to_status notice_status not null,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_activity_firm on public.activity_log(firm_id);
create index if not exists idx_activity_notice on public.activity_log(notice_id);
create index if not exists idx_activity_created on public.activity_log(created_at);

alter table public.activity_log enable row level security;

drop policy if exists "activity_member_select" on public.activity_log;
create policy "activity_member_select" on public.activity_log for select
  using (public.is_firm_member(firm_id));

-- No insert/update/delete for authenticated — service_role/RPC only
-- Ensure no permissive policies

-- Atomic transition RPC
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

  select role into v_role from public.firm_members where firm_id = v_firm_id and user_id = v_user_id limit 1;
  if v_role is null then raise exception 'No membership'; end if;

  -- Cross-firm assigned_to verification if supplied
  if p_target_assigned_to is not null then
    if not exists (select 1 from public.firm_members where firm_id = v_firm_id and user_id = p_target_assigned_to) then
      raise exception 'Assigned user must belong to firm';
    end if;
  end if;

  -- Validate transition graph
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

  -- Authorization per transition
  -- MEMBER may only act on own assigned notice
  if v_role = 'member' then
    if v_current_assigned is distinct from v_user_id then
      raise exception 'Member may only transition own assigned notice';
    end if;
    -- MEMBER cannot mark ready_to_submit, submitted, follow_up, closed, nor reopen
    if p_target_status in ('ready_to_submit','submitted','follow_up','closed') then
      raise exception 'Member not allowed for %', p_target_status;
    end if;
    if v_current_status = 'closed' and p_target_status = 'review' then
      raise exception 'Member cannot reopen';
    end if;
    -- MEMBER cannot assign to another
    if p_target_assigned_to is not null and p_target_assigned_to <> v_user_id then
      raise exception 'Member cannot assign to another';
    end if;
    -- REVIEW -> ASSIGNED not for member (would assign)
    if v_current_status = 'review' and p_target_status = 'assigned' then
      raise exception 'Member cannot assign';
    end if;
  end if;

  -- OWNER/ADMIN checks for privileged transitions
  if p_target_status in ('ready_to_submit','submitted','follow_up','closed') and v_role not in ('owner','admin') then
    raise exception 'Only owner/admin for %', p_target_status;
  end if;
  if v_current_status = 'closed' and p_target_status = 'review' and v_role not in ('owner','admin') then
    raise exception 'Only owner/admin can reopen';
  end if;

  -- Perform update
  update public.notices
  set status = p_target_status,
      assigned_to = coalesce(p_target_assigned_to, assigned_to),
      updated_at = now()
  where id = p_notice_id;

  -- Insert activity (append-only)
  insert into public.activity_log (firm_id, notice_id, actor_id, action, from_status, to_status, metadata)
  values (v_firm_id, p_notice_id, v_user_id, 'status_changed', v_current_status, p_target_status, null);
end;
$$;

revoke all on function public.transition_notice(uuid, notice_status, uuid) from public;
grant execute on function public.transition_notice(uuid, notice_status, uuid) to authenticated;
