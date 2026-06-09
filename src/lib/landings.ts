import { api } from "@/lib/api";

export type LandingStatus = "DRAFT" | "PUBLISHED";

export interface LandingTheme {
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
  logoUrl?: string | null;
}

export interface LandingContent {
  theme?: LandingTheme;
  hero: { headline: string; subheadline?: string; imageUrl?: string };
  pain: { title: string; bullets: string[] };
  benefits: { title: string; items: { title: string; description: string }[] };
  mechanism: { title: string; body: string };
  testimonials: { name: string; quote: string; rating?: number }[];
  offer: { headline: string; note?: string };
  cta: { label: string };
  faq: { question: string; answer: string }[];
}

export interface Landing {
  id: string;
  slug: string;
  title: string | null;
  avatar: string | null;
  productHandle: string | null;
  appProductId: string | null;
  content: LandingContent;
  /** AI-designed full HTML (new approach). Null = legacy structured template. */
  html: string | null;
  pixelId: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  status: LandingStatus;
  views: number;
  clicks: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLandingInput {
  slug: string;
  title?: string;
  avatar?: string;
  productHandle?: string;
  appProductId?: string;
}

export interface UpdateLandingInput {
  title?: string;
  avatar?: string;
  productHandle?: string;
  appProductId?: string;
  content?: LandingContent;
  html?: string;
  pixelId?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  status?: LandingStatus;
}

export const landingsApi = {
  list: () => api.get<Landing[]>("/landings"),
  get: (id: string) => api.get<Landing>(`/landings/${id}`),
  create: (input: CreateLandingInput) => api.post<Landing>("/landings", input),
  update: (id: string, input: UpdateLandingInput) =>
    api.patch<Landing>(`/landings/${id}`, input),
  generate: (id: string, input: { avatar?: string; instructions?: string }) =>
    api.post<Landing>(`/landings/${id}/generate`, input),
  remove: (id: string) => api.delete<void>(`/landings/${id}`),
};
