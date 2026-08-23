"use client";

import { Fragment, useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { api } from "@/lib/api";
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
import { useI18n, useT } from "@/contexts/I18nContext";
import type { TranslateFn } from "@/i18n/translate";

interface CampaignInsight {
  campaignId: string;
  campaignName: string;
  status: string;
  dailyBudget: number | null;
  spend: number;
  impressions: number;
  reach: number;
  clicks: number;
  ctr: number;
  cpc: number;
  cpm: number;
  frequency: number;
  conversions: number;
  cpa: number | null;
  roas: number | null;
}

type SuggestionType = "raiseBudget" | "lowerBudget" | "pause" | "activate" | "refreshCreatives";
type EntityLevel = "campaign" | "adset" | "ad";

interface Suggestion {
  type: SuggestionType;
  severity: "success" | "warning" | "error";
  title: string;
  description: string;
  // For budget changes: the suggested new daily budget value
  suggestedBudget?: number;
}

interface EntityMetrics {
  level: EntityLevel;
  id: string;
  name: string;
  status: string;
  dailyBudget: number | null;
  spend: number;
  impressions: number;
  clicks: number;
  ctr: number;
  cpc: number;
  frequency: number;
}

interface AdSetInsight {
  adSetId: string;
  adSetName: string;
  status: string;
  dailyBudget: number | null;
  spend: number;
  impressions: number;
  reach: number;
  clicks: number;
  ctr: number;
  cpc: number;
  cpm: number;
  frequency: number;
  cpa: number | null;
  roas: number | null;
}

interface AdInsight {
  adId: string;
  adName: string;
  status: string;
  spend: number;
  impressions: number;
  reach: number;
  clicks: number;
  ctr: number;
  cpc: number;
  cpm: number;
  frequency: number;
  cpa: number | null;
  roas: number | null;
}

interface DashboardData {
  campaigns: CampaignInsight[];
  totals: {
    spend: number;
    impressions: number;
    reach: number;
    clicks: number;
    conversions: number;
  };
}

type DrillLevel = "campaigns" | "adsets" | "ads";

// Los textos en español son también sus claves de traducción (ver src/i18n).
const STATUS_MAP: Record<string, { label: string; variant: "success" | "muted" | "error" | "warning" | "default" }> = {
  ACTIVE: { label: "Activa", variant: "success" },
  PAUSED: { label: "Pausada", variant: "muted" },
  ARCHIVED: { label: "Archivada", variant: "muted" },
};

function ctrHealth(ctr: number): "success" | "warning" | "error" {
  if (ctr >= 2) return "success";
  if (ctr >= 1) return "warning";
  return "error";
}

function freqHealth(freq: number): "success" | "warning" | "error" {
  if (freq <= 2) return "success";
  if (freq <= 3.5) return "warning";
  return "error";
}

function cpcHealth(cpc: number): "success" | "warning" | "error" {
  if (cpc <= 0.5) return "success";
  if (cpc <= 1.5) return "warning";
  return "error";
}

// ROAS = ingreso / gasto. >3 es premium, 1.5-3 sostiene el negocio,
// <1.5 quema dinero. Cuando no hay conversiones reportadas devolvemos
// null y la celda muestra "—" en lugar de colorear como error.
function roasHealth(roas: number): "success" | "warning" | "error" {
  if (roas >= 3) return "success";
  if (roas >= 1.5) return "warning";
  return "error";
}

// CPA bueno depende del ticket promedio del producto, pero estos
// umbrales sirven como referencia genérica para e-commerce LATAM.
function cpaHealth(cpa: number): "success" | "warning" | "error" {
  if (cpa <= 20) return "success";
  if (cpa <= 50) return "warning";
  return "error";
}

function fmtRoas(roas: number | null): string {
  if (roas == null) return "—";
  return `${roas.toFixed(2)}x`;
}

function fmtCpa(cpa: number | null, localeTag = "es-CO"): string {
  if (cpa == null) return "—";
  return formatMoney(cpa, localeTag);
}

const HEALTH_COLORS = {
  success: "text-success",
  warning: "text-warning",
  error: "text-error",
};

const HEALTH_BG = {
  success: "bg-success/10 border-success/20",
  warning: "bg-warning/10 border-warning/20",
  error: "bg-error/10 border-error/20",
};

// `localeTag` decide el separador de miles/decimales; por defecto español.
function formatNum(n: number, localeTag = "es-CO"): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString(localeTag);
}

function formatMoney(n: number, localeTag = "es-CO"): string {
  return `$${n.toLocaleString(localeTag, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

// Versión compacta para las tarjetas de resumen, donde los montos en
// pesos (COP) son tan largos que se desbordan del recuadro. La tabla
// sigue usando formatMoney() con el detalle completo.
function formatMoneyCompact(n: number, localeTag = "es-CO"): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 10_000) return `$${(n / 1_000).toFixed(1)}K`;
  return formatMoney(n, localeTag);
}

// Los textos en español son también sus claves de traducción (ver src/i18n).
const LEVEL_LABELS: Record<EntityLevel, { entity: string; pause: string; activate: string }> = {
  campaign: { entity: "la campaña", pause: "Pausar campaña", activate: "Reactivar campaña" },
  adset: { entity: "el grupo de anuncios", pause: "Pausar grupo", activate: "Reactivar grupo" },
  ad: { entity: "el anuncio", pause: "Pausar anuncio", activate: "Reactivar anuncio" },
};

function getSuggestions(
  e: EntityMetrics,
  t: TranslateFn,
  localeTag: string,
): Suggestion[] {
  const out: Suggestion[] = [];
  const isActive = e.status === "ACTIVE";
  const hasData = e.impressions > 0;
  const L = LEVEL_LABELS[e.level];
  const entity = t(L.entity);
  const money = (n: number) => formatMoney(n, localeTag);
  const canEditBudget = e.level !== "ad"; // ads never carry their own budget

  // 0 clicks but spending → pause urgently
  if (isActive && e.spend > 5 && e.clicks === 0) {
    out.push({
      type: "pause",
      severity: "error",
      title: t("Pausar urgente"),
      description: t(
        "Llevas {spend} sin un solo clic. Pausa {entity} y revisa segmentación/creativo antes de seguir gastando.",
        { spend: money(e.spend), entity },
      ),
    });
    return out;
  }

  // Fatiga: frecuencia muy alta
  if (hasData && e.frequency > 3.5) {
    out.push({
      type: "refreshCreatives",
      severity: "error",
      title: t("Refresca los creativos"),
      description: t(
        "Frecuencia de {freq} indica fatiga de audiencia. Cambia la imagen o el copy para evitar quemar la audiencia.",
        { freq: e.frequency.toFixed(1) },
      ),
    });
    if (isActive) {
      out.push({
        type: "pause",
        severity: "warning",
        title: t("Pausar mientras refrescas"),
        description: t(
          "Considera pausar {entity} hasta tener creativos nuevos para no seguir gastando con CTR caído.",
          { entity },
        ),
      });
    }
  }

  // CTR muy bajo con gasto significativo
  if (hasData && e.ctr < 1 && e.spend > 10) {
    out.push({
      type: "pause",
      severity: "warning",
      title: t("CTR bajo"),
      description: t(
        "CTR de {ctr}% es bajo. Pausa o reduce presupuesto y revisa el creativo/audiencia.",
        { ctr: e.ctr.toFixed(2) },
      ),
    });
    if (canEditBudget && e.dailyBudget && e.dailyBudget > 5) {
      const suggested = Math.max(5, Math.round(e.dailyBudget * 0.6));
      out.push({
        type: "lowerBudget",
        severity: "warning",
        title: t("Bajar presupuesto a {amount}", { amount: money(suggested) }),
        description: t(
          "Reducir el gasto diario un 40% mientras pruebas variantes. (Actual: {current}/día)",
          { current: money(e.dailyBudget) },
        ),
        suggestedBudget: suggested,
      });
    }
  }

  // Excelente desempeño + no saturado → escalar
  if (
    isActive &&
    hasData &&
    e.ctr >= 2 &&
    e.frequency <= 2 &&
    e.cpc <= 1.5 &&
    canEditBudget &&
    e.dailyBudget
  ) {
    const suggested = Math.round(e.dailyBudget * 1.2);
    out.push({
      type: "raiseBudget",
      severity: "success",
      title: t("Subir presupuesto a {amount}", { amount: money(suggested) }),
      description: t(
        "CTR {ctr}% y frecuencia {freq} indican que rinde y aún hay margen. Sube +20% para escalar sin sobrecargar. (Actual: {current}/día)",
        {
          ctr: e.ctr.toFixed(2),
          freq: e.frequency.toFixed(1),
          current: money(e.dailyBudget),
        },
      ),
      suggestedBudget: suggested,
    });
  }

  // Pausado con buen historial → considerar reactivar
  if (!isActive && e.status === "PAUSED" && hasData && e.ctr >= 1.5 && e.frequency <= 3) {
    out.push({
      type: "activate",
      severity: "success",
      title: t(L.activate),
      description: t(
        "{name} estaba pausado con CTR {ctr}% y frecuencia {freq}. Vale la pena reactivarlo.",
        {
          name: e.name,
          ctr: e.ctr.toFixed(2),
          freq: e.frequency.toFixed(1),
        },
      ),
    });
  }

  return out;
}

function campaignToEntity(c: CampaignInsight): EntityMetrics {
  return {
    level: "campaign",
    id: c.campaignId,
    name: c.campaignName,
    status: c.status,
    dailyBudget: c.dailyBudget,
    spend: c.spend,
    impressions: c.impressions,
    clicks: c.clicks,
    ctr: c.ctr,
    cpc: c.cpc,
    frequency: c.frequency,
  };
}

function adSetToEntity(a: AdSetInsight): EntityMetrics {
  return {
    level: "adset",
    id: a.adSetId,
    name: a.adSetName,
    status: a.status,
    dailyBudget: a.dailyBudget,
    spend: a.spend,
    impressions: a.impressions,
    clicks: a.clicks,
    ctr: a.ctr,
    cpc: a.cpc,
    frequency: a.frequency,
  };
}

function adToEntity(ad: AdInsight): EntityMetrics {
  return {
    level: "ad",
    id: ad.adId,
    name: ad.adName,
    status: ad.status,
    dailyBudget: null,
    spend: ad.spend,
    impressions: ad.impressions,
    clicks: ad.clicks,
    ctr: ad.ctr,
    cpc: ad.cpc,
    frequency: ad.frequency,
  };
}

// Cuántas filas por página en la tabla de campañas.
const PAGE_SIZE = 25;

// Columnas por las que se puede ordenar. "default" = activas primero,
// luego mayor gasto (el orden inicial).
type SortKey =
  | "default"
  | "name"
  | "spend"
  | "impressions"
  | "clicks"
  | "ctr"
  | "cpc"
  | "cpm"
  | "frequency"
  | "cpa"
  | "roas";

function compareCampaigns(
  a: CampaignInsight,
  b: CampaignInsight,
  key: SortKey,
  dir: "asc" | "desc",
): number {
  if (key === "default") {
    const aActive = a.status === "ACTIVE" ? 0 : 1;
    const bActive = b.status === "ACTIVE" ? 0 : 1;
    if (aActive !== bActive) return aActive - bActive;
    return b.spend - a.spend;
  }
  let cmp: number;
  if (key === "name") {
    cmp = a.campaignName.localeCompare(b.campaignName, "es");
  } else {
    // cpa/roas pueden ser null → los tratamos como 0 para ordenar.
    const av = (a[key] as number | null) ?? 0;
    const bv = (b[key] as number | null) ?? 0;
    cmp = av - bv;
  }
  return dir === "asc" ? cmp : -cmp;
}

/* Encabezado de tabla clicable para ordenar por esa columna. */
function SortableTh({
  label,
  colKey,
  activeKey,
  dir,
  onSort,
  align = "right",
}: {
  label: string;
  colKey: SortKey;
  activeKey: SortKey;
  dir: "asc" | "desc";
  onSort: (key: SortKey) => void;
  align?: "left" | "right";
}) {
  const isActive = activeKey === colKey;
  return (
    <th className={`pb-3 pr-4 ${align === "right" ? "text-right" : ""}`}>
      <button
        type="button"
        onClick={() => onSort(colKey)}
        className={`inline-flex items-center gap-1 uppercase tracking-wide transition-colors hover:text-ink ${
          isActive ? "text-ink" : ""
        }`}
      >
        {label}
        <span className="text-orange">{isActive ? (dir === "asc" ? "↑" : "↓") : ""}</span>
      </button>
    </th>
  );
}

export default function AnalyticsPage() {
  const { t, localeTag } = useI18n();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Drill-down state
  const [drillLevel, setDrillLevel] = useState<DrillLevel>("campaigns");
  const [selectedCampaign, setSelectedCampaign] = useState<CampaignInsight | null>(null);
  const [selectedAdSet, setSelectedAdSet] = useState<AdSetInsight | null>(null);
  const [adSets, setAdSets] = useState<AdSetInsight[]>([]);
  const [ads, setAds] = useState<AdInsight[]>([]);
  const [drillLoading, setDrillLoading] = useState(false);

  // Suggestions panel state
  const [expandedSuggestions, setExpandedSuggestions] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");

  // Controles de la tabla de campañas: filtro, búsqueda, orden, página.
  const [statusFilter, setStatusFilter] = useState<StatusValue>("all");
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("default");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(0);

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
    setPage(0);
  }

  // Rango de fechas que controla TODAS las métricas (dashboard + drill-down).
  const [range, setRange] = useState<DateRange>(DEFAULT_RANGE);
  const withRange = (path: string) => `${path}?${rangeToQueryParams(range)}`;

  const LEVEL_PATH: Record<EntityLevel, string> = {
    campaign: "campaigns",
    adset: "adsets",
    ad: "ads",
  };

  async function refreshData() {
    try {
      const res = await api.get<DashboardData>(
        withRange("/connections/meta/insights/dashboard"),
      );
      setData(res);
      // Refresh drill-down too if applicable
      if (selectedCampaign) {
        const adSetsRes = await api.get<{ adSets: AdSetInsight[] }>(
          withRange(
            `/connections/meta/campaigns/${selectedCampaign.campaignId}/adsets/insights`,
          ),
        );
        setAdSets(adSetsRes.adSets);
      }
      if (selectedAdSet) {
        const adsRes = await api.get<{ ads: AdInsight[] }>(
          withRange(
            `/connections/meta/adsets/${selectedAdSet.adSetId}/ads/insights`,
          ),
        );
        setAds(adsRes.ads);
      }
    } catch {
      // Silent — keep stale data
    }
  }

  async function applyStatusChange(
    level: EntityLevel,
    id: string,
    status: "ACTIVE" | "PAUSED",
  ) {
    const actionKey = `${level}:${id}:status:${status}`;
    setActionLoading(actionKey);
    setActionError("");
    try {
      await api.patch(`/connections/meta/${LEVEL_PATH[level]}/${id}/status`, {
        status,
      });
      await refreshData();
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "No se pudo actualizar el estado.",
      );
    } finally {
      setActionLoading(null);
    }
  }

  async function applyBudgetChange(
    level: EntityLevel,
    id: string,
    dailyBudget: number,
  ) {
    if (level === "ad") return; // ads never carry their own budget
    const actionKey = `${level}:${id}:budget`;
    setActionLoading(actionKey);
    setActionError("");
    try {
      await api.patch(`/connections/meta/${LEVEL_PATH[level]}/${id}/budget`, {
        dailyBudget,
      });
      await refreshData();
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "No se pudo actualizar el presupuesto.",
      );
    } finally {
      setActionLoading(null);
    }
  }

  useEffect(() => {
    setLoading(true);
    api
      .get<DashboardData>(
        `/connections/meta/insights/dashboard?${rangeToQueryParams(range)}`,
      )
      .then(setData)
      .catch((err) => setError(err.message || "Error al cargar analytics."))
      .finally(() => setLoading(false));
    // Re-fetch cuando cambia el rango de fechas.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range]);

  async function handleCampaignClick(campaign: CampaignInsight) {
    setSelectedCampaign(campaign);
    setDrillLevel("adsets");
    setDrillLoading(true);
    setAdSets([]);
    setAds([]);
    setSelectedAdSet(null);

    try {
      const res = await api.get<{ adSets: AdSetInsight[] }>(
        withRange(
          `/connections/meta/campaigns/${campaign.campaignId}/adsets/insights`,
        ),
      );
      setAdSets(res.adSets);
    } catch {
      setAdSets([]);
    } finally {
      setDrillLoading(false);
    }
  }

  async function handleAdSetClick(adSet: AdSetInsight) {
    setSelectedAdSet(adSet);
    setDrillLevel("ads");
    setDrillLoading(true);
    setAds([]);

    try {
      const res = await api.get<{ ads: AdInsight[] }>(
        withRange(`/connections/meta/adsets/${adSet.adSetId}/ads/insights`),
      );
      setAds(res.ads);
    } catch {
      setAds([]);
    } finally {
      setDrillLoading(false);
    }
  }

  function handleBackToCampaigns() {
    setDrillLevel("campaigns");
    setSelectedCampaign(null);
    setSelectedAdSet(null);
    setAdSets([]);
    setAds([]);
  }

  function handleBackToAdSets() {
    setDrillLevel("adsets");
    setSelectedAdSet(null);
    setAds([]);
  }

  // Spinner de pantalla completa solo en la carga inicial. Al cambiar el
  // rango de fechas mantenemos la vista anterior mientras refresca.
  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16">
        <Spinner size="lg" />
        <p className="text-sm text-muted">{t("Cargando métricas de Meta Ads...")}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl">
        <h1 className="text-2xl font-semibold text-ink">Analytics</h1>
        <div className="mt-4 rounded-md border border-error/20 bg-error/10 p-3">
          <p className="text-sm text-error">{t(error)}</p>
        </div>
      </div>
    );
  }

  if (!data || data.campaigns.length === 0) {
    return (
      <div className="max-w-2xl">
        <h1 className="text-2xl font-semibold text-ink">Analytics</h1>
        <p className="mt-1 text-sm text-muted">
          {t("Métricas de tus campañas publicitarias.")}
        </p>
        <div className="mt-12 text-center">
          <Icon name="chart" size={36} className="mx-auto text-blue-500" />
          <p className="mt-2 text-sm text-muted">
            {t("Aún no hay datos. Publica una campaña para ver métricas.")}
          </p>
        </div>
      </div>
    );
  }

  const { campaigns } = data;

  // Conteos por estado para las pills del filtro.
  const statusCounts = {
    all: campaigns.length,
    active: campaigns.filter((c) => c.status === "ACTIVE").length,
    paused: campaigns.filter((c) => c.status !== "ACTIVE").length,
  };

  // Filtro por estado + búsqueda por nombre, luego orden (por defecto
  // activas primero y mayor gasto), y finalmente paginado.
  const q = query.trim().toLowerCase();
  const filteredCampaigns = campaigns
    .filter((c) =>
      statusFilter === "all"
        ? true
        : statusFilter === "active"
          ? c.status === "ACTIVE"
          : c.status !== "ACTIVE",
    )
    .filter((c) => (q ? c.campaignName.toLowerCase().includes(q) : true))
    .sort((a, b) => compareCampaigns(a, b, sortKey, sortDir));

  const totalPages = Math.max(1, Math.ceil(filteredCampaigns.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages - 1);
  const pagedCampaigns = filteredCampaigns.slice(
    currentPage * PAGE_SIZE,
    currentPage * PAGE_SIZE + PAGE_SIZE,
  );

  // Las tarjetas de resumen reflejan el conjunto FILTRADO (todas las que
  // pasan el filtro/búsqueda, no solo la página visible), para que
  // coincidan con lo que se está viendo en la tabla.
  const isFiltered = statusFilter !== "all" || q.length > 0;
  const viewTotals = filteredCampaigns.reduce(
    (acc, c) => {
      acc.spend += c.spend;
      acc.impressions += c.impressions;
      acc.reach += c.reach;
      acc.clicks += c.clicks;
      acc.conversions += c.conversions;
      return acc;
    },
    { spend: 0, impressions: 0, reach: 0, clicks: 0, conversions: 0 },
  );

  const avgCtr =
    viewTotals.impressions > 0
      ? (viewTotals.clicks / viewTotals.impressions) * 100
      : 0;
  const avgCpc = viewTotals.clicks > 0 ? viewTotals.spend / viewTotals.clicks : 0;
  const overallCpa =
    viewTotals.conversions > 0 ? viewTotals.spend / viewTotals.conversions : null;
  // ROAS global = ingreso atribuido / gasto atribuido. Ingreso por
  // campaña = roas * spend; sólo sumamos campañas (del conjunto filtrado)
  // que reportaron ROAS para no diluir el promedio.
  const roasContributors = filteredCampaigns.filter(
    (c): c is typeof c & { roas: number } => c.roas != null,
  );
  const roasSpend = roasContributors.reduce((s, c) => s + c.spend, 0);
  const overallRoas =
    roasSpend > 0
      ? roasContributors.reduce((s, c) => s + c.roas * c.spend, 0) / roasSpend
      : null;

  return (
    <div className="max-w-6xl">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Analytics</h1>
          <p className="mt-1 text-sm text-muted">
            {t("Rendimiento de tus campañas en Meta Ads.")}
          </p>
        </div>
        <div className="flex flex-col gap-1 sm:items-end">
          <DateRangePicker value={range} onChange={setRange} />
          {loading && (
            <span className="text-xs text-muted">{t("Actualizando…")}</span>
          )}
        </div>
      </div>

      {/* Summary cards */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
        <SummaryCard label={t("Gasto total")} value={formatMoneyCompact(viewTotals.spend, localeTag)} />
        <SummaryCard label={t("Impresiones")} value={formatNum(viewTotals.impressions, localeTag)} />
        <SummaryCard label={t("Alcance")} value={formatNum(viewTotals.reach, localeTag)} />
        <SummaryCard
          label={t("CTR promedio")}
          value={`${avgCtr.toFixed(2)}%`}
          health={ctrHealth(avgCtr)}
        />
        <SummaryCard
          label={t("CPC promedio")}
          value={formatMoneyCompact(avgCpc, localeTag)}
          health={cpcHealth(avgCpc)}
        />
        <SummaryCard
          label={t("CPA promedio")}
          value={overallCpa != null ? formatMoneyCompact(overallCpa, localeTag) : "—"}
          health={overallCpa != null ? cpaHealth(overallCpa) : undefined}
        />
        <SummaryCard
          label={t("ROAS global")}
          value={fmtRoas(overallRoas)}
          health={overallRoas != null ? roasHealth(overallRoas) : undefined}
        />
      </div>

      {isFiltered && (
        <p className="mt-2 text-xs text-muted">
          {filteredCampaigns.length === 1
            ? t("Totales de 1 campaña filtrada.")
            : t("Totales de {count} campañas filtradas.", {
                count: filteredCampaigns.length,
              })}
        </p>
      )}

      {/* Breadcrumb navigation */}
      <div className="mt-6 flex items-center gap-2 text-sm">
        <button
          type="button"
          onClick={handleBackToCampaigns}
          className={`transition-colors ${
            drillLevel === "campaigns"
              ? "font-semibold text-ink"
              : "text-orange hover:text-orange/80 cursor-pointer"
          }`}
        >
          {t("Campañas")}
        </button>
        {selectedCampaign && (
          <>
            <span className="text-muted">/</span>
            <button
              type="button"
              onClick={handleBackToAdSets}
              className={`transition-colors line-clamp-1 max-w-[250px] ${
                drillLevel === "adsets"
                  ? "font-semibold text-ink"
                  : "text-orange hover:text-orange/80 cursor-pointer"
              }`}
              title={selectedCampaign.campaignName}
            >
              {selectedCampaign.campaignName}
            </button>
          </>
        )}
        {selectedAdSet && (
          <>
            <span className="text-muted">/</span>
            <span className="font-semibold text-ink line-clamp-1 max-w-[250px]" title={selectedAdSet.adSetName}>
              {selectedAdSet.adSetName}
            </span>
          </>
        )}
      </div>

      {/* Drill-down tables */}
      {drillLevel === "campaigns" && (
        <Card className="mt-4 overflow-x-auto">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">
              {t("Detalle por campaña")}
            </h3>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <StatusFilter
                value={statusFilter}
                onChange={(v) => {
                  setStatusFilter(v);
                  setPage(0);
                }}
                counts={statusCounts}
              />
              <SearchInput
                value={query}
                onChange={(v) => {
                  setQuery(v);
                  setPage(0);
                }}
                placeholder={t("Buscar campaña…")}
              />
            </div>
          </div>

          {actionError && (
            <div className="mt-3 rounded-md border border-error/20 bg-error/10 p-3">
              <p className="text-sm text-error">{t(actionError)}</p>
            </div>
          )}

          <table className="mt-4 w-full text-left text-sm">
            <thead>
              <tr className="border-b border-sand text-xs font-semibold uppercase tracking-wide text-muted">
                <SortableTh label={t("Campaña")} colKey="name" activeKey={sortKey} dir={sortDir} onSort={handleSort} align="left" />
                <SortableTh label={t("Gasto")} colKey="spend" activeKey={sortKey} dir={sortDir} onSort={handleSort} />
                <SortableTh label={t("Impresiones")} colKey="impressions" activeKey={sortKey} dir={sortDir} onSort={handleSort} />
                <SortableTh label={t("Clics")} colKey="clicks" activeKey={sortKey} dir={sortDir} onSort={handleSort} />
                <SortableTh label={t("CTR")} colKey="ctr" activeKey={sortKey} dir={sortDir} onSort={handleSort} />
                <SortableTh label={t("CPC")} colKey="cpc" activeKey={sortKey} dir={sortDir} onSort={handleSort} />
                <SortableTh label={t("CPM")} colKey="cpm" activeKey={sortKey} dir={sortDir} onSort={handleSort} />
                <SortableTh label={t("Freq.")} colKey="frequency" activeKey={sortKey} dir={sortDir} onSort={handleSort} />
                <SortableTh label={t("CPA")} colKey="cpa" activeKey={sortKey} dir={sortDir} onSort={handleSort} />
                <SortableTh label={t("ROAS")} colKey="roas" activeKey={sortKey} dir={sortDir} onSort={handleSort} />
                <th className="pb-3 pr-4 text-right">{t("Veredicto")}</th>
                <th className="pb-3 text-right">{t("Sugerencias")}</th>
              </tr>
            </thead>
            <tbody>
              {pagedCampaigns.map((c) => {
                const statusInfo = STATUS_MAP[c.status] || { label: c.status, variant: "default" as const };
                const verdict = getVerdict(c, t);
                const entity = campaignToEntity(c);
                const suggestions = getSuggestions(entity, t, localeTag);
                const isExpanded = expandedSuggestions === c.campaignId;
                return (
                  <Fragment key={c.campaignId}>
                    <tr className="border-b border-sand/50 last:border-0 hover:bg-sand/10 transition-colors">
                      <td
                        className="py-3 pr-4 cursor-pointer"
                        onClick={() => handleCampaignClick(c)}
                      >
                        <div className="flex flex-col gap-1">
                          <span className="font-medium text-orange hover:text-orange/80 line-clamp-1">
                            {c.campaignName}
                          </span>
                          <Badge variant={statusInfo.variant}>{t(statusInfo.label)}</Badge>
                        </div>
                      </td>
                      <td className="py-3 pr-4 text-right font-medium text-ink">
                        {formatMoney(c.spend, localeTag)}
                      </td>
                      <td className="py-3 pr-4 text-right text-charcoal">
                        {formatNum(c.impressions, localeTag)}
                      </td>
                      <td className="py-3 pr-4 text-right text-charcoal">
                        {formatNum(c.clicks, localeTag)}
                      </td>
                      <td className={`py-3 pr-4 text-right font-semibold ${HEALTH_COLORS[ctrHealth(c.ctr)]}`}>
                        {c.ctr.toFixed(2)}%
                      </td>
                      <td className={`py-3 pr-4 text-right font-semibold ${HEALTH_COLORS[cpcHealth(c.cpc)]}`}>
                        {formatMoney(c.cpc, localeTag)}
                      </td>
                      <td className="py-3 pr-4 text-right text-charcoal">
                        {formatMoney(c.cpm, localeTag)}
                      </td>
                      <td className={`py-3 pr-4 text-right font-semibold ${HEALTH_COLORS[freqHealth(c.frequency)]}`}>
                        {c.frequency.toFixed(1)}
                      </td>
                      <td
                        className={`py-3 pr-4 text-right font-semibold ${
                          c.cpa != null ? HEALTH_COLORS[cpaHealth(c.cpa)] : "text-muted"
                        }`}
                      >
                        {fmtCpa(c.cpa, localeTag)}
                      </td>
                      <td
                        className={`py-3 pr-4 text-right font-semibold ${
                          c.roas != null ? HEALTH_COLORS[roasHealth(c.roas)] : "text-muted"
                        }`}
                      >
                        {fmtRoas(c.roas)}
                      </td>
                      <td className="py-3 pr-4 text-right">
                        {c.impressions > 0 ? (
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-semibold ${HEALTH_BG[verdict.health]}`}
                          >
                            {verdict.icon} {verdict.label}
                          </span>
                        ) : (
                          <Badge variant="muted">{t("Sin gasto")}</Badge>
                        )}
                      </td>
                      <td className="py-3 text-right">
                        <SuggestionsBadgeCell
                          suggestions={suggestions}
                          isExpanded={isExpanded}
                          onToggle={() =>
                            setExpandedSuggestions(isExpanded ? null : c.campaignId)
                          }
                        />
                      </td>
                    </tr>
                    {isExpanded && suggestions.length > 0 && (
                      <SuggestionsExpandedRow
                        entity={entity}
                        suggestions={suggestions}
                        colSpan={12}
                        actionLoading={actionLoading}
                        onStatusChange={(status) =>
                          applyStatusChange("campaign", c.campaignId, status)
                        }
                        onBudgetChange={(budget) =>
                          applyBudgetChange("campaign", c.campaignId, budget)
                        }
                      />
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>

          {filteredCampaigns.length === 0 && (
            <p className="mt-6 text-center text-sm text-muted">
              {t("No hay campañas que coincidan con el filtro.")}
            </p>
          )}

          <Pagination
            page={currentPage}
            totalItems={filteredCampaigns.length}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
          />
        </Card>
      )}

      {drillLevel === "adsets" && (
        <Card className="mt-4 overflow-x-auto">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">
            {t("Grupos de anuncios")}
          </h3>

          {drillLoading ? (
            <div className="mt-4 flex items-center gap-3 py-6">
              <Spinner size="sm" />
              <p className="text-sm text-muted">
                {t("Cargando grupos de anuncios...")}
              </p>
            </div>
          ) : adSets.length === 0 ? (
            <p className="mt-4 text-sm text-muted">
              {t("No se encontraron grupos de anuncios.")}
            </p>
          ) : (
            <>
              {actionError && (
                <div className="mt-3 rounded-md border border-error/20 bg-error/10 p-3">
                  <p className="text-sm text-error">{t(actionError)}</p>
                </div>
              )}
              <table className="mt-4 w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-sand text-xs font-semibold uppercase tracking-wide text-muted">
                    <th className="pb-3 pr-4">{t("Grupo de anuncios")}</th>
                    <th className="pb-3 pr-4 text-right">{t("Presup.")}</th>
                    <th className="pb-3 pr-4 text-right">{t("Gasto")}</th>
                    <th className="pb-3 pr-4 text-right">{t("Impresiones")}</th>
                    <th className="pb-3 pr-4 text-right">{t("Clics")}</th>
                    <th className="pb-3 pr-4 text-right">{t("CTR")}</th>
                    <th className="pb-3 pr-4 text-right">{t("CPC")}</th>
                    <th className="pb-3 pr-4 text-right">{t("CPM")}</th>
                    <th className="pb-3 pr-4 text-right">{t("Freq.")}</th>
                    <th className="pb-3 pr-4 text-right">{t("CPA")}</th>
                    <th className="pb-3 pr-4 text-right">{t("ROAS")}</th>
                    <th className="pb-3 text-right">{t("Sugerencias")}</th>
                  </tr>
                </thead>
                <tbody>
                  {adSets.map((a) => {
                    const statusInfo = STATUS_MAP[a.status] || { label: a.status, variant: "default" as const };
                    const entity = adSetToEntity(a);
                    const suggestions = getSuggestions(entity, t, localeTag);
                    const isExpanded = expandedSuggestions === a.adSetId;
                    return (
                      <Fragment key={a.adSetId}>
                        <tr className="border-b border-sand/50 last:border-0 hover:bg-sand/10 transition-colors">
                          <td
                            className="py-3 pr-4 cursor-pointer"
                            onClick={() => handleAdSetClick(a)}
                          >
                            <div className="flex flex-col gap-1">
                              <span className="font-medium text-orange hover:text-orange/80 line-clamp-1">
                                {a.adSetName}
                              </span>
                              <Badge variant={statusInfo.variant}>{t(statusInfo.label)}</Badge>
                            </div>
                          </td>
                          <td className="py-3 pr-4 text-right text-charcoal">
                            {a.dailyBudget != null
                              ? t("{amount}/día", {
                                  amount: formatMoney(a.dailyBudget, localeTag),
                                })
                              : "—"}
                          </td>
                          <td className="py-3 pr-4 text-right font-medium text-ink">
                            {formatMoney(a.spend, localeTag)}
                          </td>
                          <td className="py-3 pr-4 text-right text-charcoal">
                            {formatNum(a.impressions, localeTag)}
                          </td>
                          <td className="py-3 pr-4 text-right text-charcoal">
                            {formatNum(a.clicks, localeTag)}
                          </td>
                          <td className={`py-3 pr-4 text-right font-semibold ${HEALTH_COLORS[ctrHealth(a.ctr)]}`}>
                            {a.ctr.toFixed(2)}%
                          </td>
                          <td className={`py-3 pr-4 text-right font-semibold ${HEALTH_COLORS[cpcHealth(a.cpc)]}`}>
                            {formatMoney(a.cpc, localeTag)}
                          </td>
                          <td className="py-3 pr-4 text-right text-charcoal">
                            {formatMoney(a.cpm, localeTag)}
                          </td>
                          <td className={`py-3 pr-4 text-right font-semibold ${HEALTH_COLORS[freqHealth(a.frequency)]}`}>
                            {a.frequency.toFixed(1)}
                          </td>
                          <td
                            className={`py-3 pr-4 text-right font-semibold ${
                              a.cpa != null ? HEALTH_COLORS[cpaHealth(a.cpa)] : "text-muted"
                            }`}
                          >
                            {fmtCpa(a.cpa, localeTag)}
                          </td>
                          <td
                            className={`py-3 pr-4 text-right font-semibold ${
                              a.roas != null ? HEALTH_COLORS[roasHealth(a.roas)] : "text-muted"
                            }`}
                          >
                            {fmtRoas(a.roas)}
                          </td>
                          <td className="py-3 text-right">
                            <SuggestionsBadgeCell
                              suggestions={suggestions}
                              isExpanded={isExpanded}
                              onToggle={() =>
                                setExpandedSuggestions(isExpanded ? null : a.adSetId)
                              }
                            />
                          </td>
                        </tr>
                        {isExpanded && suggestions.length > 0 && (
                          <SuggestionsExpandedRow
                            entity={entity}
                            suggestions={suggestions}
                            colSpan={12}
                            actionLoading={actionLoading}
                            onStatusChange={(status) =>
                              applyStatusChange("adset", a.adSetId, status)
                            }
                            onBudgetChange={(budget) =>
                              applyBudgetChange("adset", a.adSetId, budget)
                            }
                          />
                        )}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </>
          )}
        </Card>
      )}

      {drillLevel === "ads" && (
        <Card className="mt-4 overflow-x-auto">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">
            {t("Anuncios")}
          </h3>

          {drillLoading ? (
            <div className="mt-4 flex items-center gap-3 py-6">
              <Spinner size="sm" />
              <p className="text-sm text-muted">{t("Cargando anuncios...")}</p>
            </div>
          ) : ads.length === 0 ? (
            <p className="mt-4 text-sm text-muted">
              {t("No se encontraron anuncios.")}
            </p>
          ) : (
            <>
              {actionError && (
                <div className="mt-3 rounded-md border border-error/20 bg-error/10 p-3">
                  <p className="text-sm text-error">{t(actionError)}</p>
                </div>
              )}
              <table className="mt-4 w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-sand text-xs font-semibold uppercase tracking-wide text-muted">
                    <th className="pb-3 pr-4">{t("Anuncio")}</th>
                    <th className="pb-3 pr-4 text-right">{t("Gasto")}</th>
                    <th className="pb-3 pr-4 text-right">{t("Impresiones")}</th>
                    <th className="pb-3 pr-4 text-right">{t("Clics")}</th>
                    <th className="pb-3 pr-4 text-right">{t("CTR")}</th>
                    <th className="pb-3 pr-4 text-right">{t("CPC")}</th>
                    <th className="pb-3 pr-4 text-right">{t("CPM")}</th>
                    <th className="pb-3 pr-4 text-right">{t("Freq.")}</th>
                    <th className="pb-3 pr-4 text-right">{t("CPA")}</th>
                    <th className="pb-3 pr-4 text-right">{t("ROAS")}</th>
                    <th className="pb-3 text-right">{t("Sugerencias")}</th>
                  </tr>
                </thead>
                <tbody>
                  {ads.map((ad) => {
                    const statusInfo = STATUS_MAP[ad.status] || { label: ad.status, variant: "default" as const };
                    const entity = adToEntity(ad);
                    const suggestions = getSuggestions(entity, t, localeTag);
                    const isExpanded = expandedSuggestions === ad.adId;
                    return (
                      <Fragment key={ad.adId}>
                        <tr className="border-b border-sand/50 last:border-0 hover:bg-sand/10 transition-colors">
                          <td className="py-3 pr-4">
                            <div className="flex flex-col gap-1">
                              <span className="font-medium text-ink line-clamp-1">
                                {ad.adName}
                              </span>
                              <Badge variant={statusInfo.variant}>{t(statusInfo.label)}</Badge>
                            </div>
                          </td>
                          <td className="py-3 pr-4 text-right font-medium text-ink">
                            {formatMoney(ad.spend, localeTag)}
                          </td>
                          <td className="py-3 pr-4 text-right text-charcoal">
                            {formatNum(ad.impressions, localeTag)}
                          </td>
                          <td className="py-3 pr-4 text-right text-charcoal">
                            {formatNum(ad.clicks, localeTag)}
                          </td>
                          <td className={`py-3 pr-4 text-right font-semibold ${HEALTH_COLORS[ctrHealth(ad.ctr)]}`}>
                            {ad.ctr.toFixed(2)}%
                          </td>
                          <td className={`py-3 pr-4 text-right font-semibold ${HEALTH_COLORS[cpcHealth(ad.cpc)]}`}>
                            {formatMoney(ad.cpc, localeTag)}
                          </td>
                          <td className="py-3 pr-4 text-right text-charcoal">
                            {formatMoney(ad.cpm, localeTag)}
                          </td>
                          <td className={`py-3 pr-4 text-right font-semibold ${HEALTH_COLORS[freqHealth(ad.frequency)]}`}>
                            {ad.frequency.toFixed(1)}
                          </td>
                          <td
                            className={`py-3 pr-4 text-right font-semibold ${
                              ad.cpa != null ? HEALTH_COLORS[cpaHealth(ad.cpa)] : "text-muted"
                            }`}
                          >
                            {fmtCpa(ad.cpa, localeTag)}
                          </td>
                          <td
                            className={`py-3 pr-4 text-right font-semibold ${
                              ad.roas != null ? HEALTH_COLORS[roasHealth(ad.roas)] : "text-muted"
                            }`}
                          >
                            {fmtRoas(ad.roas)}
                          </td>
                          <td className="py-3 text-right">
                            <SuggestionsBadgeCell
                              suggestions={suggestions}
                              isExpanded={isExpanded}
                              onToggle={() =>
                                setExpandedSuggestions(isExpanded ? null : ad.adId)
                              }
                            />
                          </td>
                        </tr>
                        {isExpanded && suggestions.length > 0 && (
                          <SuggestionsExpandedRow
                            entity={entity}
                            suggestions={suggestions}
                            colSpan={11}
                            actionLoading={actionLoading}
                            onStatusChange={(status) =>
                              applyStatusChange("ad", ad.adId, status)
                            }
                            onBudgetChange={() => {
                              // Ads don't have their own budget; this is a no-op.
                            }}
                          />
                        )}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </>
          )}
        </Card>
      )}

      {/* Legend — only on campaigns view */}
      {drillLevel === "campaigns" && (
        <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted">
          <span>
            {t("CTR:")}{" "}
            <span className="text-success">{t("≥2% excelente")}</span> ·{" "}
            <span className="text-warning">{t("1-2% aceptable")}</span> ·{" "}
            <span className="text-error">{t("<1% mejorar")}</span>
          </span>
          <span>
            {t("Freq:")}{" "}
            <span className="text-success">{t("≤2 ok")}</span> ·{" "}
            <span className="text-warning">{t("2-3.5 atención")}</span> ·{" "}
            <span className="text-error">{t(">3.5 fatiga")}</span>
          </span>
          <span>
            {t("CPA:")}{" "}
            <span className="text-success">{t("≤$20 bueno")}</span> ·{" "}
            <span className="text-warning">{t("$20-50 medio")}</span> ·{" "}
            <span className="text-error">{t(">$50 caro")}</span>
          </span>
          <span>
            {t("ROAS:")}{" "}
            <span className="text-success">{t("≥3x premium")}</span> ·{" "}
            <span className="text-warning">{t("1.5-3x sostiene")}</span> ·{" "}
            <span className="text-error">{t("<1.5x pierde")}</span>
          </span>
        </div>
      )}
    </div>
  );
}

/* ── Summary Card ── */

function SummaryCard({
  label,
  value,
  health,
}: {
  label: string;
  value: string;
  health?: "success" | "warning" | "error";
}) {
  return (
    <div className="rounded-lg border border-sand bg-cream p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">
        {label}
      </p>
      <p
        className={`mt-2 text-xl font-bold ${
          health ? HEALTH_COLORS[health] : "text-ink"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

/* ── Verdict logic ── */

function getVerdict(
  c: CampaignInsight,
  t: TranslateFn,
): {
  label: string;
  icon: string;
  health: "success" | "warning" | "error";
} {
  let score = 0;

  if (c.ctr >= 2) score += 40;
  else if (c.ctr >= 1) score += 20;

  if (c.cpc <= 0.5) score += 30;
  else if (c.cpc <= 1.5) score += 15;

  if (c.frequency <= 2) score += 30;
  else if (c.frequency <= 3.5) score += 15;

  if (score >= 70)
    return { label: t("Funciona"), icon: "✓", health: "success" };
  if (score >= 35)
    return { label: t("Revisar"), icon: "~", health: "warning" };
  return { label: t("Mejorar"), icon: "✗", health: "error" };
}

/* ── Suggestions cell (badge that toggles the expanded row) ── */

function SuggestionsBadgeCell({
  suggestions,
  isExpanded,
  onToggle,
}: {
  suggestions: Suggestion[];
  isExpanded: boolean;
  onToggle: () => void;
}) {
  if (suggestions.length === 0) {
    return <span className="text-xs text-muted">—</span>;
  }
  const severity = suggestions.some((s) => s.severity === "error")
    ? "error"
    : suggestions.some((s) => s.severity === "warning")
      ? "warning"
      : "success";
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-semibold transition-colors ${HEALTH_BG[severity]} hover:opacity-80`}
    >
      <Icon name="lightbulb" size={13} className="text-amber-500" />
      {suggestions.length} {isExpanded ? "▴" : "▾"}
    </button>
  );
}

/* ── Suggestions expanded row ── */

function SuggestionsExpandedRow({
  entity,
  suggestions,
  colSpan,
  actionLoading,
  onStatusChange,
  onBudgetChange,
}: {
  entity: EntityMetrics;
  suggestions: Suggestion[];
  colSpan: number;
  actionLoading: string | null;
  onStatusChange: (status: "ACTIVE" | "PAUSED") => void;
  onBudgetChange: (newBudget: number) => void;
}) {
  const t = useT();

  return (
    <tr className="border-b border-sand/50 bg-cream">
      <td colSpan={colSpan} className="px-4 py-4">
        <div className="flex flex-col gap-3">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted">
            {t("Sugerencias para {name}", { name: entity.name })}
          </h4>
          {suggestions.map((s, idx) => {
            const actionKey =
              s.type === "raiseBudget" || s.type === "lowerBudget"
                ? `${entity.level}:${entity.id}:budget`
                : s.type === "pause"
                  ? `${entity.level}:${entity.id}:status:PAUSED`
                  : s.type === "activate"
                    ? `${entity.level}:${entity.id}:status:ACTIVE`
                    : null;
            const isLoading = actionKey === actionLoading;
            return (
              <div
                key={idx}
                className={`rounded-md border p-3 ${HEALTH_BG[s.severity]}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className={`text-sm font-semibold ${HEALTH_COLORS[s.severity]}`}>
                      {s.title}
                    </p>
                    <p className="mt-1 text-xs text-charcoal">
                      {s.description}
                    </p>
                  </div>
                  {actionKey && (
                    <SuggestionActionButton
                      suggestion={s}
                      loading={isLoading}
                      disabled={actionLoading !== null}
                      onApply={() => {
                        if (s.type === "pause") {
                          if (
                            window.confirm(
                              t("¿Pausar “{name}”?", { name: entity.name }),
                            )
                          ) {
                            onStatusChange("PAUSED");
                          }
                        } else if (s.type === "activate") {
                          if (
                            window.confirm(
                              t("¿Reactivar “{name}”?", { name: entity.name }),
                            )
                          ) {
                            onStatusChange("ACTIVE");
                          }
                        } else if (
                          (s.type === "raiseBudget" ||
                            s.type === "lowerBudget") &&
                          s.suggestedBudget
                        ) {
                          const input = window.prompt(
                            t("Nuevo presupuesto diario para “{name}” (USD):", {
                              name: entity.name,
                            }),
                            String(s.suggestedBudget),
                          );
                          if (!input) return;
                          const value = Number(input);
                          if (!Number.isFinite(value) || value <= 0) {
                            alert(t("Valor inválido."));
                            return;
                          }
                          onBudgetChange(value);
                        }
                      }}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </td>
    </tr>
  );
}

/* ── Suggestion action button ── */

function SuggestionActionButton({
  suggestion,
  loading,
  disabled,
  onApply,
}: {
  suggestion: Suggestion;
  loading: boolean;
  disabled: boolean;
  onApply: () => void;
}) {
  const t = useT();
  const labels: Record<SuggestionType, string> = {
    raiseBudget: t("Subir presupuesto"),
    lowerBudget: t("Bajar presupuesto"),
    pause: t("Pausar"),
    activate: t("Reactivar"),
    refreshCreatives: "",
  };
  const label = labels[suggestion.type];
  if (!label) return null;
  return (
    <Button
      size="sm"
      variant={suggestion.severity === "error" ? "primary" : "ghost"}
      loading={loading}
      disabled={disabled && !loading}
      onClick={onApply}
    >
      {label}
    </Button>
  );
}
