"use client";

import { useQuery } from "@tanstack/react-query";
import { getAuditLogs } from "@/features/audit/api/audit-logs.api";
import { auditQueryKeys } from "@/features/audit/query-keys";
import type { AuditLogFilters } from "@/features/audit/types/audit-log.types";

export function useAuditLogs(filters?: AuditLogFilters) {
  return useQuery({
    queryKey: auditQueryKeys.list(filters),
    queryFn: () => getAuditLogs(filters),
  });
}
