"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useT } from "@/contexts/I18nContext";

interface Props {
  template: string;
  /**
   * Optional header — e.g., timestamp/caching info. Rendered above
   * the template block.
   */
  metaLine?: string;
  /**
   * Optional action buttons rendered to the right of the title.
   */
  actions?: React.ReactNode;
}

/**
 * Renders the universal template returned by the video-blueprint
 * prompt. Output is markdown plain text — we display it in a
 * monospace block to preserve formatting and offer a one-click copy
 * for easy reuse.
 */
export function VideoTemplateView({ template, metaLine, actions }: Props) {
  const t = useT();
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(template);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // ignore — clipboard API can fail on non-HTTPS contexts
    }
  }

  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-ink">
            {t("Template universal")}
          </h2>
          <p className="mt-1 text-xs text-muted">
            {t(
              "Estructura neutra del anuncio, lista para copiar y adaptar a tu producto. Las variables entre [CORCHETES] son los puntos que reemplazás con tus propios datos.",
            )}
          </p>
          {metaLine && (
            <p className="mt-1 text-[10px] text-muted">{metaLine}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" onClick={handleCopy}>
            {copied ? t("✓ Copiado") : t("Copiar")}
          </Button>
          {actions}
        </div>
      </div>

      <pre className="mt-4 max-h-[640px] overflow-auto whitespace-pre-wrap break-words rounded-md border border-sand bg-cream p-4 font-mono text-sm leading-relaxed text-charcoal">
        {template}
      </pre>
    </Card>
  );
}
