-- 010_subscriptions
-- Phase P0: firm-level MicroTool subscriptions (platform substrate, no billing/payment)

-- Enums
do $$ begin
  create type microtool_product as enum ('noticeflow', 'mattervault');
exception when duplicate_object then null; end $$;

do $$ begin
  create type subscription_status as enum ('active', 'trialing', 'past_due', 'canceled');
exception when duplicate_object then null; end $$;

-- Table
create table if not exists public.firm_subscriptions (
  id uuid primary key default gen_random_uuid(),
  firm_id uuid not null references public.firms(id) on delete cascade,
  product microtool_product not null,
  status subscription_status not null default 'active',
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  canceled_at timestamptz,
  constraint uq_firm_product unique (firm_id, product)
);

create index if not exists idx_firm_subscriptions_firm on public.firm_subscriptions(firm_id);
create index if not exists idx_firm_subscriptions_firm_product on public.firm_subscriptions(firm_id, product);

-- updated_at trigger (reuse set_updated_at from 001)
drop trigger if exists trg_firm_subscriptions_updated_at on public.firm_subscriptions;
create trigger trg_firm_subscriptions_updated_at
  before update on public.firm_subscriptions
  for each row execute function public.set_updated_at();

-- RLS
alter table public.firm_subscriptions enable row level security;

drop policy if exists "firm_subscriptions_member_select" on public.firm_subscriptions;
create policy "firm_subscriptions_member_select" on public.firm_subscriptions
  for select using (public.is_firm_member(firm_id));

-- No insert/update/delete for authenticated — mutations via service_role / future billing webhook only.
-- Service role bypasses RLS; no additional policies.

-- Backfill: grandfather existing V1 firms → active for both products (idempotent)
insert into public.firm_subscriptions (firm_id, product, status)
select f.id, p.product, 'active'::public.subscription_status
from public.firms f
cross join (values ('noticeflow'::public.microtool_product), ('mattervault'::public.microtool_product)) as p(product)
on conflict (firm_id, product) do nothing;

-- Helper: is_firm_subscribed
-- Returns true only if caller is a member of target_firm AND subscription is active/trialing.
-- SECURITY DEFINER, STABLE, explicit search_path, no client firm_id trust.
create or replace function public.is_firm_subscribed(target_firm uuid, target_product microtool_product)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.firm_members fm
    join public.firm_subscriptions fs
      on fs.firm_id = fm.firm_id
     and fs.product = target_product
     and fs.status in ('active'::public.subscription_status, 'trialing'::public.subscription_status)
    where fm.firm_id = target_firm
      and fm.user_id = auth.uid()
      and fs.firm_id = target_firm
  );
$$;

revoke all on function public.is_firm_subscribed(uuid, microtool_product) from public;
grant execute on function public.is_firm_subscribed(uuid, microtool_product) to authenticated;

-- Text overload for convenience (clients pass 'noticeflow' text)
create or replace function public.is_firm_subscribed(target_firm uuid, target_product text)
returns boolean
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_product public.microtool_product;
begin
  -- Validate product value; unknown product → not subscribed (false, not exception)
  begin
    v_product := target_product::public.microtool_product;
  exception when others then
    return false;
  end;
  return public.is_firm_subscribed(target_firm, v_product);
end;
$$;

revoke all on function public.is_firm_subscribed(uuid, text) from public;
grant execute on function public.is_firm_subscribed(uuid, text) to authenticated;
