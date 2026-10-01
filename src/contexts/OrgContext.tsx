"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { ORG_STORAGE_KEY } from "@/lib/api";
import { orgApi, type OrgMembershipSummary, type OrgRole } from "@/lib/projects";
import { useAuth } from "@/contexts/AuthContext";

interface OrgState {
  orgs: OrgMembershipSummary[];
  current: OrgMembershipSummary | null;
  role: OrgRole | null;
  isLoading: boolean;
  /** Switch the active organization (reloads module data). */
  switchOrg: (organizationId: string) => void;
  refresh: () => Promise<void>;
}

const OrgContext = createContext<OrgState>({
  orgs: [],
  current: null,
  role: null,
  isLoading: true,
  switchOrg: () => {},
  refresh: async () => {},
});

function readStored(): string | null {
  try {
    return localStorage.getItem(ORG_STORAGE_KEY);
  } catch {
    return null;
  }
}

// Organización activa del módulo de proyectos. Se guarda en localStorage y
// el cliente API la envía como X-Org-Id. Por defecto: la primera empresa
// (el backend ya ordena las organizaciones de empresa antes de la personal).
export function OrgProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [orgs, setOrgs] = useState<OrgMembershipSummary[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const list = await orgApi.list();
      setOrgs(list);
      const stored = readStored();
      const chosen =
        list.find((o) => o.organization.id === stored) ?? list[0] ?? null;
      if (chosen) {
        localStorage.setItem(ORG_STORAGE_KEY, chosen.organization.id);
        setCurrentId(chosen.organization.id);
      }
    } catch {
      setOrgs([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    void refresh();
  }, [user, refresh]);

  const switchOrg = useCallback((organizationId: string) => {
    localStorage.setItem(ORG_STORAGE_KEY, organizationId);
    setCurrentId(organizationId);
    // Full reload: every page re-fetches with the new X-Org-Id.
    window.location.reload();
  }, []);

  const value = useMemo<OrgState>(() => {
    const current = orgs.find((o) => o.organization.id === currentId) ?? null;
    return {
      orgs,
      current,
      role: current?.role ?? null,
      isLoading,
      switchOrg,
      refresh,
    };
  }, [orgs, currentId, isLoading, switchOrg, refresh]);

  return <OrgContext.Provider value={value}>{children}</OrgContext.Provider>;
}

export function useOrg() {
  return useContext(OrgContext);
}

/** Leaders and admins can create/lead projects and see workload. */
export function canLead(role: OrgRole | null): boolean {
  return role === "ADMIN" || role === "LEADER";
}
