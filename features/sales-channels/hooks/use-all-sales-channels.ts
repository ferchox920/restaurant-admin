"use client";

import { useQuery } from "@tanstack/react-query";
import { getAllSalesChannels, type SalesChannelsFilters } from "@/features/sales-channels/api/sales-channels.api";
import { salesChannelsQueryKeys } from "@/features/sales-channels/query-keys";

export function useAllSalesChannels(filters?: Omit<SalesChannelsFilters, "limit" | "offset">) {
  return useQuery({
    queryKey: [...salesChannelsQueryKeys.list(filters), "all-pages"],
    queryFn: () => getAllSalesChannels(filters),
  });
}
