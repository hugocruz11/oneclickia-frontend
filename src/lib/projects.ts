import { api, apiUrl, authHeaders, ApiError } from "@/lib/api";

// ── Organizations ──

export type OrgRole = "ADMIN" | "LEADER" | "MEMBER";
export type SkillLevel = "JUNIOR" | "MID" | "SENIOR";

export interface Organization {
  id: string;
  name: string;
  timezone: string;
  isPersonal: boolean;
}

export interface OrgMembershipSummary {
  organization: Organization;
  role: OrgRole;
  membershipId: string;
}

export interface CurrentOrg {
  organization: Organization;
  role: OrgRole;
  membershipId: string;
  userId: string;
}

export interface UserRef {
  id: string;
  name: string | null;
  email: string;
}

export interface Skill {
  id: string;
  name: string;
  _count?: { members: number };
}

export interface MemberProfile {
  id: string;
  userId: string;
  role: OrgRole;
  status: "ACTIVE" | "DEACTIVATED";
  title: string | null;
  department: string | null;
  weeklyCapacityHours: string | number;
  user: UserRef;
  skills: { skillId: string; level: SkillLevel; skill: { id: string; name: string } }[];
  unavailability: { id: string; from: string; to: string; reason: string | null }[];
}

export interface Invitation {
  id: string;
  email: string;
  role: OrgRole;
  expiresAt: string;
  createdAt: string;
}

export interface MemberProfileInput {
  title?: string;
  department?: string;
  weeklyCapacityHours?: number;
  skills?: { skillId: string; level: SkillLevel }[];
  unavailability?: { from: string; to: string; reason?: string }[];
}

// ── Projects ──

export type ProjectStatus =
  | "INTAKE"
  | "PLANNING"
  | "DRAFT"
  | "ACTIVE"
  | "COMPLETED"
  | "ARCHIVED";
export type TaskStatus = "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type Confidence = "LOW" | "MEDIUM" | "HIGH";

export const TASK_STATUSES: TaskStatus[] = ["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"];
export const PRIORITIES: TaskPriority[] = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

export interface ChecklistItem {
  text: string;
  done: boolean;
}

export interface TaskCard {
  id: string;
  projectId: string;
  phaseId: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  blocked: boolean;
  blockedReason: string | null;
  assigneeId: string | null;
  assignee: UserRef | null;
  assignmentReason: string | null;
  baseEstimateHours: string | number;
  startDate: string | null;
  dueDate: string | null;
  deliverable: string | null;
  acceptanceCriteria: string[];
  checklist: ChecklistItem[];
  customFields: Record<string, string | number | boolean | null>;
  order: number;
  rejectionCount: number;
  actualHours: string | number | null;
  estimatedStart: string | null;
  estimatedEndOptimistic: string | null;
  estimatedEndProbable: string | null;
  confidence: Confidence | null;
  skills: { skillId: string; skill: { id: string; name: string } }[];
  dependencies: {
    dependsOnTaskId: string;
    dependsOn: { id: string; title: string; status: TaskStatus };
  }[];
  _count: { comments: number; attachments: number };
  project?: { id: string; title: string };
  phase?: { id: string; name: string };
}

export interface Phase {
  id: string;
  projectId: string;
  name: string;
  goal: string | null;
  order: number;
  tasks: TaskCard[];
}

export interface ProjectSummary {
  id: string;
  title: string;
  objective: string;
  status: ProjectStatus;
  leaderId: string;
  leader: UserRef;
  dueDate: string | null;
  estimatedEndOptimistic: string | null;
  estimatedEndProbable: string | null;
  updatedAt: string;
  canManage: boolean;
  taskCounts: Record<TaskStatus | "total", number>;
}

export interface ProjectDetail extends Omit<ProjectSummary, "taskCounts"> {
  summary: string | null;
  intake: { questions: IntakeQuestion[]; answers?: IntakeAnswer[] } | null;
  members: { userId: string; user: UserRef }[];
  phases: Phase[];
}

export interface Comment {
  id: string;
  body: string;
  mentions: string[];
  createdAt: string;
  author: UserRef;
}

export interface Attachment {
  id: string;
  fileName: string;
  mime: string;
  size: number;
  createdAt: string;
  uploader?: UserRef;
}

export interface TaskDetail extends TaskCard {
  project: { id: string; title: string; status: ProjectStatus; leaderId: string };
  phase: { id: string; name: string };
  dependents: { task: { id: string; title: string; status: TaskStatus } }[];
  comments: Comment[];
  attachments: Attachment[];
  loggedHours: number;
  runningTimerStartedAt: string | null;
  waiting: boolean;
  canManage: boolean;
  isAssignee: boolean;
}

export interface TaskInput {
  title?: string;
  description?: string;
  priority?: TaskPriority;
  requiredSkillIds?: string[];
  baseEstimateHours?: number;
  startDate?: string | null;
  dueDate?: string | null;
  deliverable?: string;
  acceptanceCriteria?: string[];
  checklist?: ChecklistItem[];
  phaseId?: string;
}

export type TransitionAction =
  | "START"
  | "SUBMIT_REVIEW"
  | "APPROVE"
  | "REJECT"
  | "RETURN_TODO"
  | "REOPEN"
  | "BLOCK"
  | "UNBLOCK";

export interface TransitionResult {
  taskId: string;
  status: TaskStatus;
  blocked: boolean;
  warnings: string[];
  projectCompleted: boolean;
}

export interface Candidate {
  userId: string;
  name: string;
  score: number;
  skillMatch: number;
  utilization: number;
  freeHoursInWindow: number;
  fits: boolean;
  neededHours: number;
  reason: string;
}

export interface CapacityConflict {
  taskId: string;
  taskTitle: string;
  userId: string | null;
  dueDate: string | null;
  estimatedEnd: string | null;
  options: ("MOVE_DATES" | "REASSIGN" | "SPLIT")[];
}

export interface AssignResult {
  taskId: string;
  assigneeId: string | null;
  reason: string | null;
  utilizationBefore: number | null;
  utilizationAfter: number | null;
  conflicts: CapacityConflict[];
}

export interface ActivityEvent {
  id: string;
  type: string;
  payload: Record<string, unknown>;
  taskId: string | null;
  createdAt: string;
  actor: UserRef | null;
}

export interface ProjectDashboard {
  projectId: string;
  title: string;
  status: ProjectStatus;
  dueDate: string | null;
  estimatedEnd: { optimistic: string | null; probable: string | null };
  progress: number;
  counts: {
    total: number;
    todo: number;
    inProgress: number;
    inReview: number;
    done: number;
    overdue: number;
    blocked: number;
    atRisk: number;
    unassigned: number;
  };
  late: boolean;
  topAtRisk: {
    taskId: string;
    title: string;
    assignee: string | null;
    dueDate: string | null;
    estimatedEnd: string | null;
    blocked: boolean;
  }[];
}

export interface ConsolidatedDashboard {
  projects: ProjectDashboard[];
  totals: {
    projects: number;
    late: number;
    overdue: number;
    blocked: number;
    atRisk: number;
    inReview: number;
  };
}

export interface WorkloadGrid {
  weeks: string[];
  projects: { id: string; title: string }[];
  rows: {
    userId: string;
    name: string;
    capacity: number[];
    allocated: number[];
    byProject: Record<string, number[]>;
  }[];
}

// ── Planner ──

export interface IntakeQuestion {
  id: string;
  question: string;
  kind: "text" | "date" | "choice";
  options?: string[];
}

export interface IntakeAnswer {
  questionId: string;
  answer: string;
}

export interface PlanGeneration {
  id: string;
  projectId: string;
  phaseId: string | null;
  kind: "INTAKE" | "PLAN" | "PHASE";
  status: "PENDING" | "RUNNING" | "SUCCEEDED" | "FAILED";
  error: string | null;
}

export interface ApprovalResult {
  assigned: number;
  unassigned: { taskId: string; title: string }[];
  conflicts: CapacityConflict[];
  projectEstimatedEnd: { optimistic: string | null; probable: string | null };
}

// ── Notifications ──

export interface AppNotification {
  id: string;
  type: string;
  projectId: string | null;
  taskId: string | null;
  params: Record<string, string | number | boolean | null | string[]>;
  count: number;
  readAt: string | null;
  createdAt: string;
  updatedAt: string;
  project: { id: string; title: string } | null;
  task: { id: string; title: string } | null;
}

function qs(params: Record<string, string | number | boolean | string[] | undefined>) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === "") continue;
    if (Array.isArray(v)) v.forEach((x) => sp.append(k, x));
    else sp.set(k, String(v));
  }
  const s = sp.toString();
  return s ? `?${s}` : "";
}

export const orgApi = {
  list: () => api.get<OrgMembershipSummary[]>("/orgs"),
  create: (name: string) => api.post<Organization>("/orgs", { name }),
  current: () => api.get<CurrentOrg>("/orgs/current"),
  update: (input: { name?: string; timezone?: string }) =>
    api.patch<Organization>("/orgs/current", input),
  members: (includeInactive = false) =>
    api.get<MemberProfile[]>(`/orgs/members${includeInactive ? "?includeInactive=true" : ""}`),
  updateRole: (id: string, role: OrgRole) =>
    api.patch<MemberProfile>(`/orgs/members/${id}/role`, { role }),
  updateProfile: (id: string, input: MemberProfileInput) =>
    api.patch<MemberProfile>(`/orgs/members/${id}/profile`, input),
  deactivate: (id: string) => api.delete<void>(`/orgs/members/${id}`),
  invitations: () => api.get<Invitation[]>("/orgs/invitations"),
  invite: (email: string, role: OrgRole) =>
    api.post<{ invitation: Invitation; url: string }>("/orgs/invitations", { email, role }),
  revokeInvitation: (id: string) => api.delete<void>(`/orgs/invitations/${id}`),
  previewInvitation: (token: string) =>
    api.get<{ organizationName: string; role: OrgRole; email: string; expiresAt: string }>(
      `/invitations/${encodeURIComponent(token)}`,
    ),
  acceptInvitation: (token: string) =>
    api.post<{ organizationId: string; role: OrgRole }>(
      `/invitations/${encodeURIComponent(token)}/accept`,
    ),
  skills: () => api.get<Skill[]>("/skills"),
  createSkill: (name: string) => api.post<Skill>("/skills", { name }),
};

export const projectsApi = {
  list: (status?: ProjectStatus[]) =>
    api.get<ProjectSummary[]>(`/projects${qs({ status })}`),
  create: (input: { objective: string; title?: string; dueDate?: string; manual?: boolean }) =>
    api.post<ProjectSummary>("/projects", input),
  get: (id: string) => api.get<ProjectDetail>(`/projects/${id}`),
  update: (id: string, input: { title?: string; summary?: string; dueDate?: string | null }) =>
    api.patch<ProjectSummary>(`/projects/${id}`, input),
  archive: (id: string) => api.delete<void>(`/projects/${id}`),
  /** Permanent delete (organization admins only). */
  deletePermanently: (id: string) => api.delete<void>(`/projects/${id}/permanent`),
  transfer: (id: string, userId: string) =>
    api.post<void>(`/projects/${id}/leader`, { userId }),
  dashboard: (id: string) => api.get<ProjectDashboard>(`/projects/${id}/dashboard`),
  consolidated: () => api.get<ConsolidatedDashboard>("/projects/dashboard"),
  conflicts: (id: string) => api.get<CapacityConflict[]>(`/projects/${id}/conflicts`),
  activity: (id: string, limit = 100) =>
    api.get<ActivityEvent[]>(`/projects/${id}/activity?limit=${limit}`),
  createPhase: (id: string, input: { name: string; goal?: string }) =>
    api.post<Phase>(`/projects/${id}/phases`, input),
  reorderPhases: (id: string, ids: string[]) =>
    api.post<void>(`/projects/${id}/phases/reorder`, { ids }),
  updatePhase: (phaseId: string, input: { name?: string; goal?: string }) =>
    api.patch<Phase>(`/phases/${phaseId}`, input),
  deletePhase: (phaseId: string) => api.delete<void>(`/phases/${phaseId}`),
  createTask: (phaseId: string, input: TaskInput & { title: string; baseEstimateHours: number }) =>
    api.post<TaskCard>(`/phases/${phaseId}/tasks`, input),
  // Planner
  intake: (id: string, regenerate = false) =>
    api.post<IntakeQuestion[]>(`/projects/${id}/intake`, { regenerate }),
  plan: (id: string, answers: IntakeAnswer[]) =>
    api.post<PlanGeneration>(`/projects/${id}/plan`, { answers }),
  regeneratePhase: (phaseId: string, instructions?: string) =>
    api.post<PlanGeneration>(`/phases/${phaseId}/regenerate`, { instructions }),
  generation: (generationId: string) =>
    api.get<PlanGeneration>(`/plan-generations/${generationId}`),
  approve: (id: string) => api.post<ApprovalResult>(`/projects/${id}/approve`),
};

export const tasksApi = {
  get: (id: string) => api.get<TaskDetail>(`/tasks/${id}`),
  update: (id: string, input: TaskInput) => api.patch<TaskCard>(`/tasks/${id}`, input),
  remove: (id: string) => api.delete<void>(`/tasks/${id}`),
  transition: (
    id: string,
    action: TransitionAction,
    extra: { comment?: string; actualHours?: number; reason?: string } = {},
  ) => api.post<TransitionResult>(`/tasks/${id}/transition`, { action, ...extra }),
  candidates: (id: string) => api.get<Candidate[]>(`/tasks/${id}/candidates`),
  assign: (id: string, userId: string | null) =>
    api.patch<AssignResult>(`/tasks/${id}/assignee`, { userId }),
  addDependency: (id: string, dependsOnTaskId: string) =>
    api.post<void>(`/tasks/${id}/dependencies`, { dependsOnTaskId }),
  removeDependency: (id: string, depId: string) =>
    api.delete<void>(`/tasks/${id}/dependencies/${depId}`),
  comment: (id: string, body: string) => api.post<Comment>(`/tasks/${id}/comments`, { body }),
  upload: (id: string, file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    return api.post<Attachment>(`/tasks/${id}/attachments`, fd);
  },
  removeAttachment: (attachmentId: string) =>
    api.delete<void>(`/attachments/${attachmentId}`),
  startTimer: (id: string) => api.post<unknown>(`/tasks/${id}/timer/start`),
  stopTimer: (id: string) => api.post<{ hours: number }>(`/tasks/${id}/timer/stop`),
  logTime: (id: string, hours: number) =>
    api.post<{ hours: number }>(`/tasks/${id}/time`, { hours }),
  activity: (id: string) => api.get<ActivityEvent[]>(`/tasks/${id}/activity`),
  mine: (filter: { projectId?: string; status?: TaskStatus[]; includeDone?: boolean } = {}) =>
    api.get<TaskCard[]>(`/me/tasks${qs(filter)}`),
};

export type NextReason =
  | "IN_PROGRESS"
  | "OVERDUE"
  | "AT_RISK"
  | "UNBLOCKS"
  | "HIGH_PRIORITY"
  | "DUE_SOON";

export interface NextTaskSuggestion {
  taskId: string;
  reasons: NextReason[];
  unblocksCount: number;
  task: TaskCard;
}

export const nextTasksApi = {
  get: (projectId?: string) =>
    api.get<NextTaskSuggestion[]>(`/me/next-tasks${qs({ projectId })}`),
};

export const workloadApi = {
  get: (params: { from?: string; weeks?: number; projectId?: string[] } = {}) =>
    api.get<WorkloadGrid>(`/workload${qs(params)}`),
};

export const notificationsApi = {
  list: (params: { unreadOnly?: boolean; projectId?: string; cursor?: string; limit?: number } = {}) =>
    api.get<{ items: AppNotification[]; nextCursor: string | null }>(`/notifications${qs(params)}`),
  unreadCount: () => api.get<{ count: number }>("/notifications/unread-count"),
  markRead: (input: { ids?: string[]; all?: boolean; projectId?: string }) =>
    api.post<{ updated: number }>("/notifications/read", input),
};

/** Authenticated download of a task attachment (opens a blob URL). */
export async function downloadAttachment(att: Attachment): Promise<void> {
  const res = await fetch(apiUrl(`/attachments/${att.id}`), { headers: authHeaders() });
  if (!res.ok) throw new ApiError(res.status, "No se pudo descargar el archivo.");
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = att.fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

// ── Formatting helpers ──

export function displayName(u: { name: string | null; email: string } | null | undefined): string {
  if (!u) return "";
  return u.name?.trim() || u.email.split("@")[0];
}

/** 'YYYY-MM-DD…' → localized short date. */
export function formatDay(value: string | null | undefined, localeTag: string): string {
  if (!value) return "—";
  const d = new Date(`${value.slice(0, 10)}T12:00:00Z`);
  return d.toLocaleDateString(localeTag, { day: "numeric", month: "short", timeZone: "UTC" });
}

export function isOverdue(task: Pick<TaskCard, "dueDate" | "status">): boolean {
  if (!task.dueDate || task.status === "DONE") return false;
  return task.dueDate.slice(0, 10) < new Date().toISOString().slice(0, 10);
}

export function isAtRisk(task: Pick<TaskCard, "dueDate" | "estimatedEndProbable" | "status">): boolean {
  if (!task.dueDate || !task.estimatedEndProbable || task.status === "DONE") return false;
  return task.estimatedEndProbable.slice(0, 10) > task.dueDate.slice(0, 10);
}

export function isWaiting(task: Pick<TaskCard, "dependencies" | "status">): boolean {
  return task.status !== "DONE" && task.dependencies.some((d) => d.dependsOn.status !== "DONE");
}
