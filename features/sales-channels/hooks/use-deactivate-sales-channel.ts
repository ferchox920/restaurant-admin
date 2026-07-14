"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deactivateSalesChannel } from "@/features/sales-channels/api/sales-channels.api";
import { salesChannelsQueryKeys } from "@/features/sales-channels/query-keys";

export function useDeactivateSalesChannel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deactivateSalesChannel,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: salesChannelsQueryKeys.lists(),
      });
    },
  });
}
