"use client";

import { Fragment } from "react";
import { useI18n } from "@/contexts/I18nContext";
import type { TranslateVars } from "@/i18n/translate";

// Marcado mínimo dentro de una frase traducible, para no partir párrafos en
// diez claves sueltas (que se traducen fatal porque pierden el contexto):
//
//   **negrita**   → <strong>
//   *cursiva*     → <em>
//   `código`      → <code>
//
// Se usa sobre todo en las guías paso a paso (Shopify, onboarding), donde el
// texto lleva mucho énfasis intercalado.
const TOKEN = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;

export function RichText({
  children,
  vars,
  className,
}: {
  /** Texto en español con el marcado de arriba. Es también la clave. */
  children: string;
  vars?: TranslateVars;
  className?: string;
}) {
  const { t } = useI18n();
  const parts = t(children, vars).split(TOKEN);

  const nodes = parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
      return <em key={i}>{part.slice(1, -1)}</em>;
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={i}
          className="rounded bg-sand-light px-1 py-0.5 text-xs text-ink"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return <Fragment key={i}>{part}</Fragment>;
  });

  return className ? (
    <span className={className}>{nodes}</span>
  ) : (
    <>{nodes}</>
  );
}
