export const categoriesQueryKeys = {
  all: ["categories"] as const,
  lists: () => [...categoriesQueryKeys.all, "list"] as const,
  list: (filters?: Record<string, string | number | boolean | undefined>) =>
    [...categoriesQueryKeys.lists(), filters ?? {}] as const,
};
