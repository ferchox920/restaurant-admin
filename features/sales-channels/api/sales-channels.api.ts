import { apiClient } from "@/lib/api/api-client";
import { buildQueryString } from "@/lib/api/build-query-string";
import type {
  CreateSalesChannelInput,
  SalesChannel,
  UpdateSalesChannelInput,
} from "@/features/sales-channels/types/sales-channel.types";

export type SalesChannelsFilters = {
  active?: boolean;
};

export function getSalesChannels(filters?: SalesChannelsFilters) {
  const queryString = buildQueryString({
    active: filters?.active,
  });

  return apiClient.get<SalesChannel[]>(`/api/sales-channels${queryString}`);
}

export function getSalesChannel(salesChannelId: string) {
  return apiClient.get<SalesChannel>(`/api/sales-channels/${salesChannelId}`);
}

export function createSalesChannel(payload: CreateSalesChannelInput) {
  return apiClient.post<SalesChannel>("/api/sales-channels", payload);
}

export function updateSalesChannel(
  salesChannelId: string,
  payload: UpdateSalesChannelInput
) {
  return apiClient.patch<SalesChannel>(
    `/api/sales-channels/${salesChannelId}`,
    payload
  );
}

export function deactivateSalesChannel(salesChannelId: string) {
  return apiClient.patch<SalesChannel>(
    `/api/sales-channels/${salesChannelId}/deactivate`
  );
}

export function reactivateSalesChannel(salesChannelId: string) {
  return apiClient.patch<SalesChannel>(
    `/api/sales-channels/${salesChannelId}/reactivate`
  );
}
