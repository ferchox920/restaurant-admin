export const tableOrdersQueryKeys = {
  all: ["table-orders"] as const,
  lists: () => [...tableOrdersQueryKeys.all, "list"] as const,
  list: (filters?: Record<string, string | number | boolean | undefined>) =>
    [...tableOrdersQueryKeys.lists(), filters ?? {}] as const,
  details: () => [...tableOrdersQueryKeys.all, "detail"] as const,
  detail: (orderId: string) =>
    [...tableOrdersQueryKeys.details(), orderId] as const,
};
