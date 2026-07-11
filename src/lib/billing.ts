import { api } from "@/lib/api";

// Mirrors the backend billing contracts (src/billing in the API).

export type PlanTier = "FREE" | "STARTER" | "PRO" | "BUSINESS";

export type SubscriptionStatus =
  | "TRIALING"
  | "ACTIVE"
  | "PAST_DUE"
  | "CANCELED"
  | "INCOMPLETE";

export interface CreditBalance {
  subscriptionCredits: number;
  topUpCredits: number;
  total: number;
}

export interface BillingSummary {
  tier: PlanTier;
  planName: string;
  status: SubscriptionStatus;
  monthlyCredits: number;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  balance: CreditBalance;
}

export interface Plan {
  tier: PlanTier;
  name: string;
  priceUsdCents: number;
  /** What Mercado Pago actually charges, in whole COP. */
  priceCop: number;
  monthlyCredits: number;
  maxLinkedBusinesses: number;
  features: string[];
}

export interface CreditPack {
  id: string;
  name: string;
  credits: number;
  priceUsdCents: number;
  /** What Mercado Pago actually charges, in whole COP. */
  priceCop: number;
}

/** Event dispatched by the API client on any HTTP 402 response. */
export const INSUFFICIENT_CREDITS_EVENT = "oneclickia:insufficient-credits";

export interface InsufficientCreditsDetail {
  required?: number;
  available?: number;
  message?: string;
}

export function formatUsd(cents: number): string {
  if (cents === 0) return "Gratis";
  return `$${(cents / 100).toFixed(cents % 100 === 0 ? 0 : 2)}`;
}

/** Whole COP, e.g. 139900 → "$139.900 COP". */
export function formatCop(pesos: number): string {
  if (pesos === 0) return "Gratis";
  return `$${pesos.toLocaleString("es-CO")} COP`;
}

// ── API calls ──

/** Both checkouts answer with the Mercado Pago URL to redirect to. */
export interface CheckoutRedirect {
  initPoint: string;
}

export const billingApi = {
  me: () => api.get<BillingSummary>("/billing/me"),
  plans: () => api.get<Plan[]>("/billing/plans"),
  packs: () => api.get<CreditPack[]>("/billing/packs"),
  /**
   * Start a subscription checkout at Mercado Pago. Redirect the browser
   * to `initPoint`; activation/credits arrive via webhooks after payment.
   */
  subscribe: (tier: PlanTier) =>
    api.post<CheckoutRedirect>("/billing/subscribe", { tier }),
  /** Start a one-off credit-pack checkout at Mercado Pago. */
  packCheckout: (packId: string) =>
    api.post<CheckoutRedirect>("/billing/packs/checkout", { packId }),
  /** Cancel the recurring subscription (keeps already-paid credits). */
  cancel: () => api.post<{ canceled: true }>("/billing/cancel"),
};
