"use client";

import { useQuery } from "@tanstack/react-query";
import { getAuditLog } from "@/features/audit/api/audit-logs.api";
import { auditQueryKeys } from "@/features/audit/query-keys";

type UseAuditLogOptions = {
  enabled?: boolean;
};

export function useAuditLog(
  auditLogId: string | undefined,
  options: UseAuditLogOptions = {}
) {
  const { enabled = true } = options;

  return useQuery({
    queryKey: auditQueryKeys.detail(auditLogId ?? ""),
    queryFn: () => getAuditLog(auditLogId as string),
    enabled: enabled && Boolean(auditLogId),
  });
}
