export const paymentBanksQueryKeys = {
  all: ["payment-banks"] as const,
  lists: () => [...paymentBanksQueryKeys.all, "list"] as const,
  list: (filters?: Record<string, string | number | boolean | undefined>) =>
    [...paymentBanksQueryKeys.lists(), filters ?? {}] as const,
};
