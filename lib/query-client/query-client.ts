import { MutationCache, QueryClient } from "@tanstack/react-query";
import { shouldRetryQuery } from "@/lib/api/query-utils";
import { isApiError } from "@/lib/api/is-api-error";
import { HTTP_STATUS } from "@/lib/api/http-status";

function makeQueryClient() {
  const holder: { client?: QueryClient } = {};
  const mutationCache = new MutationCache({
    onError: (error) => {
      if (
        isApiError(error) &&
        error.statusCode === HTTP_STATUS.conflict &&
        holder.client
      ) {
        return holder.client.invalidateQueries();
      }
    },
  });
  const queryClient = new QueryClient({
    mutationCache,
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        refetchOnWindowFocus: false,
        retry: shouldRetryQuery,
      },
    },
  });
  holder.client = queryClient;
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
