"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateSalesChannel } from "@/features/sales-channels/api/sales-channels.api";
import { salesChannelsQueryKeys } from "@/features/sales-channels/query-keys";
import type { UpdateSalesChannelInput } from "@/features/sales-channels/types/sales-channel.types";

type UpdateSalesChannelPayload = {
  salesChannelId: string;
  data: UpdateSalesChannelInput;
};

export function useUpdateSalesChannel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ salesChannelId, data }: UpdateSalesChannelPayload) =>
      updateSalesChannel(salesChannelId, data),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({
        queryKey: salesChannelsQueryKeys.lists(),
      });
      void queryClient.invalidateQueries({
        queryKey: salesChannelsQueryKeys.detail(variables.salesChannelId),
      });
    },
  });
}
