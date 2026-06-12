export const productsQueryKeys = {
  all: ["products"] as const,
  lists: () => [...productsQueryKeys.all, "list"] as const,
  list: (filters?: Record<string, string | number | boolean | undefined>) =>
    [...productsQueryKeys.lists(), filters ?? {}] as const,
  details: () => [...productsQueryKeys.all, "detail"] as const,
  detail: (productId: string) =>
    [...productsQueryKeys.details(), productId] as const,
};
