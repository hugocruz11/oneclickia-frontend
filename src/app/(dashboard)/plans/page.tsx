"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { useCredits, CREDITS_ENABLED } from "@/contexts/CreditsContext";
import { ApiError } from "@/lib/api";
import {
  billingApi,
  formatCop,
  formatUsd,
  copFromUsdCents,
  type Plan,
  type PlanTier,
  type CreditPack,
  type BillingPeriod,
} from "@/lib/billing";

type Banner = "success" | "cancel" | "pending" | "subscribed" | null;

export default function PlansPage() {
  const { summary, refresh } = useCredits();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [packs, setPacks] = useState<CreditPack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pending, setPending] = useState<string | null>(null);
  const [canceling, setCanceling] = useState(false);
  const [banner, setBanner] = useState<Banner>(null);
  const [period, setPeriod] = useState<BillingPeriod>("MONTHLY");
  const [trm, setTrm] = useState<number | null>(null);

  const router = useRouter();

  useEffect(() => {
    // Créditos desactivados → esta página no aplica; volvemos al dashboard.
    if (!CREDITS_ENABLED) {
      router.replace("/ads/search");
      return;
    }
    const params = new URLSearchParams(window.location.search);

    // Live TRM to estimate the COP charged for USD prices. Best-effort:
    // if it fails we fall back to the plan's static COP.
    billingApi
      .usdCop()
      .then((r) => setTrm(r.rate))
      .catch(() => setTrm(null));

    Promise.all([billingApi.plans(), billingApi.packs()])
      .then(([p, k]) => {
        setPlans(p);
        setPacks(k);
        // ?plan=PRO&period=annual (coming from the landing → register)
        // starts the Mercado Pago checkout for that plan/period straight away.
        const wantedPeriod =
          params.get("period") === "annual" ? "ANNUAL" : "MONTHLY";
        setPeriod(wantedPeriod);
        const wanted = params.get("plan") as PlanTier | null;
        const match = wanted ? p.find((pl) => pl.tier === wanted) : undefined;
        if (match && match.tier !== "FREE")
          void subscribeTo(match.tier, wantedPeriod);
      })
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : "Error al cargar."),
      )
      .finally(() => setLoading(false));

    // Returning from a Mercado Pago checkout: show a banner + refresh.
    // "subscribed"/"success" credits land when the webhook confirms, so we
    // refresh optimistically here and again on window focus.
    const status = params.get("status") as Banner;
    if (
      status === "success" ||
      status === "cancel" ||
      status === "pending" ||
      status === "subscribed"
    ) {
      setBanner(status);
      if (status === "success" || status === "subscribed") void refresh();
    }
  }, [refresh, router]);

  /** Create the checkout at the backend and send the user to Mercado Pago. */
  async function subscribeTo(tier: PlanTier, overridePeriod?: BillingPeriod) {
    setPending(tier);
    setError("");
    try {
      const { initPoint } = await billingApi.subscribe(
        tier,
        overridePeriod ?? period,
      );
      window.location.href = initPoint;
    } catch (err) {
      setError(
        err instanceof ApiError || err instanceof Error
          ? err.message
          : "No se pudo iniciar la suscripción.",
      );
      setPending(null);
    }
  }

  async function buyPack(pack: CreditPack) {
    setPending(pack.id);
    setError("");
    try {
      const { initPoint } = await billingApi.packCheckout(pack.id);
      window.location.href = initPoint;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo abrir el pago.",
      );
      setPending(null);
    }
  }

  async function cancelPlan() {
    if (!window.confirm("¿Cancelar tu suscripción? Conservas los créditos que ya pagaste.")) {
      return;
    }
    setCanceling(true);
    setError("");
    try {
      await billingApi.cancel();
      await refresh();
      setBanner("cancel");
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "No se pudo cancelar.",
      );
    } finally {
      setCanceling(false);
    }
  }

  // Créditos desactivados → no renderizamos la página (ya redirigimos arriba).
  if (!CREDITS_ENABLED) return null;

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  const annualDiscountPct =
    plans.find((p) => p.tier !== "FREE")?.annualDiscountPct ?? 0;

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-semibold text-ink">Planes y créditos</h1>
      <p className="mt-1 text-sm text-muted">
        Los créditos se consumen al generar copys, imágenes y análisis de video.
        Publicar campañas en Meta es gratis.
      </p>

      {summary && (
        <p className="mt-3 text-sm text-charcoal">
          Plan actual: <span className="font-semibold">{summary.planName}</span> ·{" "}
          <span className="font-semibold">
            {summary.balance.total.toLocaleString("es")}
          </span>{" "}
          créditos disponibles
          {summary.balance.topUpCredits > 0 &&
            ` (incluye ${summary.balance.topUpCredits.toLocaleString("es")} comprados)`}
        </p>
      )}

      {summary && summary.tier !== "FREE" && (
        <div className="mt-3">
          <Button
            variant="ghost"
            size="sm"
            loading={canceling}
            onClick={cancelPlan}
          >
            Cancelar suscripción
          </Button>
          <span className="ml-3 text-sm text-muted">
            Al cancelar conservas los créditos que ya pagaste.
          </span>
        </div>
      )}

      {banner === "success" && (
        <div className="mt-4 rounded-md border border-success/20 bg-success/10 p-3">
          <p className="text-sm text-success-text">
            ¡Pago confirmado! Tus créditos se actualizan en unos segundos.
          </p>
        </div>
      )}
      {banner === "subscribed" && (
        <div className="mt-4 rounded-md border border-success/20 bg-success/10 p-3">
          <p className="text-sm text-success-text">
            ¡Suscripción autorizada! Tus créditos se acreditan cuando Mercado
            Pago confirma el primer cobro (suele tardar unos segundos).
          </p>
        </div>
      )}
      {banner === "pending" && (
        <div className="mt-4 rounded-md border border-warning/30 bg-warning/10 p-3">
          <p className="text-sm text-charcoal">
            Tu pago está en proceso. Los créditos se acreditan cuando Mercado
            Pago lo apruebe.
          </p>
        </div>
      )}
      {banner === "cancel" && (
        <div className="mt-4 rounded-md border border-sand bg-sand-light p-3">
          <p className="text-sm text-charcoal">
            Operación cancelada. No se cobró nada.
          </p>
        </div>
      )}
      {error && (
        <div className="mt-4 rounded-md border border-error/20 bg-error/10 p-3">
          <p className="text-sm text-error">{error}</p>
        </div>
      )}

      {/* ── Subscription plans ── */}
      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-ink">Suscripciones</h2>
        {/* Monthly / Annual toggle */}
        <div className="inline-flex items-center rounded-full border border-sand bg-sand-light p-1 text-sm">
          <button
            type="button"
            onClick={() => setPeriod("MONTHLY")}
            className={`rounded-full px-3 py-1 font-medium transition ${
              period === "MONTHLY" ? "bg-ink text-white" : "text-muted"
            }`}
          >
            Mensual
          </button>
          <button
            type="button"
            onClick={() => setPeriod("ANNUAL")}
            className={`rounded-full px-3 py-1 font-medium transition ${
              period === "ANNUAL" ? "bg-ink text-white" : "text-muted"
            }`}
          >
            Anual
            {annualDiscountPct > 0 && (
              <span className="ml-1 text-orange">−{annualDiscountPct}%</span>
            )}
          </button>
        </div>
      </div>
      {period === "ANNUAL" && (
        <p className="mt-2 text-xs text-muted">
          Facturación anual: pagas una vez al año y ahorras {annualDiscountPct}%.
        </p>
      )}
      <div className="mt-4 rounded-md border border-success/20 bg-success/10 px-4 py-2.5 text-center text-sm text-charcoal">
        <span className="font-semibold text-ink">Sin permanencia.</span> Pago
        seguro con Mercado Pago · cancela cuando quieras · conservas los
        créditos que ya pagaste.
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-4">
        {plans.map((plan) => {
          const isCurrent = summary?.tier === plan.tier;
          const isFree = plan.tier === "FREE";
          const isAnnual = period === "ANNUAL";
          // USD per month shown as the headline; annual shows the discounted
          // per-month rate. The COP estimate uses the amount actually charged
          // (monthly price, or the full-year total for annual).
          const perMonthUsdCents = isAnnual
            ? plan.annualMonthlyUsdCents
            : plan.priceUsdCents;
          const chargeUsdCents = isAnnual
            ? plan.annualPriceUsdCents
            : plan.priceUsdCents;
          const copEstimate =
            trm !== null ? copFromUsdCents(chargeUsdCents, trm) : plan.priceCop;
          const isPopular = plan.tier === "PRO";
          const annualSavingsUsdCents =
            plan.priceUsdCents * 12 - plan.annualPriceUsdCents;
          return (
            <Card
              key={plan.tier}
              className={`relative flex flex-col transition duration-200 ${
                isPopular
                  ? "border-2 border-orange shadow-lg lg:-translate-y-2"
                  : "hover:-translate-y-1 hover:border-sand-mid hover:shadow-md"
              }`}
            >
              {isPopular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-orange px-3 py-0.5 text-xs font-semibold text-white shadow">
                  ★ Más elegido
                </span>
              )}
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-ink">{plan.name}</h3>
                {isCurrent && <Badge variant="orange">Actual</Badge>}
              </div>

              <div className="mt-3">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold tracking-tight text-ink">
                    {formatUsd(perMonthUsdCents)}
                  </span>
                  {!isFree && (
                    <span className="text-sm text-muted">USD/mes</span>
                  )}
                </div>
                {!isFree && isAnnual && annualSavingsUsdCents > 0 && (
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <span className="text-sm text-muted line-through">
                      {formatUsd(plan.priceUsdCents)}
                    </span>
                    <span className="rounded-full bg-success/10 px-2 py-0.5 text-xs font-semibold text-success-text">
                      Ahorras {formatUsd(annualSavingsUsdCents)}/año
                    </span>
                  </div>
                )}
                {!isFree && (
                  <p className="mt-1 text-xs text-muted">
                    {isAnnual
                      ? `${formatUsd(plan.annualPriceUsdCents)} USD/año · ≈ ${formatCop(copEstimate)}`
                      : `≈ ${formatCop(copEstimate)}/mes`}
                  </p>
                )}
              </div>

              <div className="mt-4 rounded-md bg-sand-light px-3 py-2 text-center">
                <span className="text-lg font-bold text-ink">
                  {plan.monthlyCredits.toLocaleString("es")}
                </span>
                <span className="text-sm text-muted"> créditos/mes</span>
              </div>

              <ul className="mt-4 flex-1 space-y-2">
                {plan.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-start gap-2 text-sm text-charcoal"
                  >
                    <span className="mt-0.5 flex h-4 w-4 flex-none items-center justify-center rounded-full bg-orange/15 text-[10px] font-bold text-orange">
                      ✓
                    </span>
                    {f}
                  </li>
                ))}
              </ul>

              <div className="mt-6">
                {isFree ? (
                  <Button variant="ghost" className="w-full" disabled>
                    {isCurrent ? "Plan actual" : "Gratis"}
                  </Button>
                ) : (
                  <Button
                    variant={isPopular ? "primary" : "ghost"}
                    className="w-full"
                    disabled={isCurrent || pending !== null}
                    loading={pending === plan.tier}
                    onClick={() => subscribeTo(plan.tier)}
                  >
                    {isCurrent ? "Plan actual" : "Suscribirme"}
                  </Button>
                )}
              </div>
              {!isFree && !isCurrent && (
                <p className="mt-2 text-center text-[11px] text-muted">
                  Cancela cuando quieras
                </p>
              )}
            </Card>
          );
        })}
      </div>
      <p className="mt-2 text-xs text-muted">
        Precios en USD; se cobra en pesos a la tasa TRM del día. Pago seguro
        procesado por Mercado Pago. La suscripción se renueva automáticamente
        {period === "ANNUAL" ? " cada año" : " cada mes"}; puedes cancelarla
        cuando quieras.
      </p>

      {/* ── One-off credit packs ── */}
      <h2 className="mt-10 text-lg font-semibold text-ink">Packs de créditos</h2>
      <p className="mt-1 text-sm text-muted">
        ¿Te quedaste corto este mes? Compra créditos extra que no caducan.
      </p>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        {packs.map((pack) => (
          <Card
            key={pack.id}
            className="flex flex-col transition duration-200 hover:-translate-y-1 hover:border-sand-mid hover:shadow-md"
          >
            <h3 className="font-semibold text-ink">{pack.name}</h3>
            <p className="mt-2 text-2xl font-bold text-ink">
              {formatUsd(pack.priceUsdCents)}
              <span className="text-sm font-normal text-muted"> USD</span>
            </p>
            <p className="mt-0.5 text-xs text-muted">
              se cobra {formatCop(pack.priceCop)}
            </p>
            <p className="mt-1 flex-1 text-sm text-muted">
              {pack.credits.toLocaleString("es")} créditos · no caducan
            </p>
            <Button
              variant="dark"
              className="mt-4 w-full"
              loading={pending === pack.id}
              disabled={pending !== null}
              onClick={() => buyPack(pack)}
            >
              Comprar
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
