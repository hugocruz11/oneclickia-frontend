"use client";

import { Fragment, useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { useI18n } from "@/contexts/I18nContext";
import { canLead, useOrg } from "@/contexts/OrgContext";
import { formatDay, workloadApi, type WorkloadGrid } from "@/lib/projects";
import { errorMessage } from "@/components/projects/labels";

function cellClass(pct: number, capacity: number): string {
  if (capacity <= 0) return "bg-sand-light text-muted";
  if (pct > 1) return "bg-red-100 text-red-800";
  if (pct >= 0.85) return "bg-amber-100 text-amber-800";
  if (pct > 0) return "bg-emerald-50 text-emerald-800";
  return "bg-white text-muted";
}

// Carga de trabajo global: personas × semanas, sumando TODOS los proyectos.
export default function WorkloadPage() {
  const { t, localeTag } = useI18n();
  const { role, current } = useOrg();
  const [grid, setGrid] = useState<WorkloadGrid | null>(null);
  const [weeks, setWeeks] = useState(6);
  const [projectId, setProjectId] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!current || !canLead(role)) return;
    workloadApi
      .get({ weeks, projectId: projectId ? [projectId] : undefined })
      .then(setGrid)
      .catch((err) => setError(errorMessage(err, t)));
  }, [current, role, weeks, projectId, t]);

  if (current && !canLead(role)) {
    return <Card className="mx-auto max-w-xl text-center text-sm text-muted">{t("Solo líderes y administradores ven la carga de trabajo.")}</Card>;
  }

  const projectTitle = new Map(grid?.projects.map((p) => [p.id, p.title]) ?? []);

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-5">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex-1">
          <h1 className="text-2xl font-semibold text-ink">{t("Carga de trabajo")}</h1>
          <p className="text-sm text-muted">
            {t("Horas asignadas vs capacidad de cada persona, sumando todos sus proyectos.")}
          </p>
        </div>
        <select
          className="rounded-md border border-sand bg-white px-2 py-1.5 text-sm"
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
          aria-label={t("Proyecto")}
        >
          <option value="">{t("Todas las personas")}</option>
          {grid?.projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.title}
            </option>
          ))}
        </select>
        <select
          className="rounded-md border border-sand bg-white px-2 py-1.5 text-sm"
          value={weeks}
          onChange={(e) => setWeeks(Number(e.target.value))}
          aria-label={t("Semanas")}
        >
          {[4, 6, 8, 12].map((w) => (
            <option key={w} value={w}>
              {t("{n} semanas", { n: w })}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap gap-3 text-xs text-charcoal">
        <span className="flex items-center gap-1"><span className="h-3 w-3 rounded-sm bg-emerald-50 ring-1 ring-sand" /> {t("Con espacio")}</span>
        <span className="flex items-center gap-1"><span className="h-3 w-3 rounded-sm bg-amber-100" /> {t("Casi lleno (≥85%)")}</span>
        <span className="flex items-center gap-1"><span className="h-3 w-3 rounded-sm bg-red-100" /> {t("Sobrecargado")}</span>
      </div>

      {error && <p className="text-sm text-error">{error}</p>}
      {!grid ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : grid.rows.length === 0 ? (
        <Card className="text-center text-sm text-muted">{t("No hay personas para mostrar.")}</Card>
      ) : (
        <div className="overflow-x-auto rounded-md border border-sand bg-white">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-sand-light text-xs text-muted">
              <tr>
                <th className="px-3 py-2 text-left">{t("Persona")}</th>
                {grid.weeks.map((w) => (
                  <th key={w} className="px-2 py-2 text-center font-medium">
                    {t("Sem. {d}", { d: formatDay(w, localeTag) })}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-sand">
              {grid.rows.map((row) => (
                <Fragment key={row.userId}>
                  <tr>
                    <td className="px-3 py-2">
                      <button
                        type="button"
                        className="text-left font-medium text-ink hover:underline"
                        onClick={() => setExpanded((e) => (e === row.userId ? null : row.userId))}
                      >
                        {row.name}
                      </button>
                    </td>
                    {row.allocated.map((h, i) => {
                      const cap = row.capacity[i];
                      const pct = cap > 0 ? h / cap : 0;
                      return (
                        <td key={i} className="px-1 py-1 text-center">
                          <span
                            className={`block rounded-sm px-1 py-1.5 text-xs font-semibold ${cellClass(pct, cap)}`}
                            title={t("{h} h de {c} h", { h, c: cap })}
                          >
                            {cap > 0 ? `${Math.round(pct * 100)}%` : t("Ausente")}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                  {expanded === row.userId &&
                    Object.entries(row.byProject).map(([pid, hours]) => (
                      <tr key={`${row.userId}-${pid}`} className="bg-cream text-xs">
                        <td className="px-3 py-1 pl-8 text-muted">{projectTitle.get(pid) ?? pid}</td>
                        {hours.map((h, i) => (
                          <td key={i} className="px-1 py-1 text-center text-charcoal">
                            {h ? `${h} h` : ""}
                          </td>
                        ))}
                      </tr>
                    ))}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
