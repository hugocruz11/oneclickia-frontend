"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { Icon } from "@/components/ui/Icon";
import { useI18n } from "@/contexts/I18nContext";
import { useOrg } from "@/contexts/OrgContext";
import { useAuth } from "@/contexts/AuthContext";
import {
  displayName,
  formatDay,
  orgApi,
  type Invitation,
  type MemberProfile,
  type OrgRole,
  type Skill,
  type SkillLevel,
} from "@/lib/projects";
import { Modal } from "@/components/projects/Modal";
import { errorMessage, LEVEL_LABEL, ROLE_LABEL } from "@/components/projects/labels";

const input =
  "w-full rounded-md border border-sand bg-white px-3 py-2 text-sm text-ink placeholder:text-muted focus:border-orange focus:outline-none";
const ROLES: OrgRole[] = ["ADMIN", "LEADER", "MEMBER"];
const LEVELS: SkillLevel[] = ["JUNIOR", "MID", "SENIOR"];

type Tab = "members" | "invitations" | "skills" | "settings";

// Administración de la organización: miembros (rol, skills, capacidad,
// ausencias), invitaciones por enlace, catálogo de skills y ajustes.
export default function OrganizationPage() {
  const { t } = useI18n();
  const { role, current, refresh } = useOrg();
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>("members");
  const [members, setMembers] = useState<MemberProfile[] | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [editing, setEditing] = useState<MemberProfile | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    orgApi.members(true).then(setMembers).catch((err) => setError(errorMessage(err, t)));
    orgApi.skills().then(setSkills).catch(() => {});
    orgApi.invitations().then(setInvitations).catch(() => {});
  }, [t]);

  useEffect(() => {
    if (current && role === "ADMIN") load();
  }, [current, role, load]);

  if (current && role !== "ADMIN") {
    return <Card className="mx-auto max-w-xl text-center text-sm text-muted">{t("Solo los administradores gestionan la organización.")}</Card>;
  }

  async function act(fn: () => Promise<unknown>) {
    setError("");
    try {
      await fn();
      load();
    } catch (err) {
      setError(errorMessage(err, t));
    }
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: "members", label: "Miembros" },
    { key: "invitations", label: "Invitaciones" },
    { key: "skills", label: "Skills" },
    { key: "settings", label: "Ajustes" },
  ];

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-5">
      <div>
        <h1 className="text-2xl font-semibold text-ink">{t("Organización")}</h1>
        <p className="text-sm text-muted">{current?.organization.name}</p>
      </div>

      <div className="flex gap-4 border-b border-sand">
        {tabs.map((tb) => (
          <button
            key={tb.key}
            type="button"
            onClick={() => setTab(tb.key)}
            className={`-mb-px border-b-2 px-1 pb-2 text-sm font-medium ${
              tab === tb.key ? "border-orange text-ink" : "border-transparent text-muted hover:text-ink"
            }`}
          >
            {t(tb.label)}
          </button>
        ))}
      </div>

      {error && <p className="rounded-md bg-error/10 px-3 py-2 text-sm text-error">{error}</p>}

      {tab === "members" &&
        (members === null ? (
          <Spinner />
        ) : (
          <div className="overflow-x-auto rounded-md border border-sand bg-white">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="bg-sand-light text-left text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-3 py-2">{t("Persona")}</th>
                  <th className="px-3 py-2">{t("Rol")}</th>
                  <th className="px-3 py-2">{t("Skills")}</th>
                  <th className="px-3 py-2">{t("Capacidad")}</th>
                  <th className="px-3 py-2" />
                </tr>
              </thead>
              <tbody className="divide-y divide-sand">
                {members.map((m) => (
                  <tr key={m.id} className={m.status === "DEACTIVATED" ? "opacity-50" : ""}>
                    <td className="px-3 py-2">
                      <p className="font-medium text-ink">{displayName(m.user)}</p>
                      <p className="text-xs text-muted">
                        {[m.title, m.department].filter(Boolean).join(" · ") || m.user.email}
                      </p>
                    </td>
                    <td className="px-3 py-2">
                      <select
                        className="rounded-md border border-sand bg-white px-2 py-1 text-sm"
                        value={m.role}
                        disabled={m.status === "DEACTIVATED"}
                        onChange={(e) => act(() => orgApi.updateRole(m.id, e.target.value as OrgRole))}
                        aria-label={t("Rol")}
                      >
                        {ROLES.map((r) => (
                          <option key={r} value={r}>
                            {t(ROLE_LABEL[r])}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex flex-wrap gap-1">
                        {m.skills.length === 0 && <span className="text-xs text-muted">—</span>}
                        {m.skills.map((s) => (
                          <span key={s.skillId} className="rounded-sm bg-sand-light px-1.5 py-0.5 text-xs text-charcoal">
                            {s.skill.name} · {t(LEVEL_LABEL[s.level])}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-3 py-2 text-charcoal">{t("{h} h/sem", { h: Number(m.weeklyCapacityHours) })}</td>
                    <td className="px-3 py-2 text-right">
                      {m.status === "ACTIVE" ? (
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="ghost" onClick={() => setEditing(m)}>
                            {t("Editar")}
                          </Button>
                          {m.userId !== user?.id && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                if (window.confirm(t("¿Desactivar a {name}? Sus tareas abiertas quedarán sin asignar.", { name: displayName(m.user) }))) {
                                  void act(() => orgApi.deactivate(m.id));
                                }
                              }}
                            >
                              {t("Desactivar")}
                            </Button>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-muted">{t("Desactivado")}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}

      {tab === "invitations" && <InvitationsPanel invitations={invitations} onChanged={load} />}
      {tab === "skills" && <SkillsPanel skills={skills} onChanged={load} />}
      {tab === "settings" && current && (
        <SettingsPanel
          name={current.organization.name}
          timezone={current.organization.timezone}
          onSaved={() => void refresh()}
        />
      )}

      {editing && (
        <MemberEditor
          member={editing}
          skills={skills}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            load();
          }}
        />
      )}
    </div>
  );
}

function InvitationsPanel({ invitations, onChanged }: { invitations: Invitation[]; onChanged: () => void }) {
  const { t, localeTag } = useI18n();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<OrgRole>("MEMBER");
  const [link, setLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function invite(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res = await orgApi.invite(email.trim(), role);
      setLink(res.url);
      setCopied(false);
      setEmail("");
      onChanged();
    } catch (err) {
      setError(errorMessage(err, t));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <form onSubmit={invite} className="flex flex-wrap items-end gap-3">
          <label className="flex min-w-[220px] flex-1 flex-col gap-1.5 text-sm font-medium text-charcoal">
            {t("Email")}
            <input className={input} type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium text-charcoal">
            {t("Rol")}
            <select className={input} value={role} onChange={(e) => setRole(e.target.value as OrgRole)}>
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {t(ROLE_LABEL[r])}
                </option>
              ))}
            </select>
          </label>
          <Button type="submit" loading={busy}>
            {t("Crear invitación")}
          </Button>
        </form>
        {error && <p className="mt-2 text-sm text-error">{error}</p>}
        {link && (
          <div className="mt-4 rounded-md border border-sand bg-sand-light p-3">
            <p className="text-xs text-charcoal">
              {t("Comparte este enlace con la persona. Es de un solo uso y vence en 7 días.")}
            </p>
            <div className="mt-2 flex gap-2">
              <input className={input} readOnly value={link} onFocus={(e) => e.target.select()} />
              <Button
                type="button"
                variant="dark"
                onClick={() => {
                  void navigator.clipboard?.writeText(link).then(() => setCopied(true));
                }}
              >
                {copied ? t("Copiado") : t("Copiar")}
              </Button>
            </div>
          </div>
        )}
      </Card>

      <Card padding="sm">
        <p className="mb-2 text-sm font-semibold text-ink">{t("Invitaciones pendientes")}</p>
        {invitations.length === 0 ? (
          <p className="text-sm text-muted">{t("No hay invitaciones pendientes.")}</p>
        ) : (
          <ul className="divide-y divide-sand">
            {invitations.map((i) => {
              const expired = new Date(i.expiresAt) < new Date();
              return (
                <li key={i.id} className="flex flex-wrap items-center gap-3 py-2 text-sm">
                  <span className="flex-1 text-ink">{i.email}</span>
                  <span className="text-xs text-muted">{t(ROLE_LABEL[i.role])}</span>
                  <span className={`text-xs ${expired ? "text-red-600" : "text-muted"}`}>
                    {expired ? t("Vencida") : t("Vence {d}", { d: formatDay(i.expiresAt, localeTag) })}
                  </span>
                  <button
                    type="button"
                    className="text-xs font-semibold text-error hover:underline"
                    onClick={() => orgApi.revokeInvitation(i.id).then(onChanged).catch(() => {})}
                  >
                    {t("Revocar")}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}

function SkillsPanel({ skills, onChanged }: { skills: Skill[]; onChanged: () => void }) {
  const { t } = useI18n();
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  return (
    <Card className="flex flex-col gap-4">
      <p className="text-sm text-muted">
        {t("Catálogo libre de habilidades de tu organización (cualquier área). Las equivalentes se unifican automáticamente.")}
      </p>
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (!name.trim()) return;
          orgApi
            .createSkill(name.trim())
            .then(() => {
              setName("");
              onChanged();
            })
            .catch((err) => setError(errorMessage(err, t)));
        }}
      >
        <input className={input} value={name} onChange={(e) => setName(e.target.value)} placeholder={t("Ej: Diseño gráfico, Contabilidad, React…")} />
        <Button type="submit" variant="ghost">
          <Icon name="plus" size={16} />
        </Button>
      </form>
      {error && <p className="text-sm text-error">{error}</p>}
      <div className="flex flex-wrap gap-2">
        {skills.map((s) => (
          <span key={s.id} className="rounded-pill border border-sand bg-white px-3 py-1 text-sm text-ink">
            {s.name}
            {s._count && <span className="ml-1 text-xs text-muted">({s._count.members})</span>}
          </span>
        ))}
      </div>
    </Card>
  );
}

function SettingsPanel({ name, timezone, onSaved }: { name: string; timezone: string; onSaved: () => void }) {
  const { t } = useI18n();
  const [n, setN] = useState(name);
  const [tz, setTz] = useState(timezone);
  const [msg, setMsg] = useState("");
  return (
    <Card>
      <form
        className="flex max-w-md flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          orgApi
            .update({ name: n.trim(), timezone: tz.trim() })
            .then(() => {
              setMsg(t("Guardado."));
              onSaved();
            })
            .catch((err) => setMsg(errorMessage(err, t)));
        }}
      >
        <label className="flex flex-col gap-1.5 text-sm font-medium text-charcoal">
          {t("Nombre de la organización")}
          <input className={input} value={n} onChange={(e) => setN(e.target.value)} />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium text-charcoal">
          {t("Zona horaria")}
          <input className={input} value={tz} onChange={(e) => setTz(e.target.value)} placeholder="America/Bogota" />
        </label>
        <div className="flex items-center gap-3">
          <Button type="submit">{t("Guardar")}</Button>
          {msg && <span className="text-sm text-muted">{msg}</span>}
        </div>
      </form>
    </Card>
  );
}

function MemberEditor({
  member,
  skills,
  onClose,
  onSaved,
}: {
  member: MemberProfile;
  skills: Skill[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const { t } = useI18n();
  const [title, setTitle] = useState(member.title ?? "");
  const [department, setDepartment] = useState(member.department ?? "");
  const [capacity, setCapacity] = useState(String(Number(member.weeklyCapacityHours)));
  const [levels, setLevels] = useState<Record<string, SkillLevel>>(
    Object.fromEntries(member.skills.map((s) => [s.skillId, s.level])),
  );
  const [absences, setAbsences] = useState(
    member.unavailability.map((u) => ({ from: u.from.slice(0, 10), to: u.to.slice(0, 10), reason: u.reason ?? "" })),
  );
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true);
    setError("");
    try {
      await orgApi.updateProfile(member.id, {
        title,
        department,
        weeklyCapacityHours: Number(capacity),
        skills: Object.entries(levels).map(([skillId, level]) => ({ skillId, level })),
        unavailability: absences.filter((a) => a.from && a.to).map((a) => ({ ...a, reason: a.reason || undefined })),
      });
      onSaved();
    } catch (err) {
      setError(errorMessage(err, t));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal open onClose={onClose} title={displayName(member.user)} wide>
      <div className="flex flex-col gap-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="flex flex-col gap-1 text-xs text-charcoal">
            {t("Cargo")}
            <input className={input} value={title} onChange={(e) => setTitle(e.target.value)} />
          </label>
          <label className="flex flex-col gap-1 text-xs text-charcoal">
            {t("Área / departamento")}
            <input className={input} value={department} onChange={(e) => setDepartment(e.target.value)} />
          </label>
          <label className="flex flex-col gap-1 text-xs text-charcoal">
            {t("Capacidad semanal (horas productivas)")}
            <input className={input} type="number" min="1" max="80" value={capacity} onChange={(e) => setCapacity(e.target.value)} />
          </label>
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">{t("Skills y nivel")}</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {skills.map((s) => (
              <div key={s.id} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={!!levels[s.id]}
                  onChange={(e) =>
                    setLevels((l) => {
                      const next = { ...l };
                      if (e.target.checked) next[s.id] = "MID";
                      else delete next[s.id];
                      return next;
                    })
                  }
                  aria-label={s.name}
                />
                <span className="flex-1 text-ink">{s.name}</span>
                {levels[s.id] && (
                  <select
                    className="rounded-md border border-sand bg-white px-2 py-1 text-xs"
                    value={levels[s.id]}
                    onChange={(e) => setLevels((l) => ({ ...l, [s.id]: e.target.value as SkillLevel }))}
                    aria-label={t("Nivel")}
                  >
                    {LEVELS.map((lv) => (
                      <option key={lv} value={lv}>
                        {t(LEVEL_LABEL[lv])}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            ))}
            {skills.length === 0 && (
              <p className="text-sm text-muted">{t("Primero crea skills en la pestaña Skills.")}</p>
            )}
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">{t("Ausencias (vacaciones, festivos)")}</p>
          <div className="flex flex-col gap-2">
            {absences.map((a, i) => (
              <div key={i} className="flex flex-wrap items-center gap-2">
                <input type="date" className={`${input} !w-40`} value={a.from} onChange={(e) => setAbsences((x) => x.map((y, j) => (j === i ? { ...y, from: e.target.value } : y)))} aria-label={t("Desde")} />
                <input type="date" className={`${input} !w-40`} value={a.to} onChange={(e) => setAbsences((x) => x.map((y, j) => (j === i ? { ...y, to: e.target.value } : y)))} aria-label={t("Hasta")} />
                <input className={`${input} !w-auto min-w-0 flex-1`} value={a.reason} placeholder={t("Motivo (opcional)")} onChange={(e) => setAbsences((x) => x.map((y, j) => (j === i ? { ...y, reason: e.target.value } : y)))} />
                <button type="button" aria-label={t("Quitar")} className="text-muted hover:text-error" onClick={() => setAbsences((x) => x.filter((_, j) => j !== i))}>
                  <Icon name="trash" size={16} />
                </button>
              </div>
            ))}
            <button type="button" className="self-start text-xs font-semibold text-orange hover:underline" onClick={() => setAbsences((x) => [...x, { from: "", to: "", reason: "" }])}>
              {t("+ Agregar ausencia")}
            </button>
          </div>
        </div>

        {error && <p className="text-sm text-error">{error}</p>}
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            {t("Cancelar")}
          </Button>
          <Button loading={busy} onClick={save}>
            {t("Guardar")}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
