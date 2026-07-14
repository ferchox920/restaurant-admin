import type { PaginationParams } from "@/types/common";

export const DEFAULT_PAGE_LIMIT = 50;
export const ALL_OPTIONS_PAGE_LIMIT = 100;

export function withDefaultPagination<T extends PaginationParams>(params?: T) {
  return {
    ...params,
    limit: params?.limit ?? DEFAULT_PAGE_LIMIT,
    offset: params?.offset ?? 0,
  };
}

export async function fetchAllPages<T>(
  fetchPage: (pagination: Required<PaginationParams>) => Promise<T[]>,
) {
  const items: T[] = [];
  let offset = 0;
  while (true) {
    const page = await fetchPage({ limit: ALL_OPTIONS_PAGE_LIMIT, offset });
    items.push(...page);
    if (page.length < ALL_OPTIONS_PAGE_LIMIT) return items;
    offset += page.length;
  }
}
