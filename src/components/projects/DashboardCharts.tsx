"use client";

import { useState, type ReactNode } from "react";
import { Card } from "@/components/ui/Card";
import { Icon, type IconName } from "@/components/ui/Icon";
import { useI18n } from "@/contexts/I18nContext";
import { formatDay, type ProjectDashboard } from "@/lib/projects";

// Gráficas del dashboard del proyecto. Colores por rol (tokens --viz-* en
// globals.css, validados claro/oscuro): estados del flujo = rampa ordinal
// de un solo tono; señales de riesgo = paleta de estado + icono + etiqueta
// (nunca solo color); series semanales = slots categóricos 1 y 2.

type T = (k: string, v?: Record<string, string | number>) => string;

const STATUS_SERIES = [
  { key: "todo", label: "Por hacer", color: "var(--viz-ord-1)" },
  { key: "inProgress", label: "En progreso", color: "var(--viz-ord-2)" },
  { key: "inReview", label: "En revisión", color: "var(--viz-ord-3)" },
  { key: "done", label: "Hecho", color: "var(--viz-ord-4)" },
] as const;

type StatusKey = (typeof STATUS_SERIES)[number]["key"];

function Tooltip({ children }: { children: ReactNode }) {
  return (
    <div
      role="tooltip"
      className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md border border-sand bg-cream px-2.5 py-1.5 text-xs text-ink shadow-lg"
    >
      {children}
    </div>
  );
}

function Swatch({ color }: { color: string }) {
  return <span className="inline-block h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: color }} />;
}

function Legend({ items }: { items: { label: string; color: string }[] }) {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-charcoal">
      {items.map((i) => (
        <span key={i.label} className="flex items-center gap-1.5">
          <Swatch color={i.color} />
          {i.label}
        </span>
      ))}
    </div>
  );
}

function ChartCard({
  title,
  subtitle,
  children,
  table,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  table: ReactNode;
}) {
  const { t } = useI18n();
  const [showTable, setShowTable] = useState(false);
  return (
    <Card padding="sm" className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-ink">{title}</p>
          {subtitle && <p className="text-xs text-muted">{subtitle}</p>}
        </div>
        <button
          type="button"
          onClick={() => setShowTable((s) => !s)}
          className="shrink-0 text-xs font-semibold text-charcoal hover:underline"
          aria-pressed={showTable}
        >
          {showTable ? t("Ver gráfica") : t("Ver tabla")}
        </button>
      </div>
      {showTable ? <div className="overflow-x-auto">{table}</div> : children}
    </Card>
  );
}

const th = "px-2 py-1 text-left font-medium text-muted";
const td = "px-2 py-1 text-ink tabular-nums";

// ── Barras horizontales (una serie por fila) ──

interface BarRow {
  label: string;
  value: number;
  color: string;
  icon?: IconName;
}

function HBars({ rows, unit }: { rows: BarRow[]; unit: (n: number) => string }) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <ul className="flex flex-col gap-2.5">
      {rows.map((r, i) => (
        <li key={r.label} className="grid grid-cols-[8.5rem_1fr_2.5rem] items-center gap-2 text-sm">
          <span className="flex items-center gap-1.5 truncate text-charcoal">
            {r.icon && <Icon name={r.icon} size={14} style={{ color: r.color }} />}
            {r.label}
          </span>
          <div
            className="relative flex h-5 items-center"
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
          >
            <div className="absolute inset-y-[9px] left-0 right-0 rounded-full bg-[var(--viz-grid)]" />
            <div
              className="relative h-3 rounded-r-[4px] transition-[width]"
              style={{ width: `${(r.value / max) * 100}%`, minWidth: r.value ? 4 : 0, background: r.color }}
            />
            {hover === i && (
              <Tooltip>
                {r.label}: <strong>{unit(r.value)}</strong>
              </Tooltip>
            )}
          </div>
          <span className="text-right text-sm font-semibold tabular-nums text-ink">{r.value}</span>
        </li>
      ))}
    </ul>
  );
}

// ── Barras apiladas por fase ──

function PhaseStack({ data, t }: { data: ProjectDashboard["byPhase"]; t: T }) {
  const [hover, setHover] = useState<string | null>(null);
  const max = Math.max(1, ...data.map((p) => p.todo + p.inProgress + p.inReview + p.done));
  return (
    <div className="flex flex-col gap-3">
      <Legend items={STATUS_SERIES.map((s) => ({ label: t(s.label), color: s.color }))} />
      <ul className="flex flex-col gap-2.5">
        {data.map((p) => {
          const total = p.todo + p.inProgress + p.inReview + p.done;
          return (
            <li key={p.phaseId} className="grid grid-cols-[8.5rem_1fr_3.5rem] items-center gap-2 text-sm">
              <span className="truncate text-charcoal" title={p.name}>
                {p.name}
              </span>
              <div className="flex h-4 gap-[2px]" style={{ width: `${(total / max) * 100}%` }}>
                {STATUS_SERIES.map((s) => {
                  const v = p[s.key as StatusKey];
                  if (!v) return null;
                  const id = `${p.phaseId}-${s.key}`;
                  return (
                    <div
                      key={s.key}
                      className="relative h-full first:rounded-l-[4px] last:rounded-r-[4px]"
                      style={{ flexGrow: v, flexBasis: 0, minWidth: 6, background: s.color }}
                      onMouseEnter={() => setHover(id)}
                      onMouseLeave={() => setHover(null)}
                    >
                      {hover === id && (
                        <Tooltip>
                          {p.name} · {t(s.label)}: <strong>{v}</strong>
                        </Tooltip>
                      )}
                    </div>
                  );
                })}
              </div>
              <span className="text-right text-xs tabular-nums text-muted">
                {p.done}/{total}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// ── Barras agrupadas por semana (iniciadas vs terminadas) ──

const WEEK_SERIES = [
  { key: "started", label: "Iniciadas", color: "var(--viz-s1)" },
  { key: "completed", label: "Terminadas", color: "var(--viz-s2)" },
] as const;

function WeeklyBars({ data, t, localeTag }: { data: ProjectDashboard["weekly"]; t: T; localeTag: string }) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(1, ...data.flatMap((d) => [d.started, d.completed]));
  const ticks = Array.from(new Set([0, Math.ceil(max / 2), max]));
  const H = 140;
  return (
    <div className="flex flex-col gap-3">
      <Legend items={WEEK_SERIES.map((s) => ({ label: t(s.label), color: s.color }))} />
      <div className="relative pl-6">
        {ticks.map((v) => (
          <div
            key={v}
            className="absolute left-6 right-0 border-t border-[var(--viz-grid)]"
            style={{ bottom: 18 + (v / max) * H }}
          >
            <span className="absolute -left-6 -translate-y-1/2 text-[10px] tabular-nums text-muted">{v}</span>
          </div>
        ))}
        <div className="relative flex items-end gap-2" style={{ height: H + 18 }}>
          {data.map((d, i) => (
            <div
              key={d.week}
              className="relative flex h-full flex-1 flex-col justify-end"
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
            >
              <div className="flex items-end justify-center gap-[2px]" style={{ height: H }}>
                {WEEK_SERIES.map((s) => (
                  <div
                    key={s.key}
                    className="w-full max-w-4 rounded-t-[4px]"
                    style={{
                      height: `${(d[s.key] / max) * 100}%`,
                      minHeight: d[s.key] ? 3 : 0,
                      background: s.color,
                      opacity: hover === null || hover === i ? 1 : 0.45,
                    }}
                  />
                ))}
              </div>
              <span className="mt-1 h-[14px] truncate text-center text-[10px] text-muted">
                {formatDay(d.week, localeTag)}
              </span>
              {hover === i && (
                <Tooltip>
                  <span className="block font-semibold">{t("Semana del {d}", { d: formatDay(d.week, localeTag) })}</span>
                  {WEEK_SERIES.map((s) => (
                    <span key={s.key} className="flex items-center gap-1.5">
                      <Swatch color={s.color} />
                      {t(s.label)}: <strong className="tabular-nums">{d[s.key]}</strong>
                    </span>
                  ))}
                </Tooltip>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function DashboardCharts({ dashboard }: { dashboard: ProjectDashboard }) {
  const { t, localeTag } = useI18n();
  const c = dashboard.counts;
  const tasksUnit = (n: number) => (n === 1 ? t("1 tarea") : t("{n} tareas", { n }));

  const statusRows: BarRow[] = STATUS_SERIES.map((s) => ({
    label: t(s.label),
    value: c[s.key as StatusKey],
    color: s.color,
  }));
  const signalRows: BarRow[] = [
    { label: t("Bloqueadas"), value: c.blocked, color: "var(--viz-critical)", icon: "lock" },
    { label: t("Atrasadas"), value: c.overdue, color: "var(--viz-serious)", icon: "clock" },
    { label: t("En riesgo"), value: c.atRisk, color: "var(--viz-warning)", icon: "alert-triangle" },
    { label: t("Sin asignar"), value: c.unassigned, color: "var(--viz-neutral)", icon: "users" },
  ];

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <ChartCard
        title={t("Tareas por estado")}
        subtitle={t("{started} de {total} tareas ya se iniciaron", { started: c.started, total: c.total })}
        table={
          <table className="w-full text-sm">
            <tbody>
              {statusRows.map((r) => (
                <tr key={r.label}>
                  <td className={th}>{r.label}</td>
                  <td className={td}>{r.value}</td>
                </tr>
              ))}
              <tr>
                <td className={th}>{t("Iniciadas")}</td>
                <td className={td}>{c.started}</td>
              </tr>
            </tbody>
          </table>
        }
      >
        <HBars rows={statusRows} unit={tasksUnit} />
      </ChartCard>

      <ChartCard
        title={t("Señales de riesgo")}
        subtitle={t("Tareas abiertas que requieren atención")}
        table={
          <table className="w-full text-sm">
            <tbody>
              {signalRows.map((r) => (
                <tr key={r.label}>
                  <td className={th}>{r.label}</td>
                  <td className={td}>{r.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        }
      >
        <HBars rows={signalRows} unit={tasksUnit} />
      </ChartCard>

      <ChartCard
        title={t("Avance por fase")}
        subtitle={t("Tareas de cada fase según su estado")}
        table={
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className={th}>{t("Fase")}</th>
                {STATUS_SERIES.map((s) => (
                  <th key={s.key} className={th}>
                    {t(s.label)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dashboard.byPhase.map((p) => (
                <tr key={p.phaseId}>
                  <td className={td}>{p.name}</td>
                  {STATUS_SERIES.map((s) => (
                    <td key={s.key} className={td}>
                      {p[s.key as StatusKey]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        }
      >
        {dashboard.byPhase.length ? (
          <PhaseStack data={dashboard.byPhase} t={t} />
        ) : (
          <p className="text-sm text-muted">{t("Sin fases.")}</p>
        )}
      </ChartCard>

      <ChartCard
        title={t("Ritmo semanal")}
        subtitle={t("Tareas iniciadas y terminadas en las últimas 8 semanas")}
        table={
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className={th}>{t("Semana")}</th>
                <th className={th}>{t("Iniciadas")}</th>
                <th className={th}>{t("Terminadas")}</th>
              </tr>
            </thead>
            <tbody>
              {dashboard.weekly.map((w) => (
                <tr key={w.week}>
                  <td className={td}>{formatDay(w.week, localeTag)}</td>
                  <td className={td}>{w.started}</td>
                  <td className={td}>{w.completed}</td>
                </tr>
              ))}
            </tbody>
          </table>
        }
      >
        <WeeklyBars data={dashboard.weekly} t={t} localeTag={localeTag} />
      </ChartCard>
    </div>
  );
}
