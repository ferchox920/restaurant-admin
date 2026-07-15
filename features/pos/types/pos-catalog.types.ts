import type { SaleProductOption } from "@/features/sales/types/sale-ticket.types";

export type PosCatalogCategory = {
  id: string;
  name: string;
};

export type PosCatalogItem = SaleProductOption & {
  currentPrice: string | null;
};

export type PosCatalogResponse = {
  items: PosCatalogItem[];
  categories: PosCatalogCategory[];
  nextCursor: string | null;
};

export type PosCatalogFilters = {
  salesChannelId: string;
  search?: string;
  categoryId?: string;
  cursor?: string;
  limit?: number;
};
