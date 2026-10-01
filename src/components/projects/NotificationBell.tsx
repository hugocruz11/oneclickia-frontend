"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { Spinner } from "@/components/ui/Spinner";
import { useI18n } from "@/contexts/I18nContext";
import { useOrg } from "@/contexts/OrgContext";
import { notificationsApi, type AppNotification } from "@/lib/projects";
import { notificationHref, notificationText } from "./labels";
import { useNotificationStream } from "./useNotificationStream";

// Campanita in-app: contador de no leídas, lista paginada, marcar leídas
// y filtro por proyecto. Se actualiza en vivo (SSE) con respaldo por polling.
export function NotificationBell() {
  const { t, localeTag } = useI18n();
  const { current } = useOrg();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(0);
  const [items, setItems] = useState<AppNotification[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [projectId, setProjectId] = useState("");
  const panelRef = useRef<HTMLDivElement>(null);

  const refreshCount = useCallback(() => {
    notificationsApi
      .unreadCount()
      .then((r) => setCount(r.count))
      .catch(() => {});
  }, []);

  const load = useCallback(
    async (reset: boolean) => {
      setLoading(true);
      try {
        const page = await notificationsApi.list({
          unreadOnly: unreadOnly || undefined,
          projectId: projectId || undefined,
          cursor: reset ? undefined : (cursor ?? undefined),
          limit: 20,
        });
        setItems((prev) => (reset ? page.items : [...prev, ...page.items]));
        setCursor(page.nextCursor);
      } catch {
        // La campanita nunca debe romper la página.
      } finally {
        setLoading(false);
      }
    },
    [cursor, unreadOnly, projectId],
  );

  useEffect(() => {
    if (current) refreshCount();
  }, [current, refreshCount]);

  const onSignal = useCallback(() => {
    refreshCount();
    if (open) void load(true);
  }, [refreshCount, open, load]);
  useNotificationStream(!!current, onSignal);

  useEffect(() => {
    if (open) void load(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, unreadOnly, projectId]);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  async function markAll() {
    await notificationsApi.markRead({ all: true, projectId: projectId || undefined });
    setItems((prev) => prev.map((n) => ({ ...n, readAt: n.readAt ?? new Date().toISOString() })));
    refreshCount();
  }

  async function openItem(n: AppNotification) {
    if (!n.readAt) {
      await notificationsApi.markRead({ ids: [n.id] }).catch(() => {});
      refreshCount();
    }
    setOpen(false);
    router.push(notificationHref(n));
  }

  if (!current) return null;

  const projects = Array.from(
    new Map(items.filter((n) => n.project).map((n) => [n.project!.id, n.project!.title])),
  );

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={t("Notificaciones")}
        aria-expanded={open}
        className="relative flex h-9 w-9 items-center justify-center rounded-md border border-sand transition-colors hover:bg-sand-light"
      >
        <Icon name="bell" size={18} className="text-charcoal" />
        {count > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-orange px-1 text-[11px] font-bold text-cream">
            {count > 99 ? "99+" : count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-40 mt-2 w-[22rem] max-w-[calc(100vw-2rem)] rounded-md border border-sand bg-cream shadow-xl">
          <div className="flex items-center justify-between border-b border-sand px-4 py-2.5">
            <span className="text-sm font-semibold text-ink">{t("Notificaciones")}</span>
            <button
              type="button"
              onClick={markAll}
              className="text-xs font-semibold text-orange hover:underline"
            >
              {t("Marcar todas como leídas")}
            </button>
          </div>
          <div className="flex items-center gap-2 border-b border-sand px-4 py-2 text-xs">
            <label className="flex items-center gap-1.5 text-charcoal">
              <input
                type="checkbox"
                checked={unreadOnly}
                onChange={(e) => setUnreadOnly(e.target.checked)}
              />
              {t("Solo no leídas")}
            </label>
            {projects.length > 0 && (
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="ml-auto max-w-[10rem] truncate rounded-md border border-sand bg-white px-2 py-1 text-xs"
                aria-label={t("Filtrar por proyecto")}
              >
                <option value="">{t("Todos los proyectos")}</option>
                {projects.map(([id, title]) => (
                  <option key={id} value={id}>
                    {title}
                  </option>
                ))}
              </select>
            )}
          </div>
          <ul className="max-h-96 overflow-y-auto">
            {items.length === 0 && !loading && (
              <li className="px-4 py-8 text-center text-sm text-muted">
                {t("No tienes notificaciones.")}
              </li>
            )}
            {items.map((n) => (
              <li key={n.id}>
                <button
                  type="button"
                  onClick={() => openItem(n)}
                  className={`flex w-full gap-2 px-4 py-3 text-left text-sm transition-colors hover:bg-sand-light ${
                    n.readAt ? "text-muted" : "text-ink"
                  }`}
                >
                  {!n.readAt && (
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-orange" />
                  )}
                  <span className="flex-1">
                    <span className="block">{notificationText(n, t)}</span>
                    <span className="mt-0.5 block text-xs text-muted">
                      {new Date(n.updatedAt).toLocaleString(localeTag, {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </span>
                  </span>
                </button>
              </li>
            ))}
            {loading && (
              <li className="flex justify-center py-3">
                <Spinner size="sm" />
              </li>
            )}
          </ul>
          {cursor && !loading && (
            <button
              type="button"
              onClick={() => load(false)}
              className="w-full border-t border-sand py-2 text-xs font-semibold text-charcoal hover:bg-sand-light"
            >
              {t("Ver más")}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
