"use client";

import { useEffect, useState } from "react";

interface AiProgressProps {
  // Mensaje principal (ej. "Generando copy con IA…").
  message: string;
  // Pista de duración esperada para calibrar expectativas (segundos).
  estimateSeconds?: number;
}

// Feedback para operaciones de IA largas (15–60s). En vez de un spinner mudo
// que parece congelado, muestra una barra de progreso animada, el tiempo
// transcurrido y un texto que tranquiliza. El progreso es "simulado" (no
// real, porque el backend no reporta avance) pero comunica que algo pasa.
export function AiProgress({ message, estimateSeconds = 30 }: AiProgressProps) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const start = Date.now();
    const id = setInterval(() => {
      setElapsed((Date.now() - start) / 1000);
    }, 250);
    return () => clearInterval(id);
  }, []);

  // Curva que se acerca a 95% asintóticamente: avanza rápido al inicio y se
  // frena cerca del final, así nunca "llega" antes de tiempo ni se estanca.
  const pct = Math.min(95, (1 - Math.exp(-elapsed / estimateSeconds)) * 100);

  return (
    <div
      className="flex flex-col items-center gap-3 py-10"
      role="status"
      aria-live="polite"
    >
      <p className="text-sm font-medium text-ink">{message}</p>
      <div className="h-2 w-full max-w-xs overflow-hidden rounded-full bg-sand-light">
        <div
          className="h-full rounded-full bg-orange transition-[width] duration-300 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-xs text-muted">
        {elapsed < estimateSeconds * 1.5
          ? `Esto suele tardar ~${estimateSeconds}s · ${Math.floor(elapsed)}s`
          : `Tardando un poco más de lo normal… ${Math.floor(elapsed)}s`}
      </p>
    </div>
  );
}
