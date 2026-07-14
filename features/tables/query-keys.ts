export const tablesQueryKeys = {
  all: ["tables"] as const,
  lists: () => [...tablesQueryKeys.all, "list"] as const,
  list: (filters?: Record<string, string | number | boolean | undefined>) =>
    [...tablesQueryKeys.lists(), filters ?? {}] as const,
  details: () => [...tablesQueryKeys.all, "detail"] as const,
  detail: (tableId: string) => [...tablesQueryKeys.details(), tableId] as const,
};
