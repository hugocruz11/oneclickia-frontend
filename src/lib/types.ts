// ── Auth ──

export interface User {
  id: string;
  email: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

// ── Brand ──

export interface Brand {
  id: string;
  userId: string;
  name: string | null;
  websiteUrl: string | null;
  webSummary: string | null;
  instagramUrl: string | null;
  instagramSummary: string | null;
  logoUrl: string | null;
  logoAnalysis: string | null;
  primaryColors: string[];
  sources: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

export interface OnboardingStatus {
  completed: boolean;
  brand: Brand | null;
}

// ── Meta Connection ──

export interface MetaConnection {
  id: string;
  platform: string;
  metaUserId: string;
  metaUserName: string;
}

export interface MetaAdAccount {
  id: string;
  account_id: string;
  name: string;
  currency: string;
  account_status: number;
  business_name?: string;
}

export interface MetaPage {
  id: string;
  name: string;
  category: string;
}

export interface MetaInterest {
  id: string;
  name: string;
  audience_size: number;
}

// ── Ads (Foreplay) ──

export interface CachedAd {
  id: string;
  foreplayId: string;
  headline: string | null;
  description: string | null;
  imageUrl: string | null;
  primaryText: string | null;
  link: string | null;
  displayUrl: string | null;
  advertiserName: string | null;
  brandId: string | null;
  publisherPlatform: string;
  createdAt: string;
}

export interface AdsSearchResponse {
  ads: CachedAd[];
  nextCursor: string | null;
  creditsCost: number;
  creditsRemaining: number | null;
  searchId: string;
  cacheHit: boolean;
}

export interface AdsUsage {
  creditsRemaining: number;
  creditsTotal: number;
}

// ── Copy Adaptation ──

export interface CopyVariant {
  headline: string;
  description: string;
  ctaTitle: string;
  rationale: string;
}

export interface Product {
  id: string;
  name: string | null;
  imageUrl: string;
  brandId: string;
}

export interface AdaptCopyResponse {
  adaptationId: string;
  product: Product | null;
  variants: CopyVariant[];
  cached: boolean;
}

// ── Image Generation ──

export interface GenerateImageResponse {
  generatedImageId: string;
  variantIndex: number;
  feedImageUrl: string | null;
  verticalImageUrl: string | null;
  storyImageUrl: string | null;
}

// ── Campaigns ──

export type CampaignStatus =
  | "DRAFT"
  | "PUBLISHING"
  | "PAUSED"
  | "ACTIVE"
  | "ERROR"
  | "ARCHIVED";

export interface Campaign {
  id: string;
  userId: string;
  generatedImageId: string;
  variantIndex: number;
  adAccountId: string;
  pageId: string;
  objective: string;
  budgetType: "DAILY" | "LIFETIME";
  budgetAmount: number;
  currency: string;
  startDate: string;
  endDate: string | null;
  targetCountries: string[];
  ageMin: number;
  ageMax: number;
  genders: number[];
  interests: { id: string; name: string }[];
  headline: string;
  description: string;
  ctaType: string;
  destinationUrl: string;
  status: CampaignStatus;
  metaCampaignId: string | null;
  metaAdSetId: string | null;
  metaCreativeId: string | null;
  metaAdId: string | null;
  metaImageHash: string | null;
  errorStep: string | null;
  errorMessage: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CampaignDefaults {
  destinationUrl: string;
  adAccountId: string;
  pageId: string;
  pageName: string;
  objective: string;
  budgetType: string;
  budgetAmount: number;
  targetCountries: string[];
  ageMin: number;
  ageMax: number;
  genders: number[];
  interests: { id: string; name: string }[];
}
