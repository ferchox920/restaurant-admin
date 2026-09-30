import type {
  PosCatalogFilters,
  PosCatalogResponse,
} from "@/features/pos/types/pos-catalog.types";
import { apiClient } from "@/lib/api/api-client";
import { buildQueryString } from "@/lib/api/build-query-string";

export const POS_CATALOG_PAGE_LIMIT = 50;

export function getPosCatalog(
  filters: PosCatalogFilters,
  signal?: AbortSignal
) {
  const queryString = buildQueryString({
    salesChannelId: filters.salesChannelId,
    search: filters.search?.trim() || undefined,
    categoryId: filters.categoryId,
    cursor: filters.cursor,
    limit: Math.min(
      Math.max(filters.limit ?? POS_CATALOG_PAGE_LIMIT, 1),
      POS_CATALOG_PAGE_LIMIT
    ),
  });

  return apiClient.get<PosCatalogResponse>(
    `/api/pos/catalog${queryString}`,
    signal
  );
}
