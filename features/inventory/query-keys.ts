export const inventoryQueryKeys = {
  all: ["inventory"] as const,
  lists: () => [...inventoryQueryKeys.all, "list"] as const,
  list: (filters?: Record<string, string | number | boolean | undefined>) =>
    [...inventoryQueryKeys.lists(), filters ?? {}] as const,
  details: () => [...inventoryQueryKeys.all, "detail"] as const,
  detail: (productId: string) =>
    [...inventoryQueryKeys.details(), productId] as const,
  movements: () => [...inventoryQueryKeys.all, "movements"] as const,
  movementList: (filters?: Record<string, string | number | boolean | undefined>) =>
    [...inventoryQueryKeys.movements(), "list", filters ?? {}] as const,
  productMovements: () => [...inventoryQueryKeys.all, "product-movements"] as const,
  productMovementsByProduct: (productId: string) =>
    [...inventoryQueryKeys.productMovements(), productId] as const,
  productMovementList: (
    productId: string,
    filters?: Record<string, string | number | boolean | undefined>
  ) => [...inventoryQueryKeys.productMovementsByProduct(productId), filters ?? {}] as const,
};
