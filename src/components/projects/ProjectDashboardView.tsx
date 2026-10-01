"use client";

import { Card } from "@/components/ui/Card";
import { useI18n } from "@/contexts/I18nContext";
import { formatDay, type ProjectDashboard } from "@/lib/projects";
import { DashboardCharts } from "./DashboardCharts";

// Dashboard del proyecto (líderes y admins): indicadores, gráficas y
// tareas que requieren atención. Sin ranking de personas.
export function ProjectDashboardView({
  dashboard,
  onOpenTask,
}: {
  dashboard: ProjectDashboard;
  onOpenTask: (taskId: string) => void;
}) {
  const { t, localeTag } = useI18n();
  const c = dashboard.counts;
  const kpis = [
    { label: "Avance", value: `${Math.round(dashboard.progress * 100)}%` },
    { label: "Iniciadas", value: c.started },
    { label: "En progreso", value: c.inProgress },
    { label: "En revisión", value: c.inReview },
    { label: "Bloqueadas", value: c.blocked, warn: c.blocked > 0 },
    { label: "En riesgo", value: c.atRisk, warn: c.atRisk > 0 },
  ];
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {kpis.map((k) => (
          <Card key={k.label} padding="sm">
            <p className="text-xs text-muted">{t(k.label)}</p>
            <p className={`text-2xl font-semibold tabular-nums ${k.warn ? "text-red-600" : "text-ink"}`}>
              {k.value}
            </p>
          </Card>
        ))}
      </div>

      <Card padding="sm">
        <p className="text-sm text-charcoal">
          {t("Fecha límite: {due} · Entrega estimada: {opt} – {prob}", {
            due: formatDay(dashboard.dueDate, localeTag),
            opt: formatDay(dashboard.estimatedEnd.optimistic, localeTag),
            prob: formatDay(dashboard.estimatedEnd.probable, localeTag),
          })}
        </p>
        {dashboard.late && (
          <p className="mt-1 text-sm font-semibold text-red-600">
            {t("Al ritmo y capacidad actuales, el proyecto terminaría después de su fecha límite.")}
          </p>
        )}
      </Card>

      <DashboardCharts dashboard={dashboard} />

      <Card padding="sm">
        <p className="mb-2 text-sm font-semibold text-ink">{t("Tareas que requieren atención")}</p>
        {dashboard.topAtRisk.length === 0 ? (
          <p className="text-sm text-muted">{t("Todo en orden por ahora.")}</p>
        ) : (
          <ul className="flex flex-col divide-y divide-sand">
            {dashboard.topAtRisk.map((r) => (
              <li key={r.taskId}>
                <button
                  type="button"
                  onClick={() => onOpenTask(r.taskId)}
                  className="flex w-full flex-wrap items-center gap-2 py-2 text-left text-sm hover:bg-sand-light"
                >
                  <span className="flex-1 text-ink">{r.title}</span>
                  {r.blocked && <span className="text-xs font-semibold text-red-600">{t("Bloqueada")}</span>}
                  <span className="text-xs text-muted">{r.assignee ?? t("Sin asignar")}</span>
                  <span className="text-xs text-muted">
                    {formatDay(r.estimatedEnd, localeTag)} / {formatDay(r.dueDate, localeTag)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
