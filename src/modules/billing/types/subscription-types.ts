export const MICROTOOL_PRODUCTS = ["noticeflow", "mattervault"] as const;
export type MicrotoolProduct = (typeof MICROTOOL_PRODUCTS)[number];

export const SUBSCRIPTION_STATUSES = ["active", "trialing", "past_due", "canceled"] as const;
export type SubscriptionStatus = (typeof SUBSCRIPTION_STATUSES)[number];

export type FirmSubscription = {
  id: string;
  firm_id: string;
  product: MicrotoolProduct;
  status: SubscriptionStatus;
  current_period_end: string | null;
  created_at: string;
  updated_at: string;
  canceled_at: string | null;
};

export function isEntitledStatus(status: SubscriptionStatus): boolean {
  return status === "active" || status === "trialing";
}
