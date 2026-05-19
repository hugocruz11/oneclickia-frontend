"use client";

import Link from "next/link";
import { Card } from "@/components/ui/Card";

export default function OnboardingChoicePage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-ink">Configura tu marca</h2>
        <p className="mt-2 text-sm text-muted">
          Elige qué tan a fondo quieres entrenar a la IA. Mientras más cuentes
          de tu marca, mejores serán los anuncios que genere.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <ChoiceCard
          href="/onboarding/quick"
          icon="⚡"
          title="Configuración rápida"
          duration="~3 minutos"
          description="Lo mínimo para empezar: nombre, logo, sitio web. Funciona, pero los ads son más genéricos."
          features={[
            "Nombre de la marca",
            "Logo",
            "URL del sitio web",
            "Instagram (opcional)",
          ]}
          variant="basic"
        />

        <ChoiceCard
          href="/onboarding/extended"
          icon="🎯"
          title="Configuración completa"
          duration="~15 minutos"
          description="Cuéntale a la IA tu producto, audiencia, diferenciación y mucho más. Ads notablemente mejores."
          features={[
            "Todo lo de la rápida",
            "USP y diferenciación",
            "Avatar del cliente",
            "Voice of Customer",
            "Munición creativa",
            "Banco de objeciones",
          ]}
          variant="recommended"
          badge="Recomendado"
        />
      </div>

      <p className="mt-2 text-center text-xs text-muted">
        Puedes empezar con la rápida y completar la versión extendida después
        desde tu dashboard.
      </p>
    </div>
  );
}

function ChoiceCard({
  href,
  icon,
  title,
  duration,
  description,
  features,
  variant,
  badge,
}: {
  href: string;
  icon: string;
  title: string;
  duration: string;
  description: string;
  features: string[];
  variant: "basic" | "recommended";
  badge?: string;
}) {
  const isRecommended = variant === "recommended";
  return (
    <Link href={href} className="block">
      <Card
        className={`relative h-full transition-all hover:shadow-md ${
          isRecommended
            ? "border-orange ring-2 ring-orange/20"
            : "hover:border-orange/40"
        }`}
        padding="lg"
      >
        {badge && (
          <span className="absolute -top-2.5 right-4 rounded-full bg-orange px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
            {badge}
          </span>
        )}

        <div className="flex items-baseline justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{icon}</span>
            <h3 className="text-base font-semibold text-ink">{title}</h3>
          </div>
          <span className="text-xs text-muted">{duration}</span>
        </div>

        <p className="mt-3 text-sm text-muted">{description}</p>

        <ul className="mt-4 flex flex-col gap-1.5">
          {features.map((f) => (
            <li
              key={f}
              className="flex items-center gap-2 text-xs text-charcoal"
            >
              <span
                className={isRecommended ? "text-orange" : "text-muted"}
              >
                ✓
              </span>
              {f}
            </li>
          ))}
        </ul>

        <div
          className={`mt-5 rounded-md py-2 text-center text-sm font-medium transition-colors ${
            isRecommended
              ? "bg-orange text-white"
              : "border border-sand text-ink hover:border-orange/40"
          }`}
        >
          Empezar →
        </div>
      </Card>
    </Link>
  );
}
