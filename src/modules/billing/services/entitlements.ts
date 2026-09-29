import { createServerSupabaseClient } from "@/infrastructure/database/supabase-server";
import type { MicrotoolProduct, SubscriptionStatus } from "../types/subscription-types";
import { isEntitledStatus } from "../types/subscription-types";

/**
 * P0 entitlement primitive — firm-level MicroTool subscriptions.
 * - Firm-owned (shared across members); never trusts client-provided firm_id.
 * - Returns true only for status active/trialing.
 * - No UI/action wiring in P0; purely a domain read helper.
 */

export async function isSubscribed(firmId: string, product: MicrotoolProduct): Promise<boolean> {
  if (!firmId || !product) return false;
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("firm_subscriptions")
    .select("status")
    .eq("firm_id", firmId)
    .eq("product", product)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return false;
  return isEntitledStatus(data.status as SubscriptionStatus);
}

export class EntitlementError extends Error {
  readonly firmId: string;
  readonly product: MicrotoolProduct;
  constructor(firmId: string, product: MicrotoolProduct) {
    super(`Not subscribed to ${product}`);
    this.name = "EntitlementError";
    this.firmId = firmId;
    this.product = product;
  }
}

/**
 * Throws EntitlementError when the firm is not entitled to the product.
 * P1 will call this from page/action/service/API guards.
 */
export async function requireEntitlement(firmId: string, product: MicrotoolProduct): Promise<void> {
  const ok = await isSubscribed(firmId, product);
  if (!ok) throw new EntitlementError(firmId, product);
}
