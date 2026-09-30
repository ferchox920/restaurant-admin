import {
  auditActionLabels,
  auditEntityLabels,
} from "@/features/audit/constants/audit-labels";
import type {
  AuditAction,
  AuditEntityType,
} from "@/features/audit/types/audit-log.types";

export function formatAuditAction(action: AuditAction | string) {
  return (
    auditActionLabels[action as AuditAction] ?? `Accion desconocida (${action})`
  );
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
