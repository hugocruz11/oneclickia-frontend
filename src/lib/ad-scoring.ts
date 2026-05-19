import type { CachedAd, Brand } from "./types";

interface ScoredAd {
  ad: CachedAd;
  score: number;
  isTop: boolean;
}

/**
 * Scores ads based on performance signals and brand relevance.
 *
 * Score breakdown (0-100):
 * - Running duration (0-50): longer = better performance signal
 * - Niche match (0-25): overlap between ad niches and brand keywords
 * - Market/language match (0-15): B2B/B2C and language alignment
 * - Live status (0-10): currently running = still performing
 */
export function scoreAds(ads: CachedAd[], brand: Brand | null): ScoredAd[] {
  if (ads.length === 0) return [];

  // Extract brand keywords from summaries
  const brandKeywords = brand
    ? extractKeywords(
        [brand.webSummary, brand.instagramSummary, brand.name]
          .filter(Boolean)
          .join(" "),
      )
    : [];

  // Find max duration for normalization
  const maxDuration = Math.max(
    ...ads.map((a) => a.runningDurationDays || 0),
    1,
  );

  const scored = ads.map((ad) => {
    let score = 0;

    // 1. Running duration (0-50 points)
    const duration = ad.runningDurationDays || 0;
    score += (duration / maxDuration) * 50;

    // 2. Niche match (0-25 points)
    if (brandKeywords.length > 0 && ad.niches && ad.niches.length > 0) {
      const adNicheWords = ad.niches.flatMap((n) =>
        extractKeywords(n),
      );
      const matchCount = adNicheWords.filter((w) =>
        brandKeywords.some(
          (bk) => bk.includes(w) || w.includes(bk),
        ),
      ).length;
      const nicheScore = Math.min(matchCount / Math.max(adNicheWords.length, 1), 1);
      score += nicheScore * 25;
    }

    // Also check categories and productCategory
    if (brandKeywords.length > 0) {
      const adCatWords = [
        ...(ad.categories || []),
        ad.productCategory || "",
      ].flatMap((c) => extractKeywords(c));
      const catMatch = adCatWords.filter((w) =>
        brandKeywords.some((bk) => bk.includes(w) || w.includes(bk)),
      ).length;
      if (catMatch > 0) score += Math.min(catMatch * 5, 10);
    }

    // 3. Market alignment (0-10 points)
    if (ad.marketTarget === "b2c") score += 5; // Most OneClickIA users are B2C
    if (ad.languages && ad.languages.includes("es")) score += 5;

    // 4. Live status (0-10 points)
    if (ad.isLive) score += 10;

    return { ad, score, isTop: false };
  });

  // Sort by score descending
  scored.sort((a, b) => b.score - a.score);

  // Mark the top ad (only if score is significantly higher)
  if (scored.length > 0 && scored[0].score > 0) {
    scored[0].isTop = true;
  }

  return scored;
}

function extractKeywords(text: string): string[] {
  if (!text) return [];
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .split(/[\s,;.!?()[\]{}<>|/\\:'"]+/)
    .filter((w) => w.length > 3)
    .filter(
      (w) =>
        ![
          "para",
          "como",
          "este",
          "esta",
          "esos",
          "esas",
          "unos",
          "unas",
          "todo",
          "toda",
          "todos",
          "todas",
          "cada",
          "otro",
          "otra",
          "otros",
          "otras",
          "mismo",
          "misma",
          "donde",
          "cuando",
          "quien",
          "cual",
          "pero",
          "sino",
          "tambien",
          "sobre",
          "desde",
          "entre",
          "hasta",
          "hacia",
          "tras",
          "durante",
          "mediante",
          "segun",
          "contra",
          "without",
          "with",
          "that",
          "this",
          "from",
          "have",
          "been",
          "were",
          "they",
          "them",
          "their",
          "your",
          "will",
          "would",
          "could",
          "should",
          "more",
          "than",
          "then",
          "into",
          "also",
          "very",
          "just",
          "only",
          "some",
          "what",
          "which",
          "there",
          "here",
          "does",
          "like",
        ].includes(w),
    );
}
