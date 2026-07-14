"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getSalesChannels,
  type SalesChannelsFilters,
} from "@/features/sales-channels/api/sales-channels.api";
import { salesChannelsQueryKeys } from "@/features/sales-channels/query-keys";

export function useSalesChannels(filters?: SalesChannelsFilters) {
  return useQuery({
    queryKey: salesChannelsQueryKeys.list(filters),
    queryFn: ({ signal }) => getSalesChannels(filters, signal),
  });
}
