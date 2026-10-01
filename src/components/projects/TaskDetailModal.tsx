"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Spinner } from "@/components/ui/Spinner";
import { useI18n } from "@/contexts/I18nContext";
import {
  displayName,
  downloadAttachment,
  formatDay,
  PRIORITIES,
  tasksApi,
  type ActivityEvent,
  type Candidate,
  type ChecklistItem,
  type MemberProfile,
  type Skill,
  type TaskDetail,
  type TaskPriority,
  type TransitionAction,
} from "@/lib/projects";
import { Modal } from "./Modal";
import {
  CONFIDENCE_LABEL,
  errorMessage,
  PRIORITY_CLASS,
  PRIORITY_LABEL,
  TASK_STATUS_LABEL,
} from "./labels";
import { useTaskTransition } from "./useTaskTransition";

const input =
  "w-full rounded-md border border-sand bg-white px-3 py-2 text-sm text-ink focus:border-orange focus:outline-none";
const sectionTitle = "mb-2 text-xs font-semibold uppercase tracking-wide text-muted";

type Tab = "detail" | "comments" | "activity";

// Detalle de tarea: datos, checklist, dependencias, comentarios con
// menciones, adjuntos, temporizador, flujo de estados y reasignación.
export function TaskDetailModal({
  taskId,
  onClose,
  onChanged,
  members,
  skills,
  projectTasks,
}: {
  taskId: string | null;
  onClose: () => void;
  onChanged: () => void;
  members: MemberProfile[];
  skills: Skill[];
  projectTasks: { id: string; title: string }[];
}) {
  const { t, localeTag } = useI18n();
  const [task, setTask] = useState<TaskDetail | null>(null);
  const [tab, setTab] = useState<Tab>("detail");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [editing, setEditing] = useState(false);
  const [candidates, setCandidates] = useState<Candidate[] | null>(null);
  const [activity, setActivity] = useState<ActivityEvent[] | null>(null);
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    if (!taskId) return;
    try {
      setTask(await tasksApi.get(taskId));
    } catch (err) {
      setError(errorMessage(err, t));
    }
  }, [taskId, t]);

  useEffect(() => {
    setTask(null);
    setTab("detail");
    setEditing(false);
    setCandidates(null);
    setActivity(null);
    setError("");
    setInfo("");
    void load();
  }, [load]);

  useEffect(() => {
    if (tab === "activity" && taskId) {
      tasksApi.activity(taskId).then(setActivity).catch(() => setActivity([]));
    }
  }, [tab, taskId]);

  const refreshAll = useCallback(() => {
    void load();
    onChanged();
  }, [load, onChanged]);

  const transition = useTaskTransition(
    (r) => {
      if (r.projectCompleted) setInfo(t("¡Proyecto completado!"));
      refreshAll();
    },
    (msg) => setError(msg),
  );

  async function act<T>(fn: () => Promise<T>) {
    setError("");
    setSaving(true);
    try {
      await fn();
      refreshAll();
    } catch (err) {
      setError(errorMessage(err, t));
    } finally {
      setSaving(false);
    }
  }

  if (!taskId) return null;

  const manager = !!task?.canManage;
  const assignee = !!task?.isAssignee;
  const editable = task && !["ARCHIVED", "COMPLETED"].includes(task.project.status);
  const active = task?.project.status === "ACTIVE";

  function actionButtons(): { action: TransitionAction; label: string; variant: "primary" | "ghost" }[] {
    if (!task || !active) return [];
    const out: { action: TransitionAction; label: string; variant: "primary" | "ghost" }[] = [];
    const worker = assignee || manager;
    if (task.status === "TODO" && worker) out.push({ action: "START", label: "Iniciar", variant: "primary" });
    if (task.status === "IN_PROGRESS" && worker) {
      out.push({ action: "SUBMIT_REVIEW", label: "Enviar a revisión", variant: "primary" });
      out.push({ action: "RETURN_TODO", label: "Devolver a por hacer", variant: "ghost" });
    }
    if (task.status === "IN_REVIEW" && manager) {
      out.push({ action: "APPROVE", label: "Aprobar", variant: "primary" });
      out.push({ action: "REJECT", label: "Rechazar", variant: "ghost" });
    }
    if (task.status === "DONE" && manager) out.push({ action: "REOPEN", label: "Reabrir", variant: "ghost" });
    if (task.status !== "DONE" && worker) {
      out.push(
        task.blocked
          ? { action: "UNBLOCK", label: "Desbloquear", variant: "ghost" }
          : { action: "BLOCK", label: "Marcar bloqueada", variant: "ghost" },
      );
    }
    return out;
  }

  async function toggleChecklist(i: number) {
    if (!task) return;
    const next: ChecklistItem[] = task.checklist.map((c, idx) =>
      idx === i ? { ...c, done: !c.done } : c,
    );
    setTask({ ...task, checklist: next });
    await act(() => tasksApi.update(task.id, { checklist: next }));
  }

  async function loadCandidates() {
    if (!task) return;
    try {
      setCandidates(await tasksApi.candidates(task.id));
    } catch (err) {
      setError(errorMessage(err, t));
    }
  }

  async function assign(userId: string | null) {
    if (!task) return;
    setError("");
    try {
      const res = await tasksApi.assign(task.id, userId);
      if (res.conflicts.length) {
        setInfo(
          t("Con esta asignación la tarea terminaría el {date}, después de su fecha límite.", {
            date: formatDay(res.conflicts[0].estimatedEnd, localeTag),
          }),
        );
      }
      setCandidates(null);
      refreshAll();
    } catch (err) {
      setError(errorMessage(err, t));
    }
  }

  function insertMention(m: MemberProfile) {
    setComment((c) => `${c}${c && !c.endsWith(" ") ? " " : ""}@[${displayName(m.user)}](${m.userId}) `);
  }

  async function sendComment() {
    if (!task || !comment.trim()) return;
    await act(() => tasksApi.comment(task.id, comment.trim()));
    setComment("");
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !task) return;
    await act(() => tasksApi.upload(task.id, file));
    e.target.value = "";
  }

  async function logHours() {
    if (!task) return;
    const value = window.prompt(t("¿Cuántas horas trabajaste en esta tarea?"));
    const hours = value ? Number(value.replace(",", ".")) : NaN;
    if (!Number.isFinite(hours) || hours <= 0) return;
    await act(() => tasksApi.logTime(task.id, hours));
  }

  return (
    <Modal open onClose={onClose} title={task?.title ?? t("Tarea")} wide>
      {!task ? (
        <div className="flex justify-center py-12">
          {error ? <p className="text-sm text-error">{error}</p> : <Spinner />}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {/* Estado y acciones */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-sm border border-sand bg-sand-light px-2 py-0.5 text-xs font-semibold text-charcoal">
              {t(TASK_STATUS_LABEL[task.status])}
            </span>
            <span className={`text-xs font-semibold ${PRIORITY_CLASS[task.priority]}`}>
              {t("Prioridad {p}", { p: t(PRIORITY_LABEL[task.priority]) })}
            </span>
            {task.blocked && (
              <span className="rounded-sm bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
                {t("Bloqueada: {reason}", { reason: task.blockedReason ?? "" })}
              </span>
            )}
            {task.waiting && (
              <span className="rounded-sm bg-sand-light px-2 py-0.5 text-xs font-semibold text-charcoal">
                {t("En espera de dependencias")}
              </span>
            )}
            {task.rejectionCount > 0 && (
              <span className="text-xs text-muted">
                {t("Rechazada {n} veces", { n: task.rejectionCount })}
              </span>
            )}
            <div className="ml-auto flex flex-wrap gap-2">
              {actionButtons().map((b) => (
                <Button
                  key={b.action}
                  size="sm"
                  variant={b.variant}
                  disabled={transition.busy}
                  onClick={() => transition.request(task.id, b.action)}
                >
                  {t(b.label)}
                </Button>
              ))}
            </div>
          </div>

          {error && <p className="rounded-md bg-error/10 px-3 py-2 text-sm text-error">{error}</p>}
          {info && <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">{info}</p>}

          <div className="flex gap-4 border-b border-sand text-sm">
            {(["detail", "comments", "activity"] as Tab[]).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setTab(k)}
                className={`-mb-px border-b-2 px-1 pb-2 font-medium ${
                  tab === k ? "border-orange text-ink" : "border-transparent text-muted hover:text-ink"
                }`}
              >
                {k === "detail"
                  ? t("Detalle")
                  : k === "comments"
                    ? t("Comentarios ({n})", { n: task.comments.length })
                    : t("Historial")}
              </button>
            ))}
          </div>

          {tab === "detail" && (
            <div className="grid gap-5 md:grid-cols-3">
              <div className="flex flex-col gap-5 md:col-span-2">
                {editing && manager ? (
                  <TaskEditForm
                    task={task}
                    skills={skills}
                    onCancel={() => setEditing(false)}
                    onSave={async (input) => {
                      await act(() => tasksApi.update(task.id, input));
                      setEditing(false);
                    }}
                  />
                ) : (
                  <>
                    <div>
                      <div className="flex items-center justify-between">
                        <p className={sectionTitle}>{t("Descripción")}</p>
                        {manager && editable && (
                          <button
                            type="button"
                            className="text-xs font-semibold text-orange hover:underline"
                            onClick={() => setEditing(true)}
                          >
                            {t("Editar")}
                          </button>
                        )}
                      </div>
                      <p className="whitespace-pre-wrap text-sm text-ink">
                        {task.description || t("Sin descripción.")}
                      </p>
                    </div>
                    {task.deliverable && (
                      <div>
                        <p className={sectionTitle}>{t("Entregable")}</p>
                        <p className="text-sm text-ink">{task.deliverable}</p>
                      </div>
                    )}
                    {task.acceptanceCriteria.length > 0 && (
                      <div>
                        <p className={sectionTitle}>{t("Criterios de aceptación")}</p>
                        <ul className="list-disc pl-5 text-sm text-ink">
                          {task.acceptanceCriteria.map((c, i) => (
                            <li key={i}>{c}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                )}

                {task.checklist.length > 0 && (
                  <div>
                    <p className={sectionTitle}>
                      {t("Checklist ({done}/{total})", {
                        done: task.checklist.filter((c) => c.done).length,
                        total: task.checklist.length,
                      })}
                    </p>
                    <ul className="flex flex-col gap-1.5">
                      {task.checklist.map((c, i) => (
                        <li key={i}>
                          <label className="flex items-start gap-2 text-sm text-ink">
                            <input
                              type="checkbox"
                              checked={c.done}
                              disabled={!(manager || assignee) || !editable}
                              onChange={() => toggleChecklist(i)}
                              className="mt-0.5"
                            />
                            <span className={c.done ? "text-muted line-through" : ""}>{c.text}</span>
                          </label>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Dependencias */}
                <div>
                  <p className={sectionTitle}>{t("Depende de")}</p>
                  {task.dependencies.length === 0 && (
                    <p className="text-sm text-muted">{t("Sin dependencias.")}</p>
                  )}
                  <ul className="flex flex-col gap-1">
                    {task.dependencies.map((d) => (
                      <li key={d.dependsOnTaskId} className="flex items-center gap-2 text-sm">
                        <Icon
                          name={d.dependsOn.status === "DONE" ? "check" : "clock"}
                          size={14}
                          className={d.dependsOn.status === "DONE" ? "text-success" : "text-muted"}
                        />
                        <span className="flex-1 text-ink">{d.dependsOn.title}</span>
                        {manager && editable && (
                          <button
                            type="button"
                            aria-label={t("Quitar dependencia")}
                            className="text-muted hover:text-error"
                            onClick={() => act(() => tasksApi.removeDependency(task.id, d.dependsOnTaskId))}
                          >
                            <Icon name="close" size={14} />
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                  {manager && editable && (
                    <select
                      className={`${input} mt-2`}
                      value=""
                      onChange={(e) =>
                        e.target.value && act(() => tasksApi.addDependency(task.id, e.target.value))
                      }
                      aria-label={t("Agregar dependencia")}
                    >
                      <option value="">{t("+ Agregar dependencia…")}</option>
                      {projectTasks
                        .filter(
                          (p) =>
                            p.id !== task.id &&
                            !task.dependencies.some((d) => d.dependsOnTaskId === p.id),
                        )
                        .map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.title}
                          </option>
                        ))}
                    </select>
                  )}
                  {task.dependents.length > 0 && (
                    <p className="mt-2 text-xs text-muted">
                      {t("Bloquea a: {list}", {
                        list: task.dependents.map((d) => d.task.title).join(", "),
                      })}
                    </p>
                  )}
                </div>

                {/* Adjuntos */}
                <div>
                  <div className="flex items-center justify-between">
                    <p className={sectionTitle}>{t("Archivos")}</p>
                    {editable && (
                      <>
                        <button
                          type="button"
                          className="text-xs font-semibold text-orange hover:underline"
                          onClick={() => fileRef.current?.click()}
                        >
                          {t("Subir archivo")}
                        </button>
                        <input ref={fileRef} type="file" className="hidden" onChange={onFile} />
                      </>
                    )}
                  </div>
                  {task.attachments.length === 0 && (
                    <p className="text-sm text-muted">{t("Sin archivos.")}</p>
                  )}
                  <ul className="flex flex-col gap-1">
                    {task.attachments.map((a) => (
                      <li key={a.id} className="flex items-center gap-2 text-sm">
                        <Icon name="paperclip" size={14} className="text-muted" />
                        <button
                          type="button"
                          className="flex-1 truncate text-left text-ink hover:underline"
                          onClick={() =>
                            downloadAttachment(a).catch((err) => setError(errorMessage(err, t)))
                          }
                        >
                          {a.fileName}
                        </button>
                        <span className="text-xs text-muted">{Math.ceil(a.size / 1024)} KB</span>
                        {(manager || a.uploader?.id === task.assigneeId) && (
                          <button
                            type="button"
                            aria-label={t("Eliminar archivo")}
                            className="text-muted hover:text-error"
                            onClick={() => act(() => tasksApi.removeAttachment(a.id))}
                          >
                            <Icon name="trash" size={14} />
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Lateral: responsable, fechas, tiempo, skills */}
              <aside className="flex flex-col gap-4 rounded-md border border-sand bg-white p-4 text-sm">
                <div>
                  <p className={sectionTitle}>{t("Responsable")}</p>
                  <p className="font-medium text-ink">
                    {task.assignee ? displayName(task.assignee) : t("Sin asignar")}
                  </p>
                  {task.assignmentReason && (
                    <p className="mt-1 text-xs text-muted">{task.assignmentReason}</p>
                  )}
                  {manager && editable && task.status !== "DONE" && (
                    <div className="mt-2">
                      {candidates === null ? (
                        <button
                          type="button"
                          className="text-xs font-semibold text-orange hover:underline"
                          onClick={loadCandidates}
                        >
                          {t("Reasignar / ver sugerencias")}
                        </button>
                      ) : (
                        <div className="flex flex-col gap-2">
                          {candidates.length === 0 && (
                            <p className="text-xs text-muted">
                              {t("Nadie en la organización tiene las skills requeridas.")}
                            </p>
                          )}
                          {candidates.map((c) => (
                            <button
                              key={c.userId}
                              type="button"
                              onClick={() => assign(c.userId)}
                              className="rounded-md border border-sand p-2 text-left hover:border-orange"
                            >
                              <span className="flex items-center justify-between font-medium text-ink">
                                {c.name}
                                <span className={`text-xs ${c.fits ? "text-success" : "text-amber-700"}`}>
                                  {Math.round(c.utilization * 100)}%
                                </span>
                              </span>
                              <span className="mt-0.5 block text-xs text-muted">{c.reason}</span>
                            </button>
                          ))}
                          <select
                            className={input}
                            value=""
                            onChange={(e) => e.target.value && assign(e.target.value === "-" ? null : e.target.value)}
                            aria-label={t("Asignar a otra persona")}
                          >
                            <option value="">{t("Otra persona…")}</option>
                            {task.assigneeId && <option value="-">{t("— Quitar responsable —")}</option>}
                            {members.map((m) => (
                              <option key={m.userId} value={m.userId}>
                                {displayName(m.user)}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <p className={sectionTitle}>{t("Fechas")}</p>
                  <dl className="grid grid-cols-2 gap-y-1 text-xs">
                    <dt className="text-muted">{t("Inicio")}</dt>
                    <dd className="text-ink">{formatDay(task.startDate ?? task.estimatedStart, localeTag)}</dd>
                    <dt className="text-muted">{t("Fecha límite")}</dt>
                    <dd className="text-ink">{formatDay(task.dueDate, localeTag)}</dd>
                    <dt className="text-muted">{t("Entrega estimada")}</dt>
                    <dd className="text-ink">
                      {task.estimatedEndProbable
                        ? `${formatDay(task.estimatedEndOptimistic, localeTag)} – ${formatDay(task.estimatedEndProbable, localeTag)}`
                        : "—"}
                    </dd>
                  </dl>
                  {task.confidence && (
                    <p className="mt-1 text-xs text-muted">{t(CONFIDENCE_LABEL[task.confidence])}</p>
                  )}
                </div>

                <div>
                  <p className={sectionTitle}>{t("Tiempo")}</p>
                  <p className="text-xs text-ink">
                    {t("Estimado base: {h} h · Registrado: {l} h", {
                      h: Number(task.baseEstimateHours),
                      l: task.loggedHours,
                    })}
                  </p>
                  {assignee && active && task.status !== "DONE" && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {task.runningTimerStartedAt ? (
                        <Button size="sm" variant="dark" onClick={() => act(() => tasksApi.stopTimer(task.id))}>
                          <Icon name="pause" size={14} className="mr-1" />
                          {t("Detener")}
                        </Button>
                      ) : (
                        <Button size="sm" variant="ghost" onClick={() => act(() => tasksApi.startTimer(task.id))}>
                          <Icon name="play" size={14} className="mr-1" />
                          {t("Iniciar temporizador")}
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" onClick={logHours}>
                        {t("Registrar horas")}
                      </Button>
                    </div>
                  )}
                </div>

                <div>
                  <p className={sectionTitle}>{t("Skills requeridas")}</p>
                  <div className="flex flex-wrap gap-1">
                    {task.skills.length === 0 && <span className="text-xs text-muted">—</span>}
                    {task.skills.map((s) => (
                      <span key={s.skillId} className="rounded-sm bg-sand-light px-1.5 py-0.5 text-xs text-charcoal">
                        {s.skill.name}
                      </span>
                    ))}
                  </div>
                </div>
              </aside>
            </div>
          )}

          {tab === "comments" && (
            <div className="flex flex-col gap-3">
              <ul className="flex flex-col gap-3">
                {task.comments.length === 0 && (
                  <li className="text-sm text-muted">{t("Aún no hay comentarios.")}</li>
                )}
                {task.comments.map((c) => (
                  <li key={c.id} className="rounded-md border border-sand bg-white p-3">
                    <p className="text-xs text-muted">
                      <span className="font-semibold text-ink">{displayName(c.author)}</span> ·{" "}
                      {new Date(c.createdAt).toLocaleString(localeTag, { dateStyle: "short", timeStyle: "short" })}
                    </p>
                    <p className="mt-1 whitespace-pre-wrap text-sm text-ink">
                      {c.body.replace(/@\[([^\]]+)\]\([^)]+\)/g, "@$1")}
                    </p>
                  </li>
                ))}
              </ul>
              <textarea
                className={input}
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={t("Escribe un comentario…")}
              />
              <div className="flex flex-wrap items-center gap-2">
                <select
                  className="rounded-md border border-sand bg-white px-2 py-1.5 text-sm"
                  value=""
                  onChange={(e) => {
                    const m = members.find((x) => x.userId === e.target.value);
                    if (m) insertMention(m);
                  }}
                  aria-label={t("Mencionar a alguien")}
                >
                  <option value="">{t("@ Mencionar…")}</option>
                  {members.map((m) => (
                    <option key={m.userId} value={m.userId}>
                      {displayName(m.user)}
                    </option>
                  ))}
                </select>
                <Button size="sm" className="ml-auto" disabled={!comment.trim() || saving} onClick={sendComment}>
                  {t("Comentar")}
                </Button>
              </div>
            </div>
          )}

          {tab === "activity" && (
            <ul className="flex flex-col gap-2 text-sm">
              {activity === null && <Spinner size="sm" />}
              {activity?.map((a) => (
                <li key={a.id} className="flex gap-2">
                  <span className="text-xs text-muted">
                    {new Date(a.createdAt).toLocaleString(localeTag, { dateStyle: "short", timeStyle: "short" })}
                  </span>
                  <span className="text-ink">
                    <strong>{a.actor ? displayName(a.actor) : t("Sistema")}</strong> · {activityLabel(a, t)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      {transition.dialog}
    </Modal>
  );
}

export function activityLabel(a: ActivityEvent, t: (k: string, v?: Record<string, string | number>) => string): string {
  const p = a.payload as Record<string, unknown>;
  const statusLabel = (s: unknown) =>
    typeof s === "string" && s in TASK_STATUS_LABEL ? t(TASK_STATUS_LABEL[s as keyof typeof TASK_STATUS_LABEL]) : String(s ?? "");
  switch (a.type) {
    case "STATUS_CHANGED":
      return t("cambió el estado de {from} a {to}", { from: statusLabel(p.from), to: statusLabel(p.to) });
    case "ASSIGNEE_CHANGED":
      return t("cambió el responsable");
    case "ESTIMATE_CHANGED":
      return t("cambió el estimado de {from} h a {to} h", { from: String(p.from), to: String(p.to) });
    case "DATES_CHANGED":
      return t("cambió las fechas");
    case "PRIORITY_CHANGED":
      return t("cambió la prioridad");
    case "BLOCKED":
      return t("bloqueó la tarea: {reason}", { reason: String(p.reason ?? "") });
    case "UNBLOCKED":
      return t("desbloqueó la tarea");
    case "REJECTED":
      return t("rechazó el entregable");
    case "COMMENTED":
      return t("comentó");
    case "ATTACHMENT_ADDED":
      return t("subió un archivo");
    case "TIME_LOGGED":
      return t("registró {h} h", { h: String(p.hours ?? "") });
    case "TASK_CREATED":
      return t("creó la tarea");
    case "TASK_UPDATED":
      return t("editó la tarea");
    case "TASK_DELETED":
      return t("eliminó la tarea “{title}”", { title: String(p.title ?? "") });
    case "DEPENDENCY_ADDED":
      return t("agregó una dependencia");
    case "DEPENDENCY_REMOVED":
      return t("quitó una dependencia");
    case "PROJECT_CREATED":
      return t("creó el proyecto");
    case "PLAN_GENERATED":
      return t("generó el plan con IA");
    case "PLAN_APPROVED":
      return t("aprobó el plan");
    case "LEADER_CHANGED":
      return t("cambió el líder del proyecto");
    case "PROJECT_ARCHIVED":
      return t("archivó el proyecto");
    default:
      return a.type;
  }
}

function TaskEditForm({
  task,
  skills,
  onCancel,
  onSave,
}: {
  task: TaskDetail;
  skills: Skill[];
  onCancel: () => void;
  onSave: (input: Parameters<typeof tasksApi.update>[1]) => Promise<void>;
}) {
  const t = useI18n().t;
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? "");
  const [priority, setPriority] = useState<TaskPriority>(task.priority);
  const [hours, setHours] = useState(String(Number(task.baseEstimateHours)));
  const [startDate, setStartDate] = useState(task.startDate?.slice(0, 10) ?? "");
  const [dueDate, setDueDate] = useState(task.dueDate?.slice(0, 10) ?? "");
  const [deliverable, setDeliverable] = useState(task.deliverable ?? "");
  const [criteria, setCriteria] = useState(task.acceptanceCriteria.join("\n"));
  const [checklist, setChecklist] = useState(task.checklist.map((c) => c.text).join("\n"));
  const [skillIds, setSkillIds] = useState(task.skills.map((s) => s.skillId));

  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        const lines = (s: string) => s.split("\n").map((l) => l.trim()).filter(Boolean);
        const prev = new Map(task.checklist.map((c) => [c.text, c.done]));
        void onSave({
          title: title.trim(),
          description,
          priority,
          baseEstimateHours: Number(hours),
          startDate: startDate || null,
          dueDate: dueDate || null,
          deliverable,
          acceptanceCriteria: lines(criteria),
          checklist: lines(checklist).map((text) => ({ text, done: prev.get(text) ?? false })),
          requiredSkillIds: skillIds,
        });
      }}
    >
      <input className={input} value={title} onChange={(e) => setTitle(e.target.value)} required aria-label={t("Título")} />
      <textarea className={input} rows={4} value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t("Descripción")} />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <label className="text-xs text-charcoal">
          {t("Prioridad")}
          <select className={input} value={priority} onChange={(e) => setPriority(e.target.value as TaskPriority)}>
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {t(PRIORITY_LABEL[p])}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs text-charcoal">
          {t("Horas estimadas")}
          <input className={input} type="number" min="0.5" max="200" step="0.5" value={hours} onChange={(e) => setHours(e.target.value)} />
        </label>
        <label className="text-xs text-charcoal">
          {t("Inicio")}
          <input className={input} type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </label>
        <label className="text-xs text-charcoal">
          {t("Fecha límite")}
          <input className={input} type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </label>
      </div>
      <input className={input} value={deliverable} onChange={(e) => setDeliverable(e.target.value)} placeholder={t("Entregable")} />
      <textarea className={input} rows={3} value={criteria} onChange={(e) => setCriteria(e.target.value)} placeholder={t("Criterios de aceptación (uno por línea)")} />
      <textarea className={input} rows={3} value={checklist} onChange={(e) => setChecklist(e.target.value)} placeholder={t("Checklist (un paso por línea)")} />
      <div>
        <p className="mb-1 text-xs text-charcoal">{t("Skills requeridas")}</p>
        <div className="flex flex-wrap gap-1.5">
          {skills.map((s) => {
            const on = skillIds.includes(s.id);
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setSkillIds((ids) => (on ? ids.filter((x) => x !== s.id) : [...ids, s.id]))}
                className={`rounded-pill border px-2 py-0.5 text-xs ${on ? "border-orange bg-orange/10 text-ink" : "border-sand text-muted"}`}
              >
                {s.name}
              </button>
            );
          })}
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" size="sm" variant="ghost" onClick={onCancel}>
          {t("Cancelar")}
        </Button>
        <Button type="submit" size="sm">
          {t("Guardar")}
        </Button>
      </div>
    </form>
  );
}
