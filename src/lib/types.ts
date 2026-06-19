// ── Auth ──

export type Role = "USER" | "ADMIN";

export interface User {
  id: string;
  email: string;
  name?: string | null;
  role?: Role;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

// ── Brand ──

export type PricePositioning =
  | "VALUE"
  | "MID_MARKET"
  | "PREMIUM_ACCESSIBLE"
  | "PREMIUM"
  | "ULTRA_PREMIUM";

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
  // ── LA MARCA — Brand Intelligence Survey ──
  identityContext: string | null;
  markets: string | null;
  mission: string | null;
  brandPersona: string | null;
  toneOfVoice: string | null;
  communicationProhibitions: string | null;
  admiredBrands: string | null;
  coreBelief: string | null;
  visualIdentity: string | null;
  pricePositioning: PricePositioning | null;
  positioningStatement: string | null;
  competitors: string | null;
  competitiveEdge: string | null;
  marketGap: string | null;
  // ── Onboarding tracking ──
  onboardingCompleted: boolean;
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

export interface MetaCustomAudience {
  id: string;
  name: string;
  description?: string;
  subtype: string;
  approximate_count_lower_bound?: number;
  approximate_count_upper_bound?: number;
  delivery_status?: { code: number; description: string };
  operation_status?: { code: number; description: string };
  customer_file_source?: string;
  time_created?: number;
  time_updated?: number;
}

export interface AudienceUploadResult {
  total: number;
  uploaded: number;
  invalid: number;
  duplicates: number;
  sessionId: number;
}

export interface MetaInterest {
  id: string;
  name: string;
  audience_size: number;
}

export interface MetaGeoLocation {
  key: string;
  name: string;
}

// ── Ads (Foreplay) ──

export interface CachedAd {
  id: string;
  foreplayId: string;
  brandId: string;
  brandName: string | null;
  displayFormat: string | null;
  publisherPlatform: string[];
  headline: string | null;
  description: string | null;
  ctaTitle: string | null;
  ctaType: string | null;
  linkUrl: string | null;
  fullTranscription: string | null;
  imageUrl: string | null;
  thumbnailUrl: string | null;
  niches: string[];
  categories: string[];
  productCategory: string | null;
  marketTarget: string | null;
  languages: string[];
  persona: Record<string, unknown> | null;
  emotionalDrivers: Record<string, unknown> | null;
  isLive: boolean;
  startedRunningAt: string | null;
  runningDurationDays: number | null;
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

// ── Reference Images ──

export interface ReferenceImage {
  id: string;
  name: string | null;
  imageUrl: string;
  createdAt: string;
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
  brandId: string;
  name: string | null;
  imageUrl: string;
  // ── 10 EL PRODUCTO survey fields ──
  description: string | null;
  composition: string | null;
  notProduct: string | null;
  featuresBenefits: string | null;
  usp: string | null;
  mechanism: string | null;
  usageRitual: string | null;
  priceJustification: string | null;
  customerAvatar: string | null;
  customerVoice: string | null;
  // Gate flag — only products with `isComplete: true` appear in pickers.
  isComplete: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdaptCopyResponse {
  adaptationId: string;
  product: Product | null;
  referenceImageUrl?: string | null;
  variants: CopyVariant[];
  cached: boolean;
}

export interface SavedCopy {
  id: string;
  userId: string;
  headline: string;
  description: string;
  ctaTitle: string;
  rationale: string | null;
  label: string | null;
  sourceAdaptationId: string | null;
  productId: string | null;
  product?: Product | null;
  createdAt: string;
}

// ── Image Generation ──

export interface GenerateImageResponse {
  generatedImageId: string;
  variantIndex: number;
  feedImageUrl: string | null;
  verticalImageUrl: string | null;
  storyImageUrl: string | null;
}

export interface EditImageResponse {
  imageUrl: string;
  format: string;
}

export interface ImageVariantsResponse {
  variants: { id: string; imageUrl: string }[];
  format: string;
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
  performanceGoal: string | null;
  budgetType: "DAILY" | "LIFETIME";
  budgetAmount: number;
  currency: string;
  startDate: string;
  endDate: string | null;
  targetCountries: string[];
  targetCities: { key: string; name: string }[];
  ageMin: number;
  ageMax: number;
  genders: number[];
  interests: { id: string; name: string }[];
  customAudienceIds: string[];
  headline: string;
  description: string;
  ctaType: string;
  destinationUrl: string;
  campaignName: string | null;
  adSetName: string | null;
  adName: string | null;
  status: CampaignStatus;
  metaCampaignId: string | null;
  metaAdSetId: string | null;
  metaCreativeId: string | null;
  metaAdId: string | null;
  metaImageHash: string | null;
  additionalImageIds: string[];
  errorStep: string | null;
  errorMessage: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  // Populated in detail view
  generatedImage?: {
    id: string;
    feedImageUrl: string;
    verticalImageUrl: string;
    storyImageUrl: string;
  } | null;
  additionalImages?: {
    id: string;
    feedImageUrl: string;
    verticalImageUrl: string;
    storyImageUrl: string;
  }[];
}

export interface CampaignDefaults {
  destinationUrl: string;
  adAccountId: string;
  pageId: string;
  pageName: string;
  objective: string;
  performanceGoal: string;
  budgetType: string;
  budgetAmount: number;
  targetCountries: string[];
  targetCities: { key: string; name: string }[];
  ageMin: number;
  ageMax: number;
  genders: number[];
  interests: { id: string; name: string }[];
  customAudienceIds: string[];
}
