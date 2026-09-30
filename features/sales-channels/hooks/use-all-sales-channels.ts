"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getAllSalesChannels,
  type SalesChannelsFilters,
} from "@/features/sales-channels/api/sales-channels.api";
import { salesChannelsQueryKeys } from "@/features/sales-channels/query-keys";
import {
  QUERY_STALE_TIME,
  type QueryActivationOptions,
} from "@/lib/query-client/query-policies";

export function useAllSalesChannels(
  filters?: Omit<SalesChannelsFilters, "limit" | "offset">,
  options: QueryActivationOptions = {}
) {
  return useQuery({
    queryKey: [...salesChannelsQueryKeys.list(filters), "all-pages"],
    queryFn: ({ signal }) => getAllSalesChannels(filters, signal),
    enabled: options.enabled,
    staleTime: QUERY_STALE_TIME.options,
  });
}
