"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { SubscribeModal } from "@/components/SubscribeModal";
import { useCredits, CREDITS_ENABLED } from "@/contexts/CreditsContext";
import { useAuth } from "@/contexts/AuthContext";
import { ApiError } from "@/lib/api";
import {
  billingApi,
  formatUsd,
  type Plan,
  type CreditPack,
  type EpaycoConfig,
} from "@/lib/billing";
import { openPackCheckout } from "@/lib/epayco";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
// Packs are priced in our USD catalog; charge the same currency.
const PACK_CURRENCY = "USD";

export default function PlansPage() {
  const { summary, refresh } = useCredits();
  const { user } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [packs, setPacks] = useState<CreditPack[]>([]);
  const [config, setConfig] = useState<EpaycoConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pending, setPending] = useState<string | null>(null);
  const [canceling, setCanceling] = useState(false);
  const [modalPlan, setModalPlan] = useState<Plan | null>(null);
  const [banner, setBanner] = useState<"success" | "cancel" | "subscribed" | null>(
    null,
  );

  const router = useRouter();

  useEffect(() => {
    // Créditos desactivados → esta página no aplica; volvemos al dashboard.
    if (!CREDITS_ENABLED) {
      router.replace("/ads/search");
      return;
    }
    Promise.all([billingApi.plans(), billingApi.packs(), billingApi.config()])
      .then(([p, k, c]) => {
        setPlans(p);
        setPacks(k);
        setConfig(c);
        // ?plan=PRO (e.g. coming from the landing → register) preselects a
        // plan and opens the card form straight away.
        const wanted = new URLSearchParams(window.location.search).get("plan");
        const match = wanted ? p.find((pl) => pl.tier === wanted) : undefined;
        if (match && match.tier !== "FREE") setModalPlan(match);
      })
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : "Error al cargar."),
      )
      .finally(() => setLoading(false));

    // Returning from the ePayco pack checkout: show a banner + refresh.
    const status = new URLSearchParams(window.location.search).get("status");
    if (status === "success" || status === "cancel") {
      setBanner(status);
      if (status === "success") void refresh();
    }
  }, [refresh, router]);

  async function buyPack(pack: CreditPack) {
    if (!config || !user) {
      setError("No se pudo iniciar el pago. Recarga la página.");
      return;
    }
    setPending(pack.id);
    setError("");
    try {
      await openPackCheckout({
        publicKey: config.publicKey,
        test: config.test,
        amount: pack.priceUsdCents / 100,
        currency: PACK_CURRENCY,
        name: `OneClickIA — ${pack.name}`,
        description: `${pack.credits} créditos`,
        invoice: `pack-${pack.id}-${user.id.slice(0, 8)}-${Date.now()}`,
        email: user.email,
        userId: user.id,
        packId: pack.id,
        confirmationUrl: `${API_BASE}/billing/webhook`,
        responseUrl: `${window.location.origin}/plans?status=success`,
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo abrir el pago.",
      );
    } finally {
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

  function onSubscribed() {
    setModalPlan(null);
    setBanner("subscribed");
    void refresh();
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
            ¡Suscripción creada! Tus créditos se acreditan cuando ePayco confirma
            el primer cobro.
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
      <h2 className="mt-8 text-lg font-semibold text-ink">Suscripciones</h2>
      <div className="mt-4 grid gap-4 lg:grid-cols-4">
        {plans.map((plan) => {
          const isCurrent = summary?.tier === plan.tier;
          const isFree = plan.tier === "FREE";
          return (
            <Card key={plan.tier} className="flex flex-col">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-ink">{plan.name}</h3>
                {isCurrent && <Badge variant="orange">Actual</Badge>}
              </div>
              <p className="mt-2">
                <span className="text-2xl font-bold text-ink">
                  {formatUsd(plan.priceUsdCents)}
                </span>
                {!isFree && <span className="text-sm text-muted">/mes</span>}
              </p>
              <p className="mt-1 text-sm text-muted">
                {plan.monthlyCredits.toLocaleString("es")} créditos / mes
              </p>
              <ul className="mt-4 flex-1 space-y-1.5">
                {plan.features.map((f) => (
                  <li key={f} className="flex gap-2 text-sm text-charcoal">
                    <span className="text-orange">✓</span>
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
                    className="w-full"
                    disabled={isCurrent}
                    onClick={() => setModalPlan(plan)}
                  >
                    {isCurrent ? "Plan actual" : "Suscribirme"}
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* ── One-off credit packs ── */}
      <h2 className="mt-10 text-lg font-semibold text-ink">Packs de créditos</h2>
      <p className="mt-1 text-sm text-muted">
        ¿Te quedaste corto este mes? Compra créditos extra que no caducan.
      </p>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        {packs.map((pack) => (
          <Card key={pack.id} className="flex flex-col">
            <h3 className="font-semibold text-ink">{pack.name}</h3>
            <p className="mt-2 text-2xl font-bold text-ink">
              {formatUsd(pack.priceUsdCents)}
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

      {modalPlan && config && (
        <SubscribeModal
          plan={modalPlan}
          config={config}
          defaultEmail={user?.email}
          onClose={() => setModalPlan(null)}
          onSuccess={onSubscribed}
        />
      )}
    </div>
  );
}
