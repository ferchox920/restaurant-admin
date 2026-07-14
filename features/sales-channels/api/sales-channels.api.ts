import { apiClient } from "@/lib/api/api-client";
import { buildQueryString } from "@/lib/api/build-query-string";
import type {
  CreateSalesChannelInput,
  SalesChannel,
  UpdateSalesChannelInput,
} from "@/features/sales-channels/types/sales-channel.types";
import type { PaginationParams } from "@/types/common";
import { fetchAllPages, withDefaultPagination } from "@/lib/api/pagination";

export type SalesChannelsFilters = PaginationParams & {
  active?: boolean;
};

export function getSalesChannels(filters?: SalesChannelsFilters, signal?: AbortSignal) {
  const pagination = withDefaultPagination(filters);
  const queryString = buildQueryString({
    active: filters?.active,
    limit: pagination.limit,
    offset: pagination.offset,
  });

  return apiClient.get<SalesChannel[]>(`/api/sales-channels${queryString}`, signal);
}

export function getAllSalesChannels(filters?: Omit<SalesChannelsFilters, "limit" | "offset">) {
  return fetchAllPages((pagination) => getSalesChannels({ ...filters, ...pagination }));
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
