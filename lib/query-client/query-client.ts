import { MutationCache, QueryClient } from "@tanstack/react-query";
import { shouldRetryQuery } from "@/lib/api/query-utils";
import { isApiError } from "@/lib/api/is-api-error";
import { saleTicketsQueryKeys } from "@/features/sales/query-keys";
import { tableOrdersQueryKeys } from "@/features/table-orders/query-keys";
import { inventoryQueryKeys } from "@/features/inventory/query-keys";

function makeQueryClient() {
  const clientRef: { current?: QueryClient } = {};
  const mutationCache = new MutationCache({
    onError: (error) => {
      if (!isApiError(error) || error.statusCode !== 409) return;
      const conflict = error.raw as
        | { code?: string; entityType?: string; entityId?: string }
        | undefined;
      if (conflict?.code !== "STALE_VERSION" || !conflict.entityId) return;

      const queryKey =
        conflict.entityType === "SaleTicket"
          ? saleTicketsQueryKeys.detail(conflict.entityId)
          : conflict.entityType === "TableOrder"
            ? tableOrdersQueryKeys.detail(conflict.entityId)
            : conflict.entityType === "ProductStock"
              ? inventoryQueryKeys.detail(conflict.entityId)
              : undefined;
      if (queryKey) {
        void clientRef.current?.invalidateQueries({ queryKey, exact: true });
      }
    },
  });
  const queryClient = new QueryClient({
    mutationCache,
    defaultOptions: {
      mutations: { retry: false },
      queries: {
        staleTime: 30_000,
        refetchOnWindowFocus: false,
        retry: shouldRetryQuery,
      },
    },
  });
  clientRef.current = queryClient;
  return queryClient;
}

let browserQueryClient: QueryClient | undefined;

export function getQueryClient() {
  if (typeof window === "undefined") {
    return makeQueryClient();
  }

  browserQueryClient ??= makeQueryClient();

  return browserQueryClient;
}
