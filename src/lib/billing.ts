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
  monthlyCredits: number;
  maxLinkedBusinesses: number;
  features: string[];
}

export interface CreditPack {
  id: string;
  name: string;
  credits: number;
  priceUsdCents: number;
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

// ── API calls ──

/** ePayco public config the browser needs to tokenize cards / checkout. */
export interface EpaycoConfig {
  publicKey: string;
  test: boolean;
}

/** Payload for POST /billing/subscribe — the card is already tokenized. */
export interface SubscribePayload {
  tier: PlanTier;
  tokenCard: string;
  docType: string;
  docNumber: string;
  name?: string;
  phone?: string;
}

export const billingApi = {
  me: () => api.get<BillingSummary>("/billing/me"),
  plans: () => api.get<Plan[]>("/billing/plans"),
  packs: () => api.get<CreditPack[]>("/billing/packs"),
  /** ePayco public key + test flag for the browser SDK. */
  config: () => api.get<EpaycoConfig>("/billing/config"),
  /** Create the recurring subscription from a browser-tokenized card. */
  subscribe: (payload: SubscribePayload) =>
    api.post<{ status: SubscriptionStatus; tier: PlanTier }>(
      "/billing/subscribe",
      payload,
    ),
  /** Cancel the recurring subscription (keeps already-paid credits). */
  cancel: () => api.post<{ canceled: true }>("/billing/cancel"),
};
