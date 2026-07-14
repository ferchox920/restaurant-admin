"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { reactivateSalesChannel } from "@/features/sales-channels/api/sales-channels.api";
import { salesChannelsQueryKeys } from "@/features/sales-channels/query-keys";

export function useReactivateSalesChannel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: reactivateSalesChannel,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: salesChannelsQueryKeys.lists(),
      });
    },
  });
}
