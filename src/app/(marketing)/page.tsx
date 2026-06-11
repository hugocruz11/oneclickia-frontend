"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { billingApi, formatUsd, type Plan } from "@/lib/billing";
import { CREDITS_ENABLED } from "@/contexts/CreditsContext";

const FEATURES = [
  {
    icon: "🔍",
    title: "Encuentra anuncios ganadores",
    body: "Busca los creativos que ya están funcionando en tu nicho y úsalos como base.",
  },
  {
    icon: "✨",
    title: "Copys e imágenes con IA",
    body: "Genera variantes de texto e imágenes para Meta adaptadas a tu marca en minutos.",
  },
  {
    icon: "🎬",
    title: "Analiza videos ganadores",
    body: "Desglosa con IA la estructura de los videos que mejor funcionan (hook, ángulos, CTA) y conviértela en un guion listo para replicar.",
  },
  {
    icon: "📢",
    title: "Publica en Meta gratis",
    body: "Crea la campaña lista para publicar directamente en Meta.",
  },
];

export default function LandingPage() {
  const router = useRouter();
  const [plans, setPlans] = useState<Plan[]>([]);
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
            <div className="text-2xl">{f.icon}</div>
            <h3 className="mt-3 font-semibold text-ink">{f.title}</h3>
            <p className="mt-1 text-sm text-muted">{f.body}</p>
          </Card>
        ))}
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

        <div className="mt-8 grid gap-4 lg:grid-cols-4">
          {plans.map((plan) => {
            const isFree = plan.tier === "FREE";
            const href = isFree ? "/register" : `/register?plan=${plan.tier}`;
            const highlight = plan.tier === "PRO";
            return (
              <Card
                key={plan.tier}
                className={`flex flex-col ${highlight ? "border-orange" : ""}`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-ink">{plan.name}</h3>
                  {highlight && <Badge variant="orange">Popular</Badge>}
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
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex gap-2 text-sm text-charcoal">
                      <span className="text-orange">✓</span>
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
              </Card>
            );
          })}
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
