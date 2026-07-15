import { buildQueryString } from "@/lib/api/build-query-string";
import { apiClient } from "@/lib/api/api-client";
import type {
  AuditLog,
  AuditLogFilters,
  AuditLogListItem,
} from "@/features/audit/types/audit-log.types";

export function getAuditLogs(filters?: AuditLogFilters, signal?: AbortSignal) {
  const queryString = buildQueryString({
    userId: filters?.userId,
    action: filters?.action,
    entityType: filters?.entityType,
    entityId: filters?.entityId,
    from: filters?.from,
    to: filters?.to,
    limit: filters?.limit,
    offset: filters?.offset,
  });

  return apiClient.get<AuditLogListItem[]>(`/api/audit-logs${queryString}`, signal);
}

export function getAuditLog(auditLogId: string) {
  return apiClient.get<AuditLog>(`/api/audit-logs/${auditLogId}`);
}
