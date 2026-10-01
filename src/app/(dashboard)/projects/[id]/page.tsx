"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Icon, type IconName } from "@/components/ui/Icon";
import { Spinner } from "@/components/ui/Spinner";
import { useI18n } from "@/contexts/I18nContext";
import { useCredits } from "@/contexts/CreditsContext";
import { useAuth } from "@/contexts/AuthContext";
import { useOrg } from "@/contexts/OrgContext";
import {
  displayName,
  formatDay,
  orgApi,
  projectsApi,
  type ActivityEvent,
  type ApprovalResult,
  type IntakeQuestion,
  type MemberProfile,
  type ProjectDashboard,
  type ProjectDetail,
  type Skill,
  type TaskCard,
  type TaskPriority,
  type TaskStatus,
} from "@/lib/projects";
import { KanbanBoard } from "@/components/projects/KanbanBoard";
import { TaskListView } from "@/components/projects/TaskListView";
import { TaskDetailModal, activityLabel } from "@/components/projects/TaskDetailModal";
import { PlanEditor } from "@/components/projects/PlanEditor";
import { ProjectDashboardView } from "@/components/projects/ProjectDashboardView";
import { Modal } from "@/components/projects/Modal";
import { actionForMove, useTaskTransition } from "@/components/projects/useTaskTransition";
import {
  errorMessage,
  PRIORITY_LABEL,
  PROJECT_STATUS_LABEL,
} from "@/components/projects/labels";

type Tab = "board" | "list" | "dashboard" | "activity";

const TABS: { key: Tab; label: string; icon: IconName }[] = [
  { key: "board", label: "Tablero", icon: "kanban" },
  { key: "list", label: "Lista", icon: "list" },
  { key: "dashboard", label: "Dashboard", icon: "chart" },
  { key: "activity", label: "Actividad", icon: "clock" },
];

const input =
  "rounded-md border border-sand bg-white px-2 py-1.5 text-sm text-ink focus:border-orange focus:outline-none";

export default function ProjectPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { t, localeTag } = useI18n();
  const { refresh: refreshCredits } = useCredits();
  const { user } = useAuth();
  const { role: orgRole } = useOrg();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteText, setDeleteText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [members, setMembers] = useState<MemberProfile[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [dashboard, setDashboard] = useState<ProjectDashboard | null>(null);
  const [activity, setActivity] = useState<ActivityEvent[] | null>(null);
  const [tab, setTab] = useState<Tab>("board");
  const [openTask, setOpenTask] = useState<string | null>(null);
  const [approval, setApproval] = useState<ApprovalResult | null>(null);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState<{ phase: string; assignee: string; priority: string }>({
    phase: "",
    assignee: "",
    priority: "",
  });

  const load = useCallback(async () => {
    try {
      setProject(await projectsApi.get(id));
    } catch (err) {
      setError(errorMessage(err, t));
    }
  }, [id, t]);

  useEffect(() => {
    // Abre la tarea indicada por ?task= (enlaces desde la campanita).
    projectsApi
      .get(id)
      .then((p) => {
        setProject(p);
        const taskParam = new URLSearchParams(window.location.search).get("task");
        if (taskParam) setOpenTask(taskParam);
      })
      .catch((err) => setError(errorMessage(err, t)));
    orgApi.members().then(setMembers).catch(() => setMembers([]));
    orgApi.skills().then(setSkills).catch(() => setSkills([]));
  }, [id, t]);

  // Mientras el plan se genera, refresca hasta que cambie el estado.
  useEffect(() => {
    if (project?.status !== "PLANNING") return;
    const timer = setInterval(() => void load(), 3000);
    return () => clearInterval(timer);
  }, [project?.status, load]);

  const loadSide = useCallback(() => {
    if (tab === "dashboard") projectsApi.dashboard(id).then(setDashboard).catch(() => {});
    if (tab === "activity") projectsApi.activity(id).then(setActivity).catch(() => setActivity([]));
  }, [tab, id]);
  useEffect(loadSide, [loadSide]);

  const reloadAll = useCallback(() => {
    void load();
    loadSide();
  }, [load, loadSide]);

  const transition = useTaskTransition(
    () => reloadAll(),
    (msg) => setError(msg),
  );

  const tasks: TaskCard[] = useMemo(
    () => project?.phases.flatMap((p) => p.tasks) ?? [],
    [project],
  );
  const filtered = tasks.filter(
    (x) =>
      (!filters.phase || x.phaseId === filters.phase) &&
      (!filters.assignee || (filters.assignee === "-" ? !x.assigneeId : x.assigneeId === filters.assignee)) &&
      (!filters.priority || x.priority === filters.priority),
  );

  if (!project) {
    return (
      <div className="flex justify-center py-16">
        {error ? <p className="text-sm text-error">{error}</p> : <Spinner />}
      </div>
    );
  }

  const manager = project.canManage;
  const isActive = project.status === "ACTIVE" || project.status === "COMPLETED";

  function onMove(task: TaskCard, to: TaskStatus) {
    const action = actionForMove(task.status, to);
    if (!action) {
      setError(t("Ese cambio de estado no está permitido."));
      return;
    }
    setError("");
    transition.request(task.id, action);
  }

  async function archive() {
    if (!window.confirm(t("¿Archivar este proyecto? Se liberará la capacidad de su equipo."))) return;
    try {
      await projectsApi.archive(id);
      router.push("/projects");
    } catch (err) {
      setError(errorMessage(err, t));
    }
  }

  async function deleteProject() {
    setDeleting(true);
    try {
      await projectsApi.deletePermanently(id);
      router.push("/projects");
    } catch (err) {
      setError(errorMessage(err, t));
      setDeleting(false);
      setDeleteOpen(false);
    }
  }

  async function transferLeader(userId: string) {
    try {
      await projectsApi.transfer(id, userId);
      void load();
    } catch (err) {
      setError(errorMessage(err, t));
    }
  }

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-5">
      <div className="flex flex-wrap items-start gap-3">
        <div className="min-w-0 flex-1">
          <Link href="/projects" className="text-xs text-muted hover:underline">
            ← {t("Proyectos")}
          </Link>
          <h1 className="mt-1 text-2xl font-semibold text-ink">{project.title}</h1>
          <p className="mt-1 text-sm text-muted">{project.objective}</p>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-charcoal">
            <Badge variant={project.status === "ACTIVE" ? "success" : "orange"}>
              {t(PROJECT_STATUS_LABEL[project.status])}
            </Badge>
            <span>{t("Líder: {name}", { name: displayName(project.leader) })}</span>
            {project.dueDate && <span>{t("Límite: {d}", { d: formatDay(project.dueDate, localeTag) })}</span>}
            {project.estimatedEndProbable && (
              <span>
                {t("Entrega estimada: {opt} – {prob}", {
                  opt: formatDay(project.estimatedEndOptimistic, localeTag),
                  prob: formatDay(project.estimatedEndProbable, localeTag),
                })}
              </span>
            )}
          </div>
        </div>
        {manager && project.status !== "ARCHIVED" && (
          <div className="flex flex-wrap items-center gap-2">
            <select
              className={input}
              value=""
              onChange={(e) => e.target.value && transferLeader(e.target.value)}
              aria-label={t("Transferir liderazgo")}
            >
              <option value="">{t("Transferir liderazgo…")}</option>
              {members
                .filter((m) => m.role !== "MEMBER" && m.userId !== project.leaderId)
                .map((m) => (
                  <option key={m.userId} value={m.userId}>
                    {displayName(m.user)}
                  </option>
                ))}
            </select>
            <Button size="sm" variant="ghost" onClick={archive}>
              {t("Archivar")}
            </Button>
          </div>
        )}
        {orgRole === "ADMIN" && (
          <Button
            size="sm"
            variant="ghost"
            className="!text-error"
            onClick={() => {
              setDeleteText("");
              setDeleteOpen(true);
            }}
          >
            <Icon name="trash" size={14} className="mr-1" />
            {t("Eliminar")}
          </Button>
        )}
      </div>

      {deleteOpen && (
        <Modal open onClose={() => setDeleteOpen(false)} title={t("Eliminar proyecto")}>
          <div className="flex flex-col gap-3 text-sm">
            <p className="text-ink">
              {t("Se eliminarán definitivamente el proyecto, sus fases, tareas, comentarios, archivos e historial. Esta acción no se puede deshacer.")}
            </p>
            <label className="flex flex-col gap-1.5 text-charcoal">
              {t("Escribe el nombre del proyecto para confirmar:")}
              <span className="font-semibold text-ink">{project.title}</span>
              <input
                autoFocus
                className="w-full rounded-md border border-sand bg-white px-3 py-2 text-sm text-ink focus:border-orange focus:outline-none"
                value={deleteText}
                onChange={(e) => setDeleteText(e.target.value)}
              />
            </label>
            <div className="flex justify-end gap-2">
              <Button size="sm" variant="ghost" onClick={() => setDeleteOpen(false)}>
                {t("Cancelar")}
              </Button>
              <Button
                size="sm"
                variant="dark"
                loading={deleting}
                disabled={deleteText.trim() !== project.title.trim()}
                onClick={deleteProject}
              >
                {t("Eliminar definitivamente")}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {error && (
        <p className="rounded-md bg-error/10 px-3 py-2 text-sm text-error" role="alert">
          {error}
        </p>
      )}

      {project.status === "INTAKE" && manager && (
        <IntakePanel
          projectId={project.id}
          onStarted={() => {
            void refreshCredits();
            void load();
          }}
        />
      )}

      {project.status === "PLANNING" && (
        <Card className="flex flex-col items-center gap-3 py-12 text-center">
          <Spinner size="lg" />
          <p className="font-medium text-ink">{t("La IA está armando tu plan…")}</p>
        </Card>
      )}

      {project.status === "DRAFT" && manager && (
        <PlanEditor
          project={project}
          onChanged={() => void load()}
          onOpenTask={setOpenTask}
          onApproved={(r) => {
            setApproval(r);
            void load();
          }}
        />
      )}

      {(project.status === "DRAFT" || project.status === "INTAKE") && !manager && (
        <Card className="text-sm text-muted">{t("El líder está preparando el plan de este proyecto.")}</Card>
      )}

      {(isActive || project.status === "ARCHIVED") && (
        <>
          <div className="flex flex-wrap items-center gap-4 border-b border-sand">
            {TABS.map((tb) => (
              <button
                key={tb.key}
                type="button"
                onClick={() => setTab(tb.key)}
                className={`-mb-px flex items-center gap-1.5 border-b-2 px-1 pb-2 text-sm font-medium ${
                  tab === tb.key ? "border-orange text-ink" : "border-transparent text-muted hover:text-ink"
                }`}
              >
                <Icon name={tb.icon} size={16} />
                {t(tb.label)}
              </button>
            ))}
          </div>

          {(tab === "board" || tab === "list") && (
            <div className="flex flex-wrap gap-2">
              <select
                className={input}
                value={filters.phase}
                onChange={(e) => setFilters((f) => ({ ...f, phase: e.target.value }))}
                aria-label={t("Fase")}
              >
                <option value="">{t("Todas las fases")}</option>
                {project.phases.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <select
                className={input}
                value={filters.assignee}
                onChange={(e) => setFilters((f) => ({ ...f, assignee: e.target.value }))}
                aria-label={t("Responsable")}
              >
                <option value="">{t("Todos los responsables")}</option>
                <option value="-">{t("Sin asignar")}</option>
                {project.members.map((m) => (
                  <option key={m.userId} value={m.userId}>
                    {displayName(m.user)}
                  </option>
                ))}
              </select>
              <select
                className={input}
                value={filters.priority}
                onChange={(e) => setFilters((f) => ({ ...f, priority: e.target.value }))}
                aria-label={t("Prioridad")}
              >
                <option value="">{t("Todas las prioridades")}</option>
                {(Object.keys(PRIORITY_LABEL) as TaskPriority[]).map((p) => (
                  <option key={p} value={p}>
                    {t(PRIORITY_LABEL[p])}
                  </option>
                ))}
              </select>
            </div>
          )}

          {tab === "board" && (
            <KanbanBoard
              tasks={filtered}
              canDrag={(x) => project.status === "ACTIVE" && (manager || (!!user && x.assigneeId === user.id))}
              onMove={onMove}
              onOpen={(x) => setOpenTask(x.id)}
            />
          )}
          {tab === "list" && <TaskListView tasks={filtered} onOpen={(x) => setOpenTask(x.id)} />}
          {tab === "dashboard" &&
            (dashboard ? (
              <ProjectDashboardView dashboard={dashboard} onOpenTask={setOpenTask} />
            ) : (
              <Spinner />
            ))}
          {tab === "activity" && (
            <Card padding="sm">
              {activity === null ? (
                <Spinner size="sm" />
              ) : activity.length === 0 ? (
                <p className="text-sm text-muted">{t("Sin actividad todavía.")}</p>
              ) : (
                <ul className="flex flex-col gap-2 text-sm">
                  {activity.map((a) => (
                    <li key={a.id} className="flex flex-wrap gap-2">
                      <span className="text-xs text-muted">
                        {new Date(a.createdAt).toLocaleString(localeTag, { dateStyle: "short", timeStyle: "short" })}
                      </span>
                      <span className="text-ink">
                        <strong>{a.actor ? displayName(a.actor) : t("Sistema")}</strong> · {activityLabel(a, t)}
                        {a.taskId && (
                          <button
                            type="button"
                            className="ml-1 text-xs text-orange hover:underline"
                            onClick={() => setOpenTask(a.taskId)}
                          >
                            {t("ver tarea")}
                          </button>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          )}
        </>
      )}

      {openTask && (
        <TaskDetailModal
          taskId={openTask}
          onClose={() => setOpenTask(null)}
          onChanged={reloadAll}
          members={members}
          skills={skills}
          projectTasks={tasks.map((x) => ({ id: x.id, title: x.title }))}
        />
      )}

      {approval && (
        <Modal open onClose={() => setApproval(null)} title={t("Plan aprobado")}>
          <div className="flex flex-col gap-3 text-sm">
            <p className="text-ink">
              {t("Se asignaron {n} tareas según skills y capacidad. Cada persona fue notificada.", {
                n: approval.assigned,
              })}
            </p>
            {approval.projectEstimatedEnd.probable && (
              <p className="text-charcoal">
                {t("Entrega estimada del proyecto: {opt} – {prob}", {
                  opt: formatDay(approval.projectEstimatedEnd.optimistic, localeTag),
                  prob: formatDay(approval.projectEstimatedEnd.probable, localeTag),
                })}
              </p>
            )}
            {approval.unassigned.length > 0 && (
              <div>
                <p className="font-semibold text-amber-700">
                  {t("{n} tareas quedaron sin asignar (nadie tiene las skills requeridas):", {
                    n: approval.unassigned.length,
                  })}
                </p>
                <ul className="mt-1 list-disc pl-5 text-charcoal">
                  {approval.unassigned.map((u) => (
                    <li key={u.taskId}>{u.title}</li>
                  ))}
                </ul>
              </div>
            )}
            {approval.conflicts.length > 0 && (
              <div>
                <p className="font-semibold text-red-600">
                  {t("{n} tareas no llegarían a su fecha límite con la capacidad actual. Opciones: mover fechas, reasignar o dividir la tarea.", {
                    n: approval.conflicts.length,
                  })}
                </p>
                <ul className="mt-1 list-disc pl-5 text-charcoal">
                  {approval.conflicts.map((c) => (
                    <li key={c.taskId}>
                      <button type="button" className="hover:underline" onClick={() => setOpenTask(c.taskId)}>
                        {c.taskTitle}
                      </button>{" "}
                      ({formatDay(c.estimatedEnd, localeTag)} &gt; {formatDay(c.dueDate, localeTag)})
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="flex justify-end">
              <Button size="sm" onClick={() => setApproval(null)}>
                {t("Ver tablero")}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {transition.dialog}
    </div>
  );
}

// Retoma el intake de un proyecto que quedó en preguntas iniciales.
function IntakePanel({ projectId, onStarted }: { projectId: string; onStarted: () => void }) {
  const { t } = useI18n();
  const [questions, setQuestions] = useState<IntakeQuestion[] | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const field =
    "w-full rounded-md border border-sand bg-white px-3 py-2 text-sm text-ink focus:border-orange focus:outline-none";

  async function loadQuestions() {
    setBusy(true);
    setError("");
    try {
      setQuestions(await projectsApi.intake(projectId));
    } catch (err) {
      setError(errorMessage(err, t));
    } finally {
      setBusy(false);
    }
  }

  async function generate() {
    if (!questions) return;
    setBusy(true);
    setError("");
    try {
      await projectsApi.plan(
        projectId,
        questions.map((q) => ({ questionId: q.id, answer: answers[q.id] ?? "" })),
      );
      onStarted();
    } catch (err) {
      setError(errorMessage(err, t));
      setBusy(false);
    }
  }

  return (
    <Card className="flex flex-col gap-4">
      {error && <p className="text-sm text-error">{error}</p>}
      {!questions ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-charcoal">{t("Responde unas preguntas para que la IA genere el plan.")}</p>
          <Button loading={busy} onClick={loadQuestions}>
            {t("Continuar")}
          </Button>
        </div>
      ) : (
        <>
          {questions.map((q) => (
            <label key={q.id} className="flex flex-col gap-1.5 text-sm font-medium text-charcoal">
              {q.question}
              {q.kind === "choice" && q.options ? (
                <select
                  className={field}
                  value={answers[q.id] ?? ""}
                  onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
                >
                  <option value="">{t("Selecciona…")}</option>
                  {q.options.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={q.kind === "date" ? "date" : "text"}
                  className={field}
                  value={answers[q.id] ?? ""}
                  onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
                />
              )}
            </label>
          ))}
          <div className="flex justify-end">
            <Button loading={busy} onClick={generate}>
              <Icon name="sparkles" size={16} className="mr-1.5" />
              {t("Generar plan")}
            </Button>
          </div>
        </>
      )}
    </Card>
  );
}
