"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { Icon } from "@/components/ui/Icon";
import { useI18n } from "@/contexts/I18nContext";
import { canLead, useOrg } from "@/contexts/OrgContext";
import {
  displayName,
  formatDay,
  projectsApi,
  type ConsolidatedDashboard,
  type ProjectStatus,
  type ProjectSummary,
} from "@/lib/projects";
import { errorMessage, PROJECT_STATUS_LABEL } from "@/components/projects/labels";

const STATUS_VARIANT: Record<ProjectStatus, "default" | "success" | "warning" | "muted" | "orange"> = {
  INTAKE: "orange",
  PLANNING: "warning",
  DRAFT: "orange",
  ACTIVE: "success",
  COMPLETED: "default",
  ARCHIVED: "muted",
};

export default function ProjectsPage() {
  const { t, localeTag } = useI18n();
  const { role, current } = useOrg();
  const [projects, setProjects] = useState<ProjectSummary[] | null>(null);
  const [dashboard, setDashboard] = useState<ConsolidatedDashboard | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!current) return;
    projectsApi
      .list(showArchived ? ["ARCHIVED", "COMPLETED"] : undefined)
      .then(setProjects)
      .catch((err) => setError(errorMessage(err, t)));
  }, [current, showArchived, t]);

  useEffect(() => {
    if (!current || !canLead(role)) return;
    projectsApi.consolidated().then(setDashboard).catch(() => setDashboard(null));
  }, [current, role]);

  const lateById = new Map(dashboard?.projects.map((p) => [p.projectId, p]) ?? []);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-ink">{t("Proyectos")}</h1>
          <p className="text-sm text-muted">
            {t("Escribe un objetivo y la IA lo convierte en un plan con tareas, responsables y fechas.")}
          </p>
        </div>
        {canLead(role) && (
          <Link
            href="/projects/new"
            className="inline-flex items-center gap-1.5 rounded-sm border border-orange bg-orange px-4 py-2 text-sm font-semibold text-cream hover:bg-orange-hover"
          >
            <Icon name="sparkles" size={16} />
            {t("Nuevo proyecto")}
          </Link>
        )}
      </div>

      {dashboard && dashboard.totals.projects > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {[
            { label: "Proyectos activos", value: dashboard.totals.projects },
            { label: "Proyectos atrasados", value: dashboard.totals.late, warn: dashboard.totals.late > 0 },
            { label: "Tareas atrasadas", value: dashboard.totals.overdue, warn: dashboard.totals.overdue > 0 },
            { label: "Tareas bloqueadas", value: dashboard.totals.blocked, warn: dashboard.totals.blocked > 0 },
            { label: "Por revisar", value: dashboard.totals.inReview },
          ].map((k) => (
            <Card key={k.label} padding="sm">
              <p className="text-xs text-muted">{t(k.label)}</p>
              <p className={`text-2xl font-semibold ${k.warn ? "text-red-600" : "text-ink"}`}>{k.value}</p>
            </Card>
          ))}
        </div>
      )}

      <label className="flex items-center gap-2 self-end text-sm text-charcoal">
        <input type="checkbox" checked={showArchived} onChange={(e) => setShowArchived(e.target.checked)} />
        {t("Ver completados y archivados")}
      </label>

      {error && <p className="text-sm text-error">{error}</p>}
      {projects === null ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : projects.length === 0 ? (
        <Card className="text-center">
          <p className="text-sm text-muted">
            {canLead(role)
              ? t("Aún no tienes proyectos. Crea el primero con IA.")
              : t("Todavía no participas en ningún proyecto.")}
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {projects.map((p) => {
            const dash = lateById.get(p.id);
            const progress = dash ? Math.round(dash.progress * 100) : null;
            return (
              <Link key={p.id} href={`/projects/${p.id}`} className="block">
                <Card className="h-full transition-colors hover:border-charcoal/40">
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="text-base font-semibold text-ink">{p.title}</h2>
                    <Badge variant={STATUS_VARIANT[p.status]}>{t(PROJECT_STATUS_LABEL[p.status])}</Badge>
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-muted">{p.objective}</p>
                  <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-charcoal">
                    <span>{t("Líder: {name}", { name: displayName(p.leader) })}</span>
                    <span>
                      {t("{done}/{total} tareas", { done: p.taskCounts.DONE, total: p.taskCounts.total })}
                    </span>
                    {p.dueDate && <span>{t("Límite: {d}", { d: formatDay(p.dueDate, localeTag) })}</span>}
                    {p.estimatedEndProbable && (
                      <span className={dash?.late ? "font-semibold text-red-600" : ""}>
                        {t("Estimado: {d}", { d: formatDay(p.estimatedEndProbable, localeTag) })}
                      </span>
                    )}
                  </div>
                  {progress !== null && (
                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-sand-light">
                      <div className="h-full bg-orange" style={{ width: `${progress}%` }} />
                    </div>
                  )}
                  {dash && (dash.counts.overdue > 0 || dash.counts.blocked > 0 || dash.counts.atRisk > 0) && (
                    <p className="mt-2 text-xs text-red-600">
                      {t("{o} atrasadas · {b} bloqueadas · {r} en riesgo", {
                        o: dash.counts.overdue,
                        b: dash.counts.blocked,
                        r: dash.counts.atRisk,
                      })}
                    </p>
                  )}
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
