export const salesChannelsQueryKeys = {
  all: ["sales-channels"] as const,
  lists: () => [...salesChannelsQueryKeys.all, "list"] as const,
  list: (filters?: Record<string, string | number | boolean | undefined>) =>
    [...salesChannelsQueryKeys.lists(), filters ?? {}] as const,
};
