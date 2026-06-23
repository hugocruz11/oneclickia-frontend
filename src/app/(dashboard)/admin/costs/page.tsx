"use client";

import { Fragment, useCallback, useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

// ── Shapes returned by /admin/ai-usage/* ──

interface Summary {
  calls: number;
  totalTokens: number;
  tokenCostUsd: number;
  groundingRequests: number;
  groundingCostUsd: number;
  totalCostUsd: number;
}

interface UserRow {
  userId: string;
  email: string;
  name: string | null;
  calls: number;
  totalTokens: number;
  costUsd: number;
  groundingRequests: number;
}

interface ServiceRow {
  service: string;
  calls: number;
  totalTokens: number;
  costUsd: number;
}

// Spanish labels for the logical service keys recorded by the backend.
const SERVICE_LABELS: Record<string, string> = {
  copy: "Copy (texto de anuncios)",
  landing: "Landing pages",
  video_blueprint: "Análisis de video",
  brand_website: "Análisis de web (marca)",
  brand_logo: "Análisis de logo",
  image_generate: "Generación de imágenes",
  image_edit: "Edición de imágenes",
  image_variant: "Variantes de imagen",
  image_custom: "Imágenes personalizadas",
};

function serviceLabel(key: string): string {
  return SERVICE_LABELS[key] ?? key;
}

// Los costos se calculan y guardan en USD (lo que cobra Google). El panel los
// muestra en pesos colombianos usando la TRM oficial (backend /fx/usd-cop).
// Este valor es solo el fallback si la TRM no carga; se puede fijar por env.
const USD_TO_COP_FALLBACK = Number(process.env.NEXT_PUBLIC_USD_COP_RATE) || 4000;

interface UsdCopRate {
  rate: number;
  date: string;
  source: "trm" | "fallback";
}

function fmtNum(n: number): string {
  return n.toLocaleString("es");
}

// Default range: last 30 days, as yyyy-mm-dd for <input type="date">.
function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export default function AdminCostosPage() {
  const { user, isLoading: authLoading } = useAuth();

  const [from, setFrom] = useState(() =>
    isoDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)),
  );
  const [to, setTo] = useState(() => isoDate(new Date()));

  const [summary, setSummary] = useState<Summary | null>(null);
  const [byUser, setByUser] = useState<UserRow[]>([]);
  const [byService, setByService] = useState<ServiceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Tasa USD→COP (TRM oficial). Arranca con el fallback y se actualiza al
  // cargar /fx/usd-cop. COP es moneda sin decimales → pesos enteros.
  const [fx, setFx] = useState<UsdCopRate>({
    rate: USD_TO_COP_FALLBACK,
    date: "",
    source: "fallback",
  });
  const fmtCop = useCallback(
    (usd: number): string =>
      `$${(usd * fx.rate).toLocaleString("es-CO", {
        maximumFractionDigits: 0,
      })} COP`,
    [fx.rate],
  );

  // Per-user service breakdown, fetched on demand when a row is expanded.
  // "loading" while in flight; reset whenever the date range changes.
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [userBreakdown, setUserBreakdown] = useState<
    Record<string, ServiceRow[] | "loading">
  >({});

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    const qs = `from=${from}&to=${to}`;
    try {
      const [s, u, sv] = await Promise.all([
        api.get<Summary>(`/admin/ai-usage/summary?${qs}`),
        api.get<UserRow[]>(`/admin/ai-usage/by-user?${qs}`),
        api.get<ServiceRow[]>(`/admin/ai-usage/by-service?${qs}`),
      ]);
      setSummary(s);
      setByUser(u);
      setByService(sv);
      // Range changed → stale breakdowns no longer apply.
      setExpandedUser(null);
      setUserBreakdown({});
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudieron cargar los costos.",
      );
    } finally {
      setLoading(false);
    }
  }, [from, to]);

  const toggleUser = useCallback(
    async (userId: string) => {
      if (expandedUser === userId) {
        setExpandedUser(null);
        return;
      }
      setExpandedUser(userId);
      if (!userBreakdown[userId]) {
        setUserBreakdown((prev) => ({ ...prev, [userId]: "loading" }));
        try {
          const rows = await api.get<ServiceRow[]>(
            `/admin/ai-usage/user/${userId}/by-service?from=${from}&to=${to}`,
          );
          setUserBreakdown((prev) => ({ ...prev, [userId]: rows }));
        } catch {
          setUserBreakdown((prev) => ({ ...prev, [userId]: [] }));
        }
      }
    },
    [expandedUser, userBreakdown, from, to],
  );

  useEffect(() => {
    if (user?.role === "ADMIN") void load();
    else if (!authLoading) setLoading(false);
  }, [user, authLoading, load]);

  // Tasa de cambio en vivo (TRM). Si falla, se queda el fallback.
  useEffect(() => {
    if (user?.role !== "ADMIN") return;
    api
      .get<UsdCopRate>("/fx/usd-cop")
      .then(setFx)
      .catch(() => {});
  }, [user]);

  // Gate the UI too (backend enforces 403 regardless).
  if (authLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size="lg" />
      </div>
    );
  }

  if (user?.role !== "ADMIN") {
    return (
      <div className="max-w-2xl">
        <h1 className="text-2xl font-semibold text-ink">Costos de IA</h1>
        <div className="mt-4 rounded-md border border-error/20 bg-error/10 p-3">
          <p className="text-sm text-error">
            Acceso restringido a administradores.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Costos de IA</h1>
          <p className="mt-1 text-sm text-muted">
            Gasto real en Gemini por usuario y por servicio, en pesos
            colombianos. Convertido desde USD a{" "}
            {fmtNum(Math.round(fx.rate))} COP/USD
            {fx.source === "trm"
              ? ` (TRM ${fx.date})`
              : " (tasa de respaldo)"}
            .
          </p>
        </div>
        <div className="flex items-end gap-2">
          <label className="flex flex-col text-xs text-muted">
            Desde
            <input
              type="date"
              value={from}
              max={to}
              onChange={(e) => setFrom(e.target.value)}
              className="mt-1 rounded-md border border-sand bg-cream px-2 py-1 text-sm text-ink"
            />
          </label>
          <label className="flex flex-col text-xs text-muted">
            Hasta
            <input
              type="date"
              value={to}
              min={from}
              onChange={(e) => setTo(e.target.value)}
              className="mt-1 rounded-md border border-sand bg-cream px-2 py-1 text-sm text-ink"
            />
          </label>
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-md border border-error/20 bg-error/10 p-3">
          <p className="text-sm text-error">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : (
        <>
          {/* Summary cards */}
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            <SummaryCard
              label="Costo total"
              value={summary ? fmtCop(summary.totalCostUsd) : "—"}
              highlight
            />
            <SummaryCard
              label="Costo tokens"
              value={summary ? fmtCop(summary.tokenCostUsd) : "—"}
            />
            <SummaryCard
              label="Costo grounding"
              value={summary ? fmtCop(summary.groundingCostUsd) : "—"}
            />
            <SummaryCard
              label="Llamadas"
              value={summary ? fmtNum(summary.calls) : "—"}
            />
            <SummaryCard
              label="Tokens totales"
              value={summary ? fmtNum(summary.totalTokens) : "—"}
            />
          </div>

          {/* By user */}
          <Card className="mt-6 overflow-x-auto">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">
              Costo por usuario
            </h3>
            {byUser.length === 0 ? (
              <p className="mt-4 text-sm text-muted">
                No hay consumo registrado en este rango.
              </p>
            ) : (
              <>
              <p className="mt-1 text-xs text-muted">
                Haz clic en un usuario para ver su desglose por servicio.
              </p>
              <table className="mt-3 w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-sand text-xs font-semibold uppercase tracking-wide text-muted">
                    <th className="pb-3 pr-4">Usuario</th>
                    <th className="pb-3 pr-4 text-right">Costo</th>
                    <th className="pb-3 pr-4 text-right">Llamadas</th>
                    <th className="pb-3 pr-4 text-right">Tokens</th>
                    <th className="pb-3 text-right">Grounding</th>
                  </tr>
                </thead>
                <tbody>
                  {byUser.map((r) => {
                    const isExpanded = expandedUser === r.userId;
                    const breakdown = userBreakdown[r.userId];
                    return (
                      <Fragment key={r.userId}>
                        <tr
                          className="cursor-pointer border-b border-sand/50 last:border-0 hover:bg-sand/10 transition-colors"
                          onClick={() => toggleUser(r.userId)}
                        >
                          <td className="py-3 pr-4">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-orange">
                                {isExpanded ? "▾" : "▸"}
                              </span>
                              <div className="flex flex-col">
                                <span className="font-medium text-ink">
                                  {r.name || r.email}
                                </span>
                                {r.name && (
                                  <span className="text-xs text-muted">
                                    {r.email}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-3 pr-4 text-right font-semibold text-ink">
                            {fmtCop(r.costUsd)}
                          </td>
                          <td className="py-3 pr-4 text-right text-charcoal">
                            {fmtNum(r.calls)}
                          </td>
                          <td className="py-3 pr-4 text-right text-charcoal">
                            {fmtNum(r.totalTokens)}
                          </td>
                          <td className="py-3 text-right text-charcoal">
                            {fmtNum(r.groundingRequests)}
                          </td>
                        </tr>
                        {isExpanded &&
                          (breakdown === "loading" || !breakdown ? (
                            <tr className="bg-cream">
                              <td colSpan={5} className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <Spinner size="sm" />
                                  <span className="text-xs text-muted">
                                    Cargando desglose…
                                  </span>
                                </div>
                              </td>
                            </tr>
                          ) : breakdown.length === 0 ? (
                            <tr className="bg-cream">
                              <td colSpan={5} className="px-4 py-3 text-xs text-muted">
                                Sin consumo en este rango.
                              </td>
                            </tr>
                          ) : (
                            <>
                              <tr className="bg-cream">
                                <td
                                  colSpan={5}
                                  className="px-4 pt-3 pb-1 pl-9 text-xs font-semibold uppercase tracking-wide text-muted"
                                >
                                  Desglose por servicio
                                </td>
                              </tr>
                              {breakdown.map((s) => (
                                <tr key={s.service} className="bg-cream">
                                  <td className="py-2 pl-9 pr-4 text-charcoal">
                                    {serviceLabel(s.service)}
                                  </td>
                                  <td className="py-2 pr-4 text-right font-medium text-ink">
                                    {fmtCop(s.costUsd)}
                                  </td>
                                  <td className="py-2 pr-4 text-right text-muted">
                                    {fmtNum(s.calls)}
                                  </td>
                                  <td className="py-2 pr-4 text-right text-muted">
                                    {fmtNum(s.totalTokens)}
                                  </td>
                                  <td className="py-2 text-right text-muted">—</td>
                                </tr>
                              ))}
                            </>
                          ))}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
              </>
            )}
          </Card>

          {/* By service */}
          <Card className="mt-6 overflow-x-auto">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">
              Costo por servicio
            </h3>
            {byService.length === 0 ? (
              <p className="mt-4 text-sm text-muted">
                No hay consumo registrado en este rango.
              </p>
            ) : (
              <table className="mt-4 w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-sand text-xs font-semibold uppercase tracking-wide text-muted">
                    <th className="pb-3 pr-4">Servicio</th>
                    <th className="pb-3 pr-4 text-right">Costo</th>
                    <th className="pb-3 pr-4 text-right">Llamadas</th>
                    <th className="pb-3 text-right">Tokens</th>
                  </tr>
                </thead>
                <tbody>
                  {byService.map((r) => (
                    <tr
                      key={r.service}
                      className="border-b border-sand/50 last:border-0 hover:bg-sand/10 transition-colors"
                    >
                      <td className="py-3 pr-4 font-medium text-ink">
                        {serviceLabel(r.service)}
                      </td>
                      <td className="py-3 pr-4 text-right font-semibold text-ink">
                        {fmtCop(r.costUsd)}
                      </td>
                      <td className="py-3 pr-4 text-right text-charcoal">
                        {fmtNum(r.calls)}
                      </td>
                      <td className="py-3 text-right text-charcoal">
                        {fmtNum(r.totalTokens)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>
        </>
      )}
    </div>
  );
}

function SummaryCard({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-lg border border-sand bg-cream p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">
        {label}
      </p>
      <p
        className={`mt-2 text-xl font-bold ${
          highlight ? "text-orange" : "text-ink"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
