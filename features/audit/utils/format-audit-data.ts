import {
  auditActionLabels,
  auditEntityLabels,
} from "@/features/audit/constants/audit-labels";
import type { AuditAction, AuditEntityType } from "@/features/audit/types/audit-log.types";
import { sanitizeAuditData } from "@/features/audit/utils/sanitize-audit-data";

export function formatAuditAction(action: AuditAction | string) {
  return auditActionLabels[action as AuditAction] ?? `Accion desconocida (${action})`;
}

export function formatAuditEntityType(entityType: AuditEntityType | string) {
  return (
    auditEntityLabels[entityType as AuditEntityType] ??
    `Entidad desconocida (${entityType})`
  );
}

export function formatAuditActor(userId: string | null) {
  return userId ?? "Sistema";
}

export function formatAuditData(value: unknown) {
  const sanitized = sanitizeAuditData(value);

  if (sanitized === null || sanitized === undefined) {
    return "Sin datos";
  }

  try {
    return JSON.stringify(sanitized, null, 2);
  } catch {
    return String(sanitized);
  }
}
