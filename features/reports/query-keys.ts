export const reportsQueryKeys = {
  all: ["reports"] as const,
  stock: (
    filters?: Record<string, string | number | boolean | undefined | null>
  ) => [...reportsQueryKeys.all, "stock", filters ?? {}] as const,
  salesByChannel: (
    filters?: Record<string, string | number | boolean | undefined | null>
  ) => [...reportsQueryKeys.all, "sales-by-channel", filters ?? {}] as const,
  salesByProduct: (
    filters?: Record<string, string | number | boolean | undefined | null>
  ) => [...reportsQueryKeys.all, "sales-by-product", filters ?? {}] as const,
  salesByUser: (
    filters?: Record<string, string | number | boolean | undefined | null>
  ) => [...reportsQueryKeys.all, "sales-by-user", filters ?? {}] as const,
  inventoryMovements: (
    filters?: Record<string, string | number | boolean | undefined | null>
  ) => [...reportsQueryKeys.all, "inventory-movements", filters ?? {}] as const,
};
