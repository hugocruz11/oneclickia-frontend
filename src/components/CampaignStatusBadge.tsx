"use client";

import { Badge } from "@/components/ui/Badge";
import { useT } from "@/contexts/I18nContext";
import type { CampaignStatus } from "@/lib/types";

const STATUS_CONFIG: Record<
  CampaignStatus,
  { label: string; variant: "default" | "success" | "warning" | "error" | "muted" | "orange" }
> = {
  DRAFT: { label: "Borrador", variant: "default" },
  PUBLISHING: { label: "Publicando...", variant: "warning" },
  PAUSED: { label: "Pausada", variant: "muted" },
  ACTIVE: { label: "Activa", variant: "success" },
  ERROR: { label: "Error", variant: "error" },
  ARCHIVED: { label: "Archivada", variant: "muted" },
};

interface CampaignStatusBadgeProps {
  status: CampaignStatus;
}

export function CampaignStatusBadge({ status }: CampaignStatusBadgeProps) {
  const t = useT();
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.DRAFT;
  return <Badge variant={config.variant}>{t(config.label)}</Badge>;
}
