"use client";

import { useOrg } from "@/contexts/OrgContext";
import { useT } from "@/contexts/I18nContext";

// Selector de organización activa: solo aparece si el usuario pertenece a
// más de una (p. ej. su org personal + la de su empresa).
export function OrgSwitcher() {
  const { orgs, current, switchOrg } = useOrg();
  const t = useT();
  if (orgs.length < 2 || !current) return null;
  return (
    <select
      value={current.organization.id}
      onChange={(e) => switchOrg(e.target.value)}
      aria-label={t("Organización activa")}
      className="hidden max-w-[12rem] truncate rounded-md border border-sand bg-cream px-2 py-1.5 text-sm text-ink sm:block"
    >
      {orgs.map((o) => (
        <option key={o.organization.id} value={o.organization.id}>
          {o.organization.isPersonal ? t("Personal") : o.organization.name}
        </option>
      ))}
    </select>
  );
}
