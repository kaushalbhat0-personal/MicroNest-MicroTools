import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

function readMigration(name: string): string {
  return fs.readFileSync(path.resolve(__dirname, `../../../../supabase/migrations/${name}`), "utf8");
}

describe("010 subscriptions substrate (P0)", () => {
  const m010 = readMigration("010_subscriptions.sql");
  const m001 = readMigration("001_core_identity_and_firm.sql");

  it("creates microtool_product and subscription_status enums", () => {
    expect(m010).toContain("create type microtool_product as enum ('noticeflow', 'mattervault')");
    expect(m010).toContain("create type subscription_status as enum ('active', 'trialing', 'past_due', 'canceled')");
  });

  it("creates firm_subscriptions with required columns and constraints", () => {
    expect(m010).toContain("create table if not exists public.firm_subscriptions");
    expect(m010).toContain("firm_id uuid not null references public.firms(id) on delete cascade");
    expect(m010).toContain("product microtool_product not null");
    expect(m010).toContain("status subscription_status not null");
    expect(m010).toContain("current_period_end timestamptz");
    expect(m010).toContain("canceled_at timestamptz");
    expect(m010).toContain("constraint uq_firm_product unique (firm_id, product)");
    expect(m010).toContain("idx_firm_subscriptions_firm");
    expect(m010).toContain("idx_firm_subscriptions_firm_product");
  });

  it("enables RLS and allows only SELECT for members", () => {
    expect(m010).toContain("alter table public.firm_subscriptions enable row level security");
    expect(m010).toContain('create policy "firm_subscriptions_member_select"');
    expect(m010).toContain("for select using (public.is_firm_member(firm_id))");
    expect(m010).not.toContain('create policy "firm_subscriptions_member_insert"');
    expect(m010).not.toContain('create policy "firm_subscriptions_member_update"');
  });

  it("has updated_at trigger via set_updated_at", () => {
    expect(m010).toContain("trg_firm_subscriptions_updated_at");
    expect(m010).toContain("set_updated_at()");
  });

  it("grandfathers existing firms with active for both products (idempotent)", () => {
    expect(m010).toContain("cross join");
    expect(m010).toContain("'noticeflow'::public.microtool_product");
    expect(m010).toContain("'mattervault'::public.microtool_product");
    expect(m010).toContain("'active'::public.subscription_status");
    expect(m010).toContain("on conflict (firm_id, product) do nothing");
  });

  it("defines is_firm_subscribed helpers with security definer + search_path + stable", () => {
    expect(m010).toContain("create or replace function public.is_firm_subscribed(target_firm uuid, target_product microtool_product)");
    expect(m010).toContain("security definer");
    expect(m010).toContain("set search_path = ''");
    expect(m010).toContain("stable");
    expect(m010).toContain("revoke all on function public.is_firm_subscribed(uuid, microtool_product) from public");
    expect(m010).toContain("grant execute on function public.is_firm_subscribed(uuid, microtool_product) to authenticated");
    expect(m010).toContain("create or replace function public.is_firm_subscribed(target_firm uuid, target_product text)");
  });

  it("is_firm_subscribed validates membership and only active/trialing are entitled", () => {
    expect(m010).toContain("fm.user_id = auth.uid()");
    expect(m010).toContain("fm.firm_id = target_firm");
    expect(m010).toContain("fs.firm_id = target_firm");
    expect(m010).toContain("fs.status in ('active'::public.subscription_status, 'trialing'::public.subscription_status)");
  });

  it("text overload returns false for unknown product (no exception leak)", () => {
    expect(m010).toContain("exception when others then");
    expect(m010).toContain("return false");
  });

  it("does not modify existing product RLS or business tables", () => {
    for (const tbl of ["public.clients", "public.notices", "public.matters", "public.firm_members", "public.firms"]) {
      expect(m010).not.toContain(`alter table ${tbl} `);
    }
    expect(m010).not.toContain("notices_member_select");
    expect(m010).not.toContain("matters_member_select");
    // Only additive policies for firm_subscriptions
    expect(m010.split("create policy").length - 1).toBe(1);
  });

  it("follows set_updated_at pattern like 001", () => {
    expect(m001).toContain("create or replace function public.set_updated_at()");
    expect(m010).toContain("set_updated_at()");
  });

  it("service primitive isEntitled logic matches required status matrix", async () => {
    const { isEntitledStatus } = await import("../types/subscription-types");
    expect(isEntitledStatus("active")).toBe(true);
    expect(isEntitledStatus("trialing")).toBe(true);
    expect(isEntitledStatus("past_due")).toBe(false);
    expect(isEntitledStatus("canceled")).toBe(false);
  });

  it("service primitive files exist with correct exports", () => {
    const entitlements = fs.readFileSync(
      path.resolve(__dirname, "../services/entitlements.ts"),
      "utf8",
    );
    expect(entitlements).toContain("export async function isSubscribed");
    expect(entitlements).toContain("export async function requireEntitlement");
    expect(entitlements).toContain("EntitlementError");
    expect(entitlements).toContain("firm_subscriptions");

    const types = fs.readFileSync(
      path.resolve(__dirname, "../types/subscription-types.ts"),
      "utf8",
    );
    expect(types).toContain("MICROTOOL_PRODUCTS");
    expect(types).toContain("noticeflow");
    expect(types).toContain("mattervault");
    expect(types).toContain("SUBSCRIPTION_STATUSES");
    expect(types).toContain("isEntitledStatus");

    const repo = fs.readFileSync(
      path.resolve(__dirname, "../repositories/subscription-repository.ts"),
      "utf8",
    );
    expect(repo).toContain("listSubscriptionsByFirm");
    expect(repo).toContain("getSubscription");
  });

  it("cross-firm inspection denied by design (is_firm_member predicate)", () => {
    // Helper joins firm_members fm where fm.firm_id = target_firm and fm.user_id = auth.uid()
    // so caller not in target firm yields false
    expect(m010).toContain("where fm.firm_id = target_firm");
    expect(m010).toContain("and fm.user_id = auth.uid()");
    // No bypass via direct firm_subscriptions select without membership — RLS also gates
    expect(m010).toContain("public.is_firm_member(firm_id)");
  });

  it("duplicate firm/product enforced via unique constraint", () => {
    expect(m010).toContain("uq_firm_product");
    expect(m010).toContain("unique (firm_id, product)");
  });
});
