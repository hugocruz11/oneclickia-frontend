"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { useI18n } from "@/contexts/I18nContext";
import {
  formatDay,
  nextTasksApi,
  type NextReason,
  type NextTaskSuggestion,
} from "@/lib/projects";

function reasonText(
  reason: NextReason,
  s: NextTaskSuggestion,
  t: (k: string, v?: Record<string, string | number>) => string,
  localeTag: string,
): string {
  switch (reason) {
    case "IN_PROGRESS":
      return t("Ya la empezaste");
    case "OVERDUE":
      return t("Está atrasada");
    case "AT_RISK":
      return t("En riesgo de no llegar a la fecha");
    case "UNBLOCKS":
      return s.unblocksCount === 1
        ? t("Desbloquea 1 tarea")
        : t("Desbloquea {n} tareas", { n: s.unblocksCount });
    case "HIGH_PRIORITY":
      return t("Prioridad alta");
    case "DUE_SOON":
      return t("Vence pronto ({d})", { d: formatDay(s.task.dueDate, localeTag) });
  }
}

// Sugerencia de por dónde empezar: solo tareas que ya se pueden iniciar
// (sin bloqueos ni dependencias pendientes), ordenadas por urgencia y por
// cuántas tareas de otros desbloquean.
export function NextTasksCard({
  projectId,
  refreshKey,
  onOpen,
}: {
  projectId?: string;
  /** Change it to reload (e.g. after a status change). */
  refreshKey?: number;
  onOpen: (taskId: string) => void;
}) {
  const { t, localeTag } = useI18n();
  const [items, setItems] = useState<NextTaskSuggestion[] | null>(null);

  useEffect(() => {
    nextTasksApi
      .get(projectId)
      .then(setItems)
      .catch(() => setItems([]));
  }, [projectId, refreshKey]);

  if (!items || items.length === 0) return null;
  const [first, ...rest] = items;

  return (
    <div className="rounded-md border border-orange/40 bg-orange/5 p-4">
      <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-orange">
        <Icon name="lightbulb" size={14} />
        {t("Sugerencia: empieza por")}
      </p>
      <button
        type="button"
        onClick={() => onOpen(first.taskId)}
        className="mt-2 block w-full text-left"
      >
        <span className="block text-base font-semibold text-ink hover:underline">
          {first.task.title}
        </span>
        {first.task.project && (
          <span className="block text-xs text-muted">{first.task.project.title}</span>
        )}
      </button>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {first.reasons.map((r) => (
          <span
            key={r}
            className="rounded-sm border border-sand bg-white px-2 py-0.5 text-xs text-charcoal"
          >
            {reasonText(r, first, t, localeTag)}
          </span>
        ))}
      </div>
      {rest.length > 0 && (
        <div className="mt-3 border-t border-orange/20 pt-2">
          <p className="text-xs text-muted">{t("Después:")}</p>
          <ol className="mt-1 flex flex-col gap-1">
            {rest.map((s, i) => (
              <li key={s.taskId} className="text-sm">
                <button
                  type="button"
                  onClick={() => onOpen(s.taskId)}
                  className="text-left text-ink hover:underline"
                >
                  {i + 2}. {s.task.title}
                </button>
                {s.reasons[0] && (
                  <span className="ml-2 text-xs text-muted">
                    · {reasonText(s.reasons[0], s, t, localeTag)}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
