"use client";

import { useQuery } from "@tanstack/react-query";
import { getSalesChannel } from "@/features/sales-channels/api/sales-channels.api";
import { salesChannelsQueryKeys } from "@/features/sales-channels/query-keys";

type UseSalesChannelOptions = {
  enabled?: boolean;
};

export function useSalesChannel(
  salesChannelId: string | undefined,
  options: UseSalesChannelOptions = {}
) {
  const { enabled = true } = options;

  return useQuery({
    queryKey: salesChannelsQueryKeys.detail(salesChannelId ?? ""),
    queryFn: () => getSalesChannel(salesChannelId as string),
    enabled: enabled && Boolean(salesChannelId),
  });
}
