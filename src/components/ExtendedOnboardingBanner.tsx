"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";

interface IntelligenceMini {
  completedSteps: number[];
  isComplete: boolean;
}

const TOTAL_STEPS = 7;
const DISMISS_KEY = "extOnbBannerDismissedAt";
const DISMISS_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Persistent banner at the top of the dashboard that nudges users who
 * completed the short onboarding to also fill the extended brand
 * intelligence survey. Hidden when:
 *   - the user has already completed it,
 *   - they recently dismissed it (TTL 7 days),
 *   - they are currently on the onboarding routes,
 *   - they have no brand yet (the welcome flow handles that case).
 */
export function ExtendedOnboardingBanner() {
  const pathname = usePathname();
  const [state, setState] = useState<
    | { kind: "hidden" }
    | { kind: "loading" }
    | { kind: "visible"; progress: number; isComplete: boolean }
  >({ kind: "loading" });

  useEffect(() => {
    let cancelled = false;
    async function load() {
      // Skip on onboarding routes
      if (pathname?.startsWith("/onboarding")) {
        setState({ kind: "hidden" });
        return;
      }

      // Skip if recently dismissed
      try {
        const raw = localStorage.getItem(DISMISS_KEY);
        if (raw) {
          const ts = Number(raw);
          if (
            Number.isFinite(ts) &&
            Date.now() - ts < DISMISS_TTL_MS
          ) {
            setState({ kind: "hidden" });
            return;
          }
        }
      } catch {
        // ignore localStorage failures
      }

      try {
        const { intelligence } = await api.get<{
          intelligence: IntelligenceMini | null;
        }>("/brand/intelligence");
        if (cancelled) return;
        const completed = intelligence?.completedSteps?.length ?? 0;
        const isComplete = intelligence?.isComplete ?? false;
        if (isComplete) {
          setState({ kind: "hidden" });
        } else {
          setState({
            kind: "visible",
            progress: completed,
            isComplete: false,
          });
        }
      } catch {
        if (!cancelled) setState({ kind: "hidden" });
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  if (state.kind !== "visible") return null;

  function handleDismiss() {
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
      // ignore
    }
    setState({ kind: "hidden" });
  }

  const inProgress = state.progress > 0;

  return (
    <div className="border-b border-orange/20 bg-orange/5">
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3">
        <div className="flex items-start gap-3">
          <span className="text-lg">🎯</span>
          <div>
            <p className="text-sm font-semibold text-ink">
              {inProgress
                ? `Continúa entrenando tu marca — ${state.progress}/${TOTAL_STEPS} pasos completados`
                : "Mejora tus anuncios con la configuración completa"}
            </p>
            <p className="mt-0.5 text-xs text-muted">
              {inProgress
                ? "Te falta poco para que la IA tenga el contexto completo de tu marca."
                : "15 minutos extra y la IA generará ads notablemente más relevantes para tu marca."}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/onboarding/extended"
            className="rounded-md bg-orange px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-orange/90"
          >
            {inProgress ? "Continuar" : "Empezar"}
          </Link>
          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Descartar"
            title="Descartar (vuelve en 7 días)"
            className="rounded-md p-1.5 text-muted transition-colors hover:bg-sand-light hover:text-ink"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
