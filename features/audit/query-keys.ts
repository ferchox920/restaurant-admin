export const auditQueryKeys = {
  all: ["audit-logs"] as const,
  lists: () => [...auditQueryKeys.all, "list"] as const,
  list: (filters?: Record<string, string | number | undefined | null>) =>
    [...auditQueryKeys.lists(), filters ?? {}] as const,
  details: () => [...auditQueryKeys.all, "detail"] as const,
  detail: (auditLogId: string) =>
    [...auditQueryKeys.details(), auditLogId] as const,
};
