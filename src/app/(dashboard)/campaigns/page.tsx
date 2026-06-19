"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { Badge } from "@/components/ui/Badge";
import { CampaignStatusBadge } from "@/components/CampaignStatusBadge";
import { Icon } from "@/components/ui/Icon";
import { api, ApiError } from "@/lib/api";
import { objectiveLabel, locationSummary } from "@/lib/labels";
import { fromMinorUnits } from "@/lib/currency";
import {
  Pagination,
  StatusFilter,
  SearchInput,
  DateRangePicker,
  DEFAULT_RANGE,
  rangeToQueryParams,
  type StatusValue,
  type DateRange,
} from "@/components/ListControls";
import type { Campaign } from "@/lib/types";

// Cuántas campañas por página en la lista de Meta Ads.
const META_PAGE_SIZE = 25;

/* ── Types ── */

interface MetaCampaign {
  id: string;
  name: string;
  objective: string;
  status: string;
  // Estado real considerando los padres (ej. CAMPAIGN_PAUSED). El
  // service lo devuelve en camelCase; status es el interruptor propio.
  effectiveStatus?: string | null;
  // El service devuelve estos campos en camelCase (no los nombres crudos
  // de Meta), así que aquí deben coincidir o salen vacíos.
  dailyBudget?: string | null;
  lifetimeBudget?: string | null;
  startTime?: string | null;
  stopTime?: string | null;
  currency?: string | null;
  createdTime: string;
  // Métricas del rango de fechas seleccionado (0 si no hubo entrega).
  spend?: number;
  impressions?: number;
  reach?: number;
  clicks?: number;
  ctr?: number;
  cpc?: number;
  cpm?: number;
  frequency?: number;
}

interface MetaAdSet {
  id: string;
  name: string;
  status: string;
  effective_status?: string;
  daily_budget?: string;
  lifetime_budget?: string;
  optimization_goal?: string;
}

interface MetaAd {
  id: string;
  name: string;
  status: string;
  effective_status?: string;
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
  // Estados efectivos (effective_status): el objeto está encendido pero
  // un padre lo frena, así que en realidad no se entrega.
  CAMPAIGN_PAUSED: { label: "Campaña pausada", variant: "muted" },
  ADSET_PAUSED: { label: "Grupo pausado", variant: "muted" },
  PENDING_REVIEW: { label: "En revisión", variant: "warning" },
  PENDING_BILLING_INFO: { label: "Falta facturación", variant: "warning" },
  PREAPPROVED: { label: "Preaprobado", variant: "warning" },
  DISAPPROVED: { label: "Rechazado", variant: "error" },
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

// Estado real de la entidad: preferimos effective_status (considera a
// los padres) y caemos a status (interruptor propio) si no viene. El
// campo llega en camelCase para campañas y snake_case para grupos/ads.
type WithStatus = {
  status: string;
  effective_status?: string;
  effectiveStatus?: string | null;
};
function effStatus(e: WithStatus): string {
  return e.effectiveStatus ?? e.effective_status ?? e.status;
}

// Ordena cualquier lista de Meta (campañas, grupos, anuncios) dejando
// las realmente activas de primeras (por effective_status, no solo el
// interruptor propio). sort() es estable, así que dentro de cada grupo
// se conserva el orden en que las devuelve Meta.
function sortByActiveFirst<T extends WithStatus>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const aActive = effStatus(a) === "ACTIVE" ? 0 : 1;
    const bActive = effStatus(b) === "ACTIVE" ? 0 : 1;
    return aActive - bActive;
  });
}

function formatMetaBudget(
  minorUnits: string | null | undefined,
  currency?: string | null,
) {
  if (!minorUnits) return "—";
  return `$${fromMinorUnits(Number(minorUnits), currency).toLocaleString("es")}`;
}

// Métricas: números/montos compactos para no romper la tarjeta con
// cifras largas en pesos.
function fmtNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString("es");
}
function fmtMoneyShort(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 10_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toLocaleString("es", { maximumFractionDigits: 0 })}`;
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

  // Controles de la lista de campañas Meta: filtro, búsqueda, página, fecha.
  const [metaStatusFilter, setMetaStatusFilter] = useState<StatusValue>("all");
  const [metaQuery, setMetaQuery] = useState("");
  const [metaPage, setMetaPage] = useState(0);
  const [range, setRange] = useState<DateRange>(DEFAULT_RANGE);

  // Campañas propias de OneClickIA: una sola vez.
  useEffect(() => {
    api
      .get<Campaign[]>("/campaigns")
      .then(setCampaigns)
      .catch((err) => {
        if (err instanceof ApiError) setError(err.message);
        else setError("Error al cargar campañas.");
      })
      .finally(() => setLoading(false));
  }, []);

  // Campañas Meta + sus métricas: se recargan al cambiar el rango.
  useEffect(() => {
    setLoadingMeta(true);
    api
      .get<{ campaigns: MetaCampaign[] }>(
        `/connections/meta/campaigns?${rangeToQueryParams(range)}`,
      )
      .then((res) => setMetaCampaigns(sortByActiveFirst(res.campaigns)))
      .catch(() => {})
      .finally(() => setLoadingMeta(false));
  }, [range]);

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
      setAdSets(sortByActiveFirst(res.adSets));
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
      setAds(sortByActiveFirst(res.ads));
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
    // amount is stored in whole currency units (not cents).
    return new Intl.NumberFormat("es", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
    }).format(amount);
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  // Lista de campañas Meta filtrada por estado (real) + búsqueda, y
  // luego paginada. metaCampaigns ya viene ordenada (activas primero).
  const metaQ = metaQuery.trim().toLowerCase();
  const metaStatusCounts = {
    all: metaCampaigns.length,
    active: metaCampaigns.filter((c) => effStatus(c) === "ACTIVE").length,
    paused: metaCampaigns.filter((c) => effStatus(c) !== "ACTIVE").length,
  };
  const filteredMeta = metaCampaigns
    .filter((c) =>
      metaStatusFilter === "all"
        ? true
        : metaStatusFilter === "active"
          ? effStatus(c) === "ACTIVE"
          : effStatus(c) !== "ACTIVE",
    )
    .filter((c) => (metaQ ? c.name.toLowerCase().includes(metaQ) : true));
  const metaTotalPages = Math.max(1, Math.ceil(filteredMeta.length / META_PAGE_SIZE));
  const metaCurrentPage = Math.min(metaPage, metaTotalPages - 1);
  const pagedMeta = filteredMeta.slice(
    metaCurrentPage * META_PAGE_SIZE,
    metaCurrentPage * META_PAGE_SIZE + META_PAGE_SIZE,
  );

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Campañas</h1>
          <p className="mt-1 text-sm text-muted">
            Gestiona tus campañas de Meta Ads.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/ads/search">
            <Button variant="ghost">Buscar Ads</Button>
          </Link>
          <Link href="/ads/custom">
            <Button>Nueva campaña</Button>
          </Link>
        </div>
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
              <Icon name="megaphone" size={36} className="mx-auto text-orange-500" />
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
                      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
                        <span>
                          {formatBudget(campaign.budgetAmount, campaign.currency)}{" "}
                          {campaign.budgetType === "DAILY" ? "/ día" : "total"}
                        </span>
                        <span>{objectiveLabel(campaign.objective)}</span>
                        {locationSummary(campaign.targetCountries, campaign.targetCities) && (
                          <span className="inline-flex items-center gap-1">
                            <Icon name="map-pin" size={13} className="text-rose-500" />
                            {locationSummary(campaign.targetCountries, campaign.targetCities)}
                          </span>
                        )}
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
          {/* Selector de fechas: controla las métricas de cada campaña.
              Visible en el nivel 1 aunque esté cargando. */}
          {!selectedCampaign && (
            <div className="mt-6">
              <DateRangePicker
                value={range}
                onChange={(r) => {
                  setRange(r);
                  setMetaPage(0);
                }}
              />
            </div>
          )}

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
                  <Icon name="smartphone" size={36} className="mx-auto text-slate-500" />
                  <p className="mt-2 text-sm text-muted">
                    No se encontraron campañas en tu cuenta de Meta Ads.
                  </p>
                </div>
              )}

              {metaCampaigns.length > 0 && (
                <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <StatusFilter
                    value={metaStatusFilter}
                    onChange={(v) => {
                      setMetaStatusFilter(v);
                      setMetaPage(0);
                    }}
                    counts={metaStatusCounts}
                  />
                  <SearchInput
                    value={metaQuery}
                    onChange={(v) => {
                      setMetaQuery(v);
                      setMetaPage(0);
                    }}
                    placeholder="Buscar campaña…"
                  />
                </div>
              )}

              {metaCampaigns.length > 0 && filteredMeta.length === 0 && (
                <p className="mt-8 text-center text-sm text-muted">
                  No hay campañas que coincidan con el filtro.
                </p>
              )}

              {filteredMeta.length > 0 && (
                <div className="mt-4 flex flex-col gap-3">
                  {pagedMeta.map((mc) => (
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
                              {statusBadge(effStatus(mc))}
                            </div>
                            <div className="mt-2 flex items-center gap-4 text-xs text-muted">
                              <span>{objectiveLabel(mc.objective)}</span>
                              <span>
                                {mc.dailyBudget
                                  ? `${formatMetaBudget(mc.dailyBudget, mc.currency)} / día`
                                  : mc.lifetimeBudget
                                    ? `${formatMetaBudget(mc.lifetimeBudget, mc.currency)} total`
                                    : "Sin presupuesto"}
                              </span>
                              <span>{formatDate(mc.createdTime)}</span>
                            </div>
                            {/* Métricas del rango de fechas seleccionado */}
                            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                              <span>
                                <span className="text-muted">Gasto </span>
                                <span className="font-semibold text-ink">
                                  {fmtMoneyShort(mc.spend ?? 0)}
                                </span>
                              </span>
                              <span>
                                <span className="text-muted">Impr. </span>
                                <span className="font-medium text-charcoal">
                                  {fmtNum(mc.impressions ?? 0)}
                                </span>
                              </span>
                              <span>
                                <span className="text-muted">Clics </span>
                                <span className="font-medium text-charcoal">
                                  {fmtNum(mc.clicks ?? 0)}
                                </span>
                              </span>
                              <span>
                                <span className="text-muted">CTR </span>
                                <span className="font-medium text-charcoal">
                                  {(mc.ctr ?? 0).toFixed(2)}%
                                </span>
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

              {filteredMeta.length > 0 && (
                <Pagination
                  page={metaCurrentPage}
                  totalItems={filteredMeta.length}
                  pageSize={META_PAGE_SIZE}
                  onPageChange={setMetaPage}
                />
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
                  {statusBadge(effStatus(selectedCampaign))}
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
                              {statusBadge(effStatus(adSet))}
                            </div>
                            <div className="mt-2 flex items-center gap-4 text-xs text-muted">
                              {adSet.optimization_goal && (
                                <span>{adSet.optimization_goal}</span>
                              )}
                              <span>
                                {adSet.daily_budget
                                  ? `${formatMetaBudget(adSet.daily_budget, selectedCampaign?.currency)} / día`
                                  : adSet.lifetime_budget
                                    ? `${formatMetaBudget(adSet.lifetime_budget, selectedCampaign?.currency)} total`
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
                  {statusBadge(effStatus(selectedAdSet))}
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
          {statusBadge(effStatus(ad))}
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
