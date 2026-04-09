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

interface MetaCampaign {
  id: string;
  name: string;
  objective: string;
  status: string;
  dailyBudget: string | null;
  lifetimeBudget: string | null;
  startTime: string | null;
  stopTime: string | null;
  adAccountName: string;
  createdTime: string;
}

const META_STATUS_MAP: Record<string, { label: string; variant: "success" | "muted" | "error" | "warning" | "default" }> = {
  ACTIVE: { label: "Activa", variant: "success" },
  PAUSED: { label: "Pausada", variant: "muted" },
  DELETED: { label: "Eliminada", variant: "error" },
  ARCHIVED: { label: "Archivada", variant: "muted" },
  IN_PROCESS: { label: "En proceso", variant: "warning" },
  WITH_ISSUES: { label: "Con problemas", variant: "error" },
};

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [metaCampaigns, setMetaCampaigns] = useState<MetaCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMeta, setLoadingMeta] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"movity" | "meta">("movity");

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

  function formatBudget(amount: number, currency: string) {
    return new Intl.NumberFormat("es", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
    }).format(amount / 100);
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("es", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  function formatMetaBudget(cents: string | null) {
    if (!cents) return "—";
    return `$${(Number(cents) / 100).toLocaleString("es")}`;
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
        <Link href="/campaigns/new">
          <Button>Nueva campaña</Button>
        </Link>
      </div>

      {error && (
        <div className="mt-4 rounded-md border border-error/20 bg-red-50 p-3">
          <p className="text-sm text-error">{error}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="mt-6 flex gap-1 border-b border-sand">
        <button
          type="button"
          onClick={() => setTab("movity")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            tab === "movity"
              ? "border-b-2 border-orange text-orange"
              : "text-muted hover:text-ink"
          }`}
        >
          Movity ({campaigns.length})
        </button>
        <button
          type="button"
          onClick={() => setTab("meta")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            tab === "meta"
              ? "border-b-2 border-orange text-orange"
              : "text-muted hover:text-ink"
          }`}
        >
          Meta Ads {loadingMeta ? "" : `(${metaCampaigns.length})`}
        </button>
      </div>

      {/* Movity campaigns */}
      {tab === "movity" && (
        <>
          {campaigns.length === 0 && (
            <div className="mt-12 text-center">
              <p className="text-3xl">📢</p>
              <p className="mt-2 text-sm text-muted">
                Aún no tienes campañas creadas desde Movity.
              </p>
              <Link href="/ads/search" className="mt-4 inline-block">
                <Button variant="ghost" size="sm">
                  Buscar Ads
                </Button>
              </Link>
            </div>
          )}

          {campaigns.length > 0 && (
            <div className="mt-4 flex flex-col gap-3">
              {campaigns.map((campaign) => (
                <Link key={campaign.id} href={`/campaigns/${campaign.id}`}>
                  <Card className="transition-colors hover:border-orange/50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
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
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </>
      )}

      {/* Meta campaigns */}
      {tab === "meta" && (
        <>
          {loadingMeta && (
            <div className="flex justify-center py-12">
              <Spinner size="lg" />
            </div>
          )}

          {!loadingMeta && metaCampaigns.length === 0 && (
            <div className="mt-12 text-center">
              <p className="text-3xl">📱</p>
              <p className="mt-2 text-sm text-muted">
                No se encontraron campañas en tu cuenta de Meta Ads.
              </p>
            </div>
          )}

          {!loadingMeta && metaCampaigns.length > 0 && (
            <div className="mt-4 flex flex-col gap-3">
              {metaCampaigns.map((mc) => (
                <MetaCampaignCard key={mc.id} campaign={mc} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ── Meta Campaign Card with Preview Toggle ── */

const FORMAT_LABELS: Record<string, string> = {
  DESKTOP_FEED_STANDARD: "Facebook Feed",
  MOBILE_FEED_STANDARD: "Facebook Móvil",
  INSTAGRAM_STANDARD: "Instagram Feed",
  INSTAGRAM_STORY: "Instagram Story",
};

function MetaCampaignCard({ campaign: mc }: { campaign: MetaCampaign }) {
  const [previews, setPreviews] = useState<{ format: string; html: string }[]>([]);
  const [showPreviews, setShowPreviews] = useState(false);
  const [loadingPreviews, setLoadingPreviews] = useState(false);

  const statusInfo = META_STATUS_MAP[mc.status] || {
    label: mc.status,
    variant: "default" as const,
  };

  async function loadPreviews() {
    setLoadingPreviews(true);
    try {
      const res = await api.get<{ previews: { format: string; html: string }[] }>(
        `/connections/meta/campaigns/${mc.id}/preview`,
      );
      setPreviews(res.previews);
      setShowPreviews(true);
    } catch {
      // Preview not available
    } finally {
      setLoadingPreviews(false);
    }
  }

  function formatMetaBudget(cents: string | null) {
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

  return (
    <Card>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-semibold text-ink line-clamp-1">
              {mc.name}
            </h3>
            <Badge variant={statusInfo.variant}>
              {statusInfo.label}
            </Badge>
          </div>
          <div className="mt-2 flex items-center gap-4 text-xs text-muted">
            <span>{mc.objective}</span>
            <span>
              {mc.dailyBudget
                ? `${formatMetaBudget(mc.dailyBudget)} / día`
                : mc.lifetimeBudget
                  ? `${formatMetaBudget(mc.lifetimeBudget)} total`
                  : "Sin presupuesto"}
            </span>
            <span>{mc.adAccountName}</span>
            <span>{formatDate(mc.createdTime)}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (previews.length === 0) {
                loadPreviews();
              } else {
                setShowPreviews(!showPreviews);
              }
            }}
            loading={loadingPreviews}
          >
            {showPreviews ? "Ocultar preview" : "Ver preview"}
          </Button>
        </div>
      </div>

      {loadingPreviews && (
        <div className="mt-4 flex items-center gap-3 py-4">
          <Spinner size="sm" />
          <p className="text-sm text-muted">Cargando preview de Meta...</p>
        </div>
      )}

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

      {previews.length > 0 && showPreviews && previews.length === 0 && (
        <p className="mt-4 text-sm text-muted">
          No hay preview disponible para esta campaña.
        </p>
      )}
    </Card>
  );
}
