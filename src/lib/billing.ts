import { api } from "@/lib/api";

// Mirrors the backend billing contracts (src/billing in the API).

export type PlanTier = "FREE" | "STARTER" | "PRO" | "BUSINESS";

export type SubscriptionStatus =
  | "TRIALING"
  | "ACTIVE"
  | "PAST_DUE"
  | "CANCELED"
  | "INCOMPLETE";

export type BillingPeriod = "MONTHLY" | "ANNUAL";

/** Live USD→COP rate from the backend (official TRM, cached ~12h). */
export interface UsdCopRate {
  rate: number;
  date: string;
  source: "trm" | "fallback";
}

export interface CreditBalance {
  subscriptionCredits: number;
  topUpCredits: number;
  total: number;
}

export interface BillingSummary {
  tier: PlanTier;
  planName: string;
  status: SubscriptionStatus;
  billingPeriod: BillingPeriod;
  monthlyCredits: number;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  balance: CreditBalance;
}

export interface Plan {
  tier: PlanTier;
  name: string;
  /** Monthly price in USD cents (source of truth). */
  priceUsdCents: number;
  /** Annual price in USD cents (whole year, already discounted). */
  annualPriceUsdCents: number;
  /** Annual price expressed per month, USD cents (for the toggle). */
  annualMonthlyUsdCents: number;
  /** Annual discount as a whole percentage, e.g. 17. */
  annualDiscountPct: number;
  /** Legacy static COP price (display fallback; real charge = USD×TRM). */
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

/** COP charged for a USD-cents price at the given TRM (rounded to whole COP). */
export function copFromUsdCents(cents: number, rate: number): number {
  return Math.round((cents / 100) * rate);
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
  /** Live USD→COP rate to estimate the COP charged for a USD price. */
  usdCop: () => api.get<UsdCopRate>("/fx/usd-cop"),
  /**
   * Start a subscription checkout at Mercado Pago. Redirect the browser
   * to `initPoint`; activation/credits arrive via webhooks after payment.
   */
  subscribe: (tier: PlanTier, period: BillingPeriod = "MONTHLY") =>
    api.post<CheckoutRedirect>("/billing/subscribe", { tier, period }),
  /** Start a one-off credit-pack checkout at Mercado Pago. */
  packCheckout: (packId: string) =>
    api.post<CheckoutRedirect>("/billing/packs/checkout", { packId }),
  /** Cancel the recurring subscription (keeps already-paid credits). */
  cancel: () => api.post<{ canceled: true }>("/billing/cancel"),
};
