"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { Badge } from "@/components/ui/Badge";
import { CampaignStatusBadge } from "@/components/CampaignStatusBadge";
import { api, ApiError } from "@/lib/api";
import { objectiveLabel, countryName, performanceGoalLabel } from "@/lib/labels";
import type { Campaign } from "@/lib/types";
import { useI18n } from "@/contexts/I18nContext";

const API_HOST = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

interface AdPreview {
  format: string;
  html: string;
}

// Los textos en español son también sus claves de traducción (ver src/i18n).
const FORMAT_LABELS: Record<string, string> = {
  DESKTOP_FEED_STANDARD: "Facebook Feed",
  MOBILE_FEED_STANDARD: "Facebook Móvil",
  INSTAGRAM_STANDARD: "Instagram Feed",
  INSTAGRAM_STORY: "Instagram Story",
};

// Seconds in PUBLISHING after which we surface a manual "Reintentar"
// button. Most Meta publishes finish in 30-60s; past this it's likely
// stuck and the user should be able to recover.
const PUBLISHING_STUCK_THRESHOLD_SECS = 60;

export default function CampaignDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { t, localeTag } = useI18n();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [previews, setPreviews] = useState<AdPreview[]>([]);
  const [showPreviews, setShowPreviews] = useState(false);
  const [loadingPreviews, setLoadingPreviews] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");
  const [error, setError] = useState("");
  // Tracks when the current PUBLISHING state was first observed by the
  // browser, so we know when to surface the "stuck" recovery option.
  const [publishingSince, setPublishingSince] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    api
      .get<Campaign>(`/campaigns/${id}`)
      .then(setCampaign)
      .catch((err) => {
        if (err instanceof ApiError) setError(err.message);
        else setError("Error al cargar la campaña.");
      })
      .finally(() => setLoading(false));
  }, [id]);

  // While in PUBLISHING, poll the campaign every 5s until status changes,
  // and tick a clock every second so the "stuck" UI appears on time.
  useEffect(() => {
    if (campaign?.status !== "PUBLISHING") {
      setPublishingSince(null);
      return;
    }
    if (publishingSince === null) setPublishingSince(Date.now());

    const tick = setInterval(() => setNow(Date.now()), 1000);
    const poll = setInterval(async () => {
      try {
        const fresh = await api.get<Campaign>(`/campaigns/${id}`);
        setCampaign(fresh);
      } catch {
        // ignore transient failures; we'll try again
      }
    }, 5000);
    return () => {
      clearInterval(tick);
      clearInterval(poll);
    };
  }, [campaign?.status, id, publishingSince]);

  async function loadPreviews() {
    setLoadingPreviews(true);
    try {
      const res = await api.get<{ previews: AdPreview[] }>(
        `/campaigns/${id}/preview`,
      );
      setPreviews(res.previews);
      setShowPreviews(true);
    } catch {
      // Preview not available
    } finally {
      setLoadingPreviews(false);
    }
  }

  async function handleAction(action: "publish" | "activate" | "pause") {
    setActionLoading(action);
    setError("");
    try {
      const res = await api.post<Campaign>(`/campaigns/${id}/${action}`);
      setCampaign(res);
      // Reset previews after status change
      setPreviews([]);
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else
        setError(
          action === "publish"
            ? "Error al publicar la campaña."
            : action === "activate"
              ? "Error al activar la campaña."
              : "Error al pausar la campaña.",
        );
    } finally {
      setActionLoading("");
    }
  }

  async function handleDelete() {
    setActionLoading("delete");
    setError("");
    try {
      await api.delete(`/campaigns/${id}`);
      router.push("/campaigns");
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError("Error al eliminar la campaña.");
      setActionLoading("");
    }
  }

  function formatBudget(amount: number, currency: string) {
    // amount is stored in whole currency units (not cents).
    return new Intl.NumberFormat(localeTag, {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
    }).format(amount);
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString(localeTag, {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <Card>
        <p className="text-error">
          {t(error || "No se encontró la campaña.")}
        </p>
        <Link href="/campaigns" className="mt-4 inline-block">
          <Button variant="ghost" size="sm">{t("Volver a campañas")}</Button>
        </Link>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl">
      <Link
        href="/campaigns"
        className="text-sm text-muted hover:text-ink transition-colors"
      >
        {t("← Volver a campañas")}
      </Link>

      <div className="mt-4 flex items-center gap-3">
        <h1 className="text-2xl font-semibold text-ink">{t("Campaña")}</h1>
        <CampaignStatusBadge status={campaign.status} />
        {campaign.status !== "PUBLISHING" && (
          <div className="ml-auto flex items-center gap-2">
            {(campaign.status === "ACTIVE" || campaign.status === "PAUSED") && (
              <Link href={`/ads/custom?refresh=${id}`}>
                <Button variant="ghost" size="sm">
                  {t("Refrescar creativo")}
                </Button>
              </Link>
            )}
            <Link href={`/campaigns/${id}/edit`}>
              <Button variant="ghost" size="sm">{t("Editar")}</Button>
            </Link>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 rounded-md border border-error/20 bg-error/10 p-3">
          <p className="text-sm text-error">{t(error)}</p>
        </div>
      )}

      {campaign.status === "ERROR" && campaign.errorMessage && (
        <div className="mt-4 rounded-md border border-error/20 bg-error/10 p-4">
          <h3 className="text-sm font-semibold text-error">
            {t("Error en: {step}", { step: campaign.errorStep ?? "" })}
          </h3>
          <p className="mt-1 text-sm text-error/80">
            {campaign.errorMessage}
          </p>
        </div>
      )}

      {/* Ad Preview from Meta */}
      {campaign.metaCreativeId && (
        <Card className="mt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">
                {t("Preview del anuncio")}
              </h3>
              <p className="mt-1 text-xs text-muted">
                {t("Visualiza cómo se verá tu anuncio en Meta.")}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (previews.length === 0) {
                  loadPreviews();
                  setShowPreviews(true);
                } else {
                  setShowPreviews(!showPreviews);
                }
              }}
              loading={loadingPreviews}
            >
              {showPreviews ? t("Ocultar preview") : t("Ver preview")}
            </Button>
          </div>

          {loadingPreviews && (
            <div className="mt-4 flex items-center gap-3 py-4">
              <Spinner size="sm" />
              <p className="text-sm text-muted">
                {t("Cargando preview de Meta...")}
              </p>
            </div>
          )}

          {previews.length > 0 && showPreviews && (
            <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-2">
              {previews.map((preview) => (
                <div key={preview.format} className="flex flex-col gap-2">
                  <Badge variant="orange">
                    {FORMAT_LABELS[preview.format]
                      ? t(FORMAT_LABELS[preview.format])
                      : preview.format}
                  </Badge>
                  <div
                    className="rounded-lg border border-sand [&_iframe]:!w-full [&_iframe]:!max-w-full"
                    dangerouslySetInnerHTML={{ __html: preview.html }}
                  />
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Ad Images — primary + variants */}
      {campaign.generatedImage && (
        <Card className="mt-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">
            {t("Creativos del anuncio")}
          </h3>
          <p className="mt-1 text-xs text-muted">
            {t("Imagen principal")}
            {campaign.additionalImages && campaign.additionalImages.length > 0
              ? campaign.additionalImages.length === 1
                ? t(" + 1 variante para A/B testing")
                : t(" + {count} variantes para A/B testing", {
                    count: campaign.additionalImages.length,
                  })
              : ""}
          </p>

          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {/* Primary image */}
            <div className="relative overflow-hidden rounded-lg border-2 border-orange">
              <img
                src={`${API_HOST}${campaign.generatedImage.feedImageUrl || campaign.generatedImage.verticalImageUrl || campaign.generatedImage.storyImageUrl}`}
                alt={t("Imagen principal")}
                className="w-full"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                <span className="text-xs font-medium text-white">
                  {t("Principal")}
                </span>
              </div>
            </div>

            {/* Variant images */}
            {campaign.additionalImages?.map((img, i) => (
              <div key={img.id} className="relative overflow-hidden rounded-lg border border-sand">
                <img
                  src={`${API_HOST}${img.feedImageUrl || img.verticalImageUrl || img.storyImageUrl}`}
                  alt={t("Variante {n}", { n: i + 2 })}
                  className="w-full"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                  <span className="text-xs font-medium text-white">
                    {t("Variante {n}", { n: i + 2 })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Copy */}
      <Card className="mt-4">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">
          {t("Copy del anuncio")}
        </h3>
        <p className="mt-2 text-base font-semibold text-ink">
          {campaign.headline}
        </p>
        <p className="mt-1 text-sm text-charcoal">{campaign.description}</p>
        <div className="mt-3 flex items-center gap-2">
          <Badge variant="orange">{campaign.ctaType}</Badge>
          <span className="text-xs text-muted">→ {campaign.destinationUrl}</span>
        </div>
      </Card>

      {/* Budget & Schedule */}
      <Card className="mt-4">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">
          {t("Presupuesto y duración")}
        </h3>
        <div className="mt-3 grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted">{t("Presupuesto")}</p>
            <p className="text-sm font-semibold text-ink">
              {formatBudget(campaign.budgetAmount, campaign.currency)}{" "}
              {campaign.budgetType === "DAILY" ? t("/ día") : t("total")}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted">{t("Objetivo")}</p>
            <p className="text-sm font-semibold text-ink">
              {objectiveLabel(campaign.objective, t)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted">{t("Meta del grupo")}</p>
            <p className="text-sm font-semibold text-ink">
              {performanceGoalLabel(campaign.performanceGoal, t)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted">{t("Inicio")}</p>
            <p className="text-sm text-ink">{formatDate(campaign.startDate)}</p>
          </div>
          {campaign.endDate && (
            <div>
              <p className="text-xs text-muted">{t("Fin")}</p>
              <p className="text-sm text-ink">
                {formatDate(campaign.endDate)}
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Targeting */}
      <Card className="mt-4">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">
          {t("Segmentación")}
        </h3>
        <div className="mt-3 flex flex-col gap-3">
          <div>
            <p className="text-xs text-muted">{t("Países")}</p>
            <div className="mt-1 flex flex-wrap gap-1">
              {campaign.targetCountries.map((c) => (
                <Badge key={c} variant="default">{countryName(c, t)}</Badge>
              ))}
            </div>
          </div>
          {campaign.targetCities && campaign.targetCities.length > 0 && (
            <div>
              <p className="text-xs text-muted">{t("Ciudades")}</p>
              <div className="mt-1 flex flex-wrap gap-1">
                {campaign.targetCities.map((city) => (
                  <Badge key={city.key} variant="default">{city.name}</Badge>
                ))}
              </div>
            </div>
          )}
          <div className="flex gap-6">
            <div>
              <p className="text-xs text-muted">{t("Edad")}</p>
              <p className="text-sm text-ink">
                {t("{min} – {max} años", {
                  min: campaign.ageMin,
                  max: campaign.ageMax,
                })}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted">{t("Género")}</p>
              <p className="text-sm text-ink">
                {campaign.genders.includes(0)
                  ? t("Todos")
                  : campaign.genders
                      .map((g) => (g === 1 ? t("Hombre") : t("Mujer")))
                      .join(", ")}
              </p>
            </div>
          </div>
          {campaign.interests && campaign.interests.length > 0 && (
            <div>
              <p className="text-xs text-muted">{t("Intereses")}</p>
              <div className="mt-1 flex flex-wrap gap-1">
                {campaign.interests.map((i) => (
                  <Badge key={i.id} variant="orange">{i.name}</Badge>
                ))}
              </div>
            </div>
          )}
          {campaign.customAudienceIds && campaign.customAudienceIds.length > 0 && (
            <div>
              <p className="text-xs text-muted">
                {t("Públicos personalizados")}
              </p>
              <div className="mt-1 flex flex-wrap gap-1 font-mono text-xs">
                {campaign.customAudienceIds.map((id) => (
                  <Badge key={id} variant="muted">{id}</Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Estructura en Meta — nombres + IDs por nivel */}
      <Card className="mt-4">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">
          {t("Estructura en Meta")}
        </h3>
        <div className="mt-3 flex flex-col gap-3">
          <div>
            <p className="text-xs text-muted">{t("Campaña")}</p>
            <p className="text-sm font-medium text-ink">
              {campaign.campaignName || `OneClickIA — ${campaign.headline}`}
            </p>
            {campaign.metaCampaignId && (
              <p className="text-xs text-muted font-mono">{campaign.metaCampaignId}</p>
            )}
          </div>
          <div>
            <p className="text-xs text-muted">{t("Grupo de anuncios")}</p>
            <p className="text-sm font-medium text-ink">
              {campaign.adSetName || `OneClickIA AdSet — ${campaign.headline}`}
            </p>
            {campaign.metaAdSetId && (
              <p className="text-xs text-muted font-mono">{campaign.metaAdSetId}</p>
            )}
          </div>
          <div>
            <p className="text-xs text-muted">{t("Anuncio")}</p>
            <p className="text-sm font-medium text-ink">
              {campaign.adName || `OneClickIA Ad — ${campaign.headline}`}
            </p>
            {campaign.metaAdId && (
              <p className="text-xs text-muted font-mono">{campaign.metaAdId}</p>
            )}
          </div>
        </div>
      </Card>

      {/* Actions */}
      <div className="mt-6 flex gap-3">
        {campaign.status === "DRAFT" && (
          <>
            <Button
              onClick={() => handleAction("publish")}
              loading={actionLoading === "publish"}
              size="lg"
              className="flex-1"
            >
              {t("Publicar en Meta")}
            </Button>
            <Button
              variant="ghost"
              onClick={handleDelete}
              loading={actionLoading === "delete"}
              size="sm"
            >
              {t("Eliminar")}
            </Button>
          </>
        )}

        {campaign.status === "ERROR" && (
          <Button
            onClick={() => handleAction("publish")}
            loading={actionLoading === "publish"}
            size="lg"
            className="flex-1"
          >
            {t("Reintentar publicación")}
          </Button>
        )}

        {campaign.status === "PAUSED" && (
          <Button
            onClick={() => handleAction("activate")}
            loading={actionLoading === "activate"}
            size="lg"
            className="flex-1"
          >
            {t("Activar campaña")}
          </Button>
        )}

        {campaign.status === "ACTIVE" && (
          <Button
            variant="ghost"
            onClick={() => handleAction("pause")}
            loading={actionLoading === "pause"}
            size="lg"
            className="flex-1"
          >
            {t("Pausar campaña")}
          </Button>
        )}

        {campaign.status === "PUBLISHING" && (() => {
          const elapsedSecs = publishingSince
            ? Math.floor((now - publishingSince) / 1000)
            : 0;
          const isStuck = elapsedSecs >= PUBLISHING_STUCK_THRESHOLD_SECS;
          return (
            <div className="flex flex-1 flex-col gap-3">
              <div className="flex items-center gap-3 text-sm text-muted">
                <Spinner size="sm" />
                <span>
                  {t("Publicando en Meta... ({secs}s)", { secs: elapsedSecs })}
                </span>
              </div>
              {isStuck && (
                <div className="rounded-md border border-warning/20 bg-warning/10 p-3">
                  <p className="text-sm font-medium text-warning">
                    {t("La publicación está tardando más de lo normal.")}
                  </p>
                  <p className="mt-1 text-xs text-charcoal">
                    {t(
                      "Puede ser un timeout de red. La publicación es idempotente — reintentar continuará desde el paso donde se quedó, sin duplicar nada en Meta.",
                    )}
                  </p>
                  <Button
                    size="sm"
                    onClick={() => handleAction("publish")}
                    loading={actionLoading === "publish"}
                    className="mt-3"
                  >
                    {t("Reintentar publicación")}
                  </Button>
                </div>
              )}
            </div>
          );
        })()}
      </div>
    </div>
  );
}
