"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { Badge } from "@/components/ui/Badge";
import { CampaignStatusBadge } from "@/components/CampaignStatusBadge";
import { api, ApiError } from "@/lib/api";
import type { Campaign } from "@/lib/types";

/* ── Types ── */

interface MetaCampaign {
  id: string;
  name: string;
  objective: string;
  status: string;
  daily_budget?: string;
  lifetime_budget?: string;
  start_time?: string;
  stop_time?: string;
  created_time: string;
}

interface MetaAdSet {
  id: string;
  name: string;
  status: string;
  daily_budget?: string;
  lifetime_budget?: string;
  optimization_goal?: string;
}

interface MetaAd {
  id: string;
  name: string;
  status: string;
}

const META_STATUS_MAP: Record<
  string,
  { label: string; variant: "success" | "muted" | "error" | "warning" | "default" }
> = {
  ACTIVE: { label: "Activa", variant: "success" },
  PAUSED: { label: "Pausada", variant: "muted" },
  DELETED: { label: "Eliminada", variant: "error" },
  ARCHIVED: { label: "Archivada", variant: "muted" },
  IN_PROCESS: { label: "En proceso", variant: "warning" },
  WITH_ISSUES: { label: "Con problemas", variant: "error" },
};

const FORMAT_LABELS: Record<string, string> = {
  DESKTOP_FEED_STANDARD: "Facebook Feed",
  MOBILE_FEED_STANDARD: "Facebook Móvil",
  INSTAGRAM_STANDARD: "Instagram Feed",
  INSTAGRAM_STORY: "Instagram Story",
};

function statusBadge(status: string) {
  const info = META_STATUS_MAP[status] || { label: status, variant: "default" as const };
  return <Badge variant={info.variant}>{info.label}</Badge>;
}

function formatMetaBudget(cents: string | null | undefined) {
  if (!cents) return "—";
  return `$${(Number(cents) / 100).toLocaleString("es")}`;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("es", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/* ── Main Page ── */

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [metaCampaigns, setMetaCampaigns] = useState<MetaCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMeta, setLoadingMeta] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"oneclickia" | "meta">("oneclickia");

  // Meta drill-down state
  const [selectedCampaign, setSelectedCampaign] = useState<MetaCampaign | null>(null);
  const [adSets, setAdSets] = useState<MetaAdSet[]>([]);
  const [loadingAdSets, setLoadingAdSets] = useState(false);

  const [selectedAdSet, setSelectedAdSet] = useState<MetaAdSet | null>(null);
  const [ads, setAds] = useState<MetaAd[]>([]);
  const [loadingAds, setLoadingAds] = useState(false);

  useEffect(() => {
    api
      .get<Campaign[]>("/campaigns")
      .then(setCampaigns)
      .catch((err) => {
        if (err instanceof ApiError) setError(err.message);
        else setError("Error al cargar campañas.");
      })
      .finally(() => setLoading(false));

    api
      .get<{ campaigns: MetaCampaign[] }>("/connections/meta/campaigns")
      .then((res) => setMetaCampaigns(res.campaigns))
      .catch(() => {})
      .finally(() => setLoadingMeta(false));
  }, []);

  async function handleDeleteDraft(id: string) {
    if (!confirm("¿Estás seguro de eliminar esta campaña?")) return;
    try {
      await api.delete(`/campaigns/${id}`);
      setCampaigns((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError("Error al eliminar la campaña.");
    }
  }

  async function openCampaignAdSets(campaign: MetaCampaign) {
    setSelectedCampaign(campaign);
    setSelectedAdSet(null);
    setAds([]);
    setLoadingAdSets(true);
    try {
      const res = await api.get<{ adSets: MetaAdSet[] }>(
        `/connections/meta/campaigns/${campaign.id}/adsets`,
      );
      setAdSets(res.adSets);
    } catch {
      setAdSets([]);
    } finally {
      setLoadingAdSets(false);
    }
  }

  async function openAdSetAds(adSet: MetaAdSet) {
    setSelectedAdSet(adSet);
    setLoadingAds(true);
    try {
      const res = await api.get<{ ads: MetaAd[] }>(
        `/connections/meta/adsets/${adSet.id}/ads`,
      );
      setAds(res.ads);
    } catch {
      setAds([]);
    } finally {
      setLoadingAds(false);
    }
  }

  function goBackToCampaigns() {
    setSelectedCampaign(null);
    setSelectedAdSet(null);
    setAdSets([]);
    setAds([]);
  }

  function goBackToAdSets() {
    setSelectedAdSet(null);
    setAds([]);
  }

  function formatBudget(amount: number, currency: string) {
    return new Intl.NumberFormat("es", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
    }).format(amount / 100);
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Campañas</h1>
          <p className="mt-1 text-sm text-muted">
            Gestiona tus campañas de Meta Ads.
          </p>
        </div>
        <Link href="/ads/search">
          <Button>Nueva campaña</Button>
        </Link>
      </div>

      {error && (
        <div className="mt-4 rounded-md border border-error/20 bg-error/10 p-3">
          <p className="text-sm text-error">{error}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="mt-6 flex gap-1 border-b border-sand">
        <button
          type="button"
          onClick={() => { setTab("oneclickia"); goBackToCampaigns(); }}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            tab === "oneclickia"
              ? "border-b-2 border-orange text-orange"
              : "text-muted hover:text-ink"
          }`}
        >
          OneClickIA ({campaigns.length})
        </button>
        <button
          type="button"
          onClick={() => { setTab("meta"); goBackToCampaigns(); }}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            tab === "meta"
              ? "border-b-2 border-orange text-orange"
              : "text-muted hover:text-ink"
          }`}
        >
          Meta Ads {loadingMeta ? "" : `(${metaCampaigns.length})`}
        </button>
      </div>

      {/* ── OneClickIA campaigns ── */}
      {tab === "oneclickia" && (
        <>
          {campaigns.length === 0 && (
            <div className="mt-12 text-center">
              <p className="text-3xl">📢</p>
              <p className="mt-2 text-sm text-muted">
                Aún no tienes campañas creadas desde OneClickIA.
              </p>
              <Link href="/ads/search" className="mt-4 inline-block">
                <Button variant="ghost" size="sm">Buscar Ads</Button>
              </Link>
            </div>
          )}

          {campaigns.length > 0 && (
            <div className="mt-4 flex flex-col gap-3">
              {campaigns.map((campaign) => (
                <Card key={campaign.id} className="transition-colors hover:border-orange/50">
                  <div className="flex items-start justify-between">
                    <Link href={`/campaigns/${campaign.id}`} className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-sm font-semibold text-ink line-clamp-1">
                          {campaign.headline}
                        </h3>
                        <CampaignStatusBadge status={campaign.status} />
                      </div>
                      <p className="mt-1 text-xs text-charcoal line-clamp-1">
                        {campaign.description}
                      </p>
                      <div className="mt-2 flex items-center gap-4 text-xs text-muted">
                        <span>
                          {formatBudget(campaign.budgetAmount, campaign.currency)}{" "}
                          {campaign.budgetType === "DAILY" ? "/ día" : "total"}
                        </span>
                        <span>{campaign.objective.replace("OUTCOME_", "")}</span>
                        <span>{formatDate(campaign.createdAt)}</span>
                      </div>
                    </Link>
                    {["DRAFT", "PUBLISHING", "ERROR"].includes(campaign.status) && (
                      <button
                        type="button"
                        onClick={() => handleDeleteDraft(campaign.id)}
                        className="ml-3 rounded-md px-2 py-1 text-xs text-muted transition-colors hover:bg-error/10 hover:text-error"
                      >
                        Eliminar
                      </button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── Meta Ads — hierarchical drill-down ── */}
      {tab === "meta" && (
        <>
          {loadingMeta && (
            <div className="flex justify-center py-12">
              <Spinner size="lg" />
            </div>
          )}

          {/* Level 1: Campaigns list */}
          {!loadingMeta && !selectedCampaign && (
            <>
              {metaCampaigns.length === 0 && (
                <div className="mt-12 text-center">
                  <p className="text-3xl">📱</p>
                  <p className="mt-2 text-sm text-muted">
                    No se encontraron campañas en tu cuenta de Meta Ads.
                  </p>
                </div>
              )}

              {metaCampaigns.length > 0 && (
                <div className="mt-4 flex flex-col gap-3">
                  {metaCampaigns.map((mc) => (
                    <button
                      key={mc.id}
                      type="button"
                      onClick={() => openCampaignAdSets(mc)}
                      className="w-full text-left"
                    >
                      <Card className="transition-colors hover:border-orange/50">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <h3 className="text-sm font-semibold text-ink line-clamp-1">
                                {mc.name}
                              </h3>
                              {statusBadge(mc.status)}
                            </div>
                            <div className="mt-2 flex items-center gap-4 text-xs text-muted">
                              <span>{mc.objective}</span>
                              <span>
                                {mc.daily_budget
                                  ? `${formatMetaBudget(mc.daily_budget)} / día`
                                  : mc.lifetime_budget
                                    ? `${formatMetaBudget(mc.lifetime_budget)} total`
                                    : "Sin presupuesto"}
                              </span>
                              <span>{formatDate(mc.created_time)}</span>
                            </div>
                          </div>
                          <span className="text-muted text-sm">→</span>
                        </div>
                      </Card>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Level 2: Ad Sets of selected campaign */}
          {selectedCampaign && !selectedAdSet && (
            <>
              <div className="mt-4">
                <button
                  type="button"
                  onClick={goBackToCampaigns}
                  className="text-sm text-muted hover:text-ink transition-colors"
                >
                  ← Volver a campañas
                </button>
                <div className="mt-2 flex items-center gap-3">
                  <h2 className="text-lg font-semibold text-ink">
                    {selectedCampaign.name}
                  </h2>
                  {statusBadge(selectedCampaign.status)}
                </div>
                <p className="text-sm text-muted">Grupos de anuncios</p>
              </div>

              {loadingAdSets && (
                <div className="flex justify-center py-12">
                  <Spinner size="lg" />
                </div>
              )}

              {!loadingAdSets && adSets.length === 0 && (
                <div className="mt-8 text-center">
                  <p className="text-sm text-muted">
                    Esta campaña no tiene grupos de anuncios.
                  </p>
                </div>
              )}

              {!loadingAdSets && adSets.length > 0 && (
                <div className="mt-4 flex flex-col gap-3">
                  {adSets.map((adSet) => (
                    <button
                      key={adSet.id}
                      type="button"
                      onClick={() => openAdSetAds(adSet)}
                      className="w-full text-left"
                    >
                      <Card className="transition-colors hover:border-orange/50">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <h3 className="text-sm font-semibold text-ink line-clamp-1">
                                {adSet.name}
                              </h3>
                              {statusBadge(adSet.status)}
                            </div>
                            <div className="mt-2 flex items-center gap-4 text-xs text-muted">
                              {adSet.optimization_goal && (
                                <span>{adSet.optimization_goal}</span>
                              )}
                              <span>
                                {adSet.daily_budget
                                  ? `${formatMetaBudget(adSet.daily_budget)} / día`
                                  : adSet.lifetime_budget
                                    ? `${formatMetaBudget(adSet.lifetime_budget)} total`
                                    : "Sin presupuesto"}
                              </span>
                            </div>
                          </div>
                          <span className="text-muted text-sm">→</span>
                        </div>
                      </Card>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Level 3: Ads of selected ad set */}
          {selectedAdSet && (
            <>
              <div className="mt-4">
                <button
                  type="button"
                  onClick={goBackToAdSets}
                  className="text-sm text-muted hover:text-ink transition-colors"
                >
                  ← Volver a {selectedCampaign?.name}
                </button>
                <div className="mt-2 flex items-center gap-3">
                  <h2 className="text-lg font-semibold text-ink">
                    {selectedAdSet.name}
                  </h2>
                  {statusBadge(selectedAdSet.status)}
                </div>
                <p className="text-sm text-muted">Anuncios</p>
              </div>

              {loadingAds && (
                <div className="flex justify-center py-12">
                  <Spinner size="lg" />
                </div>
              )}

              {!loadingAds && ads.length === 0 && (
                <div className="mt-8 text-center">
                  <p className="text-sm text-muted">
                    Este grupo de anuncios no tiene anuncios.
                  </p>
                </div>
              )}

              {!loadingAds && ads.length > 0 && (
                <div className="mt-4 flex flex-col gap-3">
                  {ads.map((ad) => (
                    <AdWithPreview key={ad.id} ad={ad} />
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}

/* ── Ad card with toggle preview ── */

function AdWithPreview({ ad }: { ad: MetaAd }) {
  const [previews, setPreviews] = useState<{ format: string; html: string }[]>([]);
  const [showPreviews, setShowPreviews] = useState(false);
  const [loadingPreviews, setLoadingPreviews] = useState(false);

  async function loadPreviews() {
    setLoadingPreviews(true);
    try {
      const res = await api.get<{ previews: { format: string; html: string }[] }>(
        `/connections/meta/ads/${ad.id}/preview`,
      );
      setPreviews(res.previews);
      setShowPreviews(true);
    } catch {
      // Preview not available
    } finally {
      setLoadingPreviews(false);
    }
  }

  return (
    <Card>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-semibold text-ink line-clamp-1">
            {ad.name}
          </h3>
          {statusBadge(ad.status)}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            if (previews.length === 0) loadPreviews();
            else setShowPreviews(!showPreviews);
          }}
          loading={loadingPreviews}
        >
          {showPreviews ? "Ocultar preview" : "Ver preview"}
        </Button>
      </div>

      {previews.length > 0 && showPreviews && (
        <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {previews.map((preview) => (
            <div key={preview.format} className="flex flex-col gap-2">
              <Badge variant="orange">
                {FORMAT_LABELS[preview.format] || preview.format}
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
  );
}
