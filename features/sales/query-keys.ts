export const saleTicketsQueryKeys = {
  all: ["sale-tickets"] as const,
  lists: () => [...saleTicketsQueryKeys.all, "list"] as const,
  list: (filters?: Record<string, string | number | boolean | undefined>) =>
    [...saleTicketsQueryKeys.lists(), filters ?? {}] as const,
  details: () => [...saleTicketsQueryKeys.all, "detail"] as const,
  detail: (ticketId: string) =>
    [...saleTicketsQueryKeys.details(), ticketId] as const,
};
