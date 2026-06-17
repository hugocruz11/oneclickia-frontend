"use client";

/**
 * Renders a single ad variant as a realistic Facebook/Instagram Feed ad
 * preview — mirroring how Meta Ads Manager shows ads (brand header +
 * "Patrocinado", primary text, creative, and a headline + CTA footer).
 *
 * The whole card toggles selection (like the old thumbnail). A zoom
 * button opens the full-size lightbox.
 */

interface Props {
  /** Full image URL (already host-prefixed). */
  imageUrl: string;
  brandName: string;
  /** Full logo URL (host-prefixed) or null → initial-letter avatar. */
  brandLogoUrl?: string | null;
  /** Primary text shown above the image (the ad description). */
  primaryText: string;
  /** Bold headline shown in the footer. */
  headline: string;
  /** CTA button label, e.g. "Comprar ahora". */
  ctaLabel: string;
  /** Domain shown next to the headline, e.g. "mumucol.com". */
  domain?: string;
  /** Small caption, e.g. "Variante 1". */
  label: string;
  selected: boolean;
  onToggle: () => void;
  onZoom: () => void;
}

export function AdPreviewCard({
  imageUrl,
  brandName,
  brandLogoUrl,
  primaryText,
  headline,
  ctaLabel,
  domain,
  label,
  selected,
  onToggle,
  onZoom,
}: Props) {
  return (
    <div
      className={`group relative flex flex-col overflow-hidden rounded-xl border-2 bg-white transition-colors ${
        selected
          ? "border-orange ring-2 ring-orange/30"
          : "border-sand hover:border-orange/40"
      }`}
    >
      {/* Header: brand + Patrocinado */}
      <div className="flex items-center gap-2 px-3 pt-3 pb-2">
        {brandLogoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={brandLogoUrl}
            alt={brandName}
            className="h-8 w-8 shrink-0 rounded-full border border-sand object-cover"
          />
        ) : (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sand text-sm font-semibold text-charcoal">
            {brandName.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="min-w-0 flex-1 leading-tight">
          <p className="truncate text-sm font-semibold text-ink">{brandName}</p>
          <p className="text-xs text-muted">Patrocinado</p>
        </div>
        <span className="text-muted">⋯</span>
      </div>

      {/* Primary text — shown in full (wraps), so the copy is never cut off. */}
      {primaryText && (
        <p className="whitespace-pre-line px-3 pb-2 text-sm text-charcoal">
          {primaryText}
        </p>
      )}

      {/* Creative — clicking toggles selection. Overlays are anchored to
          the image so their position is stable regardless of text length. */}
      <div className="relative">
        <button type="button" onClick={onToggle} className="block w-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageUrl} alt={label} className="w-full" />
        </button>
        {selected && (
          <span className="pointer-events-none absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-orange text-xs text-white shadow">
            ✓
          </span>
        )}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onZoom();
          }}
          aria-label={`Ver ${label} en grande`}
          className="absolute left-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition-opacity hover:bg-black/70 group-hover:opacity-100 focus:opacity-100"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
            <line x1="11" y1="8" x2="11" y2="14" />
            <line x1="8" y1="11" x2="14" y2="11" />
          </svg>
        </button>
      </div>

      {/* Footer: domain + headline + CTA (Meta Feed style) */}
      <div className="flex items-center gap-3 bg-cream px-3 py-2.5">
        <div className="min-w-0 flex-1">
          {domain && (
            <p className="truncate text-[11px] uppercase tracking-wide text-muted">
              {domain}
            </p>
          )}
          <p className="text-sm font-semibold leading-snug text-ink break-words">
            {headline}
          </p>
        </div>
        <span className="shrink-0 rounded-md border border-sand bg-white px-3 py-1.5 text-xs font-semibold text-charcoal">
          {ctaLabel}
        </span>
      </div>

      {/* Caption */}
      <div className="flex items-center justify-between px-3 pb-2">
        <span className="text-xs text-muted">{label}</span>
        {selected && (
          <span className="text-xs font-medium text-orange">Seleccionada</span>
        )}
      </div>
    </div>
  );
}
