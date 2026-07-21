"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Icon, type IconName } from "@/components/ui/Icon";
import {
  billingApi,
  formatUsd,
  type Plan,
  type BillingPeriod,
} from "@/lib/billing";
import { CREDITS_ENABLED } from "@/contexts/CreditsContext";

const FEATURES: { icon: IconName; color: string; title: string; body: string }[] = [
  {
    icon: "search",
    color: "text-sky-500",
    title: "Encuentra anuncios ganadores",
    body: "Busca los creativos que ya están funcionando en tu nicho y úsalos como base.",
  },
  {
    icon: "sparkles",
    color: "text-orange-500",
    title: "Copys e imágenes con IA",
    body: "Genera variantes de texto e imágenes para Meta adaptadas a tu marca en minutos.",
  },
  {
    icon: "video",
    color: "text-rose-500",
    title: "Analiza videos ganadores",
    body: "Desglosa con IA la estructura de los videos que mejor funcionan (hook, ángulos, CTA) y conviértela en un guion listo para replicar.",
  },
  {
    icon: "megaphone",
    color: "text-orange-500",
    title: "Publica en Meta gratis",
    body: "Crea la campaña lista para publicar directamente en Meta.",
  },
];

// ⚠️ TESTIMONIOS DE EJEMPLO — reemplázalos por reseñas REALES de tus
// clientes (con su permiso) antes de publicar. Mostrar testimonios
// inventados como reales es publicidad engañosa.
const TESTIMONIALS: { quote: string; name: string; role: string }[] = [
  {
    quote:
      "Lancé mi primera campaña en una tarde. Antes tardaba una semana con una agencia.",
    name: "Ana M.",
    role: "Tienda de skincare",
  },
  {
    quote:
      "Los copys y las imágenes salen listos para Meta. Bajé muchísimo el costo por creativo.",
    name: "Carlos R.",
    role: "Marca de suplementos",
  },
  {
    quote:
      "Encontrar anuncios ganadores y adaptarlos a mi marca me ahorra horas cada semana.",
    name: "Valentina P.",
    role: "E-commerce de moda",
  },
];

// Comparativa de funciones por plan (columnas = planes desde el backend).
const COMPARE: { label: string; values: Record<string, boolean | string> }[] = [
  {
    label: "Buscar anuncios y videos ganadores",
    values: { FREE: true, STARTER: true, PRO: true, BUSINESS: true },
  },
  {
    label: "Copys e imágenes con IA",
    values: { FREE: true, STARTER: true, PRO: true, BUSINESS: true },
  },
  {
    label: "Análisis de videos con IA",
    values: { FREE: true, STARTER: true, PRO: true, BUSINESS: true },
  },
  {
    label: "Publicación en Meta gratis",
    values: { FREE: true, STARTER: true, PRO: true, BUSINESS: true },
  },
  {
    label: "Variantes A/B",
    values: { FREE: false, STARTER: false, PRO: true, BUSINESS: true },
  },
  {
    label: "Prioridad de procesamiento",
    values: { FREE: false, STARTER: false, PRO: false, BUSINESS: true },
  },
  {
    label: "Negocios vinculados",
    values: { FREE: "1", STARTER: "1", PRO: "1", BUSINESS: "1" },
  },
];

const TRUST: { icon: IconName; text: string }[] = [
  { icon: "check", text: "Pago seguro con Mercado Pago" },
  { icon: "sparkles", text: "Empieza gratis, sin tarjeta" },
  { icon: "clock", text: "Cancela cuando quieras" },
  { icon: "megaphone", text: "Publicación oficial en Meta" },
];

export default function LandingPage() {
  const router = useRouter();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [period, setPeriod] = useState<BillingPeriod>("MONTHLY");
  // Avoid a flash of the landing for already-authenticated users.
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    if (localStorage.getItem("oneclickia_token")) {
      router.replace("/ads/search");
      return;
    }
    setCheckingAuth(false);
    if (CREDITS_ENABLED) {
      billingApi.plans().then(setPlans).catch(() => setPlans([]));
    }
  }, [router]);

  if (checkingAuth) return null;

  const annualDiscountPct =
    plans.find((p) => p.tier !== "FREE")?.annualDiscountPct ?? 0;

  return (
    <div className="flex min-h-screen flex-col">
      {/* Nav */}
      <header className="flex h-16 items-center justify-between px-6 lg:px-10">
        <span className="text-lg font-semibold text-ink">OneClickIA</span>
        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm">
              Iniciar sesión
            </Button>
          </Link>
          <Link href="/register">
            <Button size="sm">Crear cuenta</Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-3xl px-6 pt-16 pb-12 text-center lg:pt-24">
        <Badge variant="orange">Campañas de Meta Ads con IA</Badge>
        <h1 className="mt-4 text-4xl font-bold leading-tight text-ink lg:text-5xl">
          Crea campañas publicitarias en minutos, no en días
        </h1>
        <p className="mt-4 text-lg text-muted">
          OneClickIA encuentra anuncios y videos ganadores, genera tus copys,
          imágenes y guiones con inteligencia artificial, y deja tu campaña
          lista para publicar en Meta.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link href="/register">
            <Button size="lg">Empezar gratis</Button>
          </Link>
          {CREDITS_ENABLED && (
            <Link href="#planes">
              <Button variant="ghost" size="lg">
                Ver planes
              </Button>
            </Link>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto grid max-w-5xl gap-4 px-6 pb-16 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map((f) => (
          <Card key={f.title}>
            <Icon name={f.icon} size={28} className={f.color} />
            <h3 className="mt-3 font-semibold text-ink">{f.title}</h3>
            <p className="mt-1 text-sm text-muted">{f.body}</p>
          </Card>
        ))}
      </section>

      {/* Social proof */}
      <section className="mx-auto max-w-5xl px-6 pb-16">
        <h2 className="text-center text-2xl font-semibold text-ink">
          Marcas que crean campañas en minutos
        </h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <Card key={t.name} className="flex flex-col">
              <div className="text-orange" aria-label="5 de 5 estrellas">
                ★★★★★
              </div>
              <p className="mt-2 flex-1 text-sm text-charcoal">
                “{t.quote}”
              </p>
              <p className="mt-3 text-sm font-semibold text-ink">{t.name}</p>
              <p className="text-xs text-muted">{t.role}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Pricing — oculto cuando el sistema de créditos está apagado */}
      {CREDITS_ENABLED && (
      <section id="planes" className="mx-auto max-w-5xl px-6 pb-20">
        <h2 className="text-center text-2xl font-semibold text-ink">
          Planes para cada etapa
        </h2>
        <p className="mt-2 text-center text-sm text-muted">
          Los créditos se consumen al generar con IA. Publicar en Meta es gratis.
        </p>

        {/* Monthly / Annual toggle */}
        <div className="mt-6 flex justify-center">
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

        <div className="mt-8 grid gap-4 lg:grid-cols-4">
          {plans.map((plan) => {
            const isFree = plan.tier === "FREE";
            const isAnnual = period === "ANNUAL";
            const perMonthUsdCents = isAnnual
              ? plan.annualMonthlyUsdCents
              : plan.priceUsdCents;
            const href = isFree
              ? "/register"
              : `/register?plan=${plan.tier}${isAnnual ? "&period=annual" : ""}`;
            const highlight = plan.tier === "PRO";
            const annualSavingsUsdCents =
              plan.priceUsdCents * 12 - plan.annualPriceUsdCents;
            return (
              <Card
                key={plan.tier}
                className={`relative flex flex-col transition duration-200 ${
                  highlight
                    ? "border-2 border-orange shadow-lg lg:-translate-y-2"
                    : "hover:-translate-y-1 hover:border-sand-mid hover:shadow-md"
                }`}
              >
                {highlight && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-orange px-3 py-0.5 text-xs font-semibold text-white shadow">
                    ★ Más elegido
                  </span>
                )}
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-ink">{plan.name}</h3>
                  {highlight && <Badge variant="orange">Popular</Badge>}
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
                  {!isFree && isAnnual && (
                    <p className="mt-1 text-xs text-muted">
                      {formatUsd(plan.annualPriceUsdCents)} USD facturado al año
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
                  {plan.features.map((feat) => (
                    <li
                      key={feat}
                      className="flex items-start gap-2 text-sm text-charcoal"
                    >
                      <span className="mt-0.5 flex h-4 w-4 flex-none items-center justify-center rounded-full bg-orange/15 text-[10px] font-bold text-orange">
                        ✓
                      </span>
                      {feat}
                    </li>
                  ))}
                </ul>

                <Link href={href} className="mt-6">
                  <Button
                    className="w-full"
                    variant={highlight ? "primary" : "ghost"}
                  >
                    {isFree ? "Crear cuenta gratis" : `Empezar con ${plan.name}`}
                  </Button>
                </Link>
                {!isFree && (
                  <p className="mt-2 text-center text-[11px] text-muted">
                    Sin permanencia · cancela cuando quieras
                  </p>
                )}
              </Card>
            );
          })}
        </div>

        {/* Guarantee / risk reversal */}
        <div className="mt-6 flex items-center justify-center gap-3 rounded-md border border-success/20 bg-success/10 px-4 py-3 text-center">
          <Icon name="check" size={20} className="flex-none text-success-text" />
          <p className="text-sm text-charcoal">
            <span className="font-semibold text-ink">
              Empieza gratis, sin tarjeta de crédito.
            </span>{" "}
            Prueba la plataforma con créditos gratis y cancela cuando quieras.
          </p>
        </div>

        {/* Trust bar */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          {TRUST.map((t) => (
            <span
              key={t.text}
              className="inline-flex items-center gap-1.5 text-xs text-muted"
            >
              <Icon name={t.icon} size={16} className="text-orange" />
              {t.text}
            </span>
          ))}
        </div>

        {/* Feature comparison table */}
        <h3 className="mt-14 text-center text-lg font-semibold text-ink">
          Compara los planes
        </h3>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-sand">
                <th className="py-3 pr-4 text-left font-medium text-muted">
                  Incluye
                </th>
                {plans.map((p) => (
                  <th
                    key={p.tier}
                    className={`px-3 py-3 text-center font-semibold ${
                      p.tier === "PRO" ? "text-orange" : "text-ink"
                    }`}
                  >
                    {p.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-sand/60">
                <td className="py-3 pr-4 text-charcoal">Créditos por mes</td>
                {plans.map((p) => (
                  <td
                    key={p.tier}
                    className="px-3 py-3 text-center font-semibold text-ink"
                  >
                    {p.monthlyCredits.toLocaleString("es")}
                  </td>
                ))}
              </tr>
              {COMPARE.map((row) => (
                <tr key={row.label} className="border-b border-sand/60">
                  <td className="py-3 pr-4 text-charcoal">{row.label}</td>
                  {plans.map((p) => {
                    const v = row.values[p.tier];
                    return (
                      <td key={p.tier} className="px-3 py-3 text-center">
                        {typeof v === "boolean" ? (
                          v ? (
                            <span className="text-orange">✓</span>
                          ) : (
                            <span className="text-sand-mid">–</span>
                          )
                        ) : (
                          <span className="text-charcoal">{v}</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      )}

      <footer className="mt-auto border-t border-sand px-6 py-6 text-center text-sm text-muted">
        <div className="flex justify-center gap-4">
          <Link href="/privacy" className="hover:text-ink">
            Privacidad
          </Link>
          <Link href="/terms" className="hover:text-ink">
            Términos
          </Link>
        </div>
        <p className="mt-2">© {new Date().getFullYear()} OneClickIA</p>
      </footer>
    </div>
  );
}
