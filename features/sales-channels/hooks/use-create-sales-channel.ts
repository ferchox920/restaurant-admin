"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createSalesChannel } from "@/features/sales-channels/api/sales-channels.api";
import { salesChannelsQueryKeys } from "@/features/sales-channels/query-keys";

export function useCreateSalesChannel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSalesChannel,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: salesChannelsQueryKeys.lists(),
      });
    },
  });
}
